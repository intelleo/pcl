-- ====================================================================
-- SKRIP SETUP DATABASE MYSQL - PEAK CHAMPIONS LEAGUE (PCL)
-- Versi: MySQL 8.0+
-- Mencakup: Tabel, Relasi FK, Indeks B-Tree, & Seed Data Awal
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `pcl_tournament` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `pcl_tournament`;
SET FOREIGN_KEY_CHECKS = 0;

-- Hapus tabel lama jika ada agar inisialisasi ulang berjalan bersih
DROP TABLE IF EXISTS `pcl_settings`;
DROP TABLE IF EXISTS `pcl_news`;
DROP TABLE IF EXISTS `pcl_season_champions`;
DROP TABLE IF EXISTS `pcl_team_registrations`;
DROP TABLE IF EXISTS `pcl_match_events`;
DROP TABLE IF EXISTS `pcl_matches`;
DROP TABLE IF EXISTS `pcl_group_standings`;
DROP TABLE IF EXISTS `pcl_tournament_groups`;
DROP TABLE IF EXISTS `pcl_players`;
DROP TABLE IF EXISTS `pcl_teams`;
DROP TABLE IF EXISTS `pcl_tournaments`;

-- ====================================================================
-- 1. STRUKTUR TABEL DDL
-- ====================================================================

-- A. TOURNAMENTS (SEASON)
CREATE TABLE IF NOT EXISTS `pcl_tournaments` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `season` VARCHAR(50) NOT NULL,
    `status` ENUM('draft', 'group_stage', 'knockout', 'completed') NOT NULL DEFAULT 'draft',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- B. TEAMS (KLUB PESERTA)
CREATE TABLE IF NOT EXISTS `pcl_teams` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `tournament_id` VARCHAR(36) NULL,
    `name` VARCHAR(255) NOT NULL,
    `short_name` VARCHAR(10) NOT NULL,
    `logo_url` TEXT NULL,
    `manager_name` VARCHAR(255) NULL,
    `group_name` VARCHAR(50) NULL,
    `rating` INT DEFAULT 90,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_teams_tournament` FOREIGN KEY (`tournament_id`) REFERENCES `pcl_tournaments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- C. PLAYERS (PEMAIN & SKUAD)
CREATE TABLE IF NOT EXISTS `pcl_players` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `team_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `squad_number` INT NOT NULL DEFAULT 1,
    `position` ENUM('GK', 'DF', 'CB', 'MF', 'CM', 'WF', 'FW', 'ST') NOT NULL,
    `avatar_url` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_players_team` FOREIGN KEY (`team_id`) REFERENCES `pcl_teams`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- D. TOURNAMENT GROUPS & STANDINGS
