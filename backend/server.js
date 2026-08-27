import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import multer from "multer";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import crypto from "crypto";

// Load environment variables
const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env");
const envContent = await fs.readFile(envPath, "utf8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length) {
    let value = valueParts.join("=").trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    envVars[key.trim()] = value;
  }
}
process.env = { ...process.env, ...envVars };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 4000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:8080";
const STORAGE_ROOT = path.resolve(process.env.STORAGE_PATH || path.join(__dirname, "../storage"));
const SESSION_COOKIE_NAME = "bs_sess";
const SESSION_EXPIRES_MS = 30 * 24 * 60 * 60 * 1000;
const ALLOWED_TABLES = new Set(["users", "profiles", "user_roles", "officers", "services", "applications", "documents", "payments", "complaints", "sessions"]);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin === FRONTEND_ORIGIN ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:") ||
      origin.startsWith("http://192.168.") ||
      origin.startsWith("http://172.") ||
      origin.startsWith("http://10.")
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy does not allow access from ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
console.log('DATABASE_URL:', process.env.DATABASE_URL);

function sanitizeStoragePath(requestPath) {
  const normalized = requestPath.replace(/\\/g, "/").replace(/\.{2,}/g, "");
  const safe = normalized.split("/").filter(Boolean).join("/");
  if (!safe || safe.includes("..")) throw new Error("Invalid storage path");
  return safe;
}

async function ensureStorageDirectory() {
  await fs.mkdir(STORAGE_ROOT, { recursive: true });
}

async function dbQuery(text, params = []) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function getSessionUser(req) {
  const token = req.cookies[SESSION_COOKIE_NAME];
  if (!token) return null;
  const { rows } = await dbQuery(
    `SELECT users.id, users.email
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token = $1 AND sessions.expires_at > now()`,
    [token]
  );
  return rows[0] || null;
}

async function createSession(res, userId) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRES_MS).toISOString();
  await dbQuery(
    `INSERT INTO sessions(token, user_id, expires_at, created_at) VALUES($1, $2, $3, now())`,
    [token, userId, expiresAt]
  );
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_EXPIRES_MS,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return token;
}

async function clearSession(req, res) {
  const token = req.cookies[SESSION_COOKIE_NAME];
  if (token) {
    await dbQuery(`DELETE FROM sessions WHERE token = $1`, [token]);
  }
  res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
}

function splitTopLevelCommas(input) {
  const parts = [];
  let buffer = "";
  let depth = 0;
  for (const char of input) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(buffer.trim());
      buffer = "";
      continue;
    }
    buffer += char;
  }
  if (buffer.trim()) parts.push(buffer.trim());
  return parts.filter(Boolean);
}

function parseSelectExpression(expression) {
  const tokens = splitTopLevelCommas(expression || "");
  const columns = [];
  const joins = [];

  for (const token of tokens) {
    const openIndex = token.indexOf("(");
    if (openIndex === -1) {
      columns.push(token.trim());
      continue;
    }

    const prefix = token.slice(0, openIndex).trim();
    const inner = token.slice(openIndex + 1, token.lastIndexOf(")")).trim();
    const [rawTable, rawJoinType] = prefix.split("!");
    const joinType = rawJoinType === "inner" ? "INNER" : "LEFT";
    const [tableName, explicitFk] = rawTable.split(":").map((p) => p.trim());
    joins.push({ table: tableName, alias: tableName, fk: explicitFk || null, joinType, selection: parseSelectExpression(inner) });
  }

  return { columns, joins };
}

function inferJoinCondition(parentTable, childTable, explicitFk) {
  if (explicitFk) {
    return `${childTable}.id = ${parentTable}.${explicitFk}`;
  }
  const candidate = `${childTable.replace(/s$/, "")}_id`;
  return `${childTable}.id = ${parentTable}.${candidate}`;
}

function collectJoins(parentTable, joinNodes, seen = new Map()) {
  const rows = [];
  for (const node of joinNodes) {
    const key = `${parentTable}:${node.table}:${node.alias}`;
    if (seen.has(key)) continue;
    seen.set(key, true);
    rows.push({ parentTable, ...node });
    if (node.selection.joins.length > 0) {
      rows.push(...collectJoins(node.alias, node.selection.joins, seen));
    }
  }
  return rows;
}

