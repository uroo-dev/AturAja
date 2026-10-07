/**
 * StudentFlow Utils - Web Audio Synthesis, Toasts, Formatting, Quotes, Confetti
 */

const MOTIVATIONAL_QUOTES = [
  { text: "Disiplin adalah jembatan antara target dan pencapaian nyata.", author: "Jim Rohn" },
  { text: "Setiap baris kode dan latihan soal membawamu selangkah lebih dekat ke kampus impian.", author: "StudentFlow" },
  { text: "Consistency beats intensity. 45 menit fokus setiap hari lebih dahsyat dari maraton semalam.", author: "James Clear" },
  { text: "Jadikan kegagalan pada try out sebagai kompas navigasi perbaikan, bukan vonis akhir.", author: "Pejuang SNBT" },
  { text: "Simplicity is prerequisite for reliability. Rapikan kodemu, rapikan jadwalmu.", author: "Edsger W. Dijkstra" }
];

class Utils {
  static generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static formatIDR(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  static formatDateIndo(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  static escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  static getRandomQuote() {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  }

  static triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  static playSound(type = 'info') {
    const profile = window.state ? window.state.getProfile() : null;
    if (profile && profile.soundEnabled === false) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!window._audioCtx) window._audioCtx = new AudioContext();
      if (window._audioCtx.state === 'suspended') window._audioCtx.resume();

      const ctx = window._audioCtx;
      const now = ctx.currentTime;

      if (type === 'success' || type === 'confetti') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.12, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.35);
        });
      } else if (type === 'alarm' || type === 'timer') {
        [880, 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.2);
          gain.gain.setValueAtTime(0.18, now + i * 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.2);
          osc.stop(now + i * 0.2 + 0.18);
        });
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      }
    } catch (e) {
      // Audio might be restricted prior to interaction
    }
  }

  static showToast(message, options = {}) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let actionBtnHtml = '';
    if (options.action) {
      actionBtnHtml = `<button class="toast-action-btn" id="toast-action-${Date.now()}">${options.action.text}</button>`;
    }

    toast.innerHTML = `
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-sm">${message}</span>
      </div>
      <div class="flex items-center gap-2">
        ${actionBtnHtml}
        <button class="text-slate-400 hover:text-white p-1" onclick="this.closest('.toast').remove()">
          <i class="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>
    `;

    container.appendChild(toast);
    Utils.playSound(options.type || 'info');

    requestAnimationFrame(() => {
      toast.classList.add('toast-visible');
    });

    if (options.action) {
      const btn = toast.querySelector('.toast-action-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          options.action.onClick();
          toast.remove();
        });
      }
    }

    const duration = options.duration || 3800;
    setTimeout(() => {
      toast.classList.remove('toast-visible');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

window.Utils = Utils;
