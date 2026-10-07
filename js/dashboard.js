/**
 * Dashboard Module - Real-time Metrics, Quotes, Active Habits, Weekly Focus & Tasks Charts
 */

class DashboardModule {
  constructor() {
    this.charts = {};
  }

  init() {
    this.render();
  }

  render() {
    this.renderProfile();
    this.renderHeroProgress();
    this.renderQuote();
    this.renderMetrics();
    this.renderCurrentTimeBlock();
    this.renderUpcomingDeadlines();
    this.renderHabitsQuickView();
    this.renderCharts();
  }

  renderProfile() {
    const state = window.state.getState();
    const profile = state.profile || { name: 'Rizki', school: 'Kelas 12 - Pejuang SNBT' };
    
    const greetEl = document.getElementById('header-greeting-name');
    const subEl = document.getElementById('header-user-subtitle');
    const sideEl = document.getElementById('sidebar-user-name');

    if (greetEl) greetEl.textContent = profile.name || 'Rizki';
    if (subEl) subEl.textContent = profile.school || 'Member DPS Community';
    if (sideEl) sideEl.textContent = profile.name ? `${profile.name} (DPS)` : 'Member DPS Community';
  }

  renderHeroProgress() {
    const state = window.state.getState();
    const todos = state.todos || [];
    const totalTodos = todos.length;
    const completedTodos = todos.filter(t => t.status === 'completed').length;
    
    let percent = 0;
    if (totalTodos > 0) {
      percent = Math.round((completedTodos / totalTodos) * 100);
    } else {
      percent = 75; // default initial demo progress
    }

    const percentEl = document.getElementById('hero-progress-percent');
    const textEl = document.getElementById('hero-progress-text');
    const barEl = document.getElementById('hero-progress-bar');
    
    if (percentEl) percentEl.textContent = `${percent}%`;
    if (textEl) {
      if (totalTodos > 0) {
        textEl.textContent = `${completedTodos} dari ${totalTodos} Tugas/Materi Selesai`;
      } else {
        textEl.textContent = '3 dari 5 Materi Selesai';
      }
    }
    if (barEl) barEl.style.width = `${percent}%`;

    // Update SVG stroke-dasharray
    const donutEl = document.querySelector('.hero-gradient-card svg path.text-\\[\\#00E676\\]');
    if (donutEl) {
      donutEl.setAttribute('stroke-dasharray', `${percent}, 100`);
    }
  }

  renderQuote() {
    const quoteEl = document.getElementById('dash-quote-text');
    const authorEl = document.getElementById('dash-quote-author');
    if (quoteEl && authorEl) {
      const q = Utils.getRandomQuote();
      quoteEl.textContent = `"${q.text}"`;
      authorEl.textContent = `— ${q.author}`;
    }
  }

  renderMetrics() {
    const state = window.state.getState();
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Pending Todos Count
    const pendingTodos = (state.todos || []).filter(t => t.status !== 'completed').length;
    const elPending = document.getElementById('dash-pending-todos');
    if (elPending) elPending.textContent = pendingTodos;

    // 2. Active Projects Count (In Progress)
    const activeProjects = (state.projects || []).filter(p => !p.archived && p.status === 'inprogress').length;
    const elProjects = document.getElementById('dash-active-projects');
    if (elProjects) elProjects.textContent = activeProjects;

    // 3. Today's Expenses
    const todayTxs = (state.finances?.transactions || []).filter(t => t.date === todayStr && t.type === 'expense');
    const todayExpense = todayTxs.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const elExpense = document.getElementById('dash-today-expenses');
    if (elExpense) elExpense.textContent = Utils.formatIDR(todayExpense);

    // 4. Study & Code Hours
    const pomo = state.pomodoro || {};
    const studyHours = Math.round(((pomo.totalStudyMinutes || 0) / 60) * 10) / 10;
    const codeHours = Math.round(((pomo.totalCodingMinutes || 0) / 60) * 10) / 10;

    const elStudy = document.getElementById('dash-study-hours');
    const elCode = document.getElementById('dash-code-hours');
    if (elStudy) elStudy.textContent = `${studyHours}h`;
    if (elCode) elCode.textContent = `${codeHours}h`;
  }