function renderJoinObject(node) {
  const pieces = [];
  for (const col of node.selection.columns) {
    pieces.push(`'${col}', ${node.alias}.${col}`);
  }
  for (const nested of node.selection.joins) {
    pieces.push(`'${nested.alias}', ${renderJoinObject({ ...nested, alias: nested.alias })}`);
  }
  if (pieces.length === 0) {
    return `to_jsonb(${node.alias})`;
  }
  return `jsonb_build_object(${pieces.join(", ")})`;
}

function addJoinForPath(path, baseTable, selections) {
  const [alias] = path.split(".");
  const existing = selections.find((node) => node.alias === alias);
  if (existing) return;
  selections.push({ table: alias, alias, fk: null, joinType: "LEFT", selection: { columns: [], joins: [] } });
}

function buildSelectQuery({ table, select, filters = [], order, limit, options = {} }) {
  const baseTable = table;
  const parsed = select ? parseSelectExpression(select) : { columns: ["*"], joins: [] };
  const joins = [...parsed.joins];

  for (const filter of filters) {
    if (filter.column.includes(".")) {
      addJoinForPath(filter.column, baseTable, joins);
    }
  }
  if (order?.column?.includes(".")) {
    addJoinForPath(order.column, baseTable, joins);
  }

  const joinClauses = collectJoins(baseTable, joins);
  const selectPieces = [];
  if (parsed.columns.length > 0) {
    for (const col of parsed.columns) {
      if (col === "*") {
        selectPieces.push(`${baseTable}.*`);
        continue;
      }
      selectPieces.push(col.includes(".") ? col : `${baseTable}.${col}`);
    }
  }
  for (const joinNode of joins) {
    selectPieces.push(`${renderJoinObject(joinNode)} AS ${joinNode.alias}`);
  }

  const whereClauses = [];
  const params = [];
  filters.forEach((filter, index) => {
    const column = filter.column.includes(".") ? filter.column : `${baseTable}.${filter.column}`;
    const placeholder = `$${params.length + 1}`;
    if (filter.method === "eq") {
      whereClauses.push(`${column} = ${placeholder}`);
    } else if (filter.method === "neq") {
      whereClauses.push(`${column} <> ${placeholder}`);
    } else {
      throw new Error(`Unsupported filter method: ${filter.method}`);
    }
    params.push(filter.value);
  });

  const orderClause = order ? `ORDER BY ${order.column.includes(".") ? order.column : `${baseTable}.${order.column}`} ${order.ascending === false ? "DESC" : "ASC"}` : "";
  const limitClause = limit ? `LIMIT ${Number(limit)}` : "";
  const joinSql = joinClauses.map((join) => `${join.joinType} JOIN ${join.table} ON ${inferJoinCondition(join.parentTable, join.table, join.fk)}`).join(" ");

  const fromClause = `FROM ${baseTable} ${joinSql}`;
  return {
    text: `SELECT ${selectPieces.join(", ")} ${fromClause} ${whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : ""} ${orderClause} ${limitClause}`.trim(),
    params,
    countText: `SELECT COUNT(*) AS count ${fromClause} ${whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : ""}`.trim(),
  };
}

async function getRoleExists(role) {
  const { rows } = await dbQuery(`SELECT 1 FROM user_roles WHERE role = $1 LIMIT 1`, [role]);
  return rows.length > 0;
}

