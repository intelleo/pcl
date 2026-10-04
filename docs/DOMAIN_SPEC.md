# SPESIFIKASI DOMAIN & STANDAR BAKU PROYEK PCL (Peak Champions League)

Dokumen ini adalah **Single Source of Truth (SSOT)** untuk logika bisnis, skema data, arsitektur database MySQL + Express, dan katalog komponen baku proyek PCL.

---

## 1. STRUKTUR DATABASE MYSQL 8.X & RESTFUL API

Semua tabel menggunakan database MySQL dengan prefix `pcl_`. Backend menggunakan Express.js dengan pool koneksi `mysql2/promise` (`server/`).

### A. Tabel & Kolom Kunci (MySQL 8.x)

1. **`pcl_tournaments`**:
   - `id` (VARCHAR 36, PK), `name` (VARCHAR 255), `season` (VARCHAR 50), `status` (ENUM `'draft'|'group_stage'|'knockout'|'completed'`), `created_at`, `updated_at`.
2. **`pcl_teams`**:
   - `id` (VARCHAR 36, PK), `tournament_id` (VARCHAR 36, FK), `name` (VARCHAR 255), `short_name` (VARCHAR 10), `logo_url` (LONGTEXT), `manager_name` (VARCHAR 255), `group_name` (VARCHAR 50), `rating` (INT DEFAULT 90), `created_at`.
3. **`pcl_players`**:
   - `id` (VARCHAR 36, PK), `team_id` (VARCHAR 36, FK), `name` (VARCHAR 255), `squad_number` (INT), `position` (ENUM `'GK'|'DF'|'CB'|'MF'|'CM'|'WF'|'FW'|'ST'`), `avatar_url` (TEXT), `created_at`.
4. **`pcl_tournament_groups`**:
   - `id` (VARCHAR 36, PK), `tournament_id` (VARCHAR 36, FK), `name` (VARCHAR 50, contoh: 'Grup A', 'Grup B', 'Grup C', 'Grup D'), `created_at`.
5. **`pcl_group_standings`**:
   - `id` (VARCHAR 36, PK), `group_id` (VARCHAR 36, FK), `team_id` (VARCHAR 36, FK), `played`, `won`, `drawn`, `lost`, `goals_for`, `goals_against`, `goal_difference`, `points`, `rank`, `updated_at`.
6. **`pcl_matches`**:
   - `id` (VARCHAR 36, PK), `tournament_id` (VARCHAR 36, FK), `stage` (ENUM `'group'|'round_of_32'|'round_of_16'|'quarter_final'|'semi_final'|'final'`), `group_id` (VARCHAR 36, FK), `knockout_bracket_slot` (VARCHAR 50), `home_team_id` (VARCHAR 36, FK), `away_team_id` (VARCHAR 36, FK), `home_score` (INT), `away_score` (INT), `home_penalty_score` (INT), `away_penalty_score` (INT), `status` (ENUM `'scheduled'|'ongoing'|'finished'`), `matchday` (INT), `scheduled_at` (DATETIME), `created_at`, `updated_at`.
7. **`pcl_match_events`**:
   - `id` (VARCHAR 36, PK), `match_id` (VARCHAR 36, FK), `team_id` (VARCHAR 36, FK), `player_id` (VARCHAR 36, FK), `assist_player_id` (VARCHAR 36, FK), `event_type` (ENUM `'goal'|'own_goal'|'penalty_goal'|'yellow_card'|'red_card'|'assist'`), `minute` (INT), `created_at`.
8. **`pcl_team_registrations`**:
   - `id` (VARCHAR 36, PK), `nama_tim` (VARCHAR 255), `short_name` (VARCHAR 10), `manager_name` (VARCHAR 255), `kontak` (VARCHAR 100), `email` (VARCHAR 255), `catatan` (LONGTEXT), `status` (ENUM `'pending'|'diterima'|'ditolak'`), `created_at`, `updated_at`.
9. **`pcl_season_champions`**:
   - `id` (VARCHAR 36, PK), `musim` (VARCHAR 50), `label_musim` (VARCHAR 255), `juara_team_id` (VARCHAR 36, FK), `runner_up_team_id` (VARCHAR 36, FK), `skor_final` (VARCHAR 50), `top_scorer_nama` (VARCHAR 255), `top_scorer_total` (INT), `mvp_nama` (VARCHAR 255), `mvp_rating` (DECIMAL(3,1)), `created_at`.
10. **`pcl_news`**:
    - `id` (VARCHAR 36, PK), `judul` (VARCHAR 255), `ringkasan` (TEXT), `konten` (LONGTEXT), `kategori` (VARCHAR 100), `tag` (VARCHAR 100), `penulis` (VARCHAR 255), `gambar_url` (LONGTEXT), `waktu_baca` (VARCHAR 50), `terkait_match_id` (VARCHAR 36, FK), `diterbitkan_pada` (DATETIME), `created_at`, `updated_at`.
