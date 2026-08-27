-- =====================================================================
-- BharatSeva — Local Postgres schema dump
-- For running the same data model on a local Postgres instance.
-- This version REMOVES Supabase-only pieces (auth.users, RLS, auth.uid())
-- and replaces them with a plain `users` table so it works in vanilla
-- PostgreSQL 14+. Run with:  psql -U postgres -d bharatseva -f schema.sql
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid()

-- ---------- ENUMS ----------
DO $$ BEGIN
  CREATE TYPE app_role        AS ENUM ('citizen','officer','admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE app_status      AS ENUM ('submitted','under_review','approved','rejected','completed','more_info');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE complaint_status AS ENUM ('open','in_progress','resolved','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status   AS ENUM ('pending','success','failed','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- AUTH (replaces Supabase auth.users) ----------
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text UNIQUE NOT NULL,
  password_hash text NOT NULL,           -- store bcrypt/argon hash from app
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ---------- PROFILES ----------
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name  text,
  email      text,
  phone      text,
  aadhaar    text,
  dob        date,
  gender     text,
  address    text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- USER ROLES (separate table — never put roles on profiles) ----------
CREATE TABLE IF NOT EXISTS user_roles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- ---------- SESSIONS ----------
CREATE TABLE IF NOT EXISTS sessions (
  token      text PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- ---------- OFFICERS ----------
-- NOTE: Officer accounts are created ONLY by an administrator from the
-- Admin → Manage Officers UI. There is no public officer self-registration.
CREATE TABLE IF NOT EXISTS officers (
  id          uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name   text NOT NULL,
  email       text NOT NULL,
  department  text NOT NULL,
  region      text,
  designation text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- SERVICES ----------
CREATE TABLE IF NOT EXISTS services (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code            text NOT NULL UNIQUE,
  name            text NOT NULL,
  department      text NOT NULL,
  description     text,
  fee             numeric NOT NULL DEFAULT 0,
  processing_days integer NOT NULL DEFAULT 7,
  required_docs   text[] NOT NULL DEFAULT '{}',
  icon            text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- APPLICATIONS ----------
CREATE TABLE IF NOT EXISTS applications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_no  text NOT NULL DEFAULT ('BS-' || to_char(now(),'YYYY') || '-' ||
                                       lpad(floor(random()*1000000)::text,6,'0')),
  citizen_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id    uuid NOT NULL REFERENCES services(id),
  officer_id    uuid REFERENCES users(id),
  status        app_status NOT NULL DEFAULT 'submitted',
  form_data     jsonb NOT NULL DEFAULT '{}'::jsonb,
  remarks       text,
  fee_amount    numeric NOT NULL DEFAULT 0,
  is_paid       boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ---------- DOCUMENTS ----------
CREATE TABLE IF NOT EXISTS documents (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  doc_type       text NOT NULL,
  file_name      text NOT NULL,
  storage_path   text NOT NULL,
  mime_type      text,
  size_bytes     bigint,
  uploaded_at    timestamptz NOT NULL DEFAULT now()
);

-- ---------- PAYMENTS ----------
CREATE TABLE IF NOT EXISTS payments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  txn_id         text NOT NULL DEFAULT ('TXN' || lpad(floor(random()*100000000)::text,8,'0')),
  citizen_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
  amount         numeric NOT NULL,
  method         text NOT NULL,
  status         payment_status NOT NULL DEFAULT 'success',
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ---------- COMPLAINTS ----------
CREATE TABLE IF NOT EXISTS complaints (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_no text NOT NULL DEFAULT ('CMP-' || lpad(floor(random()*1000000)::text,6,'0')),
  citizen_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category     text NOT NULL,
  priority     text NOT NULL DEFAULT 'medium',
  subject      text NOT NULL,
  description  text NOT NULL,
  status       complaint_status NOT NULL DEFAULT 'open',
  response     text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ---------- updated_at trigger ----------
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_app_updated  ON applications;
CREATE TRIGGER trg_app_updated  BEFORE UPDATE ON applications  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_cmp_updated  ON complaints;
CREATE TRIGGER trg_cmp_updated  BEFORE UPDATE ON complaints   FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ---------- helper: role check ----------
CREATE OR REPLACE FUNCTION has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- ---------- seed services (optional) ----------
INSERT INTO services (code, name, department, fee, processing_days, required_docs) VALUES
  ('PASSPORT',  'Passport Application',     'Ministry of External Affairs', 1500, 30, ARRAY['Aadhaar','Photo','Address Proof']),
  ('DL',        'Driving License',          'Ministry of Road Transport',    600, 21, ARRAY['Aadhaar','Photo','Medical Cert']),
  ('INCOME',    'Income Certificate',       'Revenue Department',            100,  7, ARRAY['Aadhaar','Salary Slip']),
  ('BIRTH',     'Birth Certificate',        'Municipal Corporation',          50, 10, ARRAY['Hospital Record','Parent ID'])
ON CONFLICT (code) DO NOTHING;

-- =====================================================================
-- NOTE FOR LOCAL USE
-- This local schema has NO Row-Level Security. Enforce permissions in
-- your application layer (Express/Spring/Django/etc.). The `has_role`
-- helper is provided so you can mirror the RLS-style checks in queries.
-- =====================================================================