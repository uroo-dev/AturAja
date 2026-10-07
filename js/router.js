/**
 * Router Module - Hash-based Single Page App Routing
 */

class Router {
  constructor() {
    this.routes = ['dashboard', 'todo', 'schedule', 'projects', 'finance', 'focus', 'settings'];
    this.currentRoute = 'dashboard';
    window.addEventListener('hashchange', () => this.handleHashChange());
  }

  init() {
    const initialHash = window.location.hash.replace('#', '');
    if (this.routes.includes(initialHash)) {
      this.navigate(initialHash, false);
    } else {
      this.navigate('dashboard', false);
    }
  }

  handleHashChange() {
    const hash = window.location.hash.replace('#', '');
    if (this.routes.includes(hash) && hash !== this.currentRoute) {
      this.navigate(hash, false);
    }
  }

  navigate(route, updateHash = true) {
    if (!this.routes.includes(route)) route = 'dashboard';
    this.currentRoute = route;

    if (updateHash) {
      window.location.hash = route;
    }

    // Update Nav Links
    document.querySelectorAll('[data-nav-target]').forEach(link => {
      const target = link.getAttribute('data-nav-target');
      if (target === route) {
        link.classList.add('active');
        link.classList.remove('text-muted');
      } else {
        link.classList.remove('active');
      }
    });

    // Toggle Tab Sections
    document.querySelectorAll('.tab-panel').forEach(panel => {
      if (panel.id === `tab-${route}`) {
        panel.classList.remove('hidden');
        panel.classList.add('fade-in');
      } else {
        panel.classList.add('hidden');
        panel.classList.remove('fade-in');
      }
    });

    // Re-render charts & module specific logic
    if (route === 'dashboard' && window.dashboardModule) window.dashboardModule.render();
    if (route === 'finance' && window.financeModule) window.financeModule.render();
    if (route === 'projects' && window.projectsModule) window.projectsModule.render();
    if (route === 'schedule' && window.scheduleModule) window.scheduleModule.render();
    if (route === 'todo' && window.todoModule) window.todoModule.render();
    if (route === 'settings' && window.settingsModule) window.settingsModule.render();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

window.router = new Router();
