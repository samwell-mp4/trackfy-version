-- 1. Corrigir constraint de tipos de eventos (Adicionando 'content' e 'travel')
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_type_check;
ALTER TABLE events ADD CONSTRAINT events_type_check 
    CHECK (type IN ('release', 'recording', 'meeting', 'deadline', 'rehearsal', 'show', 'post', 'mastering', 'other', 'content', 'travel'));

-- 2. Garantir colunas extras na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS artistic_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS musical_genre TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS managed_artists_count INTEGER;

-- 3. Garantir que a tabela video_requests existe
CREATE TABLE IF NOT EXISTS video_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metodo VARCHAR(20) NOT NULL CHECK (metodo IN ('Automatico', 'Manual')),
    frase TEXT,
    num_images INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices e RLS para video_requests
CREATE INDEX IF NOT EXISTS idx_video_requests_user_id ON video_requests(user_id);
ALTER TABLE video_requests ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_requests' AND policyname = 'Users can view their own video requests') THEN
        CREATE POLICY "Users can view their own video requests" ON video_requests FOR SELECT USING (auth.uid() = user_id::uuid OR user_id = (select id from users where email = auth.jwt()->>'email'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_requests' AND policyname = 'Users can insert their own video requests') THEN
        CREATE POLICY "Users can insert their own video requests" ON video_requests FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_requests' AND policyname = 'Users can update their own video requests') THEN
        CREATE POLICY "Users can update their own video requests" ON video_requests FOR UPDATE USING (true);
    END IF;
END $$;
