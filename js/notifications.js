/**
 * Notification System - Browser Notifications, In-App Notification Center & Scheduled Alarms
 */

class NotificationService {
  constructor() {
    this.hasPermission = false;
    this.notificationsHistory = this.loadHistory();
    this.notifiedTaskIds = new Set();
    this.lastDailyMorningDate = null;
    this.lastDailyEveningDate = null;
    this.scheduledChecksInterval = null;

    this.init();
  }

  init() {
    if ('Notification' in window) {
      this.hasPermission = Notification.permission === 'granted';
    }
    this.updateNotificationBadge();
    this.startScheduler();
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem('studentflow_notif_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'notif-welcome',
        title: 'Selamat Datang di StudentFlow! 🚀',
        body: 'Atur jadwal belajarmu, target UTBK, dan project coding dengan tenang.',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'info'
      }
    ];
  }

  saveHistory() {
    try {
      localStorage.setItem('studentflow_notif_history', JSON.stringify(this.notificationsHistory));
      this.updateNotificationBadge();
    } catch (e) {}
  }

  addNotificationToCenter(title, body, type = 'info') {
    const item = {
      id: Utils.generateId('notif'),
      title,
      body,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };
    this.notificationsHistory.unshift(item);
    if (this.notificationsHistory.length > 30) this.notificationsHistory.pop();
    this.saveHistory();
  }

  updateNotificationBadge() {
    const unreadCount = this.notificationsHistory.filter(n => !n.read).length;
    const badge = document.getElementById('header-notif-badge');
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  openNotificationModal() {
    const modal = document.getElementById('notification-center-modal');
    const container = document.getElementById('notification-center-list');
    if (!modal || !container) return;

    if (this.notificationsHistory.length === 0) {
      container.innerHTML = '<p class="text-xs text-slate-400 text-center py-8">Tidak ada riwayat notifikasi.</p>';
    } else {
      container.innerHTML = this.notificationsHistory.map(n => `
        <div class="p-3.5 rounded-2xl ${n.read ? 'bg-slate-800/40 opacity-70' : 'bg-slate-800/90 border border-indigo-500/30'} flex items-start gap-3 transition-all">
          <div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm mt-0.5">
            <i class="fa-solid fa-bell"></i>
          </div>
          <div class="flex-1 min-w-0">
            <h5 class="text-xs font-bold text-slate-100">${Utils.escapeHTML(n.title)}</h5>
            <p class="text-xs text-slate-300 mt-0.5">${Utils.escapeHTML(n.body)}</p>
            <span class="text-[10px] text-slate-400 font-mono mt-1 block">${new Date(n.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • ${Utils.formatDateIndo(n.timestamp.split('T')[0])}</span>
          </div>
        </div>
      `).join('');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeNotificationModal() {
    const modal = document.getElementById('notification-center-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  markAllAsRead() {
    this.notificationsHistory.forEach(n => n.read = true);
    this.saveHistory();
    this.openNotificationModal();
    Utils.showToast('Semua notifikasi ditandai sudah dibaca.', { type: 'info' });
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      Utils.showToast('Browser Anda tidak mendukung notifikasi web.', { type: 'warning' });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      if (this.hasPermission) {
        Utils.showToast('Notifikasi browser aktif!', { type: 'success' });
        this.sendSystemNotification('StudentFlow — DPS Community', {
          body: 'Notifikasi aktif. Pengingat tugas & briefing harian siap!'
        });
      } else {
        Utils.showToast('Izin notifikasi ditolak.', { type: 'info' });
      }
      return this.hasPermission;
    } catch (e) {
      return false;
    }
  }

  sendSystemNotification(title, options = {}) {
    this.addNotificationToCenter(title, options.body || '', options.type || 'info');

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
      Utils.playSound('info');
    } catch (e) {}
  }

  startScheduler() {
    this.scheduledChecksInterval = setInterval(() => this.checkScheduledEvents(), 60000);
    setTimeout(() => this.checkScheduledEvents(), 2000);
  }

  checkScheduledEvents() {
    const state = window.state ? window.state.getState() : null;
    if (!state) return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMin;

    const settings = state.settings || {};

    // 1. Check Morning Summary (07:00)
    const [morningH, morningM] = (settings.morningSummaryTime || '07:00').split(':').map(Number);
    if (currentHour === morningH && currentMin === morningM && this.lastDailyMorningDate !== todayStr) {
      this.lastDailyMorningDate = todayStr;
      const pendingCount = (state.todos || []).filter(t => t.status !== 'completed').length;
      const msg = `Selamat pagi! Kamu punya ${pendingCount} tugas aktif hari ini. Semangat belajar TKA & coding!`;
      this.sendSystemNotification('🌅 Briefing Pagi Hari', { body: msg });
      Utils.showToast(msg, { type: 'info', duration: 6000 });
    }

    // 2. Check Evening Review (20:30)
    const [eveningH, eveningM] = (settings.eveningReviewTime || '20:30').split(':').map(Number);
    if (currentHour === eveningH && currentMin === eveningM && this.lastDailyEveningDate !== todayStr) {
      this.lastDailyEveningDate = todayStr;
      const completedToday = (state.todos || []).filter(t => t.status === 'completed' && t.completedAt && t.completedAt.startsWith(todayStr)).length;
      const msg = `Malam! Kamu telah menyelesaikan ${completedToday} tugas hari ini. Jangan lupa evaluasi harianmu.`;
      this.sendSystemNotification('🌙 Evaluasi Malam Hari', { body: msg });
      Utils.showToast(msg, { type: 'info', duration: 6000 });
    }

    // 3. Check Todo Due Timers (30 minutes before due)
    const offsetMin = settings.dueReminderOffsetMinutes || 30;
    (state.todos || []).forEach(todo => {
      if (todo.status === 'completed' || !todo.dueDate) return;
      
      const [tDate, tTime] = todo.dueDate.split('T');
      if (tDate !== todayStr || !tTime) return;

      const [dueH, dueM] = tTime.split(':').map(Number);
      const dueTimeMinutes = dueH * 60 + dueM;
      const diff = dueTimeMinutes - currentTimeMinutes;

      if (diff >= 0 && diff <= offsetMin && !this.notifiedTaskIds.has(todo.id)) {
        this.notifiedTaskIds.add(todo.id);
        const text = `Tenggat dalam ${diff} menit: "${todo.title}" (${todo.category})`;
        this.sendSystemNotification('⏰ Pengingat Tugas', { body: text });
        Utils.showToast(text, { type: 'warning', duration: 6000 });
      }
    });
  }
}

window.notifications = new NotificationService();
