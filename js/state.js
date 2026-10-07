/**
 * State Management Module - Reactive LocalStorage Store with Schema Migration, Undo Support & Profile Handling
 */

const STORAGE_KEY = 'studentflow_data';

const DEFAULT_PROFILE = {
  name: "Arka Pratama",
  email: "arka.code@gmail.com",
  avatar: null,
  school: "SMA Negeri 1 Jakarta",
  grade: "12",
  timezone: "Asia/Jakarta",
  language: "id",
  theme: "dark",
  accentColor: "#4F46E5",
  notificationsEnabled: true,
  soundEnabled: true,
  wakeTime: "04:30",
  sleepTime: "22:00",
  studyBlocks: [
    { start: "05:30", end: "06:30", name: "Review Rumus Pagi" },
    { start: "16:00", end: "17:30", name: "Coding Project Sprint" },
    { start: "19:30", end: "21:00", name: "Drill Soal TKA Saintek" }
  ],
  dailyCodingHours: 2.0,
  weeklyStudyHours: 20,
  savingsGoal: 5000000,
  createdAt: new Date().toISOString(),
  lastActive: new Date().toISOString()
};

const DEFAULT_STATE = {
  version: '2.0.0',
  profile: DEFAULT_PROFILE,
  todos: [
    {
      id: 'todo-1',
      title: 'Latihan Soal UTBK/TKA Fisika (Mekanika & Termodinamika)',
      description: 'Kerjakan paket soal Saintek 2024-2025 min. 25 nomor',
      category: 'TKA',
      priority: 'high',
      status: 'pending',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T16:00:00',
      createdAt: new Date().toISOString(),
      completedAt: null,
      recurring: { enabled: true, frequency: 'daily', endDate: null },
      subtasks: [
        { id: 'st-1', title: 'Kerjakan soal 1-10 Kinematika', completed: true },
        { id: 'st-2', title: 'Kerjakan soal 11-20 Dinamika Rotasi', completed: false },
        { id: 'st-3', title: 'Review pembahasan soal yang salah', completed: false }
      ],
      tags: ['fisika', 'utbk'],
      estimatedMinutes: 90,
      actualMinutes: null,
      notificationsSent: false
    },
    {
      id: 'todo-2',
      title: 'Selesaikan REST API Authentication Project Portfolio',
      description: 'Implementasikan JWT Token refresh, password hashing & unit tests',
      category: 'Coding',
      priority: 'high',
      status: 'pending',
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0] + 'T21:00:00',
      createdAt: new Date().toISOString(),
      completedAt: null,
      recurring: { enabled: false, frequency: 'none', endDate: null },
      subtasks: [
        { id: 'st-4', title: 'Setup Argon2 password hashing', completed: true },
        { id: 'st-5', title: 'Endpoint POST /api/auth/login & refresh', completed: true },
        { id: 'st-6', title: 'Middleware token verification', completed: false }
      ],
      tags: ['nodejs', 'jwt', 'api'],
      estimatedMinutes: 120,
      actualMinutes: 60,
      notificationsSent: false
    },
    {
      id: 'todo-3',
      title: 'Tugas Makalah Bahasa Indonesia (Karya Tulis Ilmiah)',
      description: 'Format BAB 3 Metodologi Penelitian & Lampiran',
      category: 'School',
      priority: 'medium',
      status: 'completed',
      dueDate: new Date().toISOString().split('T')[0] + 'T14:00:00',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      recurring: { enabled: false, frequency: 'none', endDate: null },
      subtasks: [
        { id: 'st-7', title: 'Ketik bab metodologi', completed: true },
        { id: 'st-8', title: 'Cek daftar pustaka format APA', completed: true }
      ],
      tags: ['sekolah', 'bahasa'],
      estimatedMinutes: 60,
      actualMinutes: 45,
      notificationsSent: false
    }
  ],
  schedule: {
    [new Date().toISOString().split('T')[0]]: [
      { id: 'sch-1', startTime: '04:30', endTime: '05:30', activity: 'Sholat Subuh & Morning Routine', category: 'Personal', notes: 'Persiapan awal hari', color: '#F97316' },
      { id: 'sch-2', startTime: '05:30', endTime: '06:30', activity: 'Review Flashcards & Rumus TKA Matematika', category: 'TKA', notes: 'Fokus Matriks & Turunan', color: '#8B5CF6' },
      { id: 'sch-3', startTime: '07:00', endTime: '15:00', activity: 'KBM Sekolah Kelas 12', category: 'School', notes: 'KBM aktif', color: '#10B981' },
      { id: 'sch-4', startTime: '16:00', endTime: '17:30', activity: 'Deep Work: Coding Project Web App', category: 'Coding', notes: 'Sprint frontend styling & integration', color: '#4F46E5' },
      { id: 'sch-5', startTime: '19:30', endTime: '21:00', activity: 'Drill Soal TKA Saintek (Try Out Online)', category: 'TKA', notes: 'Target skor > 700', color: '#8B5CF6' },
      { id: 'sch-6', startTime: '21:00', endTime: '22:00', activity: 'LeetCode / Algorithm Practice', category: 'Coding', notes: '2 Soal Data Structure', color: '#4F46E5' }
    ],
    templates: {
      weekday: [
        { id: 't-w-1', startTime: '05:00', endTime: '06:30', activity: 'Belajar Pagi: Soal TKA', category: 'TKA', notes: 'Otak masih segar', color: '#8B5CF6' },
        { id: 't-w-2', startTime: '07:00', endTime: '15:00', activity: 'Sekolah (KBM SMA Kelas 12)', category: 'School', notes: 'KBM aktif', color: '#10B981' },
        { id: 't-w-3', startTime: '16:00', endTime: '18:00', activity: 'Coding Project Work', category: 'Coding', notes: 'Project development', color: '#4F46E5' },
        { id: 't-w-4', startTime: '19:30', endTime: '21:30', activity: 'Try Out & Review Soal TKA', category: 'TKA', notes: 'Drill soal', color: '#8B5CF6' }
      ],
      weekend: [
        { id: 't-wk-1', startTime: '06:00', endTime: '07:30', activity: 'Olahraga & Sarapan Sehat', category: 'Personal', notes: 'Jogging 30 menit', color: '#F97316' },
        { id: 't-wk-2', startTime: '08:00', endTime: '12:00', activity: 'Hackathon / Big Coding Milestone', category: 'Coding', notes: 'Deep focus coding sprint', color: '#4F46E5' },
        { id: 't-wk-3', startTime: '13:30', endTime: '16:30', activity: 'Simulasi Try Out Akbar TKA', category: 'TKA', notes: 'Full simulasi UTBK', color: '#8B5CF6' },
        { id: 't-wk-4', startTime: '19:00', endTime: '21:00', activity: 'Bedah Pembahasan Try Out', category: 'TKA', notes: 'Analisis kelemahan subtes', color: '#8B5CF6' }
      ],
      exam: [
        { id: 't-e-1', startTime: '05:00', endTime: '06:30', activity: 'Quick Formula Review & Cheatsheet', category: 'TKA', notes: 'Review ringkasan', color: '#8B5CF6' },
        { id: 't-e-2', startTime: '07:30', endTime: '12:00', activity: 'Ujian Sekolah / Try Out Resmi', category: 'School', notes: 'Fokus konsentrasi', color: '#10B981' },
        { id: 't-e-3', startTime: '14:00', endTime: '17:00', activity: 'Persiapan Ujian Besok', category: 'TKA', notes: 'Materi subtes prioritas', color: '#8B5CF6' }
      ]
    }
  },
  projects: [
    {
      id: 'proj-1',
      title: 'StudentFlow Productivity Web App',
      description: 'Aplikasi manajemen all-in-one kelas 12: TKA, Coding, Jadwal & Keuangan dengan PWA offline capability.',
      category: 'Coding',
      priority: 'High',
      status: 'inprogress',
      estimatedHours: 25,
      loggedHours: 19,
      tags: ['VanillaJS', 'PWA', 'Productivity'],
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      links: [{ title: 'GitHub Repo', url: 'https://github.com/uroo-dev/AturAja' }],
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
      tags: ['TKA', 'UTBK', 'Algorithm'],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      links: [{ title: 'Materi Drive', url: 'https://drive.google.com' }],
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
      tags: ['NodeJS', 'Discord', 'Automation'],
      dueDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      links: [{ title: 'Server Discord', url: 'https://discord.gg' }],
      archived: false,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
    }
  ],
  finances: {
    transactions: [
      { id: 'fn-1', type: 'income', category: 'Uang Saku', amount: 500000, date: new Date().toISOString().split('T')[0], notes: 'Uang saku mingguan orang tua', paymentMethod: 'Transfer', isRecurring: true },
      { id: 'fn-2', type: 'expense', category: 'Study', amount: 75000, date: new Date().toISOString().split('T')[0], notes: 'Buku Paket Soal Try Out TKA 2025', paymentMethod: 'E-Wallet', isRecurring: false },
      { id: 'fn-3', type: 'expense', category: 'Food', amount: 35000, date: new Date().toISOString().split('T')[0], notes: 'Makan siang & es kopi belajar', paymentMethod: 'QRIS', isRecurring: false },
      { id: 'fn-4', type: 'expense', category: 'Coding', amount: 65000, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], notes: 'Domain .dev untuk portfolio project', paymentMethod: 'E-Wallet', isRecurring: false },
      { id: 'fn-5', type: 'income', category: 'Freelance', amount: 350000, date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], notes: 'Fixing bug landing page klien', paymentMethod: 'Transfer', isRecurring: false },
      { id: 'fn-6', type: 'expense', category: 'Savings', amount: 150000, date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], notes: 'Setor celengan Tabungan Laptop', paymentMethod: 'Transfer', isRecurring: true }
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
    categoryColors: {
      TKA: '#8B5CF6',
      Coding: '#4F46E5',
      School: '#10B981',
      Personal: '#F97316',
      Finance: '#EC4899',
      Other: '#64748B'
    },
    wipProjectLimit: 3
  }
};