app.post("/api/auth/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: { message: "Email and password are required." } });

    const { rows } = await dbQuery(`SELECT id, email, password_hash FROM users WHERE email = $1 LIMIT 1`, [email.toLowerCase()]);
    const user = rows[0];
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ error: { message: "Invalid email or password." } });
    }
    await createSession(res, user.id);
    return res.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: "Unable to sign in." } });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, options = {} } = req.body;
    console.log('Signup attempt:', { email, hasPassword: !!password, options });
    if (!email || !password) return res.status(400).json({ error: { message: "Email and password are required." } });
    const normalizedEmail = email.toLowerCase();

    const existing = await dbQuery(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [normalizedEmail]);
    console.log('Existing user check:', existing.rows.length);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: { message: "An account with that email already exists." } });
    }

    console.log('Hashing password...');
    const passwordHash = await hashPassword(password);
    console.log('Inserting user...');
    const { rows } = await dbQuery(
      `INSERT INTO users(email, password_hash, created_at) VALUES ($1, $2, now()) RETURNING id, email`,
      [normalizedEmail, passwordHash]
    );
    const user = rows[0];
    console.log('User created:', user);

    const profileData = options.data || {};
    console.log('Inserting profile:', profileData);
    await dbQuery(
      `INSERT INTO profiles(id, full_name, email, phone, aadhaar, dob, gender, address, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())`,
      [
        user.id,
        profileData.full_name || null,
        profileData.email || normalizedEmail,
        profileData.phone || null,
        profileData.aadhaar || null,
        profileData.dob || null,
        profileData.gender || null,
        profileData.address || null,
      ]
    );
    console.log('Profile created');

    console.log('Inserting user role...');
    await dbQuery(`INSERT INTO user_roles(user_id, role, created_at) VALUES ($1, 'citizen', now())`, [user.id]);
    console.log('Role created');

    console.log('Creating session...');
    await createSession(res, user.id);
    console.log('Session created');

    return res.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: { message: "Unable to register." } });
  }
});

app.post("/api/auth/signout", async (req, res) => {
  try {
    await clearSession(req, res);
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: "Unable to sign out." } });
  }
});

app.get("/api/auth/session", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    return res.json({ user: user || null });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: "Unable to retrieve session." } });
  }
});

app.post("/api/auth/promote_self_to_officer", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user) return res.status(401).json({ error: { message: "Authentication required." } });

    const { rows: officerRows } = await dbQuery(`SELECT 1 FROM officers WHERE id = $1 LIMIT 1`, [user.id]);
    if (officerRows.length === 0) {
      return res.json({ promoted: false });
    }
    await dbQuery(
      `INSERT INTO user_roles(user_id, role, created_at)
       VALUES ($1, 'officer', now()) ON CONFLICT (user_id, role) DO NOTHING`,
      [user.id]
    );
    return res.json({ promoted: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: "Unable to promote officer role." } });
  }
});

app.post("/api/auth/bootstrap_admin", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user) return res.status(401).json({ error: { message: "Authentication required." } });
    const adminExists = await getRoleExists("admin");
    if (adminExists) {
      return res.status(400).json({ error: { message: "An administrator already exists." } });
    }
    await dbQuery(`INSERT INTO user_roles(user_id, role, created_at) VALUES ($1, 'admin', now())`, [user.id]);
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: "Unable to bootstrap admin." } });
  }
});

app.post("/api/functions/admin-create-officer", async (req, res) => {
  try {
    const { action, officer_id, full_name, department, region, designation, email, password, is_active } = req.body;
    if (!action) return res.status(400).json({ error: { message: "Action is required." } });

    if (action === "create") {
      if (!email || !password || !full_name || !department) {
        return res.status(400).json({ error: { message: "Missing required officer fields." } });
      }
      const normalizedEmail = email.toLowerCase();
      const existingUser = await dbQuery(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [normalizedEmail]);
      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: { message: "Email is already registered." } });
      }
      const passwordHash = await hashPassword(password);
      const { rows } = await dbQuery(
        `INSERT INTO users(email, password_hash, created_at) VALUES ($1, $2, now()) RETURNING id`,
        [normalizedEmail, passwordHash]
      );
      const userId = rows[0].id;
      await dbQuery(`INSERT INTO user_roles(user_id, role, created_at) VALUES ($1, 'officer', now())`, [userId]);
      await dbQuery(
        `INSERT INTO officers(id, full_name, email, department, region, designation, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, true, now())`,
        [userId, full_name, normalizedEmail, department, region || null, designation || null]
      );
      return res.json({ data: { id: userId, email: normalizedEmail, full_name, department, region, designation, is_active: true } });
    }

    if (!["update", "delete"].includes(action)) {
      return res.status(400).json({ error: { message: "Unsupported action." } });
    }
    if (!officer_id) return res.status(400).json({ error: { message: "Officer id is required." } });

    if (action === "update") {
      const updates = [];
      const params = [];
      const push = (value) => { params.push(value); return `$${params.length}`; };
      if (full_name !== undefined) updates.push(`full_name = ${push(full_name)}`);
      if (department !== undefined) updates.push(`department = ${push(department)}`);
      if (region !== undefined) updates.push(`region = ${push(region)}`);
      if (designation !== undefined) updates.push(`designation = ${push(designation)}`);
      if (is_active !== undefined) updates.push(`is_active = ${push(is_active)}`);
      if (updates.length === 0) {
        return res.json({ data: { message: "No fields updated." } });
      }
      params.push(officer_id);
      await dbQuery(`UPDATE officers SET ${updates.join(", ")} WHERE id = $${params.length}`, params);
      return res.json({ data: { id: officer_id } });
    }

    if (action === "delete") {
      await dbQuery(`DELETE FROM officers WHERE id = $1`, [officer_id]);
      await dbQuery(`DELETE FROM user_roles WHERE user_id = $1 AND role = 'officer'`, [officer_id]);
      return res.json({ data: { id: officer_id } });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: "Unable to process officer function." } });
  }
});

