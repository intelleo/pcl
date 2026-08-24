# Dokumen Desain Teknis - Web Turnamen Peak Champions League (PCL)

- **Tanggal**: 2026-08-24
- **Status**: Disetujui (Approved)
- **Topik**: Sistem Manajemen & Tampilan Turnamen Sepak Bola Game Flash Peak

---

## 1. Ringkasan Sistem (Overview)
Aplikasi web turnamen Peak Champions League (PCL) dirancang untuk mengelola kompetisi game sepak bola Flash Peak dari fase grup (Group Stage) hingga fase gugur (Knockout / Final). Sistem menyediakan antarmuka publik untuk jadwal, klasemen interaktif, visualisasi bracket gugur, dan statistik individu (Top Scorer, Assist, Kartu), serta panel admin khusus untuk pencatatan skor dan event pertandingan.

---

## 2. Tech Stack & Standar Rekayasa
- **Frontend Framework**: Vue 3 (Composition API dengan `<script setup>`).
- **Build Tool**: Vite.
- **Styling**: Tailwind CSS (Tema Dark Sports/Esports Dashboard, modern, tipografi tegas, bebas AI-slop).
- **State Management**: Pinia.
- **Routing**: Vue Router 4.
- **Ikon**: Lucide Icons (`lucide-vue-next`).
- **Backend & Database**: Supabase Local (PostgreSQL) + `@supabase/supabase-js`.
- **Standar Kode**:
  - Batas maksimal baris per file: **500 baris**.
  - Bahasa fungsi logika bisnis: **Bahasa Indonesia** konsisten (contoh: `hitungKlasemen`, `ambilDaftarTim`, `simpanSkorPertandingan`).
  - Modularitas tinggi: composables terpisah untuk tiap domain logika.

---

## 3. Skema Database (PostgreSQL / Supabase)

### Tabel `tournaments`
Menyimpan entitas turnamen/musim.
- `id` (UUID, Primary Key)
- `name` (TEXT) - contoh: "Peak Champions League Season 1"
- `season` (TEXT) - contoh: "2026"
- `status` (TEXT) - `draft`, `group_stage`, `knockout`, `completed`
- `created_at` (TIMESTAMPTZ)

### Tabel `teams`
Menyimpan data tim peserta.
- `id` (UUID, Primary Key)
- `tournament_id` (UUID, FK -> `tournaments.id` ON DELETE CASCADE)
- `name` (TEXT)
- `short_name` (TEXT) - 3 huruf (contoh: "BAR", "RMA", "MUN")
- `logo_url` (TEXT, Nullable)
- `manager_name` (TEXT, Nullable)
- `created_at` (TIMESTAMPTZ)

### Tabel `players`
Menyimpan data pemain dalam skuad tim.
- `id` (UUID, Primary Key)
- `team_id` (UUID, FK -> `teams.id` ON DELETE CASCADE)
- `name` (TEXT)
- `squad_number` (INT)
- `position` (TEXT) - `GK`, `DF`, `MF`, `FW`
- `created_at` (TIMESTAMPTZ)

### Tabel `tournament_groups`
Menyimpan grup turnamen (Grup A, Grup B, dst).
- `id` (UUID, Primary Key)
- `tournament_id` (UUID, FK -> `tournaments.id` ON DELETE CASCADE)
- `name` (TEXT) - contoh: "Grup A"

### Tabel `group_standings`
Menyimpan klasemen tim per grup.
- `id` (UUID, Primary Key)
- `group_id` (UUID, FK -> `tournament_groups.id` ON DELETE CASCADE)
- `team_id` (UUID, FK -> `teams.id` ON DELETE CASCADE)
- `played` (INT, Default 0)
- `won` (INT, Default 0)
- `drawn` (INT, Default 0)
- `lost` (INT, Default 0)
- `goals_for` (INT, Default 0)
- `goals_against` (INT, Default 0)
- `goal_difference` (INT, Default 0)
- `points` (INT, Default 0)
- `rank` (INT, Default 0)

### Tabel `matches`
Menyimpan jadwal dan hasil pertandingan.
- `id` (UUID, Primary Key)
- `tournament_id` (UUID, FK -> `tournaments.id` ON DELETE CASCADE)
- `stage` (TEXT) - `group`, `round_of_16`, `quarter_final`, `semi_final`, `final`
- `group_id` (UUID, Nullable, FK -> `tournament_groups.id`)
- `knockout_bracket_slot` (TEXT, Nullable) - contoh: "R16_1", "QF_1", "SF_1", "FINAL"
- `home_team_id` (UUID, Nullable, FK -> `teams.id`)
- `away_team_id` (UUID, Nullable, FK -> `teams.id`)
- `home_score` (INT, Default 0)
- `away_score` (INT, Default 0)
- `home_penalty_score` (INT, Nullable)
- `away_penalty_score` (INT, Nullable)
- `status` (TEXT) - `scheduled`, `ongoing`, `finished`
- `matchday` (INT, Default 1)
- `scheduled_at` (TIMESTAMPTZ, Nullable)

