/**
 * Todo List Module - CRUD, Subtasks, Priority, Filters, Drag & Drop Reorder, Confetti
 */

class TodoModule {
  constructor() {
    this.currentFilterCategory = 'all';
    this.currentFilterPriority = 'all';
    this.currentFilterStatus = 'all';
    this.searchQuery = '';
    this.editingTodoId = null;
    this.tempSubtasks = [];
    this.draggedItemIndex = null;
  }

  init() {
    this.render();
    this.bindEvents();
  }

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('todo-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderList();
      });
    }

    // Category filter chips
    const catFilters = document.querySelectorAll('.todo-cat-filter');
    catFilters.forEach(btn => {
      btn.addEventListener('click', () => {
        catFilters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilterCategory = btn.dataset.category;
        this.renderList();
      });
    });

    // Priority filter dropdown
    const prioritySelect = document.getElementById('todo-priority-filter');
    if (prioritySelect) {
      prioritySelect.addEventListener('change', (e) => {
        this.currentFilterPriority = e.target.value;
        this.renderList();
      });
    }

    // Status filter tabs
    const statusTabs = document.querySelectorAll('.todo-status-tab');
    statusTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        statusTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilterStatus = tab.dataset.status;
        this.renderList();
      });
    });
  }

  getTodos() {
    const data = window.storage.getData();
    return data.todos || [];
  }

  render() {
    this.renderSummaryChips();
    this.renderList();
  }

  renderSummaryChips() {
    const todos = this.getTodos();
    const todayStr = new Date().toISOString().split('T')[0];

    const totalCount = todos.length;
    const pendingCount = todos.filter(t => !t.completed).length;
    const completedCount = todos.filter(t => t.completed).length;
    const todayDueCount = todos.filter(t => !t.completed && t.dueDate === todayStr).length;

    const elTotal = document.getElementById('todo-stat-total');
    const elPending = document.getElementById('todo-stat-pending');
    const elCompleted = document.getElementById('todo-stat-completed');
    const elToday = document.getElementById('todo-stat-today');

    if (elTotal) elTotal.textContent = totalCount;
    if (elPending) elPending.textContent = pendingCount;
    if (elCompleted) elCompleted.textContent = completedCount;
    if (elToday) elToday.textContent = todayDueCount;
  }

  getFilteredTodos() {
    let list = [...this.getTodos()];
    const todayStr = new Date().toISOString().split('T')[0];

    // Status filter
    if (this.currentFilterStatus === 'active') {
      list = list.filter(t => !t.completed);
    } else if (this.currentFilterStatus === 'completed') {
      list = list.filter(t => t.completed);
    } else if (this.currentFilterStatus === 'today') {
      list = list.filter(t => t.dueDate === todayStr);
    } else if (this.currentFilterStatus === 'overdue') {
      list = list.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr);
    }

    // Category filter
    if (this.currentFilterCategory !== 'all') {
      list = list.filter(t => t.category === this.currentFilterCategory);
    }

    // Priority filter
    if (this.currentFilterPriority !== 'all') {
      list = list.filter(t => t.priority.toLowerCase() === this.currentFilterPriority.toLowerCase());
    }

    // Search
    if (this.searchQuery) {
      list = list.filter(t => {
        const titleMatch = t.title.toLowerCase().includes(this.searchQuery);
        const descMatch = (t.description || '').toLowerCase().includes(this.searchQuery);
        const subMatch = (t.subtasks || []).some(st => st.text.toLowerCase().includes(this.searchQuery));
        return titleMatch || descMatch || subMatch;
      });
    }

    // Sort order: pinned/order first, then high priority, then overdue
    return list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (a.order || 0) - (b.order || 0);
    });
  }

  renderList() {
    const container = document.getElementById('todo-list-container');
    if (!container) return;

    const todos = this.getFilteredTodos();

    if (todos.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center p-12 text-center text-slate-400">
          <div class="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-4 text-2xl text-blue-400">
            <i class="fa-solid fa-list-check"></i>
          </div>
          <p class="text-base font-semibold text-slate-200">Tidak ada tugas ditemukan</p>
          <p class="text-xs text-slate-400 mt-1 max-w-sm">Coba sesuaikan filter atau tambahkan tugas baru untuk mulai mengorganisir harimu.</p>
        </div>
      `;
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const settings = window.storage.getData().settings || {};
    const categoryColors = settings.categoryColors || DEFAULT_CATEGORY_COLORS;

    let html = '<div class="space-y-3" id="todo-sortable-list">';

    todos.forEach((todo, idx) => {
      const isOverdue = !todo.completed && todo.dueDate && todo.dueDate < todayStr;
      const isToday = todo.dueDate === todayStr;
      const catColor = categoryColors[todo.category] || '#64748B';

      // Subtask progress
      const subtasks = todo.subtasks || [];
      const subCompleted = subtasks.filter(s => s.completed).length;
      const subTotal = subtasks.length;
      const subPercent = subTotal > 0 ? Math.round((subCompleted / subTotal) * 100) : 0;

      let priorityBadge = '';
      if (todo.priority === 'High') {
        priorityBadge = `<span class="badge badge-danger text-xs"><i class="fa-solid fa-angles-up mr-1"></i>Tinggi</span>`;
      } else if (todo.priority === 'Medium') {
        priorityBadge = `<span class="badge badge-warning text-xs"><i class="fa-solid fa-equals mr-1"></i>Sedang</span>`;
      } else {
        priorityBadge = `<span class="badge badge-info text-xs"><i class="fa-solid fa-angles-down mr-1"></i>Rendah</span>`;
      }

      let recurringBadge = '';
      if (todo.recurring && todo.recurring !== 'none') {
        const recLabel = { daily: 'Harian', weekly: 'Mingguan', monthly: 'Bulanan' }[todo.recurring] || todo.recurring;
        recurringBadge = `<span class="text-xs text-indigo-400 flex items-center gap-1"><i class="fa-solid fa-arrows-rotate"></i> ${recLabel}</span>`;
      }

      html += `
        <div class="todo-item-card ${todo.completed ? 'opacity-70 bg-slate-900/40 border-slate-800' : 'bg-slate-800/80 border-slate-700/60'} rounded-2xl p-4 border transition-all hover:border-slate-600 shadow-sm relative group"
             draggable="true" data-id="${todo.id}" data-index="${idx}">

          <div class="flex items-start gap-3.5">
            <!-- Drag Handle -->
            <div class="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 pt-1 drag-handle opacity-50 group-hover:opacity-100 transition-opacity">
              <i class="fa-solid fa-grip-vertical"></i>
            </div>

            <!-- Checkbox -->
            <button onclick="window.todoModule.toggleComplete('${todo.id}')"
                    class="mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      todo.completed
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'border-2 border-slate-600 hover:border-blue-400 text-transparent'
                    }">
              <i class="fa-solid fa-check text-xs"></i>
            </button>

            <!-- Main Info -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-md text-white shadow-sm" style="background-color: ${catColor}">
                  ${todo.category}
                </span>
                ${priorityBadge}
                ${recurringBadge}
                ${isOverdue ? '<span class="badge badge-danger text-xs animate-pulse"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Terlewat</span>' : ''}
              </div>

              <h4 class="text-base font-semibold text-slate-100 ${todo.completed ? 'line-through text-slate-400' : ''} break-words">
                ${this.escapeHTML(todo.title)}
              </h4>

              ${todo.description ? `<p class="text-xs text-slate-400 mt-1 line-clamp-2">${this.escapeHTML(todo.description)}</p>` : ''}

              <!-- Subtasks Progress -->
              ${subTotal > 0 ? `
                <div class="mt-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div class="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                    <span class="flex items-center gap-1.5"><i class="fa-solid fa-bars-progress text-blue-400"></i> Checklist (${subCompleted}/${subTotal})</span>
                    <span class="text-blue-400 font-bold">${subPercent}%</span>
                  </div>
                  <div class="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                    <div class="bg-gradient-to-r from-blue-500 to-emerald-400 h-1.5 rounded-full transition-all duration-300" style="width: ${subPercent}%"></div>
                  </div>

                  <!-- Subtasks Checklist Dropdown/List -->
                  <div class="mt-2.5 space-y-1.5 pt-1 border-t border-slate-800">
                    ${subtasks.map(st => `
                      <label class="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none hover:text-white">
                        <input type="checkbox" ${st.completed ? 'checked' : ''}
                               onchange="window.todoModule.toggleSubtask('${todo.id}', '${st.id}')"
                               class="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0 w-3.5 h-3.5">
                        <span class="${st.completed ? 'line-through text-slate-500' : ''}">${this.escapeHTML(st.text)}</span>
                      </label>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Footer Meta & Actions -->
              <div class="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2 text-xs text-slate-400 border-t border-slate-700/40">
                <div class="flex items-center gap-3">
                  ${todo.dueDate ? `
                    <span class="flex items-center gap-1.5 ${isOverdue ? 'text-rose-400 font-semibold' : isToday ? 'text-amber-400 font-semibold' : 'text-slate-400'}">
                      <i class="fa-regular fa-calendar"></i>
                      ${this.formatDateIndo(todo.dueDate)} ${todo.dueTime ? '• ' + todo.dueTime : ''}
                    </span>
                  ` : ''}
                </div>

                <div class="flex items-center gap-1">
                  <button onclick="window.todoModule.openModal('${todo.id}')"
                          class="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-700/50 transition-colors" title="Edit">
                    <i class="fa-regular fa-pen-to-square"></i>
                  </button>
                  <button onclick="window.todoModule.deleteTodo('${todo.id}')"
                          class="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700/50 transition-colors" title="Hapus">
                    <i class="fa-regular fa-trash-can"></i>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;

    this.attachDragAndDrop();
  }

  attachDragAndDrop() {
    const list = document.getElementById('todo-sortable-list');
    if (!list) return;

    const items = list.querySelectorAll('.todo-item-card');
    items.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        this.draggedItemIndex = parseInt(item.dataset.index);
        item.classList.add('opacity-40');
        e.dataTransfer.effectAllowed = 'move';
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('opacity-40');
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        const targetIndex = parseInt(item.dataset.index);
        if (this.draggedItemIndex !== null && this.draggedItemIndex !== targetIndex) {
          this.reorderTodos(this.draggedItemIndex, targetIndex);
        }
      });
    });
  }

  reorderTodos(fromIdx, toIdx) {
    const data = window.storage.getData();
    const [moved] = data.todos.splice(fromIdx, 1);
    data.todos.splice(toIdx, 0, moved);

    // Update order index
    data.todos.forEach((t, i) => {
      t.order = i + 1;
    });

    window.storage.saveData();
    this.render();
  }

  toggleComplete(todoId) {
    const data = window.storage.getData();
    const todo = data.todos.find(t => t.id === todoId);
    if (!todo) return;

    todo.completed = !todo.completed;
    todo.completedAt = todo.completed ? new Date().toISOString() : null;

    if (todo.completed) {
      this.triggerConfetti();
      window.notifications.showToast(`Selesai: "${todo.title}" 🎉`, 'success');

      // Check recurring reschedule
      if (todo.recurring && todo.recurring !== 'none') {
        this.rescheduleRecurringTodo(todo);
      }
    }

    window.storage.saveData();
    this.render();
    if (window.dashboardModule) window.dashboardModule.render();
  }

  rescheduleRecurringTodo(todo) {
    const nextDate = new Date(todo.dueDate || Date.now());
    if (todo.recurring === 'daily') {
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (todo.recurring === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (todo.recurring === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    const data = window.storage.getData();
    const newTodo = {
      ...JSON.parse(JSON.stringify(todo)),
      id: 'todo-' + Date.now(),
      dueDate: nextDate.toISOString().split('T')[0],
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      subtasks: (todo.subtasks || []).map(st => ({ ...st, completed: false }))
    };

    data.todos.unshift(newTodo);
    window.notifications.showToast(`Tugas berulang dijadwalkan berikutnya: ${newTodo.dueDate}`, 'info');
  }

  toggleSubtask(todoId, subtaskId) {
    const data = window.storage.getData();
    const todo = data.todos.find(t => t.id === todoId);
    if (!todo || !todo.subtasks) return;

    const st = todo.subtasks.find(s => s.id === subtaskId);
    if (st) {
      st.completed = !st.completed;

      // If all subtasks are complete, prompt or auto-complete todo
      const allDone = todo.subtasks.every(s => s.completed);
      if (allDone && !todo.completed) {
        this.toggleComplete(todoId);
        return;
      }

      window.storage.saveData();
      this.render();
    }
  }

  deleteTodo(todoId) {
    if (!confirm('Yakin ingin menghapus tugas ini?')) return;
    const data = window.storage.getData();
    data.todos = data.todos.filter(t => t.id !== todoId);
    window.storage.saveData();
    this.render();
    window.notifications.showToast('Tugas dihapus.', 'info');
    if (window.dashboardModule) window.dashboardModule.render();
  }

  openModal(todoId = null) {
    this.editingTodoId = todoId;
    const modal = document.getElementById('todo-modal');
    const modalTitle = document.getElementById('todo-modal-title');
    const form = document.getElementById('todo-form');
    if (!modal || !form) return;

    form.reset();
    this.tempSubtasks = [];

    if (todoId) {
      modalTitle.textContent = 'Edit Tugas';
      const todo = this.getTodos().find(t => t.id === todoId);
      if (todo) {
        document.getElementById('todo-input-title').value = todo.title;
        document.getElementById('todo-input-description').value = todo.description || '';
        document.getElementById('todo-input-category').value = todo.category;
        document.getElementById('todo-input-priority').value = todo.priority;
        document.getElementById('todo-input-duedate').value = todo.dueDate || '';
        document.getElementById('todo-input-duetime').value = todo.dueTime || '';
        document.getElementById('todo-input-recurring').value = todo.recurring || 'none';
        this.tempSubtasks = JSON.parse(JSON.stringify(todo.subtasks || []));
      }
    } else {
      modalTitle.textContent = 'Tambah Tugas Baru';
      // Default to today + 2 hours
      const now = new Date();
      document.getElementById('todo-input-duedate').value = now.toISOString().split('T')[0];
      document.getElementById('todo-input-duetime').value = '17:00';
    }

    this.renderSubtaskInputs();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeModal() {
    const modal = document.getElementById('todo-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    this.editingTodoId = null;
    this.tempSubtasks = [];
  }

  addSubtaskField(text = '') {
    this.tempSubtasks.push({
      id: 'st-' + Date.now() + '-' + Math.floor(Math.random()*1000),
      text: text,
      completed: false
    });
    this.renderSubtaskInputs();
  }

  removeSubtaskField(idx) {
    this.tempSubtasks.splice(idx, 1);
    this.renderSubtaskInputs();
  }

  renderSubtaskInputs() {
    const container = document.getElementById('todo-modal-subtasks-container');
    if (!container) return;

    container.innerHTML = this.tempSubtasks.map((st, i) => `
      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-500">${i + 1}.</span>
        <input type="text" value="${this.escapeHTML(st.text)}"
               oninput="window.todoModule.tempSubtasks[${i}].text = this.value"
               placeholder="Nama subtask / langkah pengerjaan"
               class="flex-1 bg-slate-800/80 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500">
        <button type="button" onclick="window.todoModule.removeSubtaskField(${i})" class="text-rose-400 hover:text-rose-300 p-1.5">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join('');
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('todo-input-title').value.trim();
    if (!title) {
      window.notifications.showToast('Judul tugas wajib diisi!', 'warning');
      return;
    }

    const description = document.getElementById('todo-input-description').value.trim();
    const category = document.getElementById('todo-input-category').value;
    const priority = document.getElementById('todo-input-priority').value;
    const dueDate = document.getElementById('todo-input-duedate').value;
    const dueTime = document.getElementById('todo-input-duetime').value;
    const recurring = document.getElementById('todo-input-recurring').value;

    const filteredSubtasks = this.tempSubtasks.filter(st => st.text.trim().length > 0);

    const data = window.storage.getData();

    if (this.editingTodoId) {
      const todo = data.todos.find(t => t.id === this.editingTodoId);
      if (todo) {
        todo.title = title;
        todo.description = description;
        todo.category = category;
        todo.priority = priority;
        todo.dueDate = dueDate;
        todo.dueTime = dueTime;
        todo.recurring = recurring;
        todo.subtasks = filteredSubtasks;
      }
      window.notifications.showToast('Tugas berhasil diperbarui.', 'success');
    } else {
      const newTodo = {
        id: 'todo-' + Date.now(),
        title,
        description,
        category,
        priority,
        dueDate,
        dueTime,
        recurring,
        subtasks: filteredSubtasks,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
        order: (data.todos.length > 0 ? Math.min(...data.todos.map(t => t.order || 0)) - 1 : 1)
      };
      data.todos.unshift(newTodo);
      window.notifications.showToast('Tugas baru berhasil ditambahkan.', 'success');
    }

    window.storage.saveData();
    this.closeModal();
    this.render();
    if (window.dashboardModule) window.dashboardModule.render();
  }

  triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  formatDateIndo(dateStr) {
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

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g,
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}

// Global instance
window.todoModule = new TodoModule();
