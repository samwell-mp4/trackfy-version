-- Comprehensive Fix Script for Schema and RLS

-- 1. Fix Events Table (Agenda)
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('planned', 'confirmed', 'completed', 'cancelled')) DEFAULT 'planned',
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Fix Files Table (just in case)
ALTER TABLE files
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 3. Fix Checklists and Tasks (ensure columns exist)
ALTER TABLE checklists
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 4. Enable RLS on all module tables
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_tracking ENABLE ROW LEVEL SECURITY;

-- 5. Create Permissive Policies (Unblock all operations for authenticated users)

-- Helper function to drop policy if exists (to avoid errors on re-run)
DO $$
BEGIN
    -- Artists
    DROP POLICY IF EXISTS "Allow all for artists" ON artists;
    -- Tracks
    DROP POLICY IF EXISTS "Allow all for tracks" ON tracks;
    -- Events
    DROP POLICY IF EXISTS "Allow all for events" ON events;
    -- Checklists
    DROP POLICY IF EXISTS "Allow all for checklists" ON checklists;
    -- Tasks
    DROP POLICY IF EXISTS "Allow all for tasks" ON tasks;
    -- Files
    DROP POLICY IF EXISTS "Allow all for files" ON files;
    -- Gallery Tracking
    DROP POLICY IF EXISTS "Allow all for gallery_tracking" ON gallery_tracking;
END
$$;

-- Create Policies
CREATE POLICY "Allow all for artists" ON artists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for tracks" ON tracks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for events" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for checklists" ON checklists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for files" ON files FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for gallery_tracking" ON gallery_tracking FOR ALL USING (true) WITH CHECK (true);

-- 6. Ensure Users table policies are also permissive
DROP POLICY IF EXISTS "Allow all public access" ON users;
CREATE POLICY "Allow all public access" ON users FOR ALL USING (true) WITH CHECK (true);
