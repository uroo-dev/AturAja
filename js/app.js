/**
 * StudentFlow Main App Controller
 */

class App {
  constructor() {}

  init() {
    this.registerServiceWorker();
    this.bindNavigation();
    this.bindKeyboardShortcuts();
    this.bindQuickActions();

    // Initialize all modules
    if (window.router) window.router.init();
    if (window.dashboardModule) window.dashboardModule.init();
    if (window.todoModule) window.todoModule.init();
    if (window.scheduleModule) window.scheduleModule.init();
    if (window.projectsModule) window.projectsModule.init();
    if (window.financeModule) window.financeModule.init();
    if (window.pomodoroModule) window.pomodoroModule.init();
    if (window.habitsModule) window.habitsModule.init();
    if (window.settingsModule) window.settingsModule.init();
    if (window.notifications) window.notifications.init();
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => console.log('StudentFlow SW registered:', reg.scope))
          .catch((err) => console.warn('StudentFlow SW registration failed:', err));
      });
    }
  }

  bindNavigation() {
    document.querySelectorAll('[data-nav-target]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = item.getAttribute('data-nav-target');
        window.router.navigate(target);
      });
    });
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggleQuickActionModal();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (window.state.undo()) {
          e.preventDefault();
          Utils.showToast('Aksi terakhir berhasil dibatalkan (Undo).', { type: 'success' });
        }
      }

      if (e.altKey && e.key >= '1' && e.key <= '7') {
        const routes = ['dashboard', 'todo', 'schedule', 'projects', 'finance', 'focus', 'settings'];
        const idx = parseInt(e.key) - 1;
        if (routes[idx]) {
          e.preventDefault();
          window.router.navigate(routes[idx]);
        }
      }
    });
  }

  bindQuickActions() {
    const fab = document.getElementById('quick-action-fab');
    if (fab) fab.addEventListener('click', () => this.toggleQuickActionModal());
  }

  toggleQuickActionModal() {
    const modal = document.getElementById('quick-action-modal');
    if (!modal) return;
    if (modal.classList.contains('hidden')) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    } else {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => {
      m.classList.add('hidden');
      m.classList.remove('flex');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
