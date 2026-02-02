-- Add missing fields to artists table to match frontend form
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS artist_type TEXT CHECK (artist_type IN ('signed', 'independent')) DEFAULT 'independent',
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS rg TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email_contact TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS share_email TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS responsible_name TEXT,
ADD COLUMN IF NOT EXISTS responsible_phone TEXT,
ADD COLUMN IF NOT EXISTS responsible_email TEXT,
ADD COLUMN IF NOT EXISTS responsible_company TEXT,
ADD COLUMN IF NOT EXISTS responsible_percentage NUMERIC;
