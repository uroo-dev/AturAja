/**
 * Pomodoro & Focus Timer Module - Study/Coding Deep Work Modes, Ambient Beeps, Session Tracking
 */

class PomodoroModule {
  constructor() {
    this.mode = 'pomodoro'; // 'pomodoro' (25m), 'shortBreak' (5m), 'longBreak' (15m), 'custom'
    this.focusTag = 'TKA'; // 'TKA' or 'Coding'
    this.timerDuration = 25 * 60;
    this.timeLeft = 25 * 60;
    this.isRunning = false;
    this.timerInterval = null;
    this.sessionCount = 0;
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    const startBtn = document.getElementById('pomodoro-start-btn');
    const pauseBtn = document.getElementById('pomodoro-pause-btn');
    const resetBtn = document.getElementById('pomodoro-reset-btn');

    if (startBtn) startBtn.addEventListener('click', () => this.start());
    if (pauseBtn) pauseBtn.addEventListener('click', () => this.pause());
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());

    const modeBtns = document.querySelectorAll('.pomodoro-mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setMode(btn.dataset.mode);
      });
    });

    const tagBtns = document.querySelectorAll('.pomodoro-tag-btn');
    tagBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tagBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.focusTag = btn.dataset.tag;
      });
    });
  }

  setMode(mode) {
    this.pause();
    this.mode = mode;
    if (mode === 'pomodoro') this.timerDuration = 25 * 60;
    else if (mode === 'shortBreak') this.timerDuration = 5 * 60;
    else if (mode === 'longBreak') this.timerDuration = 15 * 60;
    else if (mode === 'deepWork') this.timerDuration = 50 * 60;

    this.timeLeft = this.timerDuration;
    this.renderDisplay();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    const startBtn = document.getElementById('pomodoro-start-btn');
    const pauseBtn = document.getElementById('pomodoro-pause-btn');
    if (startBtn) startBtn.classList.add('hidden');
    if (pauseBtn) pauseBtn.classList.remove('hidden');

    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.renderDisplay();
      } else {
        this.completeSession();
      }
    }, 1000);
  }

  pause() {
    this.isRunning = false;
    clearInterval(this.timerInterval);

    const startBtn = document.getElementById('pomodoro-start-btn');
    const pauseBtn = document.getElementById('pomodoro-pause-btn');
    if (startBtn) startBtn.classList.remove('hidden');
    if (pauseBtn) pauseBtn.classList.add('hidden');
  }

  reset() {
    this.pause();
    this.timeLeft = this.timerDuration;
    this.renderDisplay();
  }

  completeSession() {
    this.pause();
    window.notifications.playChime('timer');

    const durationMin = Math.round(this.timerDuration / 60);

    if (this.mode === 'pomodoro' || this.mode === 'deepWork') {
      this.sessionCount++;
      const data = window.storage.getData();
      if (!data.pomodoro) data.pomodoro = { sessionsCompleted: 0, totalStudyMinutes: 0, totalCodingMinutes: 0, history: [] };

      data.pomodoro.sessionsCompleted = (data.pomodoro.sessionsCompleted || 0) + 1;
      if (this.focusTag === 'Coding') {
        data.pomodoro.totalCodingMinutes = (data.pomodoro.totalCodingMinutes || 0) + durationMin;
      } else {
        data.pomodoro.totalStudyMinutes = (data.pomodoro.totalStudyMinutes || 0) + durationMin;
      }

      data.pomodoro.history.unshift({
        date: new Date().toISOString().split('T')[0],
        type: this.focusTag,
        duration: durationMin,
        note: `Sesi Fokus ${this.focusTag} (${durationMin} menit)`
      });

      window.storage.saveData();

      window.todoModule.triggerConfetti();
      window.notifications.sendSystemNotification('⏰ Sesi Fokus Selesai!', {
        body: `Hebat! Kamu telah menyelesaikan ${durationMin} menit fokus ${this.focusTag}. Saatnya istirahat sejenak!`,
        tag: 'pomodoro-complete'
      });
      window.notifications.showToast(`Sesi fokus selesai (${durationMin} menit)! Ambil istirahat sejenak ☕`, 'success', 6000);

      // Auto switch to short break
      this.setMode('shortBreak');
    } else {
      window.notifications.sendSystemNotification('☕ Waktu Istirahat Selesai!', {
        body: 'Siap untuk sesi fokus berikutnya? Mari mulai lagi!',
        tag: 'break-complete'
      });
      window.notifications.showToast('Waktu istirahat selesai! Siap fokus lagi?', 'info');
      this.setMode('pomodoro');
    }

    this.render();
    if (window.dashboardModule) window.dashboardModule.render();
  }

  render() {
    this.renderDisplay();
    this.renderStats();
  }

  renderDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const timerEl = document.getElementById('pomodoro-timer-display');
    if (timerEl) timerEl.textContent = timeStr;

    // Progress circle / bar
    const progressPercent = ((this.timerDuration - this.timeLeft) / this.timerDuration) * 100;
    const barEl = document.getElementById('pomodoro-progress-bar');
    if (barEl) barEl.style.width = `${progressPercent}%`;

    // Title document
    if (this.isRunning) {
      document.title = `(${timeStr}) Focus - Student Life Manager`;
    } else {
      document.title = 'Student Life Manager';
    }
  }

  renderStats() {
    const data = window.storage.getData();
    const pomo = data.pomodoro || {};

    const elSessions = document.getElementById('pomo-stat-sessions');
    const elStudyHrs = document.getElementById('pomo-stat-study');
    const elCodeHrs = document.getElementById('pomo-stat-coding');

    if (elSessions) elSessions.textContent = pomo.sessionsCompleted || 0;
    if (elStudyHrs) elStudyHrs.textContent = Math.round(((pomo.totalStudyMinutes || 0) / 60) * 10) / 10 + 'h';
    if (elCodeHrs) elCodeHrs.textContent = Math.round(((pomo.totalCodingMinutes || 0) / 60) * 10) / 10 + 'h';
  }
}

// Global instance
window.pomodoroModule = new PomodoroModule();
