-- ====================================================================
-- SKRIP SETUP LENGKAP DATABASE SUPABASE - PEAK CHAMPIONS LEAGUE (PCL)
-- Jalankan skrip ini SEKALI di SQL Editor Supabase Proyek Baru Anda.
-- Mencakup: Extensions, Tabel, Relasi, Indeks, RLS Policies, & Seed Data.
-- ====================================================================

-- 0. EKSTENSI POSTGRESQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 1. STRUKTUR TABEL (SCHEMA PUBLIC DENGAN PREFIX pcl_)
-- ====================================================================

-- A. TOURNAMENTS
CREATE TABLE IF NOT EXISTS public.pcl_tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    season VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'group_stage', 'knockout', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. TEAMS (KLUB PESERTA)
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

-- C. PLAYERS (PEMAIN & SKUAD)
CREATE TABLE IF NOT EXISTS public.pcl_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.pcl_teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    squad_number INT NOT NULL DEFAULT 1,
    position VARCHAR(10) NOT NULL CHECK (position IN ('GK', 'DF', 'CB', 'MF', 'CM', 'WF', 'FW', 'ST')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- D. TOURNAMENT GROUPS & STANDINGS
CREATE TABLE IF NOT EXISTS public.pcl_tournament_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES public.pcl_tournaments(id) ON DELETE CASCADE,
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

-- E. MATCHES & MATCH EVENTS
CREATE TABLE IF NOT EXISTS public.pcl_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES public.pcl_tournaments(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL CHECK (stage IN ('group', 'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'final')),
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
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('goal', 'own_goal', 'penalty_goal', 'yellow_card', 'red_card', 'assist')),
    minute INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- F. PENDAFTARAN TIM ONLINE
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

-- G. RIWAYAT JUARA (HALL OF FAME)
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

-- H. BERITA & LIPUTAN
CREATE TABLE IF NOT EXISTS public.pcl_news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judul VARCHAR(255) NOT NULL,
    ringkasan TEXT,
    konten TEXT NOT NULL,
    kategori VARCHAR(50) DEFAULT 'turnamen',
    tag VARCHAR(50) DEFAULT 'MATCH RECAP',
    penulis VARCHAR(100) DEFAULT 'Redaksi PCL',
    gambar_url TEXT,
    waktu_baca VARCHAR(50) DEFAULT '3 min read',
    terkait_match_id UUID REFERENCES public.pcl_matches(id) ON DELETE SET NULL,
    diterbitkan_pada TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- I. SETTINGS & APP CONFIG
CREATE TABLE IF NOT EXISTS public.pcl_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 2. INDEKS DATABASE B-TREE (PERFORMA TINGGI & INSTAN)
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_pcl_matches_stage ON public.pcl_matches(stage);
CREATE INDEX IF NOT EXISTS idx_pcl_matches_status ON public.pcl_matches(status);
CREATE INDEX IF NOT EXISTS idx_pcl_matches_matchday ON public.pcl_matches(matchday);
CREATE INDEX IF NOT EXISTS idx_pcl_matches_home_team ON public.pcl_matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_pcl_matches_away_team ON public.pcl_matches(away_team_id);
CREATE INDEX IF NOT EXISTS idx_pcl_matches_stage_status ON public.pcl_matches(stage, status);
CREATE INDEX IF NOT EXISTS idx_pcl_matches_scheduled_at ON public.pcl_matches(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_pcl_match_events_match_id ON public.pcl_match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_pcl_match_events_player_id ON public.pcl_match_events(player_id);
CREATE INDEX IF NOT EXISTS idx_pcl_match_events_team_id ON public.pcl_match_events(team_id);
CREATE INDEX IF NOT EXISTS idx_pcl_match_events_event_type ON public.pcl_match_events(event_type);

CREATE INDEX IF NOT EXISTS idx_pcl_players_team_id ON public.pcl_players(team_id);
CREATE INDEX IF NOT EXISTS idx_pcl_players_position ON public.pcl_players(position);

CREATE INDEX IF NOT EXISTS idx_pcl_teams_group_name ON public.pcl_teams(group_name);
CREATE INDEX IF NOT EXISTS idx_pcl_teams_name ON public.pcl_teams(name);

CREATE INDEX IF NOT EXISTS idx_pcl_news_diterbitkan ON public.pcl_news(diterbitkan_pada DESC);
CREATE INDEX IF NOT EXISTS idx_pcl_team_reg_status ON public.pcl_team_registrations(status);

-- ====================================================================
-- 3. ROW LEVEL SECURITY (RLS) & HAK AKSES API
-- ====================================================================
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
ALTER TABLE public.pcl_settings ENABLE ROW LEVEL SECURITY;

-- Policy Akses Penuh untuk Anonim & Terotentikasi
DROP POLICY IF EXISTS "Public All Access" ON public.pcl_tournaments;
CREATE POLICY "Public All Access" ON public.pcl_tournaments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public All Access" ON public.pcl_teams;
CREATE POLICY "Public All Access" ON public.pcl_teams FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public All Access" ON public.pcl_players;
CREATE POLICY "Public All Access" ON public.pcl_players FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public All Access" ON public.pcl_tournament_groups;
CREATE POLICY "Public All Access" ON public.pcl_tournament_groups FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public All Access" ON public.pcl_group_standings;
CREATE POLICY "Public All Access" ON public.pcl_group_standings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public All Access" ON public.pcl_matches;
CREATE POLICY "Public All Access" ON public.pcl_matches FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public All Access" ON public.pcl_match_events;
CREATE POLICY "Public All Access" ON public.pcl_match_events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public All Access" ON public.pcl_team_registrations;
CREATE POLICY "Public All Access" ON public.pcl_team_registrations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public All Access" ON public.pcl_season_champions;
CREATE POLICY "Public All Access" ON public.pcl_season_champions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public All Access" ON public.pcl_news;
CREATE POLICY "Public All Access" ON public.pcl_news FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public All Access" ON public.pcl_settings;
CREATE POLICY "Public All Access" ON public.pcl_settings FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- 4. DATA AWAL (SEED INITIAL DATA)
-- ====================================================================
DO $$
DECLARE
    v_tourney_id UUID;
    v_team_bar UUID;
    v_team_rma UUID;
    v_team_mun UUID;
    v_team_mci UUID;
    v_team_bay UUID;
    v_team_dor UUID;
    v_team_psg UUID;
    v_team_juv UUID;
    v_grp_a UUID;
    v_grp_b UUID;
    v_ply_messi UUID;
    v_ply_ronaldo UUID;
    v_ply_haaland UUID;
    v_ply_mbappe UUID;
    v_match_1 UUID;
BEGIN
    -- 1. Turnamen Utama
    INSERT INTO public.pcl_tournaments (name, season, status)
    VALUES ('Peak Champions League 2026', '2026', 'group_stage')
    RETURNING id INTO v_tourney_id;

    -- 2. Setting Pendaftaran Buka
    INSERT INTO public.pcl_settings (key, value)
    VALUES ('pendaftaran_buka', 'true')
    ON CONFLICT (key) DO UPDATE SET value = 'true';

    -- 3. Tim Peserta (8 Klub Starter)
    INSERT INTO public.pcl_teams (tournament_id, name, short_name, manager_name, group_name, rating) VALUES
    (v_tourney_id, 'Barcelona FC', 'BAR', 'Coach Xavi', 'Grup A', 93) RETURNING id INTO v_team_bar;
    INSERT INTO public.pcl_teams (tournament_id, name, short_name, manager_name, group_name, rating) VALUES
    (v_tourney_id, 'Real Madrid', 'RMA', 'Coach Ancelotti', 'Grup A', 94) RETURNING id INTO v_team_rma;
    INSERT INTO public.pcl_teams (tournament_id, name, short_name, manager_name, group_name, rating) VALUES
    (v_tourney_id, 'Manchester United', 'MUN', 'Coach Ten Hag', 'Grup A', 88) RETURNING id INTO v_team_mun;
    INSERT INTO public.pcl_teams (tournament_id, name, short_name, manager_name, group_name, rating) VALUES
    (v_tourney_id, 'Manchester City', 'MCI', 'Coach Pep', 'Grup A', 95) RETURNING id INTO v_team_mci;

    INSERT INTO public.pcl_teams (tournament_id, name, short_name, manager_name, group_name, rating) VALUES
    (v_tourney_id, 'Bayern Munich', 'BAY', 'Coach Kompany', 'Grup B', 92) RETURNING id INTO v_team_bay;
    INSERT INTO public.pcl_teams (tournament_id, name, short_name, manager_name, group_name, rating) VALUES
    (v_tourney_id, 'Borussia Dortmund', 'DOR', 'Coach Sahin', 'Grup B', 87) RETURNING id INTO v_team_dor;
    INSERT INTO public.pcl_teams (tournament_id, name, short_name, manager_name, group_name, rating) VALUES
    (v_tourney_id, 'Paris Saint-Germain', 'PSG', 'Coach Enrique', 'Grup B', 90) RETURNING id INTO v_team_psg;
    INSERT INTO public.pcl_teams (tournament_id, name, short_name, manager_name, group_name, rating) VALUES
    (v_tourney_id, 'Juventus FC', 'JUV', 'Coach Motta', 'Grup B', 86) RETURNING id INTO v_team_juv;

    -- 4. Pemain Kunci
    INSERT INTO public.pcl_players (team_id, name, squad_number, position) VALUES
    (v_team_bar, 'L. Messi (Peak)', 10, 'ST') RETURNING id INTO v_ply_messi;
    INSERT INTO public.pcl_players (team_id, name, squad_number, position) VALUES
    (v_team_bar, 'Pedri', 8, 'CM');
    INSERT INTO public.pcl_players (team_id, name, squad_number, position) VALUES
    (v_team_bar, 'Ter Stegen', 1, 'GK');

    INSERT INTO public.pcl_players (team_id, name, squad_number, position) VALUES
    (v_team_rma, 'C. Ronaldo (Peak)', 7, 'ST') RETURNING id INTO v_ply_ronaldo;
    INSERT INTO public.pcl_players (team_id, name, squad_number, position) VALUES
    (v_team_rma, 'L. Modric', 10, 'CM');
    INSERT INTO public.pcl_players (team_id, name, squad_number, position) VALUES
    (v_team_rma, 'T. Courtois', 1, 'GK');

    INSERT INTO public.pcl_players (team_id, name, squad_number, position) VALUES
    (v_team_mci, 'E. Haaland', 9, 'ST') RETURNING id INTO v_ply_haaland;
    INSERT INTO public.pcl_players (team_id, name, squad_number, position) VALUES
    (v_team_mci, 'K. De Bruyne', 17, 'CM');

    INSERT INTO public.pcl_players (team_id, name, squad_number, position) VALUES
    (v_team_psg, 'K. Mbappe', 7, 'WF') RETURNING id INTO v_ply_mbappe;

    -- 5. Grup Turnamen
    INSERT INTO public.pcl_tournament_groups (tournament_id, name) VALUES (v_tourney_id, 'Grup A') RETURNING id INTO v_grp_a;
    INSERT INTO public.pcl_tournament_groups (tournament_id, name) VALUES (v_tourney_id, 'Grup B') RETURNING id INTO v_grp_b;

    -- 6. Standings Grup A & B
    INSERT INTO public.pcl_group_standings (group_id, team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, rank) VALUES
    (v_grp_a, v_team_bar, 1, 1, 0, 0, 3, 1, 2, 3, 1),
    (v_grp_a, v_team_rma, 1, 0, 0, 1, 1, 3, -2, 0, 4),
    (v_grp_a, v_team_mun, 0, 0, 0, 0, 0, 0, 0, 0, 2),
    (v_grp_a, v_team_mci, 0, 0, 0, 0, 0, 0, 0, 0, 3);

    INSERT INTO public.pcl_group_standings (group_id, team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, rank) VALUES
    (v_grp_b, v_team_bay, 0, 0, 0, 0, 0, 0, 0, 0, 1),
    (v_grp_b, v_team_dor, 0, 0, 0, 0, 0, 0, 0, 0, 2),
    (v_grp_b, v_team_psg, 0, 0, 0, 0, 0, 0, 0, 0, 3),
    (v_grp_b, v_team_juv, 0, 0, 0, 0, 0, 0, 0, 0, 4);

    -- 7. Pertandingan Contoh
    INSERT INTO public.pcl_matches (tournament_id, stage, group_id, home_team_id, away_team_id, home_score, away_score, status, matchday, scheduled_at)
    VALUES (v_tourney_id, 'group', v_grp_a, v_team_bar, v_team_rma, 3, 1, 'finished', 1, NOW() - INTERVAL '1 day')
    RETURNING id INTO v_match_1;

    INSERT INTO public.pcl_matches (tournament_id, stage, group_id, home_team_id, away_team_id, home_score, away_score, status, matchday, scheduled_at)
    VALUES (v_tourney_id, 'group', v_grp_a, v_team_mun, v_team_mci, 0, 0, 'scheduled', 1, NOW() + INTERVAL '1 day');

    -- 8. Match Events (Gol)
    INSERT INTO public.pcl_match_events (match_id, team_id, player_id, event_type, minute) VALUES
    (v_match_1, v_team_bar, v_ply_messi, 'goal', 14),
    (v_match_1, v_team_rma, v_ply_ronaldo, 'goal', 32),
    (v_match_1, v_team_bar, v_ply_messi, 'goal', 78),
    (v_match_1, v_team_bar, v_ply_messi, 'penalty_goal', 89);

    -- 9. Riwayat Juara (Hall of Fame)
    INSERT INTO public.pcl_season_champions (musim, label_musim, juara_team_id, runner_up_team_id, skor_final, top_scorer_nama, top_scorer_total, mvp_nama, mvp_rating) VALUES
    ('2026', 'PCL 2026 (Season 3)', v_team_bar, v_team_rma, '3 – 2', 'L. Messi (Prime)', 11, 'L. Messi', 9.9),
    ('2025', 'PCL 2025 (Season 2)', v_team_rma, v_team_mci, '2 – 1', 'C. Ronaldo (Prime)', 9, 'C. Ronaldo', 9.8);

    -- 10. Berita Pembuka
    INSERT INTO public.pcl_news (judul, ringkasan, konten, kategori, tag, penulis, diterbitkan_pada) VALUES
    ('El Clasico Buka Musim Perdana PCL 2026', 'Barcelona tundukkan Real Madrid dengan skor meyakinkan 3-1 di laga pembuka.', 'Pertandingan berlangsung sengit dengan hattrick spektakuler dari L. Messi di hadapan puluhan ribu penonton Flash Peak.', 'turnamen', 'MATCH RECAP', 'Redaksi PCL', NOW());

END $$;

NOTIFY pgrst, 'reload schema';
