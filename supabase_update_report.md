# Supabase Database Update - Products Table

The Supabase database has been further modified to support the **Multi-Variant** feature (multiple sizes and colors per product).

## Changes Made
1. **Removed**: `size TEXT` and `color TEXT`
2. **Replaced With**: `sizes TEXT[]` and `colors TEXT[]`

This allows a single product to contain a list of available sizes and colors, which will trigger the POS Terminal to open an intercept modal asking the cashier/customer to pick the specific variant when adding the item to the cart.

## SQL Query Used (If updating existing DB):
If you need to apply this to the live database, run this query in the Supabase SQL Editor:
```sql
ALTER TABLE products 
DROP COLUMN size, 
DROP COLUMN color, 
ADD COLUMN sizes TEXT[], 
ADD COLUMN colors TEXT[];
```