CREATE TABLE IF NOT EXISTS `pcl_tournament_groups` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `tournament_id` VARCHAR(36) NULL,
    `name` VARCHAR(50) NOT NULL,
    CONSTRAINT `fk_groups_tournament` FOREIGN KEY (`tournament_id`) REFERENCES `pcl_tournaments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pcl_group_standings` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `group_id` VARCHAR(36) NOT NULL,
    `team_id` VARCHAR(36) NOT NULL,
    `played` INT NOT NULL DEFAULT 0,
    `won` INT NOT NULL DEFAULT 0,
    `drawn` INT NOT NULL DEFAULT 0,
    `lost` INT NOT NULL DEFAULT 0,
    `goals_for` INT NOT NULL DEFAULT 0,
    `goals_against` INT NOT NULL DEFAULT 0,
    `goal_difference` INT NOT NULL DEFAULT 0,
    `points` INT NOT NULL DEFAULT 0,
    `rank` INT NOT NULL DEFAULT 0,
    UNIQUE KEY `unique_pcl_group_team` (`group_id`, `team_id`),
    CONSTRAINT `fk_standings_group` FOREIGN KEY (`group_id`) REFERENCES `pcl_tournament_groups`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_standings_team` FOREIGN KEY (`team_id`) REFERENCES `pcl_teams`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- E. MATCHES & MATCH EVENTS
CREATE TABLE IF NOT EXISTS `pcl_matches` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `tournament_id` VARCHAR(36) NULL,
    `stage` ENUM('group', 'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'final') NOT NULL,
    `group_id` VARCHAR(36) NULL,
    `knockout_bracket_slot` VARCHAR(50) NULL,
    `home_team_id` VARCHAR(36) NULL,
    `away_team_id` VARCHAR(36) NULL,
    `home_score` INT NOT NULL DEFAULT 0,
    `away_score` INT NOT NULL DEFAULT 0,
    `home_penalty_score` INT NULL,
    `away_penalty_score` INT NULL,
    `status` ENUM('scheduled', 'ongoing', 'finished') NOT NULL DEFAULT 'scheduled',
    `matchday` INT NOT NULL DEFAULT 1,
    `scheduled_at` DATETIME NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_matches_tournament` FOREIGN KEY (`tournament_id`) REFERENCES `pcl_tournaments`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_matches_group` FOREIGN KEY (`group_id`) REFERENCES `pcl_tournament_groups`(`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_matches_home_team` FOREIGN KEY (`home_team_id`) REFERENCES `pcl_teams`(`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_matches_away_team` FOREIGN KEY (`away_team_id`) REFERENCES `pcl_teams`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pcl_match_events` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `match_id` VARCHAR(36) NOT NULL,
    `team_id` VARCHAR(36) NOT NULL,
    `player_id` VARCHAR(36) NOT NULL,
    `assist_player_id` VARCHAR(36) NULL,
    `event_type` ENUM('goal', 'own_goal', 'penalty_goal', 'yellow_card', 'red_card', 'assist') NOT NULL,
    `minute` INT NOT NULL DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_events_match` FOREIGN KEY (`match_id`) REFERENCES `pcl_matches`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_events_team` FOREIGN KEY (`team_id`) REFERENCES `pcl_teams`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_events_player` FOREIGN KEY (`player_id`) REFERENCES `pcl_players`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_events_assist_player` FOREIGN KEY (`assist_player_id`) REFERENCES `pcl_players`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- F. PENDAFTARAN TIM ONLINE
CREATE TABLE IF NOT EXISTS `pcl_team_registrations` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `nama_tim` VARCHAR(255) NOT NULL,
    `short_name` VARCHAR(10) NOT NULL,
    `manager_name` VARCHAR(255) NOT NULL,
    `kontak` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `catatan` TEXT NULL,
    `status` ENUM('pending', 'diterima', 'ditolak') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- G. RIWAYAT JUARA (HALL OF FAME)
CREATE TABLE IF NOT EXISTS `pcl_season_champions` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `musim` VARCHAR(20) NOT NULL,
    `label_musim` VARCHAR(100) NOT NULL,
    `juara_team_id` VARCHAR(36) NULL,
    `runner_up_team_id` VARCHAR(36) NULL,
    `skor_final` VARCHAR(20) NOT NULL,
    `top_scorer_nama` VARCHAR(255) NULL,
    `top_scorer_total` INT DEFAULT 0,
    `mvp_nama` VARCHAR(255) NULL,
    `mvp_rating` DECIMAL(3,1) DEFAULT 9.0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_champions_juara` FOREIGN KEY (`juara_team_id`) REFERENCES `pcl_teams`(`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_champions_runner_up` FOREIGN KEY (`runner_up_team_id`) REFERENCES `pcl_teams`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- H. BERITA & LIPUTAN
CREATE TABLE IF NOT EXISTS `pcl_news` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `judul` VARCHAR(255) NOT NULL,
    `ringkasan` TEXT NULL,
    `konten` TEXT NOT NULL,
    `kategori` VARCHAR(50) DEFAULT 'turnamen',
    `tag` VARCHAR(50) DEFAULT 'MATCH RECAP',
    `penulis` VARCHAR(100) DEFAULT 'Redaksi PCL',
    `gambar_url` TEXT NULL,
    `waktu_baca` VARCHAR(50) DEFAULT '3 min read',
    `terkait_match_id` VARCHAR(36) NULL,
    `likes_count` INT DEFAULT 0,
    `diterbitkan_pada` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_news_match` FOREIGN KEY (`terkait_match_id`) REFERENCES `pcl_matches`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- I. SETTINGS & APP CONFIG
