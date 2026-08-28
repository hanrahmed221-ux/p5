-- Schema definition for external PostgreSQL deployment (Neon, Supabase, Railway, etc.)

CREATE TABLE IF NOT EXISTS admins (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  id text PRIMARY KEY,
  site_name text,
  site_tagline text,
  logo_text text,
  vodafone_cash_number text,
  instapay_address text,
  contact_phone text,
  whatsapp_number text,
  payment_instructions text,
  currency text,
  working_hours text,
  notice_banner text,
  enable_notice boolean DEFAULT true,
  show_notice_banner boolean DEFAULT true,
  data jsonb,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS companies (
  id text PRIMARY KEY,
  name text NOT NULL,
  name_en text NOT NULL,
  color text NOT NULL,
  accent_color text,
  bg_light text,
  border_light text,
  active boolean NOT NULL DEFAULT true,
  logo text,
  "order" integer NOT NULL DEFAULT 0,
  created_at text
);

CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  company_id text NOT NULL DEFAULT 'all',
  name text NOT NULL,
  name_en text,
  icon text NOT NULL DEFAULT 'tag',
  active boolean NOT NULL DEFAULT true,
  "order" integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS packages (
  id text PRIMARY KEY,
  name text NOT NULL,
  company_id text NOT NULL,
  category_id text NOT NULL,
  price double precision NOT NULL,
  cost double precision,
  profit double precision,
  quota text NOT NULL,
  description text NOT NULL,
  duration text NOT NULL DEFAULT '30 يوم',
  badge text,
  features jsonb NOT NULL,
  active boolean NOT NULL DEFAULT true,
  "order" integer NOT NULL DEFAULT 0,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  order_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  phone_number text NOT NULL,
  contact_phone text,
  package_id text NOT NULL,
  package_name text NOT NULL,
  package_price double precision NOT NULL,
  package_cost double precision,
  package_profit double precision,
  package_quota text,
  package_duration text,
  company_id text NOT NULL,
  company_name text NOT NULL,
  category_id text NOT NULL,
  category_name text NOT NULL,
  payment_method text NOT NULL,
  amount double precision NOT NULL,
  notes text,
  admin_notes text,
  status text NOT NULL DEFAULT 'new',
  status_history jsonb NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS subscribers (
  id text PRIMARY KEY,
  customer_name text NOT NULL,
  phone_number text NOT NULL,
  contact_phone text,
  company_id text NOT NULL,
  company_name text,
  package_id text,
  package_name text NOT NULL,
  package_price double precision NOT NULL,
  package_cost double precision,
  package_profit double precision,
  renewal_day integer NOT NULL,
  next_renewal_date text NOT NULL,
  last_recharge_date text,
  notes text,
  auto_notify_whatsapp boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS counters (
  id text PRIMARY KEY,
  counter integer NOT NULL DEFAULT 1
);