### Tabel `match_events`
Menyimpan statistik gol, assist, dan kartu pemain per laga.
- `id` (UUID, Primary Key)
- `match_id` (UUID, FK -> `matches.id` ON DELETE CASCADE)
- `team_id` (UUID, FK -> `teams.id`)
- `player_id` (UUID, FK -> `players.id`)
- `assist_player_id` (UUID, Nullable, FK -> `players.id`)
- `event_type` (TEXT) - `goal`, `own_goal`, `penalty_goal`, `yellow_card`, `red_card`
- `minute` (INT)
- `created_at` (TIMESTAMPTZ)

---

## 4. Arsitektur Frontend & Halaman

### Struktur Routing (`src/router/index.js`)
1. `/` - Beranda: Sorotan laga, quick standings, quick top scorer.
2. `/turnamen` - Tampilan Fase Grup & Visual Bracket Knockout interaktif.
3. `/jadwal` - Jadwal & Hasil Pertandingan lengkap dengan filter matchday/fase.
4. `/statistik` - Papan peringkat Top Scorer, Top Assist, dan Kartu.
5. `/tim` - Daftar Tim peserta.
6. `/tim/:id` - Profil detail tim, daftar pemain, riwayat laga tim.
7. `/admin` - Dashboard admin (Manajemen Tim, Input Skor & Event, Pengaturan Fase).

### Struktur Direktori File
```
src/
├── assets/
│   ├── css/main.css
│   └── logo-pcl.svg
├── components/
│   ├── umum/
│   │   ├── TombolDasar.vue
│   │   ├── KartuDasar.vue
│   │   ├── LencanaStatus.vue
│   │   ├── ModalDialog.vue
│   │   └── InputForm.vue
│   ├── turnamen/
│   │   ├── TabelKlasemenGrup.vue
│   │   ├── KartuPertandingan.vue
│   │   ├── BaganFaseGugur.vue
│   │   └── ModalDetailPertandingan.vue
│   ├── statistik/
│   │   ├── TabelPencetakGol.vue
│   │   ├── TabelPengumpanGol.vue
│   │   └── TabelDisiplinKartu.vue
│   └── admin/
│       ├── FormInputSkor.vue
│       ├── FormEventPertandingan.vue
│       ├── ManajemenTim.vue
│       └── PengaturanBagan.vue
├── composables/
│   ├── useTurnamen.js
│   ├── useKlasemen.js
│   ├── usePertandingan.js
│   ├── useStatistik.js
│   └── useAdmin.js
├── stores/
│   ├── turnamenStore.js
│   └── adminStore.js
├── views/
│   ├── BerandaView.vue
│   ├── TurnamenView.vue
│   ├── JadwalView.vue
│   ├── StatistikView.vue
│   ├── TimView.vue
│   ├── DetailTimView.vue
│   └── AdminView.vue
├── lib/
│   └── supabase.js
└── main.js
```

---

## 5. Logika Bisnis & Komputasi

### A. Kalkulasi Klasemen (`hitungKlasemen`)
Klasemen dihitung ulang dari seluruh pertandingan grup berstatus `finished`:
- Menang = 3 Poin, Seri = 1 Poin, Kalah = 0 Poin.
- Kriteria Peringkat:
  1. `Poin` tertinggi.
  2. `Selisih Gol` tertinggi (`goals_for - goals_against`).
  3. `Gol Memasukkan` tertinggi (`goals_for`).
  4. `Head-to-Head` hasil pertemuan tim terkait.

### B. Alur Fase Gugur (`buatBaganFaseGugur`)
- Juara Grup (Rank 1) dan Runner-Up (Rank 2) otomatis masuk daftar tim lolos fase gugur.
- Admin dapat menetapkan atau mengundi slot babak 16 besar / perempat final.
- Setiap pemenang laga babak knockout otomatis lanjut mengisi slot babak berikutnya hingga final.

### C. Input Skor & Detail Event (`simpanSkorDanEvent`)
- Input skor tim Home & Away.
- Input daftar pencetak gol (pemain + menit), assist (pemain + menit), serta kartu kuning/merah.
- Transaksi penyimpanan menjamin integritas data (update skor match -> simpan event -> hitung ulang klasemen otomatis).

---

## 6. Rencana Pengujian & Validasi
1. **Pengujian Skema Database**: Eksekusi DDL & integritas relasi foreign key di Supabase local.
2. **Pengujian Klasemen**: Input sample matchday grup dan verifikasi urutan poin serta selisih gol.
3. **Pengujian Event & Statistik**: Input gol/assist dan verifikasi leaderboard top scorer teragregasi dengan benar.
4. **Pengujian Bracket Knockout**: Verifikasi pemenang maju ke babak berikutnya tanpa error state.
