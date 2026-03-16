-- ═══════════════════════════════════════════════════════════
-- SCSTix EPOS — SEED DATA
-- Run this AFTER schema.sql has been deployed.
-- NOTE: Create auth users first via Supabase Dashboard →
--       Authentication → Users → "Add user" (email+password)
--       Then paste their UUIDs below.
-- ═══════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────
-- 1. VENUE + SITE + COUNTERS
-- ─────────────────────────────────────────────────────────
INSERT INTO venues (id, name, address, phone)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Main Stadium',
  '123 Stadium Road, London, UK',
  '+44 20 1234 5678'
);

INSERT INTO sites (id, venue_id, name, type)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Main Merchandise Store',
  'retail'
);

INSERT INTO counters (id, site_id, name, status)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Counter 1', 'active'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Counter 2', 'active');

-- ─────────────────────────────────────────────────────────
-- 2. ASSIGN ROLES TO AUTH USERS
--    Run this AFTER creating users in Supabase Dashboard →
--    Authentication → Users. The trigger auto-creates profiles
--    with role='customer'. These UPDATEs fix the roles.
-- ─────────────────────────────────────────────────────────
UPDATE profiles SET
  role = 'admin',
  display_name = 'Admin User',
  venue_id = 'a0000000-0000-0000-0000-000000000001',
  site_id = 'b0000000-0000-0000-0000-000000000001'
WHERE email = 'admin@scstix.com';

UPDATE profiles SET
  role = 'manager',
  display_name = 'Manager User',
  venue_id = 'a0000000-0000-0000-0000-000000000001',
  site_id = 'b0000000-0000-0000-0000-000000000001'
WHERE email = 'manager@scstix.com';

UPDATE profiles SET
  role = 'cashier',
  display_name = 'Cashier User',
  venue_id = 'a0000000-0000-0000-0000-000000000001',
  site_id = 'b0000000-0000-0000-0000-000000000001'
WHERE email = 'cashier@scstix.com';

-- ─────────────────────────────────────────────────────────
-- 3. CATEGORIES
-- ─────────────────────────────────────────────────────────
INSERT INTO categories (id, name, sort_order)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Jerseys',      1),
  ('d0000000-0000-0000-0000-000000000002', 'Accessories',   2),
  ('d0000000-0000-0000-0000-000000000003', 'Equipment',     3),
  ('d0000000-0000-0000-0000-000000000004', 'Collectibles',  4);

-- ─────────────────────────────────────────────────────────
-- 4. PRODUCTS
-- ─────────────────────────────────────────────────────────
INSERT INTO products (id, sku, name, category_id, base_price, cost_price, emoji)
VALUES
  (gen_random_uuid(), 'HJ-2425',  'Home Jersey 24/25',     'd0000000-0000-0000-0000-000000000001', 89.99, 35.00, '⚽'),
  (gen_random_uuid(), 'AJ-2425',  'Away Jersey 24/25',     'd0000000-0000-0000-0000-000000000001', 89.99, 35.00, '🏟️'),
  (gen_random_uuid(), 'TT-001',   'Training Top',          'd0000000-0000-0000-0000-000000000001', 49.99, 18.00, '🎽'),
  (gen_random_uuid(), 'SC-001',   'Club Scarf',            'd0000000-0000-0000-0000-000000000002', 24.99, 8.00,  '🧣'),
  (gen_random_uuid(), 'BH-001',   'Beanie Hat',            'd0000000-0000-0000-0000-000000000002', 19.99, 6.00,  '🧢'),
  (gen_random_uuid(), 'FL-001',   'Stadium Flag',          'd0000000-0000-0000-0000-000000000002', 14.99, 4.00,  '🏴'),
  (gen_random_uuid(), 'MF-001',   'Mini Football',         'd0000000-0000-0000-0000-000000000003', 12.99, 4.00,  '⚽'),
  (gen_random_uuid(), 'WB-001',   'Water Bottle',          'd0000000-0000-0000-0000-000000000003',  9.99, 3.00,  '🍶'),
  (gen_random_uuid(), 'BP-001',   'Retro Badge Pin',       'd0000000-0000-0000-0000-000000000004',  7.99, 2.00,  '📌'),
  (gen_random_uuid(), 'SPF-001',  'Signed Photo Frame',    'd0000000-0000-0000-0000-000000000004', 39.99, 12.00, '🖼️'),
  (gen_random_uuid(), 'MG-001',   'Club Mug',              'd0000000-0000-0000-0000-000000000002',  8.99, 3.00,  '☕'),
  (gen_random_uuid(), 'KR-001',   'Keyring',               'd0000000-0000-0000-0000-000000000002',  5.99, 1.50,  '🔑');

-- Add inventory for each product at the main site
INSERT INTO inventory (product_id, site_id, stock_on_hand, reorder_point)
SELECT p.id, 'b0000000-0000-0000-0000-000000000001', 50, 10
FROM products p;

-- ─────────────────────────────────────────────────────────
-- 5. COUPONS
-- ─────────────────────────────────────────────────────────
INSERT INTO coupons (code, description, type, value, min_order, max_uses, active, expires_at)
VALUES
  ('WELCOME10', '10% off your first order',  'percent', 10, 20.00, 500, true, NOW() + INTERVAL '90 days'),
  ('MATCHDAY5', '£5 off on match day',       'fixed',    5,  0.00, 100, true, NOW() + INTERVAL '30 days');

-- ─────────────────────────────────────────────────────────
-- 6. SETTINGS (value column is JSONB)
-- ─────────────────────────────────────────────────────────
INSERT INTO settings (venue_id, site_id, key, value)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'storeName',     '"SCSTix EPOS"'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'storeAddress',  '"123 Stadium Road, London"'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'storePhone',    '"+44 20 1234 5678"'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'storeEmail',    '"info@scstix.com"'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'vatRate',       '20'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'currency',      '"GBP"'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'loyaltyRate',   '1'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'loyaltyValue',  '0.01'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'receiptFooter', '"Thank you for shopping at SCSTix EPOS!"');
