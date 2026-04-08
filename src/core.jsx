// ═══════════════════════════════════════════════════════════════
// SCSTix EPOS — CORE DATA, UTILITIES & SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════

export { THEMES } from '@/lib/theme'
export { PRODUCT_IMAGES } from '@/lib/seed-data'

export const INITIAL_PRODUCTS = [
  { id: "11111111-1111-1111-1111-111111111111", name: "Home Jersey 2024", sku: "JRS-HOME-24", category: "Jerseys", price: 89.99, stock: 45, emoji: "🔴", featured: true, description: "Official 2024 home kit jersey. Premium quality breathable fabric, moisture-wicking technology. Club crest embroidered on chest.", discount: 0, sizes: ["XS", "S", "M", "L", "XL", "XXL"], colors: ["Red/White"], material: "100% Polyester", fit: "Regular Fit", care: "Machine wash 30°C", brand: "SCSTix Official", taxPct: 20 },
  { id: "22222222-2222-2222-2222-222222222222", name: "Away Jersey 2024", sku: "JRS-AWAY-24", category: "Jerseys", price: 89.99, stock: 32, emoji: "⚪", featured: true, description: "Official 2024 away kit jersey. Lightweight performance fabric with ventilation zones.", discount: 0, sizes: ["XS", "S", "M", "L", "XL", "XXL"], colors: ["White/Blue"], material: "100% Polyester", fit: "Slim Fit", care: "Machine wash 30°C", brand: "SCSTix Official", taxPct: 20 },
  { id: "33333333-3333-3333-3333-333333333333", name: "Third Kit Jersey", sku: "JRS-THIRD-24", category: "Jerseys", price: 84.99, stock: 18, emoji: "🔵", featured: false, description: "Limited edition third kit. Bold design with contrast trim, limited run of 500 units.", discount: 0, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Navy Blue"], material: "100% Polyester", fit: "Regular Fit", care: "Machine wash 30°C", brand: "SCSTix Official", taxPct: 20 },
  { id: "44444444-4444-4444-4444-444444444444", name: "Training Jacket", sku: "TRN-JKT-24", category: "Training Wear", price: 64.99, stock: 27, emoji: "🧥", featured: true, description: "Lightweight training jacket with zip pockets. Wind-resistant shell, perfect for matchday warm-up.", discount: 0, sizes: ["XS", "S", "M", "L", "XL", "XXL"], colors: ["Red", "Black"], material: "95% Polyester, 5% Elastane", fit: "Athletic Fit", care: "Machine wash 40°C", brand: "SCSTix Official", taxPct: 20 },
  { id: "55555555-5555-5555-5555-555555555555", name: "Training Shorts", sku: "TRN-SHT-24", category: "Training Wear", price: 34.99, stock: 41, emoji: "🩳", featured: false, description: "Pro training shorts with elastic waistband and side pockets.", discount: 0, sizes: ["XS", "S", "M", "L", "XL", "XXL"], colors: ["Red", "Black", "White"], material: "100% Polyester", fit: "Regular Fit", care: "Machine wash 40°C", waist: "28-38 inches adjustable", brand: "SCSTix Official", taxPct: 20 },
  { id: "66666666-6666-6666-6666-666666666666", name: "Football Scarf", sku: "ACC-SCARF-01", category: "Fan Accessories", price: 19.99, stock: 120, emoji: "🧣", featured: true, description: "Knitted team scarf, double-sided club colours. Official merchandise.", discount: 0, sizes: ["One Size"], colors: ["Red/White"], material: "100% Acrylic", length: "150cm", width: "20cm", care: "Hand wash cold", brand: "SCSTix Official", taxPct: 20 },
  { id: "77777777-7777-7777-7777-777777777777", name: "Team Cap", sku: "ACC-CAP-01", category: "Fan Accessories", price: 24.99, stock: 85, emoji: "🧢", featured: false, description: "Embroidered team cap with adjustable strap.", discount: 0, sizes: ["One Size (Adjustable)"], colors: ["Red", "Black", "White"], material: "Cotton Twill", fit: "Structured 6-panel", care: "Spot clean only", brand: "SCSTix Official", taxPct: 20 },
  { id: "88888888-8888-8888-8888-888888888888", name: "Fan Hoodie", sku: "ACC-HOOD-01", category: "Fan Accessories", price: 54.99, stock: 33, emoji: "👕", featured: true, description: "Premium fan hoodie with kangaroo pocket. Soft fleece lining, printed club crest.", discount: 0, sizes: ["XS", "S", "M", "L", "XL", "XXL"], colors: ["Red", "Navy", "Grey"], material: "80% Cotton, 20% Polyester", fit: "Relaxed Fit", care: "Machine wash 30°C", brand: "SCSTix Official", taxPct: 20 },
  { id: "99999999-9999-9999-9999-999999999999", name: "Match Ball Official", sku: "EQP-BALL-01", category: "Football Equipment", price: 129.99, stock: 12, emoji: "⚽", featured: true, description: "FIFA approved match ball. Used in official league matches. Thermally bonded panels.", discount: 10, sizes: ["Size 5 (Official)"], colors: ["White/Black/Red"], material: "Synthetic leather, Latex bladder", circumference: "68-70cm", weight: "410-450g", care: "Wipe clean only", brand: "SCSTix Pro", taxPct: 20 },
  { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", name: "Goalkeeper Gloves", sku: "EQP-GLV-01", category: "Football Equipment", price: 44.99, stock: 8, emoji: "🥅", featured: false, description: "Pro goalkeeper gloves with 4mm latex palm. Negative cut for superior grip.", discount: 0, sizes: ["6", "7", "8", "9", "10", "11"], colors: ["Red/Black", "Black/Yellow"], material: "German Latex Palm, Neoprene back", cut: "Negative Cut", care: "Hand wash cold, air dry", brand: "SCSTix Pro", taxPct: 20 },
  { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", name: "Shin Guards Pro", sku: "EQP-SHIN-01", category: "Football Equipment", price: 29.99, stock: 55, emoji: "🛡️", featured: false, description: "Lightweight shin guards with ankle protection. Hard shell with foam backing.", discount: 0, sizes: ["XS (6-9yrs)", "S (9-12yrs)", "M (12-15yrs)", "L (15+yrs)"], colors: ["Black", "Red/Black"], material: "Polypropylene shell, EVA foam", height: "Multiple (see sizes)", care: "Wipe clean", brand: "SCSTix Pro", taxPct: 20 },
  { id: "cccccccc-cccc-cccc-cccc-cccccccccccc", name: "Signed Jersey", sku: "COL-SIG-CAP", category: "Collectibles", price: 249.99, stock: 3, emoji: "✍️", featured: true, description: "Signed by the club captain. Comes with certificate of authenticity and display frame. Limited edition.", discount: 0, sizes: ["L (Display Size)"], colors: ["Red/White (Home)"], material: "Official match jersey with authentic signature", edition: "Limited — only 3 remaining", includes: "Certificate of Authenticity, Display Frame", care: "Keep away from direct sunlight", brand: "SCSTix Collectibles", taxPct: 20 },
  { id: "dddddddd-dddd-dddd-dddd-dddddddddddd", name: "Stadium Print A3", sku: "COL-PRT-01", category: "Collectibles", price: 39.99, stock: 22, emoji: "🖼️", featured: false, description: "A3 art print of the stadium, hand-numbered. Ideal for framing.", discount: 0, sizes: ["A3 (297 x 420mm)"], colors: ["Full Colour"], material: "Premium 250gsm matte art paper", edition: "Hand-numbered limited edition", includes: "Cardboard backing, protective sleeve", care: "Store flat, frame to preserve", brand: "SCSTix Collectibles", taxPct: 20 },
  { id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee", name: "Mini Trophy Replica", sku: "COL-TRP-01", category: "Collectibles", price: 79.99, stock: 9, emoji: "🏆", featured: true, description: "Die-cast trophy replica, 1:5 scale. Gold plated finish.", discount: 0, sizes: ["1:5 Scale (28cm tall)"], colors: ["Gold"], material: "Zinc alloy, gold plated", weight: "850g", includes: "Display stand, dust cloth, gift box", care: "Dust regularly, avoid moisture", brand: "SCSTix Collectibles", taxPct: 20 },
];

// TODO: Remove when Supabase Auth is wired
export const INITIAL_USERS = [
  { id: "00000000-0000-0000-0000-000000000001", name: "Alex Rivera", email: "admin@fanstore.com", password: "admin123", role: "admin", avatar: "file:///C:/Users/User/.gemini/antigravity/brain/c0ff7d9b-185d-45b9-afef-310c26deefc2/staff_alex_rivera_1775365215722.png", phone: "07700900001", active: true, joinDate: "2023-01-01", loyaltyPoints: 0, tier: "N/A" },
  { id: "00000000-0000-0000-0000-000000000002", name: "Sam Chen", email: "manager@fanstore.com", password: "mgr123", role: "manager", avatar: "file:///C:/Users/User/.gemini/antigravity/brain/c0ff7d9b-185d-45b9-afef-310c26deefc2/staff_sam_chen_1775365283138.png", phone: "07700900002", active: true, joinDate: "2023-01-15", loyaltyPoints: 0, tier: "N/A", venue_id: "VEN-001", site_id: "SITE-001" },
  { id: "00000000-0000-0000-0000-000000000003", name: "Jordan Lee", email: "cashier@fanstore.com", password: "cash123", role: "cashier", counter: "Counter 1", avatar: "file:///C:/Users/User/.gemini/antigravity/brain/c0ff7d9b-185d-45b9-afef-310c26deefc2/staff_jordan_lee_1775365661341.png", phone: "07700900003", active: true, joinDate: "2023-03-01", loyaltyPoints: 0, tier: "N/A" },
  { id: "00000000-0000-0000-0000-000000000004", name: "Morgan Blake", email: "cashier2@fanstore.com", password: "cash456", role: "cashier", counter: "Counter 2", avatar: "file:///C:/Users/User/.gemini/antigravity/brain/c0ff7d9b-185d-45b9-afef-310c26deefc2/staff_morgan_blake_1775365713912.png", phone: "07700900004", active: true, joinDate: "2023-04-01", loyaltyPoints: 0, tier: "N/A" },
  { id: "00000000-0000-0000-0000-000000000005", name: "Taylor Smith", email: "customer@fanstore.com", password: "cust123", role: "customer", avatar: "TS", phone: "07700900005", active: true, joinDate: "2023-06-01", loyaltyPoints: 320, tier: "Silver", pointsExpiry: "2025-06-01", totalSpent: 1240 },
  { id: "00000000-0000-0000-0000-000000000006", name: "Chris Johnson", email: "chris@email.com", password: "cust456", role: "customer", avatar: "CJ", phone: "07700900006", active: true, joinDate: "2023-09-01", loyaltyPoints: 45, tier: "Bronze", pointsExpiry: "2025-09-01", totalSpent: 180 },
  { id: "00000000-0000-0000-0000-000000000007", name: "Alex Murphy", email: "staff1@fanstore.com", password: "staff123", role: "staff", avatar: "AM", phone: "07700900007", active: true, joinDate: "2024-01-01", counter: "Counter 1", loyaltyPoints: 0, tier: "N/A" },
  { id: "00000000-0000-0000-0000-000000000008", name: "Jamie Davis", email: "staff2@fanstore.com", password: "staff456", role: "staff", avatar: "JD", phone: "07700900008", active: true, joinDate: "2024-02-01", counter: "Counter 2", loyaltyPoints: 0, tier: "N/A" },
  { id: "00000000-0000-0000-0000-000000000009", name: "Sarah Jenkins", email: "sarah@email.com", password: "cust789", role: "customer", avatar: "SJ", phone: "5667788991", active: true, joinDate: "2024-03-01", loyaltyPoints: 2150, tier: "Gold", pointsExpiry: "2026-03-01", totalSpent: 4200 },
  { id: "00000000-0000-0000-0000-000000000010", name: "Mike Ross", email: "mike@email.com", password: "cust101", role: "customer", avatar: "MR", phone: "5667788992", active: true, joinDate: "2024-03-05", loyaltyPoints: 820, tier: "Silver", pointsExpiry: "2026-03-05", totalSpent: 1550 },
  { id: "00000000-0000-0000-0000-000000000011", name: "Emma Wilson", email: "emma@email.com", password: "cust102", role: "customer", avatar: "EW", phone: "5667788993", active: true, joinDate: "2024-03-10", loyaltyPoints: 120, tier: "Bronze", pointsExpiry: "2026-03-10", totalSpent: 340 },
  { id: "00000000-0000-0000-0000-000000000012", name: "David Baker", email: "david@email.com", password: "cust103", role: "customer", avatar: "DB", phone: "5667788994", active: true, joinDate: "2024-03-15", loyaltyPoints: 3500, tier: "Gold", pointsExpiry: "2026-03-15", totalSpent: 6800 },
  { id: "00000000-0000-0000-0000-000000000013", name: "Lisa Thompson", email: "lisa@email.com", password: "cust104", role: "customer", avatar: "LT", phone: "5667788995", active: true, joinDate: "2024-03-20", loyaltyPoints: 640, tier: "Silver", pointsExpiry: "2026-03-20", totalSpent: 1120 },
];

export const INITIAL_ORDERS = [
  { id: "ORD-0001", customerId: "00000000-0000-0000-0000-000000000005", customerName: "Taylor Smith", cashierId: "00000000-0000-0000-0000-000000000003", cashierName: "Jordan Lee", items: [{ productId: "11111111-1111-1111-1111-111111111111", name: "Home Jersey 2024", qty: 1, price: 89.99, discount: 0 }, { productId: "66666666-6666-6666-6666-666666666666", name: "Football Scarf", qty: 2, price: 19.99, discount: 0 }], subtotal: 129.97, tax: 25.99, discountAmt: 0, loyaltyDiscount: 0, deliveryCharge: 0, total: 155.96, payment: "Card", cardLast4: "4242", date: "2024-01-15 10:23", counter: "Counter 1", status: "completed", orderType: "in-store", loyaltyEarned: 155, loyaltyUsed: 0 },
  { id: "ORD-0002", customerId: "00000000-0000-0000-0000-000000000006", customerName: "Chris Johnson", cashierId: "00000000-0000-0000-0000-000000000004", cashierName: "Morgan Blake", items: [{ productId: "99999999-9999-9999-9999-999999999999", name: "Match Ball Official", qty: 1, price: 129.99, discount: 0 }], subtotal: 129.99, tax: 26.00, discountAmt: 0, loyaltyDiscount: 0, deliveryCharge: 0, total: 155.99, payment: "Cash", cashGiven: 160, cashChange: 4.01, date: "2024-01-15 11:45", counter: "Counter 2", status: "completed", orderType: "in-store", loyaltyEarned: 155, loyaltyUsed: 0 },
  { id: "ORD-0003", customerId: null, customerName: "Walk-in", cashierId: "00000000-0000-0000-0000-000000000003", cashierName: "Jordan Lee", items: [{ productId: "44444444-4444-4444-4444-444444444444", name: "Training Jacket", qty: 1, price: 64.99, discount: 0 }, { productId: "77777777-7777-7777-7777-777777777777", name: "Team Cap", qty: 1, price: 24.99, discount: 0 }], subtotal: 89.98, tax: 18.00, discountAmt: 0, loyaltyDiscount: 0, deliveryCharge: 0, total: 107.98, payment: "Card", cardLast4: "1234", date: "2024-01-15 13:12", counter: "Counter 1", status: "completed", orderType: "in-store", loyaltyEarned: 0, loyaltyUsed: 0 },
  { id: "ORD-0004", customerId: "00000000-0000-0000-0000-000000000005", customerName: "Taylor Smith", cashierId: "00000000-0000-0000-0000-000000000003", cashierName: "Jordan Lee", items: [{ productId: "cccccccc-cccc-cccc-cccc-cccccccccccc", name: "Signed Jersey", qty: 1, price: 249.99, discount: 0 }], subtotal: 249.99, tax: 50.00, discountAmt: 0, loyaltyDiscount: 0, deliveryCharge: 5.99, total: 305.98, payment: "QR", date: "2024-01-14 14:05", counter: "Counter 1", status: "completed", orderType: "delivery", deliveryAddress: "123 Stadium Road, London", deliveryStatus: "delivered", loyaltyEarned: 305, loyaltyUsed: 0 },
];

export const INITIAL_RETURNS = [
  { id: "RET-001", orderId: "ORD-0006", customerId: "00000000-0000-0000-0000-000000000006", customerName: "Chris Johnson", productId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", productName: "Goalkeeper Gloves", qty: 1, reason: "Wrong size", status: "approved", refundAmount: 44.99, date: "2024-01-16 09:00", type: "full" },
  { id: "RET-002", orderId: "ORD-0001", customerId: "00000000-0000-0000-0000-000000000005", customerName: "Taylor Smith", productId: "66666666-6666-6666-6666-666666666666", productName: "Football Scarf", qty: 1, reason: "Damaged item", status: "pending", refundAmount: 19.99, date: "2024-01-16 14:30", type: "partial" },
];

export const INITIAL_BANNERS = [
  { id: 1, title: "Match Day Special!", subtitle: "20% off all Jerseys today only", cta: "Shop Now", color: "#dc2626", grad: "linear-gradient(135deg,#dc2626,#7f1d1d)", emoji: "⚽", active: true, offerType: "category", offerTarget: "Jerseys", offerDiscount: 20, startDate: "2024-01-01T00:00", endDate: "2026-12-31T23:59", image: "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1600" },
];

export const INITIAL_SETTINGS = {
  venueId: 'a0000000-0000-0000-0000-000000000001',
  siteId: 'b0000000-0000-0000-0000-000000000001',
  storeName: "SCSTix FanStore",
  storeAddress: "123 Stadium Road, London",
  storePhone: "020 7946 0000",
  storeEmail: "shop@scstix.com",
  sym: "£",
  taxRate: 20,
  loyaltyRate: 1,
  loyaltyValue: 0.05,
  receiptFooter: "Thank you for shopping with SCSTix!",
  returnDays: 28,
  logoUrl: "/logo-dark.png"
};

export const INITIAL_COUNTERS = [
  { id: "c0000000-0000-0000-0000-000000000001", name: "Counter 1", location: "North Entrance", active: true },
  { id: "c0000000-0000-0000-0000-000000000002", name: "Counter 2", location: "South Side", active: true },
  { id: "c0000000-0000-0000-0000-000000000003", name: "Counter 3", location: "Main Shop", active: true },
];

export const INITIAL_COUPONS = [
  { id: 1, code: "FANDAY10", description: "10% off for Fan Day", type: "percent", value: 10, minOrder: 0, uses: 45, maxUses: 100, active: true, expiry: "2026-12-31" },
  { id: 2, code: "WELCOME20", description: "£20 off for new members", type: "fixed", value: 20, minOrder: 100, uses: 12, maxUses: 50, active: true, expiry: "2026-12-31" },
  { id: 3, code: "FREESHIP", description: "Free shipping on orders over £50", type: "delivery", value: 0, minOrder: 50, uses: 89, maxUses: 500, active: true, expiry: "2026-12-31" },
];

export const INITIAL_VENUES = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    name: "Main Stadium",
    address: "123 Stadium Road, London",
    sites: [
      { id: "b0000000-0000-0000-0000-000000000001", name: "Main Shop" },
      { id: "b0000000-0000-0000-0000-000000000002", name: "East Wing Popup" }
    ]
  }
];

// ── UTILS ──
export const ts = () => new Date().toISOString();
export const getTier = (pts) => {
  if (pts >= 2000) return "Gold";
  if (pts >= 500) return "Silver";
  return "Bronze";
};
