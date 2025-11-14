-- Enable uuid/gen functions if not present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username varchar(100) UNIQUE NOT NULL,
  email varchar(255),
  password_hash varchar(512),
  first_name varchar(100),
  last_name varchar(100),
  role varchar(20) NOT NULL,
  compensation_type varchar(30),
  base_salary numeric,
  commission_rate numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255),
  contact_person varchar(255),
  email varchar(255),
  phone varchar(50)
);

CREATE TABLE sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255),
  address_line1 varchar(255),
  city varchar(100),
  country varchar(100),
  parking_available boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE buildings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255),
  floor_count integer,
  total_area_sqm double precision,
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE
);

CREATE TABLE building_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_number varchar(100),
  type varchar(50),
  floor integer,
  area_sqm double precision,
  parking_slots integer,
  price double precision,
  status varchar(50),
  building_id uuid REFERENCES buildings(id),
  owner_id uuid REFERENCES owners(id)
);

CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name varchar(100),
  last_name varchar(100),
  email varchar(255),
  phone varchar(50),
  source varchar(100),
  status varchar(50),
  assigned_to uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE commission_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  amount numeric,
  details text,
  issued_at timestamptz DEFAULT now()
);

-- Seed admin user (password stored in password_hash field; replace with bcrypt in real app)
INSERT INTO users (username, email, password_hash, first_name, last_name, role)
VALUES ('admin', 'admin@example.com', 'admin', 'System', 'Administrator', 'ADMIN');