app.post("/api/rpc/promote_self_to_officer", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user) return res.status(401).json({ error: { message: "Authentication required." } });
    const { rows } = await dbQuery(`SELECT 1 FROM officers WHERE id = $1 LIMIT 1`, [user.id]);
    if (rows.length === 0) return res.json({ data: null });
    await dbQuery(`INSERT INTO user_roles(user_id, role, created_at) VALUES ($1, 'officer', now()) ON CONFLICT (user_id, role) DO NOTHING`, [user.id]);
    return res.json({ data: null });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: "Unable to promote officer." } });
  }
});

app.post("/api/rpc/bootstrap_admin", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user) return res.status(401).json({ error: { message: "Authentication required." } });
    const adminExists = await getRoleExists("admin");
    if (adminExists) return res.status(400).json({ error: { message: "Administrator already exists." } });
    await dbQuery(`INSERT INTO user_roles(user_id, role, created_at) VALUES ($1, 'admin', now())`, [user.id]);
    return res.json({ data: null });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: "Unable to bootstrap admin." } });
  }
});

app.post("/api/db/query", async (req, res) => {
  try {
    const body = req.body;
    const table = body.table;
    if (!table || !ALLOWED_TABLES.has(table)) {
      return res.status(400).json({ error: { message: "Invalid table." } });
    }
    const action = body.action || "select";
    const select = body.select || "*";
    const filters = body.filters || [];
    const order = body.order || null;
    const limit = body.limit || null;
    const options = body.options || {};
    const values = body.values;

    if (["select"].includes(action)) {
      const query = buildSelectQuery({ table, select, filters, order, limit, options });
      if (options.count === "exact") {
        const countResult = await dbQuery(query.countText, query.params);
        const count = Number(countResult.rows[0]?.count || 0);
        if (options.head) {
          return res.json({ count, data: [] });
        }
        const dataResult = await dbQuery(query.text, query.params);
        return res.json({ count, data: dataResult.rows });
      }
      const result = await dbQuery(query.text, query.params);
      if (options.head) {
        return res.json({ data: [], count: result.rowCount });
      }
      return res.json({ data: result.rows });
    }

    if (["insert", "upsert", "update", "delete"].includes(action)) {
      if (action !== "delete" && !values) {
        return res.status(400).json({ error: { message: "Values are required for write operations." } });
      }
      if (action === "insert") {
        const columns = Object.keys(values);
        const placeholders = columns.map((_, index) => `$${index + 1}`);
        const result = await dbQuery(
          `INSERT INTO ${table}(${columns.join(",")}) VALUES(${placeholders.join(",")}) RETURNING *`,
          columns.map((key) => values[key])
        );
        return res.json({ data: result.rows });
      }
      if (action === "upsert") {
        const onConflict = options.onConflict;
        if (!onConflict) return res.status(400).json({ error: { message: "onConflict is required for upsert." } });
        const columns = Object.keys(values);
        const placeholders = columns.map((_, index) => `$${index + 1}`);
        const updates = columns.filter((col) => col !== onConflict).map((col) => `${col} = EXCLUDED.${col}`);
        const result = await dbQuery(
          `INSERT INTO ${table}(${columns.join(",")}) VALUES(${placeholders.join(",")}) ON CONFLICT (${onConflict}) DO UPDATE SET ${updates.join(",")} RETURNING *`,
          columns.map((key) => values[key])
        );
        return res.json({ data: result.rows });
      }
      if (action === "update") {
        const filters = body.filters || [];
        const setColumns = Object.keys(values);
        const setClauses = setColumns.map((col, index) => `${col} = $${index + 1}`);
        const filterClauses = [];
        const params = setColumns.map((key) => values[key]);
        filters.forEach((filter) => {
          const paramIndex = params.length + 1;
          const column = filter.column.includes(".") ? filter.column : `${table}.${filter.column}`;
          if (filter.method === "eq") {
            filterClauses.push(`${column} = $${paramIndex}`);
          } else if (filter.method === "neq") {
            filterClauses.push(`${column} <> $${paramIndex}`);
          }
          params.push(filter.value);
        });
        if (!filterClauses.length) {
          return res.status(400).json({ error: { message: "Update operations require filters." } });
        }
        const result = await dbQuery(
          `UPDATE ${table} SET ${setClauses.join(",")} WHERE ${filterClauses.join(" AND ")} RETURNING *`,
          params
        );
        return res.json({ data: result.rows });
      }
      if (action === "delete") {
        const filters = body.filters || [];
        const filterClauses = [];
        const params = [];
        filters.forEach((filter) => {
          const paramIndex = params.length + 1;
          const column = filter.column.includes(".") ? filter.column : `${table}.${filter.column}`;
          if (filter.method === "eq") {
            filterClauses.push(`${column} = $${paramIndex}`);
          } else if (filter.method === "neq") {
            filterClauses.push(`${column} <> $${paramIndex}`);
          }
          params.push(filter.value);
        });
        if (!filterClauses.length) {
          return res.status(400).json({ error: { message: "Delete operations require filters." } });
        }
        const result = await dbQuery(`DELETE FROM ${table} WHERE ${filterClauses.join(" AND ")} RETURNING *`, params);
        return res.json({ data: result.rows });
      }
    }

    return res.status(400).json({ error: { message: "Unsupported DB action." } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: "Database query failed." } });
  }
});

