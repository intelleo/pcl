-- =========================================================
-- Skema Database Khusus: Schema PCL (Peak Champions League)
-- Dialek: PostgreSQL / Supabase
-- =========================================================

-- 1. BUAT SCHEMA KHUSUS
CREATE SCHEMA IF NOT EXISTS pcl;

-- 2. BERIKAN HAK AKSES API KE SCHEMA PCL
GRANT USAGE ON SCHEMA pcl TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL TABLES IN SCHEMA pcl TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA pcl TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL ROUTINES IN SCHEMA pcl TO anon, authenticated, service_role, postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA pcl GRANT ALL ON TABLES TO anon, authenticated, service_role, postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA pcl GRANT ALL ON SEQUENCES TO anon, authenticated, service_role, postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA pcl GRANT ALL ON ROUTINES TO anon, authenticated, service_role, postgres;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. TABEL-TABEL PCL
CREATE TABLE IF NOT EXISTS pcl.tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    season VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'group_stage', 'knockout', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pcl.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES pcl.tournaments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    logo_url TEXT,
    manager_name VARCHAR(255),
    group_name VARCHAR(50),
    rating INT DEFAULT 90,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pcl.players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES pcl.teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    squad_number INT NOT NULL DEFAULT 1,
    position VARCHAR(10) NOT NULL CHECK (position IN ('GK', 'DF', 'MF', 'FW')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pcl.tournament_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES pcl.tournaments(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS pcl.group_standings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES pcl.tournament_groups(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES pcl.teams(id) ON DELETE CASCADE,
    played INT NOT NULL DEFAULT 0,
    won INT NOT NULL DEFAULT 0,
    drawn INT NOT NULL DEFAULT 0,
    lost INT NOT NULL DEFAULT 0,
    goals_for INT NOT NULL DEFAULT 0,
    goals_against INT NOT NULL DEFAULT 0,
    goal_difference INT NOT NULL DEFAULT 0,
    points INT NOT NULL DEFAULT 0,
    rank INT NOT NULL DEFAULT 0,
    CONSTRAINT unique_group_team_pcl UNIQUE (group_id, team_id)
);

CREATE TABLE IF NOT EXISTS pcl.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES pcl.tournaments(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL CHECK (stage IN ('group', 'round_of_16', 'quarter_final', 'semi_final', 'final')),
    group_id UUID REFERENCES pcl.tournament_groups(id) ON DELETE SET NULL,
    knockout_bracket_slot VARCHAR(50),
    home_team_id UUID REFERENCES pcl.teams(id) ON DELETE SET NULL,
    away_team_id UUID REFERENCES pcl.teams(id) ON DELETE SET NULL,
    home_score INT NOT NULL DEFAULT 0,
    away_score INT NOT NULL DEFAULT 0,
    home_penalty_score INT,
    away_penalty_score INT,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'finished')),
    matchday INT NOT NULL DEFAULT 1,
    scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pcl.match_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES pcl.matches(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES pcl.teams(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES pcl.players(id) ON DELETE CASCADE,
    assist_player_id UUID REFERENCES pcl.players(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('goal', 'own_goal', 'penalty_goal', 'yellow_card', 'red_card')),
    minute INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pcl.team_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_tim VARCHAR(255) NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    manager_name VARCHAR(255) NOT NULL,
    kontak VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    catatan TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'diterima', 'ditolak')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pcl.season_champions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    musim VARCHAR(20) NOT NULL,
    label_musim VARCHAR(100) NOT NULL,
    juara_team_id UUID REFERENCES pcl.teams(id) ON DELETE SET NULL,
    runner_up_team_id UUID REFERENCES pcl.teams(id) ON DELETE SET NULL,
    skor_final VARCHAR(20) NOT NULL,
    top_scorer_nama VARCHAR(255),
    top_scorer_total INT DEFAULT 0,
    mvp_nama VARCHAR(255),
    mvp_rating NUMERIC(3,1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pcl.news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judul VARCHAR(255) NOT NULL,
    ringkasan TEXT,
    konten TEXT NOT NULL,
    kategori VARCHAR(50) DEFAULT 'turnamen',
    gambar_url TEXT,
    penulis VARCHAR(100) DEFAULT 'Redaksi PCL',
    diterbitkan_pada TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS POLICIES
ALTER TABLE pcl.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pcl.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE pcl.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE pcl.tournament_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE pcl.group_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pcl.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pcl.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pcl.team_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pcl.season_champions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pcl.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read All" ON pcl.tournaments FOR ALL USING (true);
CREATE POLICY "Public Read All" ON pcl.teams FOR ALL USING (true);
CREATE POLICY "Public Read All" ON pcl.players FOR ALL USING (true);
CREATE POLICY "Public Read All" ON pcl.tournament_groups FOR ALL USING (true);
CREATE POLICY "Public Read All" ON pcl.group_standings FOR ALL USING (true);
CREATE POLICY "Public Read All" ON pcl.matches FOR ALL USING (true);
CREATE POLICY "Public Read All" ON pcl.match_events FOR ALL USING (true);
CREATE POLICY "Public Read All" ON pcl.team_registrations FOR ALL USING (true);
CREATE POLICY "Public Read All" ON pcl.season_champions FOR ALL USING (true);
CREATE POLICY "Public Read All" ON pcl.news FOR ALL USING (true);

-- 5. HAPUS TABEL SISA PUBLIC JIKA ADA
DROP TABLE IF EXISTS public.match_events CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.group_standings CASCADE;
DROP TABLE IF EXISTS public.tournament_groups CASCADE;
DROP TABLE IF EXISTS public.players CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.tournaments CASCADE;
DROP TABLE IF EXISTS public.team_registrations CASCADE;
DROP TABLE IF EXISTS public.season_champions CASCADE;
DROP TABLE IF EXISTS public.news CASCADE;

-- 6. REFRESH SCHEMA POSTGREST
NOTIFY pgrst, 'reload schema';
