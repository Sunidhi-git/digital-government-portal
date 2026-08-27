// @ts-nocheck
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

function normalizeJsonResponse(response) {
  if (!response.ok) return response.json().catch(() => ({ error: { message: response.statusText } }));
  return response.json().catch(() => ({}));
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }) },
    ...options,
  });
  const result = await normalizeJsonResponse(response);
  if (!response.ok) {
    throw result.error || { message: response.statusText || "Network error" };
  }
  if (result?.error) {
    throw result.error;
  }
  return result;
}

function normalizeError(err) {
  if (!err) return { message: "Unknown error" };
  if (typeof err === "string") return { message: err };
  return err.message ? { message: err.message } : { message: String(err) };
}

const authListeners = new Set();

function emitAuthEvent(event, session) {
  authListeners.forEach((listener) => listener(event, session));
}

const auth = {
  async signInWithPassword({ email, password }) {
    try {
      const result = await apiFetch("/api/auth/signin", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const user = result.user;
      emitAuthEvent("SIGNED_IN", { session: { user } });
      return { data: { user }, error: null };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  },

  async signUp({ email, password, options }) {
    try {
      const result = await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, options }),
      });
      const user = result.user;
      emitAuthEvent("SIGNED_IN", { session: { user } });
      return { data: { user }, error: null };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  },

  async signOut() {
    try {
      await apiFetch("/api/auth/signout", { method: "POST" });
      emitAuthEvent("SIGNED_OUT", null);
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  },

  async getSession() {
    try {
      const result = await apiFetch("/api/auth/session");
      return { data: { session: result.user ? { user: result.user } : null }, error: null };
    } catch (error) {
      return { data: { session: null }, error: normalizeError(error) };
    }
  },

  onAuthStateChange(callback) {
    authListeners.add(callback);
    this.getSession().then(({ data }) => {
      if (data?.session?.user) {
        callback("SIGNED_IN", data.session);
      } else {
        callback("SIGNED_OUT", null);
      }
    });
    return { data: null, subscription: { unsubscribe: () => authListeners.delete(callback) } };
  },
};

class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.actionType = "select";
    this.selectFields = "*";
    this.options = {};
    this.filters = [];
    this.orderBy = null;
    this.limitValue = null;
    this.payload = null;
    this.singleMode = false;
    this.maybeSingleMode = false;
  }
  select(columns = "*", options = {}) {
    if (this.actionType === "select") {
      this.actionType = "select";
    }
    this.selectFields = columns;
    this.options = { ...this.options, ...options };
    return this;
  }
  insert(values) {
    this.actionType = "insert";
    this.payload = values;
    return this;
  }
  upsert(values, options = {}) {
    this.actionType = "upsert";
    this.payload = values;
    this.options = { ...this.options, ...options };
    return this;
  }
  update(values) {
    this.actionType = "update";
    this.payload = values;
    return this;
  }
  delete() {
    this.actionType = "delete";
    return this;
  }
  eq(column, value) {
    this.filters.push({ method: "eq", column, value });
    return this;
  }
  neq(column, value) {
    this.filters.push({ method: "neq", column, value });
    return this;
  }
  order(column, options = {}) {
    this.orderBy = { column, ascending: options.ascending !== false };
    return this;
  }
  limit(count) {
    this.limitValue = count;
    return this;
  }
  maybeSingle() {
    this.maybeSingleMode = true;
    return this;
  }
  single() {
    this.singleMode = true;
    return this;
  }
  async execute() {
    try {
      const payload = {
        table: this.table,
        action: this.actionType,
        select: this.selectFields,
        filters: this.filters,
        order: this.orderBy,
        limit: this.limitValue,
        options: this.options,
        values: this.payload,
      };
      const result = await apiFetch("/api/db/query", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = result.data || [];
      if (this.singleMode) {
        if (!data || data.length !== 1) {
          return { data: null, error: { message: "Expected a single row." } };
        }
        return { data: data[0], error: null };
      }
      if (this.maybeSingleMode) {
        return { data: data.length > 0 ? data[0] : null, error: null };
      }
      return { data, count: result.count, error: null };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  }
  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }
}

const storage = {
  from(bucket) {
    return {
      async upload(path, file) {
        try {
          const form = new FormData();
          form.append("path", path);
          form.append("file", file);
          const result = await apiFetch(`/api/storage/${bucket}/upload`, {
            method: "POST",
            body: form,
          });
          return { data: result.data, error: null };
        } catch (error) {
          return { data: null, error: normalizeError(error) };
        }
      },
      async createSignedUrl(path, expiresIn) {
        try {
          const result = await apiFetch(`/api/storage/${bucket}/signed-url`, {
            method: "POST",
            body: JSON.stringify({ path, expiresIn }),
          });
          return { data: result.data, error: null };
        } catch (error) {
          return { data: null, error: normalizeError(error) };
        }
      },
      async remove(paths) {
        try {
          const result = await apiFetch(`/api/storage/${bucket}/remove`, {
            method: "POST",
            body: JSON.stringify({ paths }),
          });
          return { data: result.data, error: null };
        } catch (error) {
          return { data: null, error: normalizeError(error) };
        }
      },
    };
  },
};

const functions = {
  async invoke(name, options = {}) {
    try {
      const result = await apiFetch(`/api/functions/${name}`, {
        method: "POST",
        body: JSON.stringify(options.body || {}),
      });
      return { data: result.data || null, error: null };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  },
};

const rpc = {
  async invoke(name, options = {}) {
    try {
      const result = await apiFetch(`/api/rpc/${name}`, {
        method: "POST",
        body: JSON.stringify(options?.body || {}),
      });
      return { data: result.data || null, error: null };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  },
};

export const supabase = {
  auth,
  from(table) {
    return new QueryBuilder(table);
  },
  storage,
  functions,
  rpc,
};