app.post("/api/storage/documents/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.body.path) return res.status(400).json({ error: { message: "File and path are required." } });
    const storagePath = sanitizeStoragePath(req.body.path);
    const fullPath = path.join(STORAGE_ROOT, storagePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, req.file.buffer);
    return res.json({ data: { path: storagePath } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: "File upload failed." } });
  }
});

const signedUrlTokens = new Map();

app.post("/api/storage/documents/signed-url", async (req, res) => {
  try {
    const { path: storagePath, expiresIn } = req.body;
    if (!storagePath) return res.status(400).json({ error: { message: "Path is required." } });
    const sanitized = sanitizeStoragePath(storagePath);
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + Number(expiresIn || 60) * 1000;
    signedUrlTokens.set(token, { storagePath: sanitized, expiresAt });
    return res.json({ data: { signedUrl: `http://localhost:${PORT}/api/storage/documents/signed?token=${token}` } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: "Signed URL generation failed." } });
  }
});

app.get("/api/storage/documents/signed", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") return res.status(400).send("Missing token");
    const entry = signedUrlTokens.get(token);
    if (!entry || entry.expiresAt < Date.now()) {
      signedUrlTokens.delete(token);
      return res.status(404).send("Link expired or invalid");
    }
    const fullPath = path.join(STORAGE_ROOT, entry.storagePath);
    return res.sendFile(fullPath);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Unable to serve file.");
  }
});

app.post("/api/storage/documents/remove", async (req, res) => {
  try {
    const { paths } = req.body;
    if (!Array.isArray(paths) || !paths.length) {
      return res.status(400).json({ error: { message: "Paths are required." } });
    }
    for (const item of paths) {
      const sanitized = sanitizeStoragePath(item);
      const fullPath = path.join(STORAGE_ROOT, sanitized);
      await fs.unlink(fullPath).catch(() => {});
    }
    return res.json({ data: { removed: paths.length } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: "File deletion failed." } });
  }
});

app.use((req, res) => res.status(404).json({ error: { message: "Route not found." } }));

await ensureStorageDirectory();
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
