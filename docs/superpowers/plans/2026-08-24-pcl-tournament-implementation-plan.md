# Rencana Implementasi Web Turnamen Peak Champions League (PCL)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun aplikasi web turnamen sepak bola game flash Peak Champions League (PCL) berbasis Vue 3 + Tailwind CSS + Supabase lengkap dengan klasemen grup, visualisasi bracket fase gugur, statistik pemain (Top Scorer/Assist/Kartu), dan panel input admin.

**Architecture:** Frontend Single Page Application (SPA) menggunakan Vue 3 Composition API (`<script setup>`), Pinia state management, Vue Router 4, Tailwind CSS dengan styling dark-sports theme, terhubung langsung ke Supabase Local melalui `@supabase/supabase-js`. Komposabel terisolasi per domain (klasemen, pertandingan, statistik, turnamen).

**Tech Stack:** Vue 3, Vite, Tailwind CSS, Lucide Icons (`lucide-vue-next`), Pinia, Vue Router 4, Vitest, `@supabase/supabase-js`.

**Spec:** `docs/superpowers/specs/2026-08-24-pcl-tournament-web-design.md`

## Global Constraints
- Batas maksimal baris kode: maksimal 500 baris per file.
- Bahasa fungsi bisnis: Bahasa Indonesia (contoh: `hitungKlasemen`, `simpanSkorDanEvent`, `ambilTopScorer`).
- Desain UI: Dark sports / esports dashboard, kontras tajam, tipografi tegas, bukan AI slop generik.

---

### Task 1: Scaffolding Proyek Vue 3 + Tailwind CSS + Vitest

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/App.vue`
- Create: `src/assets/css/main.css`
- Create: `.env.example`
- Create: `.env`

**Interfaces:**
- Produces: Setup runtime Vue 3 dengan Tailwind CSS dan router dasar.

- [ ] **Step 1: Inisialisasi package.json**

Tulis `package.json` dengan dependensi `vue`, `vue-router`, `pinia`, `lucide-vue-next`, `@supabase/supabase-js`, `tailwindcss`, `postcss`, `autoprefixer`, `vite`, `@vitejs/plugin-vue`, `vitest`.

- [ ] **Step 2: Konfigurasi Vite, Tailwind, dan PostCSS**

Tulis `vite.config.js`, `tailwind.config.js` (dengan tema dark sports, warna primer neon/emerald/cyan/navy), dan `postcss.config.js`.

- [ ] **Step 3: Buat entry point App.vue, main.js, dan main.css**

Tulis stylesheet dasar Tailwind dan mount aplikasi Vue.

- [ ] **Step 4: Jalankan instalasi dependensi & verifikasi build**

Jalankan `npm install` dan tes `npm run build` atau jalankan vitest untuk verifikasi.

---

### Task 2: Skrip Database SQL Supabase (DDL & Sample Data)

**Files:**
- Create: `supabase/schema.sql`
- Create: `supabase/seed.sql`
- Create: `src/lib/supabase.js`
- Test: `tests/unit/supabase.test.js`

**Interfaces:**
- Produces: `supabase` client dari `src/lib/supabase.js`. Skema DDL lengkap untuk 7 tabel: `tournaments`, `teams`, `players`, `tournament_groups`, `group_standings`, `matches`, `match_events`.

- [ ] **Step 1: Buat schema.sql DDL**

Tulis DDL lengkap di `supabase/schema.sql` dengan constraint, foreign keys, dan cascade delete.

- [ ] **Step 2: Buat seed.sql**

Tulis sample data turnamen "Peak Champions League Season 1" dengan 8 tim (2 grup @ 4 tim), skuad pemain, dan sample jadwal match.

- [ ] **Step 3: Buat modul inisialisasi Supabase client**

Tulis `src/lib/supabase.js` yang membaca `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.

- [ ] **Step 4: Buat unit test untuk koneksi / modul supabase client**

Tulis dan jalankan test di `tests/unit/supabase.test.js` untuk memastikan modul client terinisialisasi dengan aman.

---

### Task 3: Komposabel Logika Klasemen & Unit Test TDD (`useKlasemen`)

**Files:**
- Create: `src/composables/useKlasemen.js`
- Test: `tests/unit/useKlasemen.test.js`

**Interfaces:**
- Produces: `hitungKlasemen(pertandinganList, timList)` -> mengembalikan array klasemen terurut (Poin > Selisih Gol > Gol Masuk).

