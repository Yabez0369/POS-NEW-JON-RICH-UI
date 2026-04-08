-- SQL to create/update the 'sites' table for Outlet Management
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.sites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'retail',
    status TEXT DEFAULT 'active',
    address TEXT,
    phone TEXT,
    email TEXT,
    manager TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

-- Simple policy (Allow all for now, or customize as needed)
CREATE POLICY "Allow all access to sites" ON public.sites
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Add some initial reminder/dummy data if table is empty
INSERT INTO public.sites (name, type, status, manager, address, phone, notes)
SELECT 'Downtown Hub', 'retail', 'active', 'John Doe', '123 Main St, City Center', '555-0101', 'Weekly stock audit on Mondays. Security code: 4422.'
WHERE NOT EXISTS (SELECT 1 FROM public.sites WHERE name = 'Downtown Hub');

INSERT INTO public.sites (name, type, status, manager, address, phone, notes)
SELECT 'North Warehouse', 'warehouse', 'active', 'Jane Smith', '45 Industrial Pkwy', '555-0202', 'Requires forklift maintenance every Friday. Contact vendor at 555-9999.'
WHERE NOT EXISTS (SELECT 1 FROM public.sites WHERE name = 'North Warehouse');

INSERT INTO public.sites (name, type, status, manager, address, phone, notes)
SELECT 'Airport Kiosk', 'kiosk', 'inactive', 'Mike Ross', 'Terminal 2, International Airport', '555-0303', 'Temporary closure due to terminal renovation. Check back on April 15th.'
WHERE NOT EXISTS (SELECT 1 FROM public.sites WHERE name = 'Airport Kiosk');
