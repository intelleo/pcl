-- =========================================================
-- Skema Database: Prefix pcl_ di Schema PUBLIC
-- Dialek: PostgreSQL / Supabase
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TOURNAMENTS
CREATE TABLE IF NOT EXISTS public.pcl_tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    season VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'group_stage', 'knockout', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TEAMS
CREATE TABLE IF NOT EXISTS public.pcl_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES public.pcl_tournaments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    logo_url TEXT,
    manager_name VARCHAR(255),
    group_name VARCHAR(50),
    rating INT DEFAULT 90,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PLAYERS
CREATE TABLE IF NOT EXISTS public.pcl_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.pcl_teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    squad_number INT NOT NULL DEFAULT 1,
    position VARCHAR(10) NOT NULL CHECK (position IN ('GK', 'DF', 'MF', 'FW')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GROUPS & STANDINGS
CREATE TABLE IF NOT EXISTS public.pcl_tournament_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES public.pcl_tournaments(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.pcl_group_standings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.pcl_tournament_groups(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.pcl_teams(id) ON DELETE CASCADE,
    played INT NOT NULL DEFAULT 0,
    won INT NOT NULL DEFAULT 0,
    drawn INT NOT NULL DEFAULT 0,
    lost INT NOT NULL DEFAULT 0,
    goals_for INT NOT NULL DEFAULT 0,
    goals_against INT NOT NULL DEFAULT 0,
    goal_difference INT NOT NULL DEFAULT 0,
    points INT NOT NULL DEFAULT 0,
    rank INT NOT NULL DEFAULT 0,
    CONSTRAINT unique_pcl_group_team UNIQUE (group_id, team_id)
);

-- 5. MATCHES & EVENTS
CREATE TABLE IF NOT EXISTS public.pcl_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES public.pcl_tournaments(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL CHECK (stage IN ('group', 'round_of_16', 'quarter_final', 'semi_final', 'final')),
    group_id UUID REFERENCES public.pcl_tournament_groups(id) ON DELETE SET NULL,
    knockout_bracket_slot VARCHAR(50),
    home_team_id UUID REFERENCES public.pcl_teams(id) ON DELETE SET NULL,
    away_team_id UUID REFERENCES public.pcl_teams(id) ON DELETE SET NULL,
    home_score INT NOT NULL DEFAULT 0,
    away_score INT NOT NULL DEFAULT 0,
    home_penalty_score INT,
    away_penalty_score INT,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'finished')),
    matchday INT NOT NULL DEFAULT 1,
    scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pcl_match_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES public.pcl_matches(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.pcl_teams(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.pcl_players(id) ON DELETE CASCADE,
    assist_player_id UUID REFERENCES public.pcl_players(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('goal', 'own_goal', 'penalty_goal', 'yellow_card', 'red_card')),
    minute INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PENDAFTARAN TIM ONLINE
CREATE TABLE IF NOT EXISTS public.pcl_team_registrations (
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

-- 7. RIWAYAT JUARA
CREATE TABLE IF NOT EXISTS public.pcl_season_champions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    musim VARCHAR(20) NOT NULL,
    label_musim VARCHAR(100) NOT NULL,
    juara_team_id UUID REFERENCES public.pcl_teams(id) ON DELETE SET NULL,
    runner_up_team_id UUID REFERENCES public.pcl_teams(id) ON DELETE SET NULL,
    skor_final VARCHAR(20) NOT NULL,
    top_scorer_nama VARCHAR(255),
    top_scorer_total INT DEFAULT 0,
    mvp_nama VARCHAR(255),
    mvp_rating NUMERIC(3,1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BERITA
CREATE TABLE IF NOT EXISTS public.pcl_news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judul VARCHAR(255) NOT NULL,
    ringkasan TEXT,
    konten TEXT NOT NULL,
    kategori VARCHAR(50) DEFAULT 'turnamen',
    gambar_url TEXT,
    penulis VARCHAR(100) DEFAULT 'Redaksi PCL',
    diterbitkan_pada TIMESTAMPTZ DEFAULT NOW()
);

-- Hak Akses & RLS di Public
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

ALTER TABLE public.pcl_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcl_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcl_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcl_tournament_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcl_group_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcl_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcl_match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcl_team_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcl_season_champions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcl_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read All" ON public.pcl_tournaments FOR ALL USING (true);
CREATE POLICY "Public Read All" ON public.pcl_teams FOR ALL USING (true);
CREATE POLICY "Public Read All" ON public.pcl_players FOR ALL USING (true);
CREATE POLICY "Public Read All" ON public.pcl_tournament_groups FOR ALL USING (true);
CREATE POLICY "Public Read All" ON public.pcl_group_standings FOR ALL USING (true);
CREATE POLICY "Public Read All" ON public.pcl_matches FOR ALL USING (true);
CREATE POLICY "Public Read All" ON public.pcl_match_events FOR ALL USING (true);
CREATE POLICY "Public Read All" ON public.pcl_team_registrations FOR ALL USING (true);
CREATE POLICY "Public Read All" ON public.pcl_season_champions FOR ALL USING (true);
CREATE POLICY "Public Read All" ON public.pcl_news FOR ALL USING (true);

NOTIFY pgrst, 'reload schema';
