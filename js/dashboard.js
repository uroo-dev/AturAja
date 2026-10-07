/**
 * Dashboard Module - Central Overview, Real-time Metrics, Weekly Stats & Charts
 */

class DashboardModule {
  constructor() {
    this.charts = {};
  }

  init() {
    this.render();
  }

  render() {
    this.renderMetrics();
    this.renderCurrentTimeBlock();
    this.renderUpcomingDeadlines();
    this.renderHabitsQuickView();
    this.renderCharts();
  }

  renderMetrics() {
    const data = window.storage.getData();
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Pending Todos Count
    const pendingTodos = (data.todos || []).filter(t => !t.completed).length;
    const elPending = document.getElementById('dash-pending-todos');
    if (elPending) elPending.textContent = pendingTodos;

    // 2. Active Projects Count (In Progress)
    const activeProjects = (data.projects || []).filter(p => !p.archived && p.status === 'inprogress').length;
    const elProjects = document.getElementById('dash-active-projects');
    if (elProjects) elProjects.textContent = activeProjects;

    // 3. Today's Expenses
    const todayTxs = (data.finances?.transactions || []).filter(t => t.date === todayStr && t.type === 'expense');
    const todayExpense = todayTxs.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const elExpense = document.getElementById('dash-today-expenses');
    if (elExpense) elExpense.textContent = window.financeModule ? window.financeModule.formatIDR(todayExpense) : `Rp ${todayExpense.toLocaleString('id-ID')}`;

    // 4. Weekly Stats
    const completedTodos = (data.todos || []).filter(t => t.completed).length;
    const elCompleted = document.getElementById('dash-completed-todos');
    if (elCompleted) elCompleted.textContent = completedTodos;

    const pomo = data.pomodoro || {};
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

    const data = window.storage.getData();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayBlocks = (data.schedule && data.schedule[todayStr]) || [];

    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();

    const activeBlock = todayBlocks.find(b => {
      const [sh, sm] = b.startTime.split(':').map(Number);
      const [eh, em] = b.endTime.split(':').map(Number);
      return currentMin >= (sh * 60 + sm) && currentMin <= (eh * 60 + em);
    });

    if (activeBlock) {
      const color = activeBlock.color || '#3B82F6';
      container.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-full animate-ping" style="background-color: ${color}"></div>
          <div class="min-w-0 flex-1">
            <span class="text-[10px] uppercase font-bold text-slate-400 font-mono">${activeBlock.startTime} - ${activeBlock.endTime} (${activeBlock.category})</span>
            <h5 class="text-sm font-semibold text-slate-100 truncate">${this.escapeHTML(activeBlock.activity)}</h5>
          </div>
          <button onclick="window.app.switchTab('schedule')" class="text-xs text-blue-400 hover:underline">
            Jadwal <i class="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="flex items-center justify-between text-xs text-slate-400">
          <span>Tidak ada jadwal aktif saat ini. Waktu bebas / istirahat.</span>
          <button onclick="window.app.switchTab('schedule')" class="text-blue-400 hover:underline">
            Buka Jadwal <i class="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        </div>
      `;
    }
  }

  renderUpcomingDeadlines() {
    const container = document.getElementById('dash-upcoming-deadlines');
    if (!container) return;

    const data = window.storage.getData();
    const pendingTodos = (data.todos || []).filter(t => !t.completed && t.dueDate);

    // Sort by due date asc
    pendingTodos.sort((a, b) => new Date(a.dueDate + 'T' + (a.dueTime || '00:00')) - new Date(b.dueDate + 'T' + (b.dueTime || '00:00')));

    const top3 = pendingTodos.slice(0, 4);

    if (top3.length === 0) {
      container.innerHTML = '<p class="text-xs text-slate-500 italic p-4 text-center">Semua tugas beres! Tidak ada deadline mendesak.</p>';
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const settings = data.settings || {};
    const catColors = settings.categoryColors || DEFAULT_CATEGORY_COLORS;

    let html = '<div class="divide-y divide-slate-800/80">';
    top3.forEach(todo => {
      const isOverdue = todo.dueDate < todayStr;
      const isToday = todo.dueDate === todayStr;
      const catColor = catColors[todo.category] || '#64748B';

      html += `
        <div class="py-2.5 flex items-center justify-between gap-3 group">
          <div class="flex items-center gap-2.5 min-w-0">
            <button onclick="window.todoModule.toggleComplete('${todo.id}')" 
                    class="w-5 h-5 rounded border border-slate-600 hover:border-emerald-400 flex items-center justify-center text-transparent hover:text-emerald-400 text-xs">
              <i class="fa-solid fa-check"></i>
            </button>
            <div class="min-w-0">
              <h6 class="text-xs font-semibold text-slate-200 truncate">${this.escapeHTML(todo.title)}</h6>
              <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                <span class="px-1.5 py-0.2 rounded text-white font-medium text-[9px]" style="background-color: ${catColor}">${todo.category}</span>
                <span class="${isOverdue ? 'text-rose-400 font-bold' : isToday ? 'text-amber-400 font-semibold' : 'text-slate-400'}">
                  ${window.todoModule.formatDateIndo(todo.dueDate)} ${todo.dueTime || ''}
                </span>
              </div>
            </div>
          </div>

          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${
            todo.priority === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
          }">${todo.priority}</span>
        </div>
      `;
    });
    html += '</div>';

    container.innerHTML = html;
  }

  renderHabitsQuickView() {
    const container = document.getElementById('dash-habits-quick');
    if (!container) return;

    const data = window.storage.getData();
    const habits = data.habits || [];
    const todayStr = new Date().toISOString().split('T')[0];

    if (habits.length === 0) {
      container.innerHTML = '<p class="text-xs text-slate-500 italic p-2">Belum ada habit aktif.</p>';
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
          <p class="text-xs font-semibold truncate">${this.escapeHTML(h.name)}</p>
        </button>
      `;
    });
    html += '</div>';

    container.innerHTML = html;
  }

  renderCharts() {
    if (typeof Chart === 'undefined') return;

    const data = window.storage.getData();

    // 1. Task Completion by Category
    const todos = data.todos || [];
    const catCounts = { TKA: 0, Coding: 0, School: 0, Personal: 0, Finance: 0 };
    todos.forEach(t => {
      if (catCounts[t.category] !== undefined) {
        catCounts[t.category]++;
      }
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
            backgroundColor: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'],
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

    // 2. Focus Hours Breakdown (Study TKA vs Coding)
    const pomo = data.pomodoro || {};
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
            label: 'Total Jam Fokus',
            data: [Math.round((studyM / 60) * 10) / 10, Math.round((codeM / 60) * 10) / 10],
            backgroundColor: ['#8B5CF6', '#3B82F6'],
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

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}

// Global instance
window.dashboardModule = new DashboardModule();