CREATE TABLE IF NOT EXISTS `pcl_settings` (
    `key` VARCHAR(100) NOT NULL PRIMARY KEY,
    `value` TEXT NOT NULL,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 2. INDEKS DATABASE B-TREE
-- ====================================================================
CREATE INDEX `idx_pcl_matches_stage` ON `pcl_matches`(`stage`);
CREATE INDEX `idx_pcl_matches_status` ON `pcl_matches`(`status`);
CREATE INDEX `idx_pcl_matches_matchday` ON `pcl_matches`(`matchday`);
CREATE INDEX `idx_pcl_matches_home_team` ON `pcl_matches`(`home_team_id`);
CREATE INDEX `idx_pcl_matches_away_team` ON `pcl_matches`(`away_team_id`);
CREATE INDEX `idx_pcl_matches_scheduled_at` ON `pcl_matches`(`scheduled_at`);

CREATE INDEX `idx_pcl_match_events_match_id` ON `pcl_match_events`(`match_id`);
CREATE INDEX `idx_pcl_match_events_player_id` ON `pcl_match_events`(`player_id`);
CREATE INDEX `idx_pcl_match_events_team_id` ON `pcl_match_events`(`team_id`);
CREATE INDEX `idx_pcl_match_events_event_type` ON `pcl_match_events`(`event_type`);

CREATE INDEX `idx_pcl_players_team_id` ON `pcl_players`(`team_id`);
CREATE INDEX `idx_pcl_players_position` ON `pcl_players`(`position`);

CREATE INDEX `idx_pcl_teams_group_name` ON `pcl_teams`(`group_name`);
CREATE INDEX `idx_pcl_teams_name` ON `pcl_teams`(`name`);

CREATE INDEX `idx_pcl_news_diterbitkan` ON `pcl_news`(`diterbitkan_pada` DESC);
CREATE INDEX `idx_pcl_team_reg_status` ON `pcl_team_registrations`(`status`);

-- ====================================================================
-- 3. DATA AWAL (SEED INITIAL DATA)
-- ====================================================================

-- 1. Turnamen Utama
INSERT INTO `pcl_tournaments` (`id`, `name`, `season`, `status`)
VALUES ('t1111111-1111-1111-1111-111111111111', 'Peak Champions League 2026', '2026', 'knockout')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 2. Settings Pendaftaran
INSERT INTO `pcl_settings` (`key`, `value`)
VALUES
('pendaftaran_buka', 'true'),
('biaya_pendaftaran', 'Rp 50.000 / Tim'),
('kontak_panitia_wa', '081234567890'),
('instruksi_pembayaran', 'Scan QRIS pembayaran di atas lalu konfirmasi struk transfer ke WhatsApp panitia.')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 3. Tim Peserta (16 Klub Lengkap Bersih Tanpa Riwayat Match)
INSERT INTO `pcl_teams` (`id`, `tournament_id`, `name`, `short_name`, `manager_name`, `group_name`, `rating`) VALUES
('tm-bar-0001', 't1111111-1111-1111-1111-111111111111', 'Barcelona FC', 'BAR', 'Coach Xavi', NULL, 93),
('tm-rma-0002', 't1111111-1111-1111-1111-111111111111', 'Real Madrid', 'RMA', 'Coach Ancelotti', NULL, 94),
('tm-mci-0003', 't1111111-1111-1111-1111-111111111111', 'Manchester City', 'MCI', 'Coach Pep Guardiola', NULL, 95),
('tm-mun-0004', 't1111111-1111-1111-1111-111111111111', 'Manchester United', 'MUN', 'Coach Ruben Amorim', NULL, 88),
('tm-ars-0005', 't1111111-1111-1111-1111-111111111111', 'Arsenal FC', 'ARS', 'Coach Mikel Arteta', NULL, 91),
('tm-liv-0006', 't1111111-1111-1111-1111-111111111111', 'Liverpool FC', 'LIV', 'Coach Arne Slot', NULL, 93),
('tm-che-0007', 't1111111-1111-1111-1111-111111111111', 'Chelsea FC', 'CHE', 'Coach Enzo Maresca', NULL, 89),
('tm-bay-0008', 't1111111-1111-1111-1111-111111111111', 'Bayern Munich', 'BAY', 'Coach Vincent Kompany', NULL, 92),
('tm-dor-0009', 't1111111-1111-1111-1111-111111111111', 'Borussia Dortmund', 'DOR', 'Coach Nuri Sahin', NULL, 87),
('tm-psg-0010', 't1111111-1111-1111-1111-111111111111', 'Paris Saint-Germain', 'PSG', 'Coach Luis Enrique', NULL, 90),
('tm-juv-0011', 't1111111-1111-1111-1111-111111111111', 'Juventus FC', 'JUV', 'Coach Thiago Motta', NULL, 87),
('tm-int-0012', 't1111111-1111-1111-1111-111111111111', 'Inter Milan', 'INT', 'Coach Simone Inzaghi', NULL, 91),
('tm-mil-0013', 't1111111-1111-1111-1111-111111111111', 'AC Milan', 'MIL', 'Coach Paulo Fonseca', NULL, 88),
('tm-atm-0014', 't1111111-1111-1111-1111-111111111111', 'Atletico Madrid', 'ATM', 'Coach Diego Simeone', NULL, 90),
('tm-b04-0015', 't1111111-1111-1111-1111-111111111111', 'Bayer Leverkusen', 'B04', 'Coach Xabi Alonso', NULL, 91),
('tm-asr-0016', 't1111111-1111-1111-1111-111111111111', 'AS Roma', 'ASR', 'Coach Claudio Ranieri', NULL, 86)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 4. Pemain Skuad (16 Klub x 5 Pemain = 80 Pemain)
INSERT INTO `pcl_players` (`id`, `team_id`, `name`, `squad_number`, `position`) VALUES
-- Barcelona FC (5 Pemain)
('pl-bar-01', 'tm-bar-0001', 'Ter Stegen', 1, 'GK'),
('pl-bar-02', 'tm-bar-0001', 'Ronald Araujo', 4, 'CB'),
('pl-bar-03', 'tm-bar-0001', 'Pedri', 8, 'CM'),
('pl-bar-04', 'tm-bar-0001', 'Lamine Yamal', 19, 'WF'),
('pl-bar-05', 'tm-bar-0001', 'Robert Lewandowski', 9, 'ST'),

-- Real Madrid (5 Pemain)
('pl-rma-01', 'tm-rma-0002', 'Thibaut Courtois', 1, 'GK'),
('pl-rma-02', 'tm-rma-0002', 'Antonio Rudiger', 22, 'CB'),
('pl-rma-03', 'tm-rma-0002', 'Jude Bellingham', 5, 'CM'),
('pl-rma-04', 'tm-rma-0002', 'Vinicius Jr', 7, 'WF'),
('pl-rma-05', 'tm-rma-0002', 'Kylian Mbappe', 9, 'ST'),

-- Manchester City (5 Pemain)
('pl-mci-01', 'tm-mci-0003', 'Ederson', 31, 'GK'),
('pl-mci-02', 'tm-mci-0003', 'Ruben Dias', 3, 'CB'),
('pl-mci-03', 'tm-mci-0003', 'Kevin De Bruyne', 17, 'CM'),
('pl-mci-04', 'tm-mci-0003', 'Phil Foden', 47, 'WF'),
('pl-mci-05', 'tm-mci-0003', 'Erling Haaland', 9, 'ST'),

-- Manchester United (5 Pemain)
('pl-mun-01', 'tm-mun-0004', 'Andre Onana', 24, 'GK'),
('pl-mun-02', 'tm-mun-0004', 'Lisandro Martinez', 6, 'CB'),
('pl-mun-03', 'tm-mun-0004', 'Bruno Fernandes', 8, 'CM'),
('pl-mun-04', 'tm-mun-0004', 'Marcus Rashford', 10, 'WF'),
('pl-mun-05', 'tm-mun-0004', 'Rasmus Hojlund', 9, 'ST'),

-- Arsenal FC (5 Pemain)
('pl-ars-01', 'tm-ars-0005', 'David Raya', 22, 'GK'),
('pl-ars-02', 'tm-ars-0005', 'William Saliba', 2, 'CB'),
('pl-ars-03', 'tm-ars-0005', 'Martin Odegaard', 8, 'CM'),
('pl-ars-04', 'tm-ars-0005', 'Bukayo Saka', 7, 'WF'),
('pl-ars-05', 'tm-ars-0005', 'Kai Havertz', 29, 'ST'),

-- Liverpool FC (5 Pemain)
('pl-liv-01', 'tm-liv-0006', 'Alisson Becker', 1, 'GK'),
('pl-liv-02', 'tm-liv-0006', 'Virgil van Dijk', 4, 'CB'),
('pl-liv-03', 'tm-liv-0006', 'Alexis Mac Allister', 10, 'CM'),
('pl-liv-04', 'tm-liv-0006', 'Mohamed Salah', 11, 'WF'),
('pl-liv-05', 'tm-liv-0006', 'Darwin Nunez', 9, 'ST'),

-- Chelsea FC (5 Pemain)
('pl-che-01', 'tm-che-0007', 'Robert Sanchez', 1, 'GK'),
('pl-che-02', 'tm-che-0007', 'Levi Colwill', 6, 'CB'),
('pl-che-03', 'tm-che-0007', 'Enzo Fernandez', 8, 'CM'),
('pl-che-04', 'tm-che-0007', 'Cole Palmer', 20, 'WF'),
('pl-che-05', 'tm-che-0007', 'Nicolas Jackson', 15, 'ST'),

-- Bayern Munich (5 Pemain)
('pl-bay-01', 'tm-bay-0008', 'Manuel Neuer', 1, 'GK'),
('pl-bay-02', 'tm-bay-0008', 'Dayot Upamecano', 2, 'CB'),
('pl-bay-03', 'tm-bay-0008', 'Joshua Kimmich', 6, 'CM'),
('pl-bay-04', 'tm-bay-0008', 'Jamal Musiala', 42, 'WF'),
('pl-bay-05', 'tm-bay-0008', 'Harry Kane', 9, 'ST'),

-- Borussia Dortmund (5 Pemain)
('pl-dor-01', 'tm-dor-0009', 'Gregor Kobel', 1, 'GK'),
('pl-dor-02', 'tm-dor-0009', 'Nico Schlotterbeck', 4, 'CB'),
('pl-dor-03', 'tm-dor-0009', 'Julian Brandt', 10, 'CM'),
('pl-dor-04', 'tm-dor-0009', 'Karim Adeyemi', 27, 'WF'),
('pl-dor-05', 'tm-dor-0009', 'Serhou Guirassy', 9, 'ST'),

-- Paris Saint-Germain (5 Pemain)
('pl-psg-01', 'tm-psg-0010', 'Gianluigi Donnarumma', 1, 'GK'),
('pl-psg-02', 'tm-psg-0010', 'Marquinhos', 5, 'CB'),
('pl-psg-03', 'tm-psg-0010', 'Vitinha', 17, 'CM'),
('pl-psg-04', 'tm-psg-0010', 'Ousmane Dembele', 10, 'WF'),
('pl-psg-05', 'tm-psg-0010', 'Bradley Barcola', 29, 'ST'),

-- Juventus FC (5 Pemain)
('pl-juv-01', 'tm-juv-0011', 'Michele Di Gregorio', 29, 'GK'),
('pl-juv-02', 'tm-juv-0011', 'Bremer', 3, 'CB'),
('pl-juv-03', 'tm-juv-0011', 'Teun Koopmeiners', 8, 'CM'),
('pl-juv-04', 'tm-juv-0011', 'Kenan Yildiz', 10, 'WF'),
('pl-juv-05', 'tm-juv-0011', 'Dusan Vlahovic', 9, 'ST'),

-- Inter Milan (5 Pemain)
('pl-int-01', 'tm-int-0012', 'Yann Sommer', 1, 'GK'),
('pl-int-02', 'tm-int-0012', 'Alessandro Bastoni', 95, 'CB'),
('pl-int-03', 'tm-int-0012', 'Nicolo Barella', 23, 'CM'),
('pl-int-04', 'tm-int-0012', 'Federico Dimarco', 32, 'WF'),
('pl-int-05', 'tm-int-0012', 'Lautaro Martinez', 10, 'ST'),

-- AC Milan (5 Pemain)
('pl-mil-01', 'tm-mil-0013', 'Mike Maignan', 16, 'GK'),
('pl-mil-02', 'tm-mil-0013', 'Fikayo Tomori', 23, 'CB'),
('pl-mil-03', 'tm-mil-0013', 'Tijjani Reijnders', 14, 'CM'),
('pl-mil-04', 'tm-mil-0013', 'Rafael Leao', 10, 'WF'),
('pl-mil-05', 'tm-mil-0013', 'Alvaro Morata', 7, 'ST'),

-- Atletico Madrid (5 Pemain)
('pl-atm-01', 'tm-atm-0014', 'Jan Oblak', 13, 'GK'),
('pl-atm-02', 'tm-atm-0014', 'Jose Gimenez', 2, 'CB'),
('pl-atm-03', 'tm-atm-0014', 'Rodrigo De Paul', 5, 'CM'),
('pl-atm-04', 'tm-atm-0014', 'Antoine Griezmann', 7, 'WF'),
('pl-atm-05', 'tm-atm-0014', 'Julian Alvarez', 19, 'ST'),

-- Bayer Leverkusen (5 Pemain)
('pl-b04-01', 'tm-b04-0015', 'Lukas Hradecky', 1, 'GK'),
('pl-b04-02', 'tm-b04-0015', 'Jonathan Tah', 4, 'CB'),
('pl-b04-03', 'tm-b04-0015', 'Granit Xhaka', 34, 'CM'),
('pl-b04-04', 'tm-b04-0015', 'Florian Wirtz', 10, 'WF'),
('pl-b04-05', 'tm-b04-0015', 'Victor Boniface', 22, 'ST'),

-- AS Roma (5 Pemain)
('pl-asr-01', 'tm-asr-0016', 'Mile Svilar', 99, 'GK'),
('pl-asr-02', 'tm-asr-0016', 'Gianluca Mancini', 23, 'CB'),
('pl-asr-03', 'tm-asr-0016', 'Lorenzo Pellegrini', 7, 'CM'),
('pl-asr-04', 'tm-asr-0016', 'Paulo Dybala', 21, 'WF'),
('pl-asr-05', 'tm-asr-0016', 'Artem Dovbyk', 11, 'ST')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 5. Berita Pembuka
INSERT INTO `pcl_news` (`id`, `judul`, `ringkasan`, `konten`, `kategori`, `tag`, `penulis`, `diterbitkan_pada`) VALUES
('news-00001', '16 Klub Resmi Terdaftar di PCL 2026', 'Sebanyak 16 klub elit siap bertanding di turnamen Peak Champions League 2026.', 'Pengundian bagan babak gugur 16 besar akan segera dilakukan oleh panitia turnamen. Pantau terus jadwal pertandingan.', 'turnamen', 'INFO RESMI', 'Redaksi PCL', NOW())
ON DUPLICATE KEY UPDATE `judul` = VALUES(`judul`);


SET FOREIGN_KEY_CHECKS = 1;


SET FOREIGN_KEY_CHECKS = 1;
