# 🎓 Student Life Manager - Static Web App

> **Aplikasi Manajemen Produktivitas All-in-One Siswa Kelas 12**: Menyeimbangkan project coding portfolio dan persiapan intensif Tes Kemampuan Akademik (TKA / UTBK-SNBT).

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-emerald.svg)
![Storage](https://img.shields.io/badge/Storage-LocalStorage%20(No%20Server)-purple.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 📌 DAFTAR ISI
1. [Fitur Utama](#-fitur-utama)
2. [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
3. [Struktur Proyek](#-struktur-proyek)
4. [Cara Menjalankan Aplikasi](#-cara-menjalankan-aplikasi)
5. [Panduan Pengguna (Bahasa Indonesia)](#-panduan-pengguna-bahasa-indonesia)
   - [To-Do List & Checklist Subtasks](#1-to-do-list--checklist-subtasks)
   - [Time Blocking Scheduler (04:00 - 23:00)](#2-time-blocking-scheduler-0400---2300)
   - [Project Tracker (Kanban Board)](#3-project-tracker-kanban-board)
   - [Finance Tracker & Target Tabungan](#4-finance-tracker--target-tabungan)
   - [Focus Timer (Pomodoro) & Daily Habits](#5-focus-timer-pomodoro--daily-habits)
   - [Backup, Import & Export Data](#6-backup-import--export-data)
6. [Shortcut Keyboard](#-shortcut-keyboard)
7. [Skema Data LocalStorage](#-skema-data-localstorage)

---

## 🚀 FITUR UTAMA

### 1. 📋 To-Do List Cerdas
- **Kategori Khusus**: TKA, Coding, School, Personal, Finance.
- **Prioritas & Tenggat**: High, Medium, Low dengan due date & time.
- **Checklist Subtasks**: Breakdown langkah pengerjaan dengan progress bar otomatis.
- **Tugas Berulang (Recurring)**: Harian, Mingguan, Bulanan otomatis dijadwalkan ulang.
- **Efek Konfeti**: Animasi perayaan saat tugas selesai dikerjakan.
- **Drag & Drop**: Susun urutan prioritas tugas semudah menggeser kartu.

### 2. ⏰ Time Blocking Scheduler
- **Visual Daily Timeline**: Rentang waktu lengkap dari **04:00 hingga 23:00**.
- **Indikator Waktu Nyata**: Garis penunjuk waktu aktif saat ini.
- **Template Jadwal Instan**: Hari Sekolah (Weekday), Akhir Pekan (Weekend), dan Minggu Try Out / Ujian (Exam Week).
- **Deteksi Konflik Otomatis**: Peringatan visual jika terdapat jam belajar/coding yang bertabrakan.
- **Duplikasi Jadwal**: Salin jadwal kemarin dengan 1 klik.
- **Cetak / Ekspor PDF**: Dukungan stylesheet cetak bersih (`@media print`).

### 3. 📂 Project Tracker (Kanban Board)
- **5 Tahapan Alur Kerja**: Backlog → To Do → In Progress → Review → Done.
- **WIP (Work-In-Progress) Limit**: Peringatan otomatis jika proyek aktif melebihi batas (maksimal 3 proyek aktif).
- **Pencatatan Jam Kerja**: Tombol cepat `+1h` dan `+0.5h` untuk melacak durasi coding atau jam belajar.
- **Template Proyek**: Web App, Mobile App, Belajar TKA, dan Portfolio Showcase.
- **Arsip & Lampiran Link**: Simpan tautan repositori GitHub, Figma, atau Google Drive.

### 4. 💰 Finance Tracker
- **Pencatatan Pemasukan & Pengeluaran**: Uang saku, buku soal TKA, domain, hosting, makanan, dll.
- **Batas Anggaran Bulanan**: Bar status warna (Hijau aman, Kuning waspada, Merah over-budget).
- **Target Tabungan Impian**: Progres tabungan beli laptop kuliah atau biaya ujian dengan tombol setoran cepat.
- **Visualisasi Grafik (Chart.js)**: Diagram lingkaran kategori pengeluaran dan grafik tren 6 bulan terakhir.
- **Ekspor Laporan CSV**: Unduh rekapitulasi data keuangan ke spreadsheet.

### 5. ⏱️ Focus Timer (Pomodoro) & Habit Tracker
- **Mode Pomodoro**: Pomodoro 25m, Deep Work 50m, Short Break 5m, Long Break 15m.
- **Tag Fokus**: Belajar TKA vs Coding Sprint (otomatis diakumulasikan ke dashboard).
- **Sintesis Audio Web**: Alarm beeps tanpa perlu koneksi internet.
- **Daily Habits & Streak Fire**: Pantau kebiasaan latihan soal dan coding harian.

### 6. 🔔 Sistem Notifikasi & PWA Offline
- **Notifikasi Browser**:
  - Peringatan tugas 30 menit sebelum tenggat waktu.
  - Briefing pagi hari (07:00).
  - Evaluasi & review malam hari (20:30).
- **PWA Ready**: Service Worker & Manifest mendukung instalasi ke layar utama ponsel/desktop dan bekerja secara offline tanpa internet.

---

## 🛠️ TEKNOLOGI YANG DIGUNAKAN
- **HTML5 & CSS3**: Semantic HTML, Custom CSS variables, Glassmorphism UI.
- **JavaScript ES6+**: Vanilla modular architecture (No heavyweight JS frameworks).
- **Tailwind CSS (CDN)**: Utility styling modern.
- **Chart.js (CDN)**: Visualisasi grafik performa, statistik tugas, dan keuangan.
- **Canvas-Confetti (CDN)**: Animasi perayaan pencapaian tugas.
- **FontAwesome 6 (CDN)**: Ikon antarmuka modern.
- **Web Audio API**: Notifikasi suara dan nada timer native browser.
- **Service Worker & LocalStorage API**: Penyimpanan lokal aman dan offline capability.

---

## 📁 STRUKTUR PROYEK

```
my-activity/
├── index.html              # Halaman utama aplikasi (Single Page Architecture)
├── manifest.json           # Manifest PWA untuk instalasi mobile & desktop
├── sw.js                   # Service Worker untuk caching aset offline
├── css/
│   └── style.css           # Styling utama, tema gelap/terang, dan print stylesheet
├── js/
│   ├── app.js              # Inisialisasi router, navigasi tab & shortcut
│   ├── storage.js          # Service LocalStorage, auto-save 30 detik & backup
│   ├── notifications.js    # Notifikasi browser, briefing terjadwal & audio
│   ├── todo.js             # Modul To-Do, subtasks, filter & drag-drop
│   ├── schedule.js         # Modul Time Blocking Scheduler & timeline visual
│   ├── projects.js         # Modul Kanban board, WIP limit & time log
│   ├── finance.js          # Modul keuangan, limit anggaran & grafik Chart.js
│   ├── pomodoro.js         # Modul Pomodoro timer & pelacakan jam fokus
│   ├── habits.js           # Modul pelacak habit & streak harian
│   ├── dashboard.js        # Modul dashboard metrik & ringkasan aktivitas
│   └── settings.js         # Modul preferensi tema, warna & import/export
├── assets/
│   ├── icon-192.png        # Ikon PWA 192x192
│   ├── icon-512.png        # Ikon PWA 512x512
│   ├── badge.png           # Badge notifikasi 72x72
│   └── icon.png            # Favicon & icon 72x72
└── README.md               # Dokumentasi lengkap & Panduan Pengguna
```

---

## 💻 CARA MENJALANKAN APLIKASI

Karena aplikasi ini murni dibangun dengan **Vanilla Web Technology (Static App)**, Anda tidak memerlukan instalasi runtime backend seperti Node.js, Python server, atau database eksternal:

### Cara 1: Buka Langsung di Browser
Cukup buka file `index.html` dengan klik ganda atau tarik ke browser pilihan Anda (Google Chrome, Microsoft Edge, Firefox, Safari).

### Cara 2: Jalankan Menggunakan Live Server / Local Web Server
Jika ingin menguji Service Worker PWA secara optimal via `http://localhost`:

- **Menggunakan Python**:
  ```bash
  python3 -m http.server 8080
  ```
  Lalu buka `http://localhost:8080` di browser.

- **Menggunakan Node (npx serve / live-server)**:
  ```bash
  npx serve .
  ```

- **Menggunakan VS Code Extension**:
  Klik kanan pada `index.html` dan pilih **Open with Live Server**.

---

## 📖 PANDUAN PENGGUNA (BAHASA INDONESIA)

### 1. To-Do List & Checklist Subtasks
- Klik tombol **+ Tambah Tugas** pada tab To-Do atau gunakan tombol cepat di pojok kanan bawah.
- Pilih kategori yang sesuai (**TKA**, **Coding**, **Sekolah**, dll.) dan atur prioritas (**Tinggi**, **Sedang**, **Rendah**).
- Tambahkan checklist langkah pengerjaan pada bagian **Subtasks** untuk memecah tugas besar menjadi langkah kecil.
- Centang tugas yang sudah selesai untuk memicu efek konfeti dan memperbarui statistik mingguan Anda.

### 2. Time Blocking Scheduler (04:00 - 23:00)
- Timeline visual harian membantu Anda membagi waktu antara sekolah, jam coding produktif, latihan soal TKA, dan istirahat.
- Gunakan menu **Terapkan Template** untuk mengisi jadwal harian dalam 1 klik (*Hari Sekolah*, *Akhir Pekan*, atau *Minggu Ujian*).
- Jika terdapat aktivitas yang waktunya bertabrakan, aplikasi akan menampilkan **Peringatan Konflik Waktu**.
- Klik tombol **Cetak / PDF** untuk mencetak jadwal mingguan Anda atau menyimpannya sebagai dokumen PDF.

### 3. Project Tracker (Kanban Board)
- Kelola proyek coding (misal: REST API, Landing Page, App) dan target belajar TKA di kolom Kanban.
- Geser (drag & drop) kartu antar kolom (**Backlog** → **To Do** → **In Progress** → **Review** → **Done**).
- **Peringatan WIP Limit**: Aplikasi akan memberi peringatan jika terdapat lebih dari 3 proyek pada kolom *In Progress*. Selesaikan proyek yang ada terlebih dahulu!
- Gunakan tombol `+1h` atau `+0.5h` pada setiap kartu proyek untuk mencatat waktu kerja nyata Anda.

### 4. Finance Tracker & Target Tabungan
- Catat setiap pengeluaran uang saku, pembelian buku try out, atau biaya hosting/domain.
- Pantau bar batas anggaran bulanan per kategori.
- Pada bagian **Target Tabungan Impian**, Anda dapat menambahkan target seperti *Beli Laptop Kuliah* dan menyetor tabungan kapan saja.
- Ekspor rekapitulasi data keuangan ke format `.csv` dengan mengklik **Export CSV**.

### 5. Focus Timer (Pomodoro) & Daily Habits
- Pilih mode **Pomodoro (25m)** atau **Deep Work (50m)**.
- Pilih tag fokus: **Belajar TKA** atau **Coding Sprint**.
- Klik **Mulai Fokus**. Saat waktu habis, aplikasi akan membunyikan alarm dan mencatat waktu produktif Anda ke dalam dashboard.
- Tandai habit harian pada bagian bawah untuk menjaga api konsistensi (*streaks*).

### 6. Backup, Import & Export Data
- Seluruh data Anda tersimpan di peramban (LocalStorage) dan diperbarui secara otomatis setiap **30 detik**.
- Untuk mencadangkan data, buka menu **Pengaturan** lalu klik **Export / Download Data JSON**.
- Jika Anda berpindah perangkat atau ingin memulihkan cadangan data, klik **Import Data JSON** dan pilih opsi **Timpa Data** (*Replace*) atau **Gabungkan Data** (*Merge*).

---

## ⌨️ SHORTCUT KEYBOARD

| Shortcut | Aksi |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Buka Menu Buat Cepat (Quick Actions Modal) |
| `Alt + 1` | Buka Tab Dashboard |
| `Alt + 2` | Buka Tab To-Do List |
| `Alt + 3` | Buka Tab Jadwal (Time Block) |
| `Alt + 4` | Buka Tab Proyek (Kanban) |
| `Alt + 5` | Buka Tab Keuangan |
| `Alt + 6` | Buka Tab Fokus (Pomodoro) |
| `Esc` | Menutup jendela modal aktif |

---

## 💾 SKEMA DATA LOCALSTORAGE

Data aplikasi disimpan dalam kunci `studentLifeData` dengan struktur JSON berikut:

```javascript
{
  "todos": [
    {
      "id": "todo-1",
      "title": "Latihan Soal UTBK Fisika",
      "description": "Paket Saintek 2025",
      "category": "TKA",
      "priority": "High",
      "dueDate": "2026-10-08",
      "dueTime": "16:00",
      "recurring": "daily",
      "subtasks": [{ "id": "st-1", "text": "Mekanika", "completed": true }],
      "completed": false,
      "completedAt": null,
      "createdAt": "2026-10-07T10:00:00Z",
      "order": 1
    }
  ],
  "schedule": {
    "2026-10-07": [
      {
        "id": "sch-1",
        "startTime": "05:30",
        "endTime": "06:30",
        "activity": "Review TKA Matematika",
        "category": "TKA",
        "notes": "Matriks & Turunan",
        "color": "#8B5CF6"
      }
    ],
    "templates": { "weekday": [...], "weekend": [...], "exam": [...] }
  },
  "projects": [
    {
      "id": "proj-1",
      "title": "Student Life Manager Web App",
      "description": "Aplikasi produktivitas kelas 12",
      "category": "Coding",
      "priority": "High",
      "status": "inprogress",
      "estimatedHours": 24,
      "loggedHours": 18,
      "tags": ["VanillaJS", "PWA"],
      "dueDate": "2026-10-14",
      "links": [{ "title": "GitHub", "url": "https://github.com/..." }],
      "archived": false,
      "createdAt": "2026-10-01T00:00:00Z"
    }
  ],
  "finances": {
    "transactions": [
      {
        "id": "fn-1",
        "type": "expense",
        "category": "Study",
        "amount": 75000,
        "date": "2026-10-07",
        "notes": "Buku Try Out TKA",
        "paymentMethod": "E-Wallet",
        "isRecurring": false
      }
    ],
    "budgets": { "Food": 400000, "Study": 250000, "Coding": 200000 },
    "goals": [
      {
        "id": "goal-1",
        "name": "Beli Laptop Kuliah",
        "targetAmount": 8500000,
        "currentAmount": 3750000,
        "targetDate": "2027-06-30",
        "notes": "RAM 16GB SSD 512GB"
      }
    ]
  },
  "habits": [
    {
      "id": "hb-1",
      "name": "Drill 20 Soal TKA",
      "category": "TKA",
      "icon": "fa-book-open",
      "streak": 12,
      "completedDates": ["2026-10-07"]
    }
  ],
  "pomodoro": {
    "sessionsCompleted": 14,
    "totalStudyMinutes": 320,
    "totalCodingMinutes": 480,
    "history": []
  },
  "settings": {
    "theme": "dark",
    "language": "id",
    "notificationsEnabled": true,
    "morningSummaryTime": "07:00",
    "eveningReviewTime": "20:30",
    "dueReminderOffsetMinutes": 30,
    "categoryColors": {
      "TKA": "#8B5CF6",
      "Coding": "#3B82F6",
      "School": "#10B981",
      "Personal": "#F59E0B",
      "Finance": "#EC4899"
    },
    "wipProjectLimit": 3
  }
}
```

---

## 🎯 PENGEMBANG
Dibuat dengan ❤️ untuk seluruh siswa kelas 12 pejuang SNBT/TKA dan calon Software Engineer masa depan!
