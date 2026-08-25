# CLAUDE.md - Peak Champions League (PCL)

## Gambaran Proyek

Aplikasi Web Turnamen Game Flash Peak (Peak Champions League / PCL).
Format: Group Stage hingga Knockout (Final) ala UEFA Champions League.

## Tech Stack

- **Frontend**: Vue 3 (Composition API, `<script setup>`), Vite, Tailwind CSS, Pinia, Vue Router, Lucide Icons.
- **Backend / Database**: Supabase (Local Instance / PostgreSQL), Supabase JS Client.

## Standar & Aturan Kode (Coding Guidelines)

1. **Batas Baris Kode**: Maksimal 500 baris per file/komponen. Pecah komponen jika melebihi batas.
2. **Konvensi Bahasa**:
   - Penamaan fungsi logika bisnis, modul internal, dan variabel domain menggunakan Bahasa Indonesia yang konsisten (contoh: `hitungKlasemen`, `ambilDaftarTim`, `simpanSkorPertandingan`, `perbaruiBracket`).
   - Penamaan istilah teknis standar tetap dipertahankan (contoh: `id`, `created_at`, `router`, `store`, `props`, `emit`).
3. **Desain UI/UX (Anti AI Slop)**:
   - Desain terstruktur, modern, bergaya sports dashboard/esports turnamen profesional.
   - Tipografi tegas, kontras warna jelas, layout rapi (bukan template generik/AI slop).
   - Responsif (Desktop & Mobile).
4. **Arsitektur & Modularitas**:
   - Prinsip Single Responsibility.
   - Pisahkan logic ke composables (`src/composables/`).
   - Store terpisah per domain (`src/stores/`).
5. - catat setiap perubahan dan prpgrees kerjanya!

## Struktur Folder Proyek

```
src/
├── assets/          # Gambar, logo, styles global
├── components/      # Komponen UI modular
│   ├── umum/        # Button, Modal, Card, Badge, Input (komponen dasar)
│   ├── turnamen/    # Komponen khusus turnamen (Bracket, Klasemen, Jadwal)
│   ├── admin/       # Panel input skor & manajemen data
│   └── statistik/   # Tabel Top Scorer, Assist, Kartu
├── composables/     # Logika reaktif (useKlasemen, usePertandingan, dll)
├── stores/          # State management Pinia
├── views/           # Halaman utama (Beranda, Turnamen, Admin, Statistik)
├── router/          # Konfigurasi Vue Router
├── lib/             # Inisialisasi Supabase client & utilitas
└── types/           # Definisi tipe TypeScript / skema data
```

## Perintah Pengembangan (Development Commands)

- `npm run dev` : Menjalankan server lokal Vite.
- `npm run build` : Membangun artefak produksi.
- `npm run preview` : Pratinjau hasil build produksi.
