/**
 * Storage Module - LocalStorage Management, Import/Export, Schema Validation & Auto-Save
 */

const STORAGE_KEY = 'studentLifeData';
const BACKUP_TIMESTAMP_KEY = 'studentLifeLastBackup';

const DEFAULT_CATEGORY_COLORS = {
  TKA: '#8B5CF6',       // Purple
  Coding: '#3B82F6',    // Blue
  School: '#10B981',    // Green
  Personal: '#F59E0B',  // Amber/Orange
  Finance: '#EC4899',   // Pink
  Other: '#64748B'      // Slate
};

const INITIAL_DATA = {
  todos: [
    {
      id: 'todo-1',
      title: 'Latihan Soal UTBK/TKA Fisika (Mekanika & Termodinamika)',
      description: 'Kerjakan paket soal Saintek 2024-2025 min. 25 nomor',
      category: 'TKA',
      priority: 'High',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      dueTime: '16:00',
      recurring: 'daily',
      subtasks: [
        { id: 'st-1', text: 'Kerjakan soal 1-10 Kinematika', completed: true },
        { id: 'st-2', text: 'Kerjakan soal 11-20 Dinamika Rotasi', completed: false },
        { id: 'st-3', text: 'Review pembahasan soal yang salah', completed: false }
      ],
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      order: 1
    },
    {
      id: 'todo-2',
      title: 'Selesaikan REST API Authentication Project Portfolio',
      description: 'Implementasikan JWT Token refresh, password hashing & unit tests',
      category: 'Coding',
      priority: 'High',
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      dueTime: '21:00',
      recurring: 'none',
      subtasks: [
        { id: 'st-4', text: 'Setup Argon2 password hashing', completed: true },
        { id: 'st-5', text: 'Endpoint POST /api/auth/login & refresh', completed: true },
        { id: 'st-6', text: 'Middleware token verification', completed: false }
      ],
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      order: 2
    },
    {
      id: 'todo-3',
      title: 'Tugas Makalah Bahasa Indonesia (Karya Tulis Ilmiah)',
      description: 'Format BAB 3 Metodologi Penelitian & Lampiran',
      category: 'School',
      priority: 'Medium',
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      dueTime: '14:00',
      recurring: 'none',
      subtasks: [
        { id: 'st-7', text: 'Ketik bab metodologi', completed: true },
        { id: 'st-8', text: 'Cek daftar pustaka format APA', completed: true }
      ],
      completed: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      order: 3
    },
    {
      id: 'todo-4',
      title: 'Evaluasi Pengeluaran Mingguan & Tabungan Laptop',
      description: 'Cek sisa uang saku dan alokasi ke target Tabungan Laptop M2',
      category: 'Finance',
      priority: 'Low',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '20:00',
      recurring: 'weekly',
      subtasks: [
        { id: 'st-9', text: 'Catat pengeluaran hari ini', completed: false },
        { id: 'st-10', text: 'Transfer sisa saku ke dompet tabungan', completed: false }
      ],
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      order: 4
    }
  ],
  schedule: {
    // Current date timeline
    [new Date().toISOString().split('T')[0]]: [
      { id: 'sch-1', startTime: '04:30', endTime: '05:30', activity: 'Sholat Subuh & Morning Routine', category: 'Personal', notes: 'Persiapan awal hari', color: '#F59E0B' },
      { id: 'sch-2', startTime: '05:30', endTime: '06:30', activity: 'Review Flashcards & Rumus TKA Matematika', category: 'TKA', notes: 'Fokus Matriks & Turunan', color: '#8B5CF6' },
      { id: 'sch-3', startTime: '07:00', endTime: '15:00', activity: 'KBM Sekolah Kelas 12', category: 'School', notes: 'Fokus materi semester akhir', color: '#10B981' },
      { id: 'sch-4', startTime: '16:00', endTime: '17:30', activity: 'Deep Work: Coding Project Web App', category: 'Coding', notes: 'Sprint 2 frontend styling & integration', color: '#3B82F6' },
      { id: 'sch-5', startTime: '19:30', endTime: '21:00', activity: 'Drill Soal TKA Saintek (Try Out Online)', category: 'TKA', notes: 'Target skor > 700', color: '#8B5CF6' },
      { id: 'sch-6', startTime: '21:00', endTime: '22:00', activity: 'Open Source / LeetCode Coding Session', category: 'Coding', notes: '2 Soal Data Structure', color: '#3B82F6' },
      { id: 'sch-7', startTime: '22:00', endTime: '22:30', activity: 'Night Journaling & Evening Review', category: 'Personal', notes: 'Rencanakan besok', color: '#F59E0B' }
    ],
    templates: {
      weekday: [
        { id: 't-w-1', startTime: '05:00', endTime: '06:30', activity: 'Belajar Pagi: Soal TKA', category: 'TKA', notes: 'Otak masih segar', color: '#8B5CF6' },
        { id: 't-w-2', startTime: '07:00', endTime: '15:00', activity: 'Sekolah (KBM SMA Kelas 12)', category: 'School', notes: 'KBM aktif', color: '#10B981' },
        { id: 't-w-3', startTime: '16:00', endTime: '18:00', activity: 'Coding Project Work', category: 'Coding', notes: 'Project development', color: '#3B82F6' },
        { id: 't-w-4', startTime: '19:30', endTime: '21:30', activity: 'Try Out & Review Soal TKA', category: 'TKA', notes: 'Drill soal', color: '#8B5CF6' },
        { id: 't-w-5', startTime: '21:30', endTime: '22:30', activity: 'Reading & Wind Down', category: 'Personal', notes: 'Istirahat teratur', color: '#F59E0B' }
      ],
      weekend: [
        { id: 't-wk-1', startTime: '06:00', endTime: '07:30', activity: 'Olahraga & Sarapan Sehat', category: 'Personal', notes: 'Jogging 30 menit', color: '#F59E0B' },
        { id: 't-wk-2', startTime: '08:00', endTime: '12:00', activity: 'Hackathon / Big Coding Milestone', category: 'Coding', notes: 'Deep focus coding sprint', color: '#3B82F6' },
        { id: 't-wk-3', startTime: '13:30', endTime: '16:30', activity: 'Simulasi Try Out Akbar TKA', category: 'TKA', notes: 'Full 150 menit simulasi UTBK', color: '#8B5CF6' },
        { id: 't-wk-4', startTime: '19:00', endTime: '21:00', activity: 'Bedah Pembahasan Try Out & Diskusi', category: 'TKA', notes: 'Analisis kelemahan subtes', color: '#8B5CF6' },
        { id: 't-wk-5', startTime: '21:00', endTime: '22:30', activity: 'Game & Family Time', category: 'Personal', notes: 'Refresh mental', color: '#F59E0B' }
      ],
      exam: [
        { id: 't-e-1', startTime: '05:00', endTime: '06:30', activity: 'Quick Formula Review & Cheatsheet', category: 'TKA', notes: 'Review ringkasan', color: '#8B5CF6' },
        { id: 't-e-2', startTime: '07:30', endTime: '12:00', activity: 'Ujian Sekolah / Try Out Resmi', category: 'School', notes: 'Fokus konsentrasi', color: '#10B981' },
        { id: 't-e-3', startTime: '14:00', endTime: '17:00', activity: 'Persiapan Ujian Besok (TKA/Sekolah)', category: 'TKA', notes: 'Materi subtes prioritas', color: '#8B5CF6' },
        { id: 't-e-4', startTime: '19:30', endTime: '21:00', activity: 'Light Review & Early Rest', category: 'Personal', notes: 'Tidur cukup sebelum tes', color: '#F59E0B' }
      ]
    }
  },
  projects: [
    {
      id: 'proj-1',
      title: 'Student Life Manager Web App',
      description: 'Aplikasi manajemen all-in-one kelas 12: TKA, Coding, Jadwal & Keuangan dengan PWA offline capability.',
      category: 'Coding',
      priority: 'High',
      status: 'inprogress',
      estimatedHours: 24,
      loggedHours: 18,
      tags: ['VanillaJS', 'PWA', 'Productivity', 'CSS3'],
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      links: [
        { title: 'GitHub Repo', url: 'https://github.com/student/life-manager' },
        { title: 'Figma Prototype', url: 'https://figma.com/@prototype-student' }
      ],
      archived: false,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
    },
    {
      id: 'proj-2',
      title: 'Bank Soal & Flashcards TKA Saintek',
      description: 'Platform latihan soal TKA online dengan scoring otomatis dan analitik kelemahan subtes.',
      category: 'TKA',
      priority: 'High',
      status: 'todo',
      estimatedHours: 35,
      loggedHours: 8,
      tags: ['TKA', 'UTBK', 'Algorithm', 'Database'],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      links: [
        { title: 'Materi Drive', url: 'https://drive.google.com/study-tka' }
      ],
      archived: false,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: 'proj-3',
      title: 'Bot Discord Reminder Tugas Sekolah',
      description: 'Bot pengingat PR dan jadwal zoom kelas berbasis Node.js webhook.',
      category: 'Coding',
      priority: 'Medium',
      status: 'done',
      estimatedHours: 12,
      loggedHours: 14,
      tags: ['NodeJS', 'Discord.js', 'Automation'],
      dueDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      links: [
        { title: 'Discord Server', url: 'https://discord.gg/kelas12ipa' }
      ],
      archived: false,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
    }
  ],
  finances: {
    transactions: [
      { id: 'fn-1', type: 'income', category: 'Uang Saku', amount: 500000, date: new Date().toISOString().split('T')[0], notes: 'Uang saku mingguan orang tua', paymentMethod: 'Transfer', isRecurring: true, recurringFrequency: 'weekly' },
      { id: 'fn-2', type: 'expense', category: 'Study', amount: 75000, date: new Date().toISOString().split('T')[0], notes: 'Buku Paket Soal Try Out TKA 2025', paymentMethod: 'E-Wallet', isRecurring: false },
      { id: 'fn-3', type: 'expense', category: 'Food', amount: 35000, date: new Date().toISOString().split('T')[0], notes: 'Makan siang & es kopi belajar', paymentMethod: 'QRIS', isRecurring: false },
      { id: 'fn-4', type: 'expense', category: 'Coding', amount: 65000, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], notes: 'Domain .dev untuk portfolio project', paymentMethod: 'E-Wallet', isRecurring: false },
      { id: 'fn-5', type: 'income', category: 'Freelance', amount: 350000, date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], notes: 'Fixing bug landing page klien', paymentMethod: 'Transfer', isRecurring: false },
      { id: 'fn-6', type: 'expense', category: 'Transport', amount: 20000, date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], notes: 'Ongkos angkot & ojek sekolah', paymentMethod: 'Cash', isRecurring: false },
      { id: 'fn-7', type: 'expense', category: 'Savings', amount: 150000, date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], notes: 'Setor celengan Tabungan Laptop', paymentMethod: 'Transfer', isRecurring: true }
    ],
    budgets: {
      Food: 400000,
      Transport: 150000,
      Study: 250000,
      Coding: 200000,
      Entertainment: 100000,
      Savings: 500000
    },
    goals: [
      { id: 'goal-1', name: 'Beli Laptop Coding & Kuliah IT', targetAmount: 8500000, currentAmount: 3750000, targetDate: '2027-06-30', notes: 'Laptop spec min. RAM 16GB, SSD 512GB untuk kuliah Informatika' },
      { id: 'goal-2', name: 'Biaya Pendaftaran Try Out Akbar & UTBK', targetAmount: 600000, currentAmount: 450000, targetDate: '2027-03-15', notes: 'Biaya UTBK-SNBT dan 4x TO Nasional' }
    ]
  },
  habits: [
    { id: 'hb-1', name: 'Drill 20 Soal TKA Saintek', category: 'TKA', icon: 'fa-book-open', streak: 12, completedDates: [new Date().toISOString().split('T')[0]] },
    { id: 'hb-2', name: 'Coding Min. 45 Menit / Commit GitHub', category: 'Coding', icon: 'fa-code-branch', streak: 19, completedDates: [new Date().toISOString().split('T')[0]] },
    { id: 'hb-3', name: 'Bangun Pagi Jam 04:30', category: 'Personal', icon: 'fa-sun', streak: 5, completedDates: [new Date().toISOString().split('T')[0]] },
    { id: 'hb-4', name: 'Minum Air 2L & Tanpa Soda', category: 'Personal', icon: 'fa-bottle-water', streak: 8, completedDates: [] }
  ],
  pomodoro: {
    sessionsCompleted: 14,
    totalStudyMinutes: 320,
    totalCodingMinutes: 480,
    history: [
      { date: new Date().toISOString().split('T')[0], type: 'TKA', duration: 50, note: 'Latihan Fisika Bab Gelombang' },
      { date: new Date().toISOString().split('T')[0], type: 'Coding', duration: 75, note: 'Slicing UI CSS Grid & Responsive' }
    ]
  },
  settings: {
    theme: 'dark',
    language: 'id',
    notificationsEnabled: true,
    dueReminderOffsetMinutes: 30,
    morningSummaryTime: '07:00',
    eveningReviewTime: '20:30',
    categoryColors: { ...DEFAULT_CATEGORY_COLORS },
    backupReminderDays: 7,
    wipProjectLimit: 3
  }
};

