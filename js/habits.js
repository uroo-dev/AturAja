/**
 * Habits Tracker Module - Daily Habits, Streak Tracking & Motivation
 */

class HabitsModule {
  constructor() {
    this.editingHabitId = null;
  }

  init() {
    this.render();
  }

  getHabits() {
    const data = window.storage.getData();
    return data.habits || [];
  }

  render() {
    const container = document.getElementById('habits-list-container');
    if (!container) return;

    const habits = this.getHabits();
    const todayStr = new Date().toISOString().split('T')[0];

    if (habits.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
          <p class="text-xs">Belum ada kebiasaan harian.</p>
          <button onclick="window.habitsModule.openModal()" class="mt-2 text-xs text-blue-400 hover:underline">
            + Tambah Kebiasaan Baru
          </button>
        </div>
      `;
      return;
    }

    let html = '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">';

    habits.forEach(h => {
      const isDoneToday = (h.completedDates || []).includes(todayStr);

      html += `
        <div class="bg-slate-800/80 rounded-2xl p-4 border ${isDoneToday ? 'border-emerald-500/50 bg-slate-800/90' : 'border-slate-700/60'} transition-all relative group">
          <div class="flex items-start justify-between gap-2 mb-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-base ${
              isDoneToday ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-400'
            }">
              <i class="fa-solid ${h.icon || 'fa-check'}"></i>
            </div>
            
            <div class="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full text-amber-400 font-mono text-xs font-bold">
              <i class="fa-solid fa-fire"></i>
              <span>${h.streak || 0} hari</span>
            </div>
          </div>

          <h5 class="text-sm font-semibold text-slate-100">${this.escapeHTML(h.name)}</h5>
          <span class="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md inline-block mt-1">${h.category}</span>

          <div class="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
            <button onclick="window.habitsModule.toggleToday('${h.id}')" 
                    class="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      isDoneToday 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                        : 'bg-slate-700/70 hover:bg-slate-700 text-slate-200'
                    }">
              <i class="fa-solid ${isDoneToday ? 'fa-circle-check' : 'fa-circle'}"></i>
              <span>${isDoneToday ? 'Sudah Selesai' : 'Tandai Selesai'}</span>
            </button>
          </div>

          <!-- Edit / Delete -->
          <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg">
            <button onclick="window.habitsModule.deleteHabit('${h.id}')" class="p-1 text-slate-400 hover:text-rose-400 text-xs">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  }

  toggleToday(habitId) {
    const data = window.storage.getData();
    const habit = (data.habits || []).find(h => h.id === habitId);
    if (!habit) return;

    if (!habit.completedDates) habit.completedDates = [];
    const todayStr = new Date().toISOString().split('T')[0];

    const idx = habit.completedDates.indexOf(todayStr);
    if (idx >= 0) {
      habit.completedDates.splice(idx, 1);
      habit.streak = Math.max(0, (habit.streak || 1) - 1);
    } else {
      habit.completedDates.push(todayStr);
      habit.streak = (habit.streak || 0) + 1;
      window.todoModule.triggerConfetti();
      window.notifications.showToast(`🔥 Streak bertambah: "${habit.name}" (${habit.streak} hari)!`, 'success');
    }

    window.storage.saveData();
    this.render();
    if (window.dashboardModule) window.dashboardModule.render();
  }

  openModal(habitId = null) {
    this.editingHabitId = habitId;
    const modal = document.getElementById('habit-modal');
    const form = document.getElementById('habit-form');
    if (!modal || !form) return;

    form.reset();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeModal() {
    const modal = document.getElementById('habit-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('habit-input-name').value.trim();
    const category = document.getElementById('habit-input-category').value;
    const icon = document.getElementById('habit-input-icon').value || 'fa-check';

    if (!name) return;

    const data = window.storage.getData();
    if (!data.habits) data.habits = [];

    const newHabit = {
      id: 'hb-' + Date.now(),
      name,
      category,
      icon,
      streak: 0,
      completedDates: []
    };

    data.habits.push(newHabit);
    window.storage.saveData();
    this.closeModal();
    this.render();
    window.notifications.showToast('Kebiasaan baru ditambahkan.', 'success');
  }

  deleteHabit(habitId) {
    if (!confirm('Hapus kebiasaan ini?')) return;
    const data = window.storage.getData();
    if (data.habits) {
      data.habits = data.habits.filter(h => h.id !== habitId);
      window.storage.saveData();
      this.render();
      window.notifications.showToast('Kebiasaan dihapus.', 'info');
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
window.habitsModule = new HabitsModule();
