/**
 * App Main Controller - Tab Navigation, Quick Action Floating Modal, Service Worker Registration & Shortcuts
 */

class App {
  constructor() {
    this.currentTab = 'dashboard';
  }

  init() {
    this.registerServiceWorker();
    this.bindNavigation();
    this.bindKeyboardShortcuts();
    this.bindQuickActions();
    this.checkInitialNotificationPermission();

    // Initialize modules
    if (window.dashboardModule) window.dashboardModule.init();
    if (window.todoModule) window.todoModule.init();
    if (window.scheduleModule) window.scheduleModule.init();
    if (window.projectsModule) window.projectsModule.init();
    if (window.financeModule) window.financeModule.init();
    if (window.pomodoroModule) window.pomodoroModule.init();
    if (window.habitsModule) window.habitsModule.init();
    if (window.settingsModule) window.settingsModule.init();

    // Default tab
    this.switchTab('dashboard');
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => {
            console.log('ServiceWorker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('ServiceWorker registration failed:', err);
          });
      });
    }
  }

  checkInitialNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      setTimeout(() => {
        const notifBanner = document.getElementById('notif-permission-banner');
        if (notifBanner) notifBanner.classList.remove('hidden');
      }, 2500);
    }
  }

  bindNavigation() {
    // Sidebar nav items & Bottom bar nav items
    const navItems = document.querySelectorAll('[data-nav-target]');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = item.getAttribute('data-nav-target');
        this.switchTab(target);
      });
    });
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update nav links styling
    const allNavLinks = document.querySelectorAll('[data-nav-target]');
    allNavLinks.forEach(link => {
      const target = link.getAttribute('data-nav-target');
      if (target === tabId) {
        link.classList.add('active-nav');
        link.classList.remove('inactive-nav');
      } else {
        link.classList.remove('active-nav');
        link.classList.add('inactive-nav');
      }
    });

    // Show/hide tab panels
    const tabPanels = document.querySelectorAll('.tab-panel');
    tabPanels.forEach(panel => {
      if (panel.id === `tab-${tabId}`) {
        panel.classList.remove('hidden');
        panel.classList.add('fade-in');
      } else {
        panel.classList.add('hidden');
        panel.classList.remove('fade-in');
      }
    });

    // Refresh charts if needed on tab switch
    if (tabId === 'dashboard' && window.dashboardModule) {
      window.dashboardModule.render();
    } else if (tabId === 'finance' && window.financeModule) {
      window.financeModule.render();
    } else if (tabId === 'projects' && window.projectsModule) {
      window.projectsModule.render();
    } else if (tabId === 'schedule' && window.scheduleModule) {
      window.scheduleModule.render();
    } else if (tabId === 'todo' && window.todoModule) {
      window.todoModule.render();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Escape key closes modals
      if (e.key === 'Escape') {
        this.closeAllModals();
        return;
      }

      // Alt+N or Ctrl+K for quick actions modal
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggleQuickActionModal();
      }

      // Alt+1 to Alt+6 for fast tab switching
      if (e.altKey && e.key >= '1' && e.key <= '6') {
        const tabs = ['dashboard', 'todo', 'schedule', 'projects', 'finance', 'focus'];
        const idx = parseInt(e.key) - 1;
        if (tabs[idx]) {
          e.preventDefault();
          this.switchTab(tabs[idx]);
        }
      }
    });
  }

  bindQuickActions() {
    const quickFab = document.getElementById('quick-action-fab');
    if (quickFab) {
      quickFab.addEventListener('click', () => this.toggleQuickActionModal());
    }
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
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });
  }
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
