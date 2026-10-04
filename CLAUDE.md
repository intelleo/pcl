# CLAUDE.md - Peak Champions League (PCL)

## 0. SPESIFIKASI UTAMA & REFERENSI DOMAIN (WAJIB BACA)

Sebelum menulis kode atau melakukan perubahan logika, rujuk dokumen berikut:
- **`docs/DOMAIN_SPEC.md`**: Single Source of Truth untuk Skema Database MySQL, Aturan Turnamen 16 Klub, dan Katalog Komponen Baku (`TombolDasar`, `KartuDasar`, `ModalDialog`, `LencanaStatus`).

---

## 1. Gambaran Proyek

Aplikasi Web Turnamen Game Flash Peak (Peak Champions League / PCL).
Format: Group Stage (4 Grup x 4 Klub) hingga Knockout (Final) ala UEFA Champions League.

## 2. Tech Stack

- **Frontend**: Vue 3 (Composition API, `<script setup>`), Vite, Tailwind CSS, Pinia, Vue Router, Lucide Icons.
- **Backend / Database**: Express.js REST API, MySQL 8.x (`mysql2/promise` connection pool).

---

## 3. Standar & Aturan Mutlak Kode (Coding Guidelines)

1. **Gunakan Komponen Baku (Wajib)**:
   - DILARANG membuat tag `<button>` mentah atau styling manual baru jika varian sudah ada di `src/components/umum/` (`TombolDasar`, `KartuDasar`, `ModalDialog`, `LencanaStatus`).
2. **Batas Baris Kode**: Maksimal 500 baris per file/komponen. Pecah komponen jika melebihi batas.
3. **Konvensi Bahasa**:
   - Penamaan fungsi logika bisnis, modul internal, dan variabel domain menggunakan Bahasa Indonesia yang konsisten (contoh: `hitungKlasemen`, `ambilDaftarTim`, `simpanSkorPertandingan`, `perbaruiBracket`).
   - Penamaan istilah teknis standar tetap dipertahankan (contoh: `id`, `created_at`, `router`, `store`, `props`, `emit`).
4. **Desain UI/UX (Anti AI Slop & Responsif)**:
   - Desain terstruktur, modern, bergaya sports dashboard/esports turnamen profesional.
   - Tipografi tegas, kontras warna jelas, layout rapi.
   - Responsif (Desktop & Mobile: tabel di mobile wajib dibuat kartu/stacked rows).
5. **Caching & Optimalisasi Query**:
   - Gunakan `src/lib/cache.js` (`getCache`/`setCache`) di view publik untuk load instan.
   - Gunakan `src/lib/api.js` untuk komunikasi dengan REST API Backend Express.
6. **Arsitektur & Modularitas**:
   - Prinsip Single Responsibility.
   - Pisahkan logic ke composables (`src/composables/`).
   - Store terpisah per domain (`src/stores/`).
7. **Diskusi & Persetujuan Sebelum Eksekusi**:
   - Selalu diskusikan rencana teknis, pendekatan arsitektur, atau ide baru kepada pengguna terlebih dahulu.
   - Tunggu persetujuan/konfirmasi pengguna sebelum mengeksekusi perubahan kode.
8. **Pencatatan Log Wajib (PROGRESS.txt)**:
   - Wajib mencatat setiap progres pekerjaan, perubahan fitur, dan keputusan teknis di `PROGRESS.txt`.

---

## 4. Struktur Folder Proyek

```
server/              # Backend Express.js & MySQL
├── config/          # Pool koneksi mysql2/promise
├── database/        # Schema DDL MySQL & skrip init_db.js
└── routes/          # REST endpoints (auth, matches, teams, knockout, dll)
src/
├── assets/          # Gambar, logo, styles global
├── components/      # Komponen UI modular
│   ├── umum/        # TombolDasar, ModalDialog, KartuDasar, LencanaStatus
│   ├── turnamen/    # Komponen khusus turnamen (Bracket, Klasemen, Jadwal)
│   ├── admin/       # Panel input skor, drawing, pendaftaran, & manajemen data
│   └── statistik/   # Tabel Top Scorer, Assist, Kartu
├── composables/     # Logika reaktif (useKlasemen, usePertandingan, useAdmin, dll)
├── stores/          # State management Pinia
├── views/           # Halaman utama (Beranda, Turnamen, Admin, Statistik, Pendaftaran, dll)
├── router/          # Konfigurasi Vue Router
├── lib/             # API client, cache engine, & utilitas
└── types/           # Definisi tipe / skema data
```

---

## 5. Perintah Pengembangan (Development Commands)

- `npm run dev` : Menjalankan server lokal Vite (frontend).
- `npm run server` : Menjalankan Express REST API backend di port 3000.
- `npm run db:init` : Inisialisasi database dan seed data MySQL.
- `npm test` : Menjalankan unit tests Vitest.
- `npm run build` : Membangun artefak produksi.
- `npm run preview` : Pratinjau hasil build produksi.
