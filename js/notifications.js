/**
 * Notification System - Browser Notifications, In-App Toasts, Scheduled Summaries & Web Audio Beeps
 */

class NotificationService {
  constructor() {
    this.hasPermission = false;
    this.audioCtx = null;
    this.scheduledChecksInterval = null;
    this.notifiedTaskIds = new Set();
    this.lastDailyMorningDate = null;
    this.lastDailyEveningDate = null;

    this.init();
  }

  init() {
    if ('Notification' in window) {
      this.hasPermission = Notification.permission === 'granted';
    }
    this.startScheduler();
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      this.showToast('Browser Anda tidak mendukung notifikasi web.', 'warning');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      if (this.hasPermission) {
        this.showToast('Notifikasi browser aktif!', 'success');
        this.sendSystemNotification('Student Life Manager', {
          body: 'Notifikasi berhasil diaktifkan. Pengingat tugas dan ringkasan harian siap!',
          tag: 'welcome-notification'
        });
      } else {
        this.showToast('Izin notifikasi ditolak.', 'info');
      }
      return this.hasPermission;
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return false;
    }
  }

  playChime(type = 'info') {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!this.audioCtx) this.audioCtx = new AudioContext();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      if (type === 'success' || type === 'confetti') {
        // High cheery chord
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.15, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.35);
        });
      } else if (type === 'alarm' || type === 'timer') {
        // Dual beep
        [880, 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.2);
          gain.gain.setValueAtTime(0.2, now + i * 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.2);
          osc.stop(now + i * 0.2 + 0.18);
        });
      } else {
        // Soft gentle pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  }

  sendSystemNotification(title, options = {}) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const defaultOpts = {
      icon: 'assets/icon-192.png',
      badge: 'assets/badge.png',
      requireInteraction: false,
      ...options
    };

    try {
      new Notification(title, defaultOpts);
      this.playChime('info');
    } catch (e) {
      console.warn('System notification failed:', e);
    }
  }

  showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type} flex items-center gap-3 p-3.5 px-4 rounded-xl shadow-xl text-sm font-medium transition-all duration-300 transform translate-y-3 opacity-0`;

    let iconClass = 'fa-circle-info text-blue-400';
    if (type === 'success') iconClass = 'fa-circle-check text-emerald-400';
    if (type === 'warning') iconClass = 'fa-triangle-exclamation text-amber-400';
    if (type === 'danger') iconClass = 'fa-circle-xmark text-rose-400';

    toast.innerHTML = `
      <i class="fa-solid ${iconClass} text-lg"></i>
      <div class="flex-1">${message}</div>
      <button class="text-slate-400 hover:text-white transition-colors" onclick="this.parentElement.remove()">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    container.appendChild(toast);
    this.playChime(type === 'success' ? 'success' : 'info');

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-3', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-8');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  startScheduler() {
    // Run checks every minute
    this.scheduledChecksInterval = setInterval(() => {
      this.checkScheduledEvents();
    }, 60000);

    // Initial check immediately
    setTimeout(() => this.checkScheduledEvents(), 2000);
  }

  checkScheduledEvents() {
    const data = window.storage ? window.storage.getData() : null;
    if (!data) return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMin;

    const settings = data.settings || {};

    // 1. Check Morning Summary (07:00 default)
    const [morningH, morningM] = (settings.morningSummaryTime || '07:00').split(':').map(Number);
    if (currentHour === morningH && currentMin === morningM && this.lastDailyMorningDate !== todayStr) {
      this.lastDailyMorningDate = todayStr;
      const pendingCount = data.todos.filter(t => !t.completed).length;
      const msg = `Selamat pagi! Kamu punya ${pendingCount} tugas aktif hari ini. Semangat belajar TKA & coding!`;
      this.sendSystemNotification('🌅 Briefing Pagi Hari', { body: msg, tag: `morning-${todayStr}` });
      this.showToast(msg, 'info', 5000);
    }

    // 2. Check Evening Review (20:30 default)
    const [eveningH, eveningM] = (settings.eveningReviewTime || '20:30').split(':').map(Number);
    if (currentHour === eveningH && currentMin === eveningM && this.lastDailyEveningDate !== todayStr) {
      this.lastDailyEveningDate = todayStr;
      const completedToday = data.todos.filter(t => t.completed && t.completedAt && t.completedAt.startsWith(todayStr)).length;
      const msg = `Malam! Kamu telah menyelesaikan ${completedToday} tugas hari ini. Jangan lupa evaluasi & persiapkan besok.`;
      this.sendSystemNotification('🌙 Evaluasi Malam Hari', { body: msg, tag: `evening-${todayStr}` });
      this.showToast(msg, 'info', 5000);
    }

    // 3. Check Todo Due Timers (30 minutes before due)
    const offsetMin = settings.dueReminderOffsetMinutes || 30;
    (data.todos || []).forEach(todo => {
      if (todo.completed || !todo.dueDate || !todo.dueTime) return;
      if (todo.dueDate !== todayStr) return;

      const [dueH, dueM] = todo.dueTime.split(':').map(Number);
      const dueTimeMinutes = dueH * 60 + dueM;
      const diff = dueTimeMinutes - currentTimeMinutes;

      // When diff is within [0, offsetMin] and not yet notified
      if (diff >= 0 && diff <= offsetMin && !this.notifiedTaskIds.has(todo.id)) {
        this.notifiedTaskIds.add(todo.id);
        const text = `Tenggat dalam ${diff} menit: "${todo.title}" (${todo.category})`;
        this.sendSystemNotification('⏰ Pengingat Tugas', {
          body: text,
          tag: `due-${todo.id}`
        });
        this.showToast(text, 'warning', 6000);
      }
    });
  }
}

// Global instance
window.notifications = new NotificationService();