- [ ] **Step 1: Tulis unit test logika perhitungan klasemen**

Tulis skenario pengujian di `tests/unit/useKlasemen.test.js`:
- Menang 3 poin, seri 1 poin, kalah 0 poin.
- Perhitungan GF, GA, GD.
- Tie breaker: Urutan poin -> selisih gol -> jumlah gol memasukkan.

- [ ] **Step 2: Jalankan test dan pastikan gagal (FAIL)**

Jalankan `npx vitest run tests/unit/useKlasemen.test.js`.

- [ ] **Step 3: Implementasi fungsi hitungKlasemen**

Tulis logika murni di `src/composables/useKlasemen.js`.

- [ ] **Step 4: Jalankan test dan pastikan lolos (PASS)**

Jalankan `npx vitest run tests/unit/useKlasemen.test.js`.

---

### Task 4: Komponen UI Dasar & Tata Letak (Design System Anti-Slop)

**Files:**
- Create: `src/components/umum/TombolDasar.vue`
- Create: `src/components/umum/KartuDasar.vue`
- Create: `src/components/umum/LencanaStatus.vue`
- Create: `src/components/umum/ModalDialog.vue`
- Create: `src/components/umum/BilahNavigasi.vue`
- Create: `src/components/umum/KakiHalaman.vue`

**Interfaces:**
- Produces: Komponen reusable UI bertema dark esports (slate/zinc dark palette dengan aksen emerald & cyan, glow effect subtle, typography bold).

- [ ] **Step 1: Buat TombolDasar.vue & LencanaStatus.vue**

Komponen tombol dengan varian (primary, secondary, danger, outline) dan lencana status pertandingan (`scheduled`, `ongoing`, `finished`).

- [ ] **Step 2: Buat KartuDasar.vue & ModalDialog.vue**

Komponen container kartu bergaya sporty glassmorphism & modal interaktif.

- [ ] **Step 3: Buat BilahNavigasi.vue & KakiHalaman.vue**

Navbar responsif dengan logo PCL, menu navigasi (Beranda, Turnamen, Jadwal, Statistik, Tim, Admin).

---

### Task 5: Modul Jadwal & Detail Pertandingan (`usePertandingan` + Komponen)

**Files:**
- Create: `src/composables/usePertandingan.js`
- Create: `src/components/turnamen/KartuPertandingan.vue`
- Create: `src/components/turnamen/ModalDetailPertandingan.vue`
- Create: `src/views/JadwalView.vue`
- Test: `tests/unit/usePertandingan.test.js`

**Interfaces:**
- Produces: `usePertandingan` (ambilJadwal, ambilDetailLaga, filterMatchday), tampilan list jadwal interaktif, dan modal rincian pencetak gol & kartu.

- [ ] **Step 1: Buat pengujian composable usePertandingan**

Tulis test untuk pemfilteran jadwal berdasarkan matchday dan stage di `tests/unit/usePertandingan.test.js`.

- [ ] **Step 2: Implementasikan usePertandingan.js**

Logic ambil dan susun pertandingan, skor, serta relasi event gol/assist/kartu.

- [ ] **Step 3: Buat KartuPertandingan.vue & ModalDetailPertandingan.vue**

Tampilan visual card match yang dinamis (skor, logo tim, menit, penalti) dan modal pop-up detail event.

- [ ] **Step 4: Rakit JadwalView.vue**

Halaman jadwal lengkap dengan filter babak & matchday.

---

### Task 6: Modul Klasemen Grup & Bagan Fase Gugur (`BaganFaseGugur` + `TurnamenView`)

**Files:**
- Create: `src/components/turnamen/TabelKlasemenGrup.vue`
- Create: `src/components/turnamen/BaganFaseGugur.vue`
- Create: `src/views/TurnamenView.vue`

**Interfaces:**
- Produces: Tab visual klasemen semua grup dan visual bracket knockout tree (R16/QF -> SF -> Final).

- [ ] **Step 1: Buat TabelKlasemenGrup.vue**

Tabel klasemen lengkap (P, W, D, L, GF, GA, GD, PTS) dengan indikator visual tim peringkat 1 & 2 (lolos fase gugur).

- [ ] **Step 2: Buat BaganFaseGugur.vue**

Komponen visual bracket pohon turnamen fase gugur interaktif dengan garis penghubung dan status pemenang tiap babak.

- [ ] **Step 3: Rakit TurnamenView.vue**

Halaman dengan tab switcher antara "Fase Grup" dan "Bagan Fase Gugur".

