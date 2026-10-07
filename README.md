# AturAja — StudentFlow: Production Ready Student Life Manager

> **Aplikasi Manajemen Produktivitas All-in-One Siswa Kelas 12**: Menyeimbangkan project coding portfolio dan persiapan intensif Tes Kemampuan Akademik (TKA / UTBK-SNBT).

![Version](https://img.shields.io/badge/version-2.0.0-indigo.svg)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-emerald.svg)
![Storage](https://img.shields.io/badge/Storage-LocalStorage%20(No%20Server)-purple.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 📌 DAFTAR ISI
1. [Fitur Utama](#-fitur-utama)
2. [Desain Human-Touch & Filosofi UI](#-desain-human-touch--filosofi-ui)
3. [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
4. [Struktur Proyek](#-struktur-proyek)
5. [Panduan Pengguna (Bahasa Indonesia)](#-panduan-pengguna-bahasa-indonesia)
   - [Profil Siswa & Kustomisasi Tema](#1-profil-siswa--kustomisasi-tema)
   - [To-Do List & Subtasks dengan Undo 5 Detik](#2-to-do-list--subtasks-dengan-undo-5-detik)
   - [Time Blocking Scheduler (04:00 - 23:00)](#3-time-blocking-scheduler-0400---2300)
   - [Project Tracker (Kanban Board dengan WIP Limit)](#4-project-tracker-kanban-board-dengan-wip-limit)
   - [Finance Tracker & Target Tabungan](#5-finance-tracker--target-tabungan)
   - [Focus Timer (Pomodoro) & Habit Streaks](#6-focus-timer-pomodoro--habit-streaks)
   - [Sistem Cadangan (Export/Import JSON)](#7-sistem-cadangan-exportimport-json)
6. [Shortcut Keyboard](#-shortcut-keyboard)
7. [Deploy ke GitHub Pages & Netlify](#-deploy-ke-github-pages--netlify)

---

## 🚀 FITUR UTAMA

### 1. 👤 Profil Siswa & Pengaturan Lengkap
- **Profil Bebas Diedit**: Nama, Email, Sekolah, Tingkat Kelas (10, 11, 12), serta Unggah Foto Profil (tersimpan otomatis dalam Base64 LocalStorage).
- **Kustomisasi Tema & Warna Aksen**: Mode Gelap (Dark Mode), Mode Terang (Light Mode), dan pemilih warna aksen (*Indigo, Coral, Emerald, Purple, Pink*).
- **Target Harian**: Alokasi jam koding harian, target jam belajar TKA mingguan, jam bangun tidur, dan jam istirahat.
- **Preferensi Notifikasi & Suara**: Toggle notifikasi browser dan nada alarm/beeps Web Audio API.

### 2. 📋 To-Do List Cerdas
- **Kategori Khusus**: TKA, Coding, School, Personal, Finance.
- **Prioritas & Tenggat**: High, Medium, Low dengan due date & time picker.
- **Checklist Subtasks**: Breakdown langkah pengerjaan dengan progress bar otomatis.
- **Tugas Berulang (Recurring)**: Harian, Mingguan, Bulanan otomatis dijadwalkan ulang.
- **5-Second Undo Toast**: Membatalkan penghapusan tugas jika tidak sengaja terhapus.
- **Efek Konfeti**: Animasi perayaan saat tugas selesai dikerjakan.
- **Drag & Drop**: Susun urutan prioritas tugas semudah menggeser kartu.

### 3. ⏰ Time Blocking Scheduler
- **Visual Daily Timeline**: Rentang waktu lengkap dari **04:00 hingga 23:00**.
- **Indikator Waktu Nyata**: Garis penunjuk waktu aktif saat ini.
- **Template Jadwal Instan**: Hari Sekolah (Weekday), Akhir Pekan (Weekend), dan Minggu Try Out / Ujian (Exam Week).
- **Deteksi Konflik Otomatis**: Peringatan visual jika terdapat jam belajar/coding yang bertabrakan.
- **Duplikasi Jadwal**: Salin jadwal kemarin dengan 1 klik.
- **Cetak / Ekspor PDF**: Dukungan stylesheet cetak bersih (`@media print`).

### 4. 📂 Project Tracker (Kanban Board)
- **5 Tahapan Alur Kerja**: Backlog → To Do → In Progress → Review → Done.
- **WIP (Work-In-Progress) Limit**: Peringatan otomatis jika proyek aktif melebihi batas (maksimal 3 proyek aktif).
- **Pencatatan Jam Kerja**: Tombol cepat `+1h` dan `+0.5h` untuk melacak durasi coding atau jam belajar.
- **Template Proyek**: Web App, Mobile App, Belajar TKA, dan Portfolio Showcase.
- **Arsip & Lampiran Link**: Simpan tautan repositori GitHub, Figma, atau Google Drive.

### 5. 💰 Finance Tracker
- **Pencatatan Pemasukan & Pengeluaran**: Uang saku, buku soal TKA, domain, hosting, makanan, dll.
- **Batas Anggaran Bulanan**: Bar status warna (Hijau aman, Kuning waspada, Merah over-budget).
- **Target Tabungan Impian**: Progres tabungan beli laptop kuliah atau biaya ujian dengan tombol setoran cepat.
- **Visualisasi Grafik (Chart.js)**: Diagram lingkaran kategori pengeluaran dan grafik tren 6 bulan terakhir.
- **Ekspor Laporan CSV**: Unduh rekapitulasi data keuangan ke spreadsheet.

### 6. ⏱️ Focus Timer (Pomodoro) & Habit Tracker
- **Mode Pomodoro**: Pomodoro 25m, Deep Work 50m, Short Break 5m, Long Break 15m.
- **Tag Fokus**: Belajar TKA vs Coding Sprint (otomatis diakumulasikan ke dashboard).
- **Sintesis Audio Web**: Alarm beeps tanpa perlu file eksternal (100% offline).
- **Daily Habits & Streak Fire**: Pantau kebiasaan latihan soal dan coding harian.

---

## 🎨 DESAIN HUMAN-TOUCH & FILOSOFI UI

Aplikasi ini didesain dengan pendekatan **Human-Crafted 2026 UI**:
- **Analog Warmth**: Overlay tekstur paper-grain halus (subtle noise).
- **Palet Hangat**: Menggunakan kombinasi Warm Indigo (`#4F46E5`), Coral (`#F97316`), dan Leaf Green (`#10B981`) yang menenangkan mata.
- **Micro-Interactions**: Spring physics feedback pada setiap tombol dan kartu saat dihover/diklik.
- **Tipografi Berkarakter**: Perpaduan sans-serif modern (*Inter*), serif hangat (*Merriweather*), dan monospace tegas (*JetBrains Mono*).

---

## 🛠️ TEKNOLOGI YANG DIGUNAKAN
- **HTML5 Semantic & ARIA Labels**
- **CSS3 Modular**: CSS Variables, Grid, Flexbox, Micro-interactions.
- **JavaScript ES6+ Vanilla**: Arsitektur modular tanpa framework berat.
- **Tailwind CSS (CDN)**: Utility styling modern.
- **Chart.js (CDN)**: Visualisasi grafik performa dan keuangan.
- **Canvas-Confetti (CDN)**: Animasi perayaan pencapaian.
- **FontAwesome 6 (CDN)**: Ikon antarmuka.
- **Web Audio API**: Notifikasi suara dan nada timer native browser.
- **Service Worker & LocalStorage API**: Penyimpanan lokal aman dan PWA offline capability.

---

## 📁 STRUKTUR PROYEK

```
AturAja/
├── index.html              # Single Page Application
├── manifest.json           # Manifest PWA untuk instalasi mobile & desktop
├── sw.js                   # Service Worker untuk caching aset offline
├── css/
│   ├── variables.css       # CSS custom properties & design tokens
│   ├── base.css            # Reset, typography, accessibility
│   ├── components.css      # Buttons, cards, inputs, modals, toasts, toggles
│   ├── layout.css          # Responsive grid, desktop sidebar & mobile bottom bar
│   ├── animations.css      # Micro-interactions, spring physics & paper noise
│   ├── main.css            # Bundler file CSS
│   └── style.css           # Custom extensions
├── js/
│   ├── app.js              # Bootstrapper & keyboard shortcuts
│   ├── utils.js            # Audio synth, formatting, toasts, quotes, confetti
│   ├── state.js            # Reactive state store & undo stack
│   ├── router.js           # Hash-based SPA Router (#todo, #schedule, etc.)
│   ├── backup.js           # Export/Import JSON & auto-backup reminders
│   ├── notifications.js    # Browser Notification API & scheduler
│   ├── todo.js             # Modul To-Do, subtasks, filter & 5s undo delete
│   ├── schedule.js         # Modul Time Blocking Scheduler visual (04:00-23:00)
│   ├── projects.js         # Modul Kanban board, WIP limit & time logs
│   ├── finance.js          # Modul keuangan, limit anggaran & grafik Chart.js
│   ├── pomodoro.js         # Modul Pomodoro timer & pelacakan jam fokus
│   ├── habits.js           # Modul pelacak habit & streak harian
│   ├── dashboard.js        # Modul dashboard metrik, quote & ringkasan
│   └── settings.js         # Modul profil siswa, avatar upload, tema & aksen
├── assets/
│   ├── icon-192.png        # Ikon PWA 192x192
│   ├── icon-512.png        # Ikon PWA 512x512
│   ├── badge.png           # Badge notifikasi 72x72
│   └── icon.png            # Favicon & logo 72x72
└── README.md               # Dokumentasi lengkap & Panduan Pengguna
```

---

## ⌨️ SHORTCUT KEYBOARD

| Shortcut | Aksi |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Buka Menu Buat Cepat (Quick Actions Modal) |
| `Ctrl + Z` / `Cmd + Z` | Urungkan Aksi Terakhir (Undo) |
| `Alt + 1` | Buka Tab Dashboard |
| `Alt + 2` | Buka Tab To-Do List |
| `Alt + 3` | Buka Tab Jadwal (Time Block) |
| `Alt + 4` | Buka Tab Proyek (Kanban) |
| `Alt + 5` | Buka Tab Keuangan |
| `Alt + 6` | Buka Tab Fokus (Pomodoro) |
| `Alt + 7` | Buka Tab Profil & Pengaturan |
| `Esc` | Menutup jendela modal aktif |

---

## 🌐 DEPLOY KE GITHUB PAGES & NETLIFY

### 1. GitHub Pages
1. Pastikan seluruh file telah di-push ke branch `main`.
2. Buka **Settings** repositori di GitHub.
3. Pilih menu **Pages** di bilah samping kiri.
4. Pada bagian **Build and deployment**, pilih Source: **Deploy from a branch** -> Branch: **main** / root.
5. Klik **Save**. Web app Anda akan aktif dalam hitungan detik.

### 2. Netlify
Tarik (*drag & drop*) folder project ini langsung ke Netlify Dashboard untuk live demo instan.

---

## 🎯 PENGEMBANG
Dibuat dengan ❤️ untuk seluruh siswa kelas 12 pejuang SNBT/TKA dan calon Software Engineer masa depan!
