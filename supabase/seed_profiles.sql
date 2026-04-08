-- =============================================================================
-- SCSTix EPOS — Seed Profiles into Supabase
-- =============================================================================
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
--
-- IMPORTANT: This script does TWO things:
--   1. Creates auth.users entries (so they can log in)
--   2. Creates profiles entries (so the app can read them)
--
-- The handle_new_user() trigger will auto-create a basic profile on auth insert,
-- but we override it with a full INSERT ON CONFLICT to set all fields properly.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 1: Ensure venue + site exist (profiles FK to these)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO venues (id, name, address, status)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Main Stadium', '123 Stadium Road, London', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO sites (id, venue_id, name, type, status)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Main Shop', 'retail', 'active'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'East Wing Popup', 'retail', 'active')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 2: Create auth.users entries
-- ─────────────────────────────────────────────────────────────────────────────
-- Uses Supabase's internal auth schema. Passwords are hashed with bcrypt.
-- Default password for all users: their respective passwords from seed data.
--
-- NOTE: The password hash below is for demonstration. In production,
-- users should reset their passwords after first login.
-- ─────────────────────────────────────────────────────────────────────────────

-- Helper: generate bcrypt hash for passwords
-- Supabase uses crypt() from pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert auth users one by one with proper password hashing
INSERT INTO auth.users (
  id, 
  instance_id,
  email, 
  encrypted_password, 
  email_confirmed_at, 
  role,
  aud,
  raw_user_meta_data,
  created_at, 
  updated_at,
  confirmation_token,
  recovery_token
)
VALUES
  -- 1. Alex Rivera (Admin)
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'admin@fanstore.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    '{"name": "Alex Rivera"}'::jsonb,
    '2023-01-01'::timestamptz,
    now(),
    '',
    ''
  ),
  -- 2. Sam Chen (Manager)
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'manager@fanstore.com',
    crypt('mgr123', gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    '{"name": "Sam Chen"}'::jsonb,
    '2023-01-15'::timestamptz,
    now(),
    '',
    ''
  ),
  -- 3. Jordan Lee (Cashier)
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'cashier@fanstore.com',
    crypt('cash123', gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    '{"name": "Jordan Lee"}'::jsonb,
    '2023-03-01'::timestamptz,
    now(),
    '',
    ''
  ),
  -- 4. Morgan Blake (Cashier 2)
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'cashier2@fanstore.com',
    crypt('cash456', gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    '{"name": "Morgan Blake"}'::jsonb,
    '2023-04-01'::timestamptz,
    now(),
    '',
    ''
  ),
  -- 5. Taylor Smith (Customer)
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'customer@fanstore.com',
    crypt('cust123', gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    '{"name": "Taylor Smith"}'::jsonb,
    '2023-06-01'::timestamptz,
    now(),
    '',
    ''
  ),
  -- 6. Chris Johnson (Customer)
  (
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'chris@email.com',
    crypt('cust456', gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    '{"name": "Chris Johnson"}'::jsonb,
    '2023-09-01'::timestamptz,
    now(),
    '',
    ''
  ),
  -- 7. Alex Murphy (Staff)
  (
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000000',
    'staff1@fanstore.com',
    crypt('staff123', gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    '{"name": "Alex Murphy"}'::jsonb,
    '2024-01-01'::timestamptz,
    now(),
    '',
    ''
  ),
  -- 8. Jamie Davis (Staff)
  (
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000000',
    'staff2@fanstore.com',
    crypt('staff456', gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    '{"name": "Jamie Davis"}'::jsonb,
    '2024-02-01'::timestamptz,
    now(),
    '',
    ''
  ),
  -- 9. Sarah Jenkins (Customer - Gold)
  (
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000000',
    'sarah@email.com',
    crypt('cust789', gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    '{"name": "Sarah Jenkins"}'::jsonb,
    '2024-03-01'::timestamptz,
    now(),
    '',
    ''
  ),
  -- 10. Mike Ross (Customer - Silver)
  (
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000000',
    'mike@email.com',
    crypt('cust101', gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    '{"name": "Mike Ross"}'::jsonb,
    '2024-03-05'::timestamptz,
    now(),
    '',
    ''
  ),
  -- 11. Emma Wilson (Customer - Bronze)
  (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000000',
    'emma@email.com',
    crypt('cust102', gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    '{"name": "Emma Wilson"}'::jsonb,
    '2024-03-10'::timestamptz,
    now(),
    '',
    ''
  ),
  -- 12. David Baker (Customer - Gold)
  (
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000000',
    'david@email.com',
    crypt('cust103', gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    '{"name": "David Baker"}'::jsonb,
    '2024-03-15'::timestamptz,
    now(),
    '',
    ''
  ),
  -- 13. Lisa Thompson (Customer - Silver)
  (
    '00000000-0000-0000-0000-000000000013',
    '00000000-0000-0000-0000-000000000000',
    'lisa@email.com',
    crypt('cust104', gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    '{"name": "Lisa Thompson"}'::jsonb,
    '2024-03-20'::timestamptz,
    now(),
    '',
    ''
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = now();


-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 3: Insert/Update profiles with full data
-- ─────────────────────────────────────────────────────────────────────────────
-- The handle_new_user() trigger created basic profiles above.
-- Now we update them with complete role, venue, site, loyalty data.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO profiles (id, display_name, email, phone, role, venue_id, site_id, active, loyalty_points, tier, total_spent)
VALUES
  -- Staff / Operations
  ('00000000-0000-0000-0000-000000000001', 'Alex Rivera',   'admin@fanstore.com',    '07700900001', 'admin',    NULL, NULL, true, 0, 'N/A', 0),
  ('00000000-0000-0000-0000-000000000002', 'Sam Chen',      'manager@fanstore.com',  '07700900002', 'manager',  'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', true, 0, 'N/A', 0),
  ('00000000-0000-0000-0000-000000000003', 'Jordan Lee',    'cashier@fanstore.com',  '07700900003', 'cashier',  'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', true, 0, 'N/A', 0),
  ('00000000-0000-0000-0000-000000000004', 'Morgan Blake',  'cashier2@fanstore.com', '07700900004', 'cashier',  'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', true, 0, 'N/A', 0),
  ('00000000-0000-0000-0000-000000000007', 'Alex Murphy',   'staff1@fanstore.com',   '07700900007', 'staff',    'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', true, 0, 'N/A', 0),
  ('00000000-0000-0000-0000-000000000008', 'Jamie Davis',   'staff2@fanstore.com',   '07700900008', 'staff',    'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', true, 0, 'N/A', 0),

  -- Customers
  ('00000000-0000-0000-0000-000000000005', 'Taylor Smith',  'customer@fanstore.com', '07700900005', 'customer', NULL, NULL, true, 320,  'Silver', 1240),
  ('00000000-0000-0000-0000-000000000006', 'Chris Johnson', 'chris@email.com',       '07700900006', 'customer', NULL, NULL, true, 45,   'Bronze', 180),
  ('00000000-0000-0000-0000-000000000009', 'Sarah Jenkins', 'sarah@email.com',       '5667788991',  'customer', NULL, NULL, true, 2150, 'Gold',   4200),
  ('00000000-0000-0000-0000-000000000010', 'Mike Ross',     'mike@email.com',        '5667788992',  'customer', NULL, NULL, true, 820,  'Silver', 1550),
  ('00000000-0000-0000-0000-000000000011', 'Emma Wilson',   'emma@email.com',        '5667788993',  'customer', NULL, NULL, true, 120,  'Bronze', 340),
  ('00000000-0000-0000-0000-000000000012', 'David Baker',   'david@email.com',       '5667788994',  'customer', NULL, NULL, true, 3500, 'Gold',   6800),
  ('00000000-0000-0000-0000-000000000013', 'Lisa Thompson', 'lisa@email.com',        '5667788995',  'customer', NULL, NULL, true, 640,  'Silver', 1120)
ON CONFLICT (id) DO UPDATE SET
  display_name   = EXCLUDED.display_name,
  email          = EXCLUDED.email,
  phone          = EXCLUDED.phone,
  role           = EXCLUDED.role,
  venue_id       = EXCLUDED.venue_id,
  site_id        = EXCLUDED.site_id,
  active         = EXCLUDED.active,
  loyalty_points = EXCLUDED.loyalty_points,
  tier           = EXCLUDED.tier,
  total_spent    = EXCLUDED.total_spent,
  updated_at     = now();


-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 4: Verify
-- ─────────────────────────────────────────────────────────────────────────────
SELECT 
  p.display_name,
  p.email,
  p.role,
  p.active,
  s.name AS site_name,
  v.name AS venue_name,
  p.loyalty_points,
  p.tier
FROM profiles p
LEFT JOIN sites s ON s.id = p.site_id
LEFT JOIN venues v ON v.id = p.venue_id
ORDER BY 
  CASE p.role 
    WHEN 'admin' THEN 1 
    WHEN 'manager' THEN 2 
    WHEN 'cashier' THEN 3 
    WHEN 'staff' THEN 4 
    WHEN 'customer' THEN 5 
  END,
  p.display_name;
