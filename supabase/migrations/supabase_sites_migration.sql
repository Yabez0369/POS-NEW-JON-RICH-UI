-- Migration SQL to add missing columns to the 'sites' table
-- Run this in your Supabase SQL Editor to fix the "column does not exist" error

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sites' AND column_name='address') THEN
        ALTER TABLE public.sites ADD COLUMN address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sites' AND column_name='phone') THEN
        ALTER TABLE public.sites ADD COLUMN phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sites' AND column_name='email') THEN
        ALTER TABLE public.sites ADD COLUMN email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sites' AND column_name='manager') THEN
        ALTER TABLE public.sites ADD COLUMN manager TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sites' AND column_name='notes') THEN
        ALTER TABLE public.sites ADD COLUMN notes TEXT;
    END IF;
END $$;