class StateManager {
  constructor() {
    this.state = this.loadState();
    this.undoStack = [];
    this.subscribers = [];
    this.initAutoSave();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        this.saveState(DEFAULT_STATE);
        return JSON.parse(JSON.stringify(DEFAULT_STATE));
      }
      const parsed = JSON.parse(saved);
      return {
        version: '2.0.0',
        profile: { ...DEFAULT_PROFILE, ...(parsed.profile || {}) },
        todos: Array.isArray(parsed.todos) ? parsed.todos : DEFAULT_STATE.todos,
        schedule: parsed.schedule && typeof parsed.schedule === 'object' ? parsed.schedule : DEFAULT_STATE.schedule,
        projects: Array.isArray(parsed.projects) ? parsed.projects : DEFAULT_STATE.projects,
        finances: parsed.finances || DEFAULT_STATE.finances,
        habits: Array.isArray(parsed.habits) ? parsed.habits : DEFAULT_STATE.habits,
        pomodoro: parsed.pomodoro || DEFAULT_STATE.pomodoro,
        settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) }
      };
    } catch (e) {
      console.error('Error loading state:', e);
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  saveState(customState = null) {
    try {
      const stateToSave = customState || this.state;
      stateToSave.profile.lastActive = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      this.notifySubscribers();
      this.updateAutoSaveBadge();
      return true;
    } catch (e) {
      console.error('Failed to save state:', e);
      return false;
    }
  }

  getState() {
    return this.state;
  }

  getProfile() {
    return this.state.profile;
  }

  updateProfile(updates) {
    this.state.profile = { ...this.state.profile, ...updates };
    this.saveState();
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notifySubscribers() {
    this.subscribers.forEach(cb => {
      try { cb(this.state); } catch (e) { console.error('Subscriber error:', e); }
    });
  }

  initAutoSave() {
    setInterval(() => this.saveState(), 30000);
  }

  updateAutoSaveBadge() {
    const badge = document.getElementById('autosave-badge');
    if (badge) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      badge.innerHTML = `<i class="fa-solid fa-cloud-arrow-up text-emerald-400"></i> Tersimpan ${timeStr}`;
      badge.style.opacity = '1';
      setTimeout(() => { badge.style.opacity = '0.6'; }, 2000);
    }
  }

  pushUndo(actionName, undoFunction) {
    this.undoStack.push({ actionName, undoFunction, timestamp: Date.now() });
    if (this.undoStack.length > 10) this.undoStack.shift();
  }

  undo() {
    const item = this.undoStack.pop();
    if (item && typeof item.undoFunction === 'function') {
      item.undoFunction();
      this.saveState();
      return true;
    }
    return false;
  }

  resetAll() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.saveState();
  }
}

window.state = new StateManager();
// Alias storage for backwards compatibility
window.storage = {
  getData: () => window.state.getState(),
  saveData: (d) => window.state.saveState(d),
  exportJSON: () => window.backupModule.exportJSON(),
  importJSON: (str, m) => window.backupModule.importJSON(str, m),
  resetAllData: () => window.state.resetAll()
};
