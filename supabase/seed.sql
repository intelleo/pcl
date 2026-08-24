-- =========================================================
-- Sample Data: Peak Champions League (PCL) Season 1
-- =========================================================

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
    -- 1. Insert Turnamen
    INSERT INTO tournaments (name, season, status)
    VALUES ('Peak Champions League Season 1', '2026', 'group_stage')
    RETURNING id INTO v_tourney_id;

    -- 2. Insert 8 Tim
    INSERT INTO teams (tournament_id, name, short_name, manager_name) VALUES
    (v_tourney_id, 'Barcelona FC', 'BAR', 'Coach Xavi') RETURNING id INTO v_team_bar;
    INSERT INTO teams (tournament_id, name, short_name, manager_name) VALUES
    (v_tourney_id, 'Real Madrid', 'RMA', 'Coach Ancelotti') RETURNING id INTO v_team_rma;
    INSERT INTO teams (tournament_id, name, short_name, manager_name) VALUES
    (v_tourney_id, 'Manchester United', 'MUN', 'Coach Ten Hag') RETURNING id INTO v_team_mun;
    INSERT INTO teams (tournament_id, name, short_name, manager_name) VALUES
    (v_tourney_id, 'Manchester City', 'MCI', 'Coach Pep') RETURNING id INTO v_team_mci;

    INSERT INTO teams (tournament_id, name, short_name, manager_name) VALUES
    (v_tourney_id, 'Bayern Munich', 'BAY', 'Coach Kompany') RETURNING id INTO v_team_bay;
    INSERT INTO teams (tournament_id, name, short_name, manager_name) VALUES
    (v_tourney_id, 'Borussia Dortmund', 'DOR', 'Coach Sahin') RETURNING id INTO v_team_dor;
    INSERT INTO teams (tournament_id, name, short_name, manager_name) VALUES
    (v_tourney_id, 'Paris Saint-Germain', 'PSG', 'Coach Enrique') RETURNING id INTO v_team_psg;
    INSERT INTO teams (tournament_id, name, short_name, manager_name) VALUES
    (v_tourney_id, 'Juventus FC', 'JUV', 'Coach Motta') RETURNING id INTO v_team_juv;

    -- 3. Insert Pemain Kunci
    INSERT INTO players (team_id, name, squad_number, position) VALUES
    (v_team_bar, 'L. Messi (Peak)', 10, 'FW') RETURNING id INTO v_ply_messi;
    INSERT INTO players (team_id, name, squad_number, position) VALUES
    (v_team_bar, 'Pedri', 8, 'MF');
    INSERT INTO players (team_id, name, squad_number, position) VALUES
    (v_team_bar, 'Ter Stegen', 1, 'GK');

    INSERT INTO players (team_id, name, squad_number, position) VALUES
    (v_team_rma, 'C. Ronaldo (Peak)', 7, 'FW') RETURNING id INTO v_ply_ronaldo;
    INSERT INTO players (team_id, name, squad_number, position) VALUES
    (v_team_rma, 'Modric', 10, 'MF');
    INSERT INTO players (team_id, name, squad_number, position) VALUES
    (v_team_rma, 'Courtois', 1, 'GK');

    INSERT INTO players (team_id, name, squad_number, position) VALUES
    (v_team_mci, 'E. Haaland', 9, 'FW') RETURNING id INTO v_ply_haaland;
    INSERT INTO players (team_id, name, squad_number, position) VALUES
    (v_team_mci, 'K. De Bruyne', 17, 'MF');

    INSERT INTO players (team_id, name, squad_number, position) VALUES
    (v_team_psg, 'K. Mbappe', 7, 'FW') RETURNING id INTO v_ply_mbappe;

    -- 4. Insert Grup
    INSERT INTO tournament_groups (tournament_id, name) VALUES (v_tourney_id, 'Grup A') RETURNING id INTO v_grp_a;
    INSERT INTO tournament_groups (tournament_id, name) VALUES (v_tourney_id, 'Grup B') RETURNING id INTO v_grp_b;

    -- 5. Masukkan Tim ke Standings Grup A
    INSERT INTO group_standings (group_id, team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, rank) VALUES
    (v_grp_a, v_team_bar, 1, 1, 0, 0, 3, 1, 2, 3, 1),
    (v_grp_a, v_team_rma, 1, 0, 0, 1, 1, 3, -2, 0, 4),
    (v_grp_a, v_team_mun, 0, 0, 0, 0, 0, 0, 0, 0, 2),
    (v_grp_a, v_team_mci, 0, 0, 0, 0, 0, 0, 0, 0, 3);

    -- Standings Grup B
    INSERT INTO group_standings (group_id, team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, rank) VALUES
    (v_grp_b, v_team_bay, 0, 0, 0, 0, 0, 0, 0, 0, 1),
    (v_grp_b, v_team_dor, 0, 0, 0, 0, 0, 0, 0, 0, 2),
    (v_grp_b, v_team_psg, 0, 0, 0, 0, 0, 0, 0, 0, 3),
    (v_grp_b, v_team_juv, 0, 0, 0, 0, 0, 0, 0, 0, 4);

    -- 6. Sample Pertandingan Finished (El Clasico Matchday 1)
    INSERT INTO matches (tournament_id, stage, group_id, home_team_id, away_team_id, home_score, away_score, status, matchday)
    VALUES (v_tourney_id, 'group', v_grp_a, v_team_bar, v_team_rma, 3, 1, 'finished', 1)
    RETURNING id INTO v_match_1;

    -- Sample Pertandingan Scheduled
    INSERT INTO matches (tournament_id, stage, group_id, home_team_id, away_team_id, home_score, away_score, status, matchday)
    VALUES (v_tourney_id, 'group', v_grp_a, v_team_mun, v_team_mci, 0, 0, 'scheduled', 1);

    -- 7. Insert Events Match 1
    INSERT INTO match_events (match_id, team_id, player_id, event_type, minute) VALUES
    (v_match_1, v_team_bar, v_ply_messi, 'goal', 14),
    (v_match_1, v_team_rma, v_ply_ronaldo, 'goal', 32),
    (v_match_1, v_team_bar, v_ply_messi, 'goal', 78),
    (v_match_1, v_team_bar, v_ply_messi, 'penalty_goal', 89);

END $$;