  renderCurrentTimeBlock() {
    const container = document.getElementById('dash-current-timeblock');
    if (!container) return;

    const state = window.state.getState();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayBlocks = (state.schedule && state.schedule[todayStr]) || [];

    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();

    const activeBlock = todayBlocks.find(b => {
      const [sh, sm] = b.startTime.split(':').map(Number);
      const [eh, em] = b.endTime.split(':').map(Number);
      return currentMin >= (sh * 60 + sm) && currentMin <= (eh * 60 + em);
    });

    if (activeBlock) {
      const color = activeBlock.color || '#4F46E5';
      container.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-full animate-ping" style="background-color: ${color}"></div>
          <div class="min-w-0 flex-1">
            <span class="text-[10px] uppercase font-bold text-slate-400 font-mono">${activeBlock.startTime} - ${activeBlock.endTime} (${activeBlock.category})</span>
            <h5 class="text-sm font-semibold text-slate-100 truncate">${Utils.escapeHTML(activeBlock.activity)}</h5>
          </div>
          <button onclick="window.router.navigate('schedule')" class="btn btn-sm btn-ghost text-primary text-xs">
            Buka Jadwal <i class="fa-solid fa-arrow-right ml-1 text-[10px]"></i>
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="flex items-center justify-between text-xs text-slate-400">
          <span>Tidak ada jadwal aktif saat ini. Waktu bebas / istirahat sejenak.</span>
          <button onclick="window.router.navigate('schedule')" class="text-primary hover:underline font-semibold">
            Buka Jadwal &rarr;
          </button>
        </div>
      `;
    }
  }

  renderUpcomingDeadlines() {
    const container = document.getElementById('dash-upcoming-deadlines');
    if (!container) return;

    const state = window.state.getState();
    const pendingTodos = (state.todos || []).filter(t => t.status !== 'completed' && t.dueDate);

    pendingTodos.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const top4 = pendingTodos.slice(0, 4);

    if (top4.length === 0) {
      container.innerHTML = '<p class="text-xs text-muted italic p-4 text-center">Semua tugas beres! Tidak ada deadline mendesak.</p>';
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const catColors = state.settings?.categoryColors || {};

    let html = '<div class="divide-y divide-slate-800">';
    top4.forEach(todo => {
      const isOverdue = todo.dueDate.split('T')[0] < todayStr;
      const isToday = todo.dueDate.split('T')[0] === todayStr;
      const catColor = catColors[todo.category] || '#64748B';

      html += `
        <div class="py-2.5 flex items-center justify-between gap-3 group">
          <div class="flex items-center gap-2.5 min-w-0">
            <button onclick="window.todoModule.toggleComplete('${todo.id}')" 
                    class="w-5 h-5 rounded border border-slate-600 hover:border-emerald-400 flex items-center justify-center text-transparent hover:text-emerald-400 text-xs">
              <i class="fa-solid fa-check"></i>
            </button>
            <div class="min-w-0">
              <h6 class="text-xs font-semibold text-slate-200 truncate">${Utils.escapeHTML(todo.title)}</h6>
              <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                <span class="px-1.5 py-0.2 rounded text-white font-bold text-[9px]" style="background-color: ${catColor}">${todo.category}</span>
                <span class="${isOverdue ? 'text-rose-400 font-bold' : isToday ? 'text-amber-400 font-semibold' : 'text-slate-400'}">
                  ${Utils.formatDateIndo(todo.dueDate.split('T')[0])}
                </span>
              </div>
            </div>
          </div>

          <span class="badge ${todo.priority === 'high' ? 'badge-danger' : 'badge-warning'} text-[10px]">${todo.priority}</span>
        </div>
      `;
    });
    html += '</div>';

    container.innerHTML = html;
  }

  renderHabitsQuickView() {
    const container = document.getElementById('dash-habits-quick');
    if (!container) return;

    const state = window.state.getState();
    const habits = state.habits || [];
    const todayStr = new Date().toISOString().split('T')[0];

    if (habits.length === 0) {
      container.innerHTML = '<p class="text-xs text-muted italic p-2">Belum ada habit aktif.</p>';
      return;
    }

    let html = '<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">';
    habits.forEach(h => {
      const isDone = (h.completedDates || []).includes(todayStr);
      html += `
        <button onclick="window.habitsModule.toggleToday('${h.id}')"
                class="p-2.5 rounded-xl border text-left transition-all ${
                  isDone 
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-500'
                }">
          <div class="flex items-center justify-between text-xs mb-1">
            <i class="fa-solid ${h.icon || 'fa-check'}"></i>
            <span class="text-[10px] font-mono text-amber-400 font-bold"><i class="fa-solid fa-fire"></i> ${h.streak}</span>
          </div>
          <p class="text-xs font-semibold truncate">${Utils.escapeHTML(h.name)}</p>
        </button>
      `;
    });
    html += '</div>';

    container.innerHTML = html;
  }

  renderCharts() {
    if (typeof Chart === 'undefined') return;
    const state = window.state.getState();

    // 1. Task Composition by Category
    const todos = state.todos || [];
    const catCounts = { TKA: 0, Coding: 0, School: 0, Personal: 0, Finance: 0 };
    todos.forEach(t => {
      if (catCounts[t.category] !== undefined) catCounts[t.category]++;
    });

    const ctxTasks = document.getElementById('chart-dash-tasks');
    if (ctxTasks) {
      if (this.charts.tasks) this.charts.tasks.destroy();
      this.charts.tasks = new Chart(ctxTasks, {
        type: 'doughnut',
        data: {
          labels: Object.keys(catCounts),
          datasets: [{
            data: Object.values(catCounts),
            backgroundColor: ['#8B5CF6', '#4F46E5', '#10B981', '#F97316', '#EC4899'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#94A3B8', font: { size: 10 } }
            }
          }
        }
      });
    }

    // 2. Study TKA vs Coding Hours
    const pomo = state.pomodoro || {};
    const studyM = pomo.totalStudyMinutes || 0;
    const codeM = pomo.totalCodingMinutes || 0;

    const ctxFocus = document.getElementById('chart-dash-focus');
    if (ctxFocus) {
      if (this.charts.focus) this.charts.focus.destroy();
      this.charts.focus = new Chart(ctxFocus, {
        type: 'bar',
        data: {
          labels: ['Belajar TKA (Jam)', 'Coding Projects (Jam)'],
          datasets: [{
            label: 'Total Jam',
            data: [Math.round((studyM / 60) * 10) / 10, Math.round((codeM / 60) * 10) / 10],
            backgroundColor: ['#8B5CF6', '#4F46E5'],
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { grid: { display: false }, ticks: { color: '#94A3B8' } },
            y: { grid: { color: '#334155' }, ticks: { color: '#94A3B8' } }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  }
}

window.dashboardModule = new DashboardModule();
