# System Updates Report

Below is a complete breakdown of what was changed across the application (including Supabase schemas, frontend forms, and utilities) and the reasoning behind each of these modifications.

---

## 1. Multi-Variant Support (Sizes & Colors)
**Files Modified:** `supabase/schema.sql`, `src/pages/manager/ProductManagement.jsx`

### What was changed:
- **Supabase Database (`schema.sql`)**: 
  - Dropped the `size` and `color` regular text columns.
  - Added `sizes TEXT[]` and `colors TEXT[]` (Array columns) to the `products` table.
- **Frontend Form (`ProductManagement.jsx`)**: 
  - Instead of standard text inputs for a single size and color, the form now utilizes a "pill" selection design. 
  - Store Managers can now select **multiple** sizes (e.g., `["S", "L", "XL"]`) and colors (e.g., `["Black", "Red"]`) for a single product. 
  - They can also type custom sizes/colors and press `Enter` to dynamically add them to the product.

### Why:
Initially, sizes and colors were saved as single strings. However, if a product only has a single string for its variant, the `POSTerminal` assumes there are no choices to make, so it completely bypasses the selection prompt. 
By converting these fields to Arrays (`[]`), the POS Terminal recognizes that there are multiple variants attached to the product, which successfully triggers the built-in **Select Variant** popup modal before adding the item to the cart. 
*(Note: Be sure to run the `ALTER TABLE products DROP COLUMN size, DROP COLUMN color, ADD COLUMN sizes TEXT[], ADD COLUMN colors TEXT[];` query in your Supabase SQL editor to match these changes!)*

---

## 2. Dynamic Currency Symbol
**Files Modified:** `src/lib/utils.js`, `src/core.jsx`, `src/pages/admin/SettingsPage.jsx`, `src/App.jsx`

### What was changed:
- **Utilities (`utils.js` & `core.jsx`)**: 
  - Updated the global currency formatting function (`fmt`) to read the active currency symbol directly from the browser's `localStorage` rather than defaulting to hardcoded `£`.
- **System Settings (`SettingsPage.jsx`)**:
  - Modified the **Save Settings** button so that if the Admin changes the currency symbol, it instantly saves the new symbol to `localStorage` and reloads the interface.
- **Main App Container (`App.jsx`)**:
  - Added a synchronization hook (`useEffect`) that automatically copies the saved `settings.sym` from Supabase into `localStorage` every time the app boots.

### Why:
Previously, the currency format was locked to the default symbol because it had no simple way to talk to the Admin settings on the fly. By storing the chosen symbol in `localStorage`, the formatter can natively format all numbers across every single screen (Admin, Product Management, POS Layout) correctly without having to rewrite or pass the `sym` property down manually to every component.