11. **`pcl_settings`**:
    - `key` (VARCHAR 100, PK), `value` (LONGTEXT), `updated_at` (DATETIME).

### B. RESTful API Endpoint Client (`src/lib/api.js`)
- `api.getTournaments()`, `api.createTournament()`, `api.updateTournament()`, `api.deleteTournament()`
- `api.getTeams()`, `api.getTeamDetail()`, `api.createTeam()`, `api.updateTeam()`, `api.deleteTeam()`
- `api.getPlayers()`, `api.createPlayer()`, `api.updatePlayer()`, `api.deletePlayer()`
- `api.getMatches()`, `api.getMatchDetail()`, `api.updateMatchScore()`
- `api.addMatchEvent()`, `api.deleteMatchEvent()`
- `api.generateKnockout()`, `api.advanceKnockout()`
- `api.getStandings()`
- `api.getStatistics()`
- `api.getNews()`, `api.getNewsDetail()`, `api.createNews()`, `api.updateNews()`, `api.deleteNews()`
- `api.getChampions()`, `api.createChampion()`, `api.deleteChampion()`
- `api.getRegistrations()`, `api.createRegistration()`, `api.updateRegistrationStatus()`
- `api.getSettings()`, `api.getSetting()`, `api.updateSetting()`
- `api.login()`

---

## 2. ATURAN & LOGIKA BISNIS TURNAMEN

1. **Format Turnamen**:
   - Total Peserta: 16 Klub.
   - Babak Grup: 4 Grup (Grup A, Grup B, Grup C, Grup D), masing-masing 4 Klub.
   - Poin: Menang = 3, Seri = 1, Kalah = 0.
   - Kriteria Klasemen (Tiebreaker): Poin -> Selisih Gol (`goal_difference`) -> Total Gol Memasukkan (`goals_for`) -> Head-to-head.
   - Lolos Fase Gugur: Juara 1 dan Runner-up setiap grup (total 8 tim) maju ke Perempat Final / Babak 8 Besar.
2. **Knockout Bracket**:
   - Perempat Final (Quarter Final) -> Semifinal -> Final.
   - Sistem Single Match / Leg Tunggal (dengan adu penalti jika imbang).
3. **Pendaftaran Tim**:
   - Formulir pendaftaran terbuka untuk publik di `/pendaftaran`.
   - Admin memverifikasi, menerima, atau menolak di panel admin (`/admin`).
   - Tim yang disetujui otomatis masuk daftar calon tim drawing turnamen.

---

## 3. KATALOG KOMPONEN UI BAKU (`src/components/umum/`)

**DILARANG** membuat styling tag mentah seperti `<button class="...">` jika varian sudah tersedia di komponen baku.

### A. `TombolDasar.vue`
- **Props**:
  - `varian`: `'primer'` (biru UCL), `'gold'` (emas PCL), `'sekunder'` (putih border slate), `'aksen'` (navy 800), `'bahaya'` (merah), `'kaca'` (backdrop blur hero/transparan), `'outline'`.
  - `tipe`: `'button' | 'submit' | 'reset'`.
  - `sedangMemuat`: `Boolean` (menampilkan spinner loading bawaan).
  - `dinonaktifkan`: `Boolean`.
- **Penggunaan**:
  ```vue
  <TombolDasar varian="gold" @click="aksiDaftar">Daftar Sekarang</TombolDasar>
  <TombolDasar varian="sekunder" @click="batal">Batal</TombolDasar>
  ```

### B. `KartuDasar.vue`
- **Props**: `padding` (default `'sedang'`), `hoverLift` (default `false`), `borderAksen` (default `false`).

### C. `LencanaStatus.vue`
- **Props**: `status` (`'selesai' | 'berlangsung' | 'dijadwalkan' | 'tertunda' | 'diterima' | 'ditolak' | 'pending'`), `ukuran` (`'kecil' | 'sedang'`).

### D. `ModalDialog.vue`
- **Props**: `terbuka` (Boolean), `judul` (String), `ukuran` (`'sm' | 'md' | 'lg' | 'xl'`).
- **Events**: `@tutup`.

---

## 4. STANDAR CACHING & DATA FETCHING

1. **Persistent Cache (`src/lib/cache.js`)**:
   - Selalu gunakan `getCache(key)` dan `setCache(key, data, ttlMs)` di setiap view/composable publik.
   - TTL default: 30–60 detik (30000–60000 ms).
   - Invalidate cache otomatis di `useAdmin.js` setiap kali ada mutasi database (`invalidateCache()`).
2. **Selective Column Projection**:
   - DILARANG menggunakan `select('*')` di query Supabase. Selalu sebutkan kolom spesifik yang dibutuhkan untuk menghemat payload dan latensi.