---

### Task 7: Modul Statistik Pemain (`useStatistik` + `StatistikView`)

**Files:**
- Create: `src/composables/useStatistik.js`
- Create: `src/components/statistik/TabelPencetakGol.vue`
- Create: `src/components/statistik/TabelPengumpanGol.vue`
- Create: `src/components/statistik/TabelDisiplinKartu.vue`
- Create: `src/views/StatistikView.vue`
- Test: `tests/unit/useStatistik.test.js`

**Interfaces:**
- Produces: `ambilTopScorer`, `ambilTopAssist`, `ambilStatistikDisiplin` teragregasi dari data event.

- [ ] **Step 1: Buat unit test agregasi statistik**

Tulis test di `tests/unit/useStatistik.test.js` untuk memastikan gol dan assist terhitung per pemain dengan benar.

- [ ] **Step 2: Implementasikan useStatistik.js**

Logic kalkulasi top scorer, top assist, dan akumulasi kartu.

- [ ] **Step 3: Buat komponen tabel statistik dan halaman StatistikView.vue**

Tabel peringkat pemain dengan foto/avatar, tim, jumlah gol/assist, dan kartu.

---

### Task 8: Modul Tim & Detail Tim (`TimView` + `DetailTimView`)

**Files:**
- Create: `src/views/TimView.vue`
- Create: `src/views/DetailTimView.vue`
- Create: `src/components/turnamen/KartuTim.vue`

**Interfaces:**
- Produces: Grid profil seluruh tim peserta dan halaman detail skuad pemain, manajer, serta statistik tim.

- [ ] **Step 1: Buat KartuTim.vue & TimView.vue**

Tampilan kartu tim dengan logo, manajer, dan ringkasan skuad.

- [ ] **Step 2: Buat DetailTimView.vue**

Halaman detail menampilkan daftar lengkap skuad pemain per posisi (GK, DF, MF, FW) dan riwayat pertandingan tim tersebut.

---

### Task 9: Panel Admin Manajemen Turnamen & Input Skor

**Files:**
- Create: `src/composables/useAdmin.js`
- Create: `src/components/admin/FormInputSkor.vue`
- Create: `src/components/admin/FormEventPertandingan.vue`
- Create: `src/components/admin/ManajemenTim.vue`
- Create: `src/views/AdminView.vue`
- Test: `tests/unit/useAdmin.test.js`

**Interfaces:**
- Produces: Dashboard admin lengkap untuk input skor laga, input pencetak gol/kartu, tambah/edit tim & pemain, serta kontrol status turnamen.

- [ ] **Step 1: Buat unit test useAdmin.js**

Test fungsi validasi input skor dan penambahan event pertandingan di `tests/unit/useAdmin.test.js`.

- [ ] **Step 2: Implementasikan useAdmin.js**

Fungsi mutasi data Supabase: `simpanSkorPertandingan`, `tambahEventLaga`, `hapusEventLaga`, `tambahTimDanPemain`.

- [ ] **Step 3: Buat FormInputSkor.vue & FormEventPertandingan.vue**

Form interaktif untuk memilih match, input skor, dan menambah baris pencetak gol / assist secara real-time.

- [ ] **Step 4: Buat ManajemenTim.vue & rakit AdminView.vue**

Tab panel admin yang rapi dengan proteksi sederhana / PIN admin.

---

### Task 10: Beranda & Integrasi Navigasi (`BerandaView` + Router)

**Files:**
- Create: `src/views/BerandaView.vue`
- Create: `src/router/index.js`
- Modify: `src/App.vue`
- Modify: `PROGRESS.txt`

**Interfaces:**
- Produces: Aplikasi terintegrasi penuh dari landing page, navigasi semua rute, hingga panel admin.

- [ ] **Step 1: Konfigurasi Vue Router di src/router/index.js**

Daftarkan semua route: `/`, `/turnamen`, `/jadwal`, `/statistik`, `/tim`, `/tim/:id`, `/admin`.

- [ ] **Step 2: Buat BerandaView.vue**

Landing page dinamis: Hero banner PCL, highlight big match / live match, mini klasemen, top 5 scorer widget, dan CTA ke bagan turnamen.

- [ ] **Step 3: Verifikasi Build Produksi & Jalankan Semua Test**

Jalankan `npm run test` (Vitest) dan `npm run build` untuk memastikan 0 error dan semua modul berjalan sempurna. Update `PROGRESS.txt`.