class StorageService {
  constructor() {
    this.subscribers = [];
    this.data = this.loadData();
    this.initAutoSave();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        this.saveData(INITIAL_DATA);
        return JSON.parse(JSON.stringify(INITIAL_DATA));
      }
      const parsed = JSON.parse(stored);
      // Ensure schema completeness
      const merged = {
        todos: Array.isArray(parsed.todos) ? parsed.todos : INITIAL_DATA.todos,
        schedule: parsed.schedule && typeof parsed.schedule === 'object' ? parsed.schedule : INITIAL_DATA.schedule,
        projects: Array.isArray(parsed.projects) ? parsed.projects : INITIAL_DATA.projects,
        finances: parsed.finances && typeof parsed.finances === 'object' ? {
          transactions: Array.isArray(parsed.finances.transactions) ? parsed.finances.transactions : INITIAL_DATA.finances.transactions,
          budgets: parsed.finances.budgets || INITIAL_DATA.finances.budgets,
          goals: Array.isArray(parsed.finances.goals) ? parsed.finances.goals : INITIAL_DATA.finances.goals
        } : INITIAL_DATA.finances,
        habits: Array.isArray(parsed.habits) ? parsed.habits : INITIAL_DATA.habits,
        pomodoro: parsed.pomodoro && typeof parsed.pomodoro === 'object' ? parsed.pomodoro : INITIAL_DATA.pomodoro,
        settings: parsed.settings && typeof parsed.settings === 'object' ? { ...INITIAL_DATA.settings, ...parsed.settings } : INITIAL_DATA.settings
      };
      // Ensure templates exist in schedule
      if (!merged.schedule.templates) {
        merged.schedule.templates = INITIAL_DATA.schedule.templates;
      }
      return merged;
    } catch (e) {
      console.error('Error loading data from LocalStorage:', e);
      return JSON.parse(JSON.stringify(INITIAL_DATA));
    }
  }

  saveData(customData = null) {
    try {
      const dataToSave = customData || this.data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      this.notifySubscribers();
      this.updateAutoSaveIndicator();
      return true;
    } catch (e) {
      console.error('Error saving data to LocalStorage:', e);
      return false;
    }
  }

  getData() {
    return this.data;
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notifySubscribers() {
    this.subscribers.forEach(cb => {
      try {
        cb(this.data);
      } catch (err) {
        console.error('Subscriber callback error:', err);
      }
    });
  }

  initAutoSave() {
    setInterval(() => {
      this.saveData();
    }, 30000); // every 30s
  }

  updateAutoSaveIndicator() {
    const indicator = document.getElementById('autosave-badge');
    if (indicator) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      indicator.innerHTML = `<i class="fa-solid fa-cloud-arrow-up text-emerald-400"></i> Tersimpan ${timeStr}`;
      indicator.classList.add('opacity-100');
      setTimeout(() => {
        indicator.classList.remove('opacity-100');
      }, 2500);
    }
  }

  // --- EXPORT & IMPORT ---

  exportJSON() {
    const dataStr = JSON.stringify(this.data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_life_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    localStorage.setItem(BACKUP_TIMESTAMP_KEY, Date.now().toString());
  }

  validateJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed !== 'object' || parsed === null) {
        return { valid: false, error: 'Format file JSON tidak valid (bukan object).' };
      }
      if (!parsed.todos || !Array.isArray(parsed.todos)) {
        return { valid: false, error: 'Data JSON harus memiliki array "todos".' };
      }
      return { valid: true, data: parsed };
    } catch (e) {
      return { valid: false, error: 'Gagal membaca JSON: ' + e.message };
    }
  }

  importJSON(jsonString, mode = 'replace') {
    const validation = this.validateJSON(jsonString);
    if (!validation.valid) {
      return { success: false, message: validation.error };
    }

    const imported = validation.data;

    if (mode === 'replace') {
      this.data = {
        todos: imported.todos || [],
        schedule: imported.schedule || { templates: INITIAL_DATA.schedule.templates },
        projects: imported.projects || [],
        finances: imported.finances || { transactions: [], budgets: {}, goals: [] },
        habits: imported.habits || [],
        pomodoro: imported.pomodoro || { sessionsCompleted: 0, totalStudyMinutes: 0, totalCodingMinutes: 0, history: [] },
        settings: { ...INITIAL_DATA.settings, ...(imported.settings || {}) }
      };
    } else if (mode === 'merge') {
      // Merge todos by ID
      const existingTodoIds = new Set(this.data.todos.map(t => t.id));
      (imported.todos || []).forEach(t => {
        if (!existingTodoIds.has(t.id)) this.data.todos.push(t);
      });

      // Merge projects
      const existingProjectIds = new Set(this.data.projects.map(p => p.id));
      (imported.projects || []).forEach(p => {
        if (!existingProjectIds.has(p.id)) this.data.projects.push(p);
      });

      // Merge transactions
      const existingTxIds = new Set(this.data.finances.transactions.map(tx => tx.id));
      (imported.finances?.transactions || []).forEach(tx => {
        if (!existingTxIds.has(tx.id)) this.data.finances.transactions.push(tx);
      });

      // Merge goals
      const existingGoalIds = new Set(this.data.finances.goals.map(g => g.id));
      (imported.finances?.goals || []).forEach(g => {
        if (!existingGoalIds.has(g.id)) this.data.finances.goals.push(g);
      });

      // Merge schedule days
      if (imported.schedule) {
        Object.keys(imported.schedule).forEach(day => {
          if (day !== 'templates' && !this.data.schedule[day]) {
            this.data.schedule[day] = imported.schedule[day];
          }
        });
      }
    }

    this.saveData();
    return { success: true, message: 'Data berhasil diimpor (' + (mode === 'replace' ? 'Timpa data' : 'Gabung data') + ').' };
  }

  resetAllData() {
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.saveData();
  }
}

// Global instance
window.storage = new StorageService();
