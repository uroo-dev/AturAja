/**
 * Todo List Module - CRUD, Subtasks, Priority, Recurring Tasks, Drag & Drop, Undo Delete & Confetti
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
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    const searchInput = document.getElementById('todo-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderList();
      });
    }

    const catFilters = document.querySelectorAll('.todo-cat-filter');
    catFilters.forEach(btn => {
      btn.addEventListener('click', () => {
        catFilters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilterCategory = btn.dataset.category;
        this.renderList();
      });
    });

    const prioritySelect = document.getElementById('todo-priority-filter');
    if (prioritySelect) {
      prioritySelect.addEventListener('change', (e) => {
        this.currentFilterPriority = e.target.value;
        this.renderList();
      });
    }

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
    return window.state.getState().todos || [];
  }

  render() {
    this.renderSummaryChips();
    this.renderList();
  }

  renderSummaryChips() {
    const todos = this.getTodos();
    const todayStr = new Date().toISOString().split('T')[0];

    const totalCount = todos.length;
    const pendingCount = todos.filter(t => t.status !== 'completed').length;
    const completedCount = todos.filter(t => t.status === 'completed').length;
    const todayDueCount = todos.filter(t => t.status !== 'completed' && t.dueDate && t.dueDate.startsWith(todayStr)).length;

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

    if (this.currentFilterStatus === 'active') {
      list = list.filter(t => t.status !== 'completed');
    } else if (this.currentFilterStatus === 'completed') {
      list = list.filter(t => t.status === 'completed');
    } else if (this.currentFilterStatus === 'today') {
      list = list.filter(t => t.dueDate && t.dueDate.startsWith(todayStr));
    } else if (this.currentFilterStatus === 'overdue') {
      list = list.filter(t => t.status !== 'completed' && t.dueDate && t.dueDate.split('T')[0] < todayStr);
    }

    if (this.currentFilterCategory !== 'all') {
      list = list.filter(t => t.category === this.currentFilterCategory);
    }

    if (this.currentFilterPriority !== 'all') {
      list = list.filter(t => (t.priority || '').toLowerCase() === this.currentFilterPriority.toLowerCase());
    }

    if (this.searchQuery) {
      list = list.filter(t => {
        const titleMatch = (t.title || '').toLowerCase().includes(this.searchQuery);
        const descMatch = (t.description || '').toLowerCase().includes(this.searchQuery);
        const subMatch = (t.subtasks || []).some(st => (st.title || st.text || '').toLowerCase().includes(this.searchQuery));
        return titleMatch || descMatch || subMatch;
      });
    }

    return list.sort((a, b) => {
      if ((a.status === 'completed') !== (b.status === 'completed')) {
        return a.status === 'completed' ? 1 : -1;
      }
      return 0;
    });
  }

  renderList() {
    const container = document.getElementById('todo-list-container');
    if (!container) return;

    const todos = this.getFilteredTodos();
    const todayStr = new Date().toISOString().split('T')[0];

    if (todos.length === 0) {
      container.innerHTML = `
        <div class="card text-center p-8 text-muted">
          <div class="w-12 h-12 rounded-2xl bg-tertiary flex items-center justify-center mx-auto mb-3 text-xl text-primary">
            <i class="fa-solid fa-list-check"></i>
          </div>
          <h4 class="text-sm font-semibold text-primary-text">Tidak ada tugas ditemukan</h4>
          <p class="text-xs text-muted mt-1">Coba sesuaikan filter atau tambahkan tugas baru.</p>
        </div>
      `;
      return;
    }

    const state = window.state.getState();
    const catColors = state.settings?.categoryColors || {};

    let html = '<div class="space-y-3" id="todo-sortable-list">';

    todos.forEach((todo, idx) => {
      const isCompleted = todo.status === 'completed';
      const isOverdue = !isCompleted && todo.dueDate && todo.dueDate.split('T')[0] < todayStr;
      const isToday = todo.dueDate && todo.dueDate.split('T')[0] === todayStr;
      const catColor = catColors[todo.category] || '#64748B';

      const subtasks = todo.subtasks || [];
      const subCompleted = subtasks.filter(s => s.completed).length;
      const subTotal = subtasks.length;
      const subPercent = subTotal > 0 ? Math.round((subCompleted / subTotal) * 100) : 0;

      let priorityBadge = '';
      if (todo.priority === 'high') {
        priorityBadge = `<span class="badge badge-danger"><i class="fa-solid fa-angles-up mr-1"></i>Tinggi</span>`;
      } else if (todo.priority === 'medium') {
        priorityBadge = `<span class="badge badge-warning"><i class="fa-solid fa-equals mr-1"></i>Sedang</span>`;
      } else {
        priorityBadge = `<span class="badge badge-info"><i class="fa-solid fa-angles-down mr-1"></i>Rendah</span>`;
      }

      let recurringBadge = '';
      if (todo.recurring && todo.recurring.enabled && todo.recurring.frequency !== 'none') {
        recurringBadge = `<span class="text-xs text-indigo-400 font-semibold flex items-center gap-1"><i class="fa-solid fa-arrows-rotate"></i> ${todo.recurring.frequency}</span>`;
      }

      html += `
        <div class="card card-lift ${isCompleted ? 'opacity-70 bg-opacity-40' : ''} p-4 transition-all relative group"
             draggable="true" data-id="${todo.id}" data-index="${idx}">
          
          <div class="flex items-start gap-3.5">
            <!-- Drag Handle -->
            <div class="cursor-grab active:cursor-grabbing text-muted pt-1 opacity-50 group-hover:opacity-100">
              <i class="fa-solid fa-grip-vertical"></i>
            </div>

            <!-- Complete Checkbox -->
            <button onclick="window.todoModule.toggleComplete('${todo.id}')" 
                    class="mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      isCompleted 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                        : 'border-2 border-slate-600 hover:border-indigo-400 text-transparent'
                    }">
              <i class="fa-solid fa-check text-xs"></i>
            </button>

            <!-- Content Area -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <span class="text-xs font-bold px-2.5 py-0.5 rounded text-white shadow-sm" style="background-color: ${catColor}">
                  ${todo.category}
                </span>
                ${priorityBadge}
                ${recurringBadge}
                ${isOverdue ? '<span class="badge badge-danger animate-pulse"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Terlewat</span>' : ''}
              </div>

              <h4 class="text-sm font-semibold text-slate-100 ${isCompleted ? 'line-through text-slate-400' : ''} break-words">
                ${Utils.escapeHTML(todo.title)}
              </h4>

              ${todo.description ? `<p class="text-xs text-slate-400 mt-1 line-clamp-2">${Utils.escapeHTML(todo.description)}</p>` : ''}

              <!-- Subtasks Progress Bar & Checklist -->
              ${subTotal > 0 ? `
                <div class="mt-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div class="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                    <span class="flex items-center gap-1.5"><i class="fa-solid fa-bars-progress text-indigo-400"></i> Checklist (${subCompleted}/${subTotal})</span>
                    <span class="text-indigo-400 font-bold">${subPercent}%</span>
                  </div>
                  <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div class="bg-gradient-to-r from-indigo-500 to-emerald-400 h-1.5 rounded-full transition-all duration-300" style="width: ${subPercent}%"></div>
                  </div>
                  
                  <div class="mt-2.5 space-y-1.5 pt-1.5 border-t border-slate-800">
                    ${subtasks.map(st => `
                      <label class="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none hover:text-white">
                        <input type="checkbox" ${st.completed ? 'checked' : ''} 
                               onchange="window.todoModule.toggleSubtask('${todo.id}', '${st.id}')"
                               class="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-0 w-3.5 h-3.5">
                        <span class="${st.completed ? 'line-through text-slate-500' : ''}">${Utils.escapeHTML(st.title || st.text)}</span>
                      </label>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Footer Meta & Actions -->
              <div class="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2 text-xs text-slate-400 border-t border-slate-700/40">
                <div class="flex items-center gap-3">
                  ${todo.dueDate ? `
                    <span class="flex items-center gap-1.5 ${isOverdue ? 'text-rose-400 font-bold' : isToday ? 'text-amber-400 font-semibold' : 'text-slate-400'}">
                      <i class="fa-regular fa-calendar"></i>
                      ${Utils.formatDateIndo(todo.dueDate.split('T')[0])} ${todo.dueDate.includes('T') ? '• ' + todo.dueDate.split('T')[1].substring(0, 5) : ''}
                    </span>
                  ` : ''}
                </div>

                <div class="flex items-center gap-1">
                  <button onclick="window.todoModule.openModal('${todo.id}')" class="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-700/50" title="Edit">
                    <i class="fa-regular fa-pen-to-square"></i>
                  </button>
                  <button onclick="window.todoModule.deleteTodo('${todo.id}')" class="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700/50" title="Hapus">
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

    const items = list.querySelectorAll('.card');
    items.forEach(item => {
      item.addEventListener('dragstart', () => {
        this.draggedItemIndex = parseInt(item.dataset.index);
        item.classList.add('opacity-40');
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('opacity-40');
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
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
    const state = window.state.getState();
    const [moved] = state.todos.splice(fromIdx, 1);
    state.todos.splice(toIdx, 0, moved);
    window.state.saveState();
    this.render();
  }

  toggleComplete(todoId) {
    const state = window.state.getState();
    const todo = state.todos.find(t => t.id === todoId);
    if (!todo) return;

    const willComplete = todo.status !== 'completed';
    todo.status = willComplete ? 'completed' : 'pending';
    todo.completedAt = willComplete ? new Date().toISOString() : null;

    if (willComplete) {
      Utils.triggerConfetti();
      Utils.showToast(`Selesai: "${todo.title}" 🎉`, { type: 'success' });

      // Handle Recurring Reschedule
      if (todo.recurring && todo.recurring.enabled && todo.recurring.frequency !== 'none') {
        this.rescheduleRecurringTodo(todo);
      }
    }

    window.state.saveState();
    this.render();
    if (window.dashboardModule) window.dashboardModule.render();
  }

  rescheduleRecurringTodo(todo) {
    const nextDate = new Date(todo.dueDate || Date.now());
    if (todo.recurring.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
    else if (todo.recurring.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (todo.recurring.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);

    const state = window.state.getState();
    const newTodo = {
      ...JSON.parse(JSON.stringify(todo)),
      id: Utils.generateId('todo'),
      dueDate: nextDate.toISOString().split('T')[0] + 'T' + (todo.dueDate ? todo.dueDate.split('T')[1] : '17:00:00'),
      status: 'pending',
      completedAt: null,
      createdAt: new Date().toISOString(),
      subtasks: (todo.subtasks || []).map(st => ({ ...st, completed: false }))
    };

    state.todos.unshift(newTodo);
    Utils.showToast(`Tugas berulang dijadwalkan berikutnya: ${newTodo.dueDate.split('T')[0]}`, { type: 'info' });
  }

  toggleSubtask(todoId, subtaskId) {
    const state = window.state.getState();
    const todo = state.todos.find(t => t.id === todoId);
    if (!todo || !todo.subtasks) return;

    const st = todo.subtasks.find(s => s.id === subtaskId);
    if (st) {
      st.completed = !st.completed;
      if (todo.subtasks.every(s => s.completed) && todo.status !== 'completed') {
        this.toggleComplete(todoId);
        return;
      }
      window.state.saveState();
      this.render();
    }
  }

  deleteTodo(todoId) {
    const state = window.state.getState();
    const idx = state.todos.findIndex(t => t.id === todoId);
    if (idx === -1) return;

    const [deleted] = state.todos.splice(idx, 1);
    window.state.saveState();
    this.render();
    if (window.dashboardModule) window.dashboardModule.render();

    // 5-Second Undo Toast
    window.state.pushUndo('Hapus Tugas', () => {
      state.todos.splice(idx, 0, deleted);
      this.render();
    });

    Utils.showToast(`Tugas "${deleted.title}" dihapus.`, {
      type: 'warning',
      duration: 5000,
      action: {
        text: 'Urungkan (Undo)',
        onClick: () => {
          window.state.undo();
          Utils.showToast('Penghapusan tugas dibatalkan.', { type: 'success' });
        }
      }
    });
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
        document.getElementById('todo-input-title').value = todo.title || '';
        document.getElementById('todo-input-description').value = todo.description || '';
        document.getElementById('todo-input-category').value = todo.category || 'TKA';
        document.getElementById('todo-input-priority').value = todo.priority || 'high';
        
        if (todo.dueDate) {
          const parts = todo.dueDate.split('T');
          document.getElementById('todo-input-duedate').value = parts[0] || '';
          document.getElementById('todo-input-duetime').value = parts[1] ? parts[1].substring(0, 5) : '17:00';
        }

        document.getElementById('todo-input-recurring').value = (todo.recurring && todo.recurring.enabled) ? todo.recurring.frequency : 'none';
        this.tempSubtasks = JSON.parse(JSON.stringify(todo.subtasks || []));
      }
    } else {
      modalTitle.textContent = 'Tambah Tugas Baru';
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

  addSubtaskField(title = '') {
    this.tempSubtasks.push({
      id: Utils.generateId('sub'),
      title: title,
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
        <span class="text-xs text-slate-500 font-mono">${i + 1}.</span>
        <input type="text" value="${Utils.escapeHTML(st.title || st.text)}" 
               oninput="window.todoModule.tempSubtasks[${i}].title = this.value"
               placeholder="Langkah pengerjaan subtask..."
               class="input flex-1 py-1.5 text-xs">
        <button type="button" onclick="window.todoModule.removeSubtaskField(${i})" class="btn-icon text-rose-400 p-1 w-7 h-7">
          <i class="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>
    `).join('');
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('todo-input-title').value.trim();
    if (!title) {
      Utils.showToast('Judul tugas wajib diisi!', { type: 'danger' });
      return;
    }

    const description = document.getElementById('todo-input-description').value.trim();
    const category = document.getElementById('todo-input-category').value;
    const priority = document.getElementById('todo-input-priority').value;
    const dueDate = document.getElementById('todo-input-duedate').value;
    const dueTime = document.getElementById('todo-input-duetime').value;
    const recurringFreq = document.getElementById('todo-input-recurring').value;

    const fullDueDate = dueDate ? `${dueDate}T${dueTime || '17:00'}:00` : null;
    const validSubtasks = this.tempSubtasks.filter(s => (s.title || s.text || '').trim().length > 0).map(s => ({
      id: s.id || Utils.generateId('sub'),
      title: (s.title || s.text).trim(),
      completed: !!s.completed
    }));

    const state = window.state.getState();

    if (this.editingTodoId) {
      const todo = state.todos.find(t => t.id === this.editingTodoId);
      if (todo) {
        todo.title = title;
        todo.description = description;
        todo.category = category;
        todo.priority = priority;
        todo.dueDate = fullDueDate;
        todo.recurring = {
          enabled: recurringFreq !== 'none',
          frequency: recurringFreq,
          endDate: null
        };
        todo.subtasks = validSubtasks;
      }
      Utils.showToast('Tugas berhasil diperbarui.', { type: 'success' });
    } else {
      const newTodo = {
        id: Utils.generateId('todo'),
        title,
        description,
        category,
        priority,
        status: 'pending',
        dueDate: fullDueDate,
        createdAt: new Date().toISOString(),
        completedAt: null,
        recurring: {
          enabled: recurringFreq !== 'none',
          frequency: recurringFreq,
          endDate: null
        },
        subtasks: validSubtasks,
        tags: [category.toLowerCase()],
        estimatedMinutes: 60,
        actualMinutes: null,
        notificationsSent: false
      };
      state.todos.unshift(newTodo);
      Utils.showToast('Tugas baru berhasil ditambahkan.', { type: 'success' });
    }

    window.state.saveState();
    this.closeModal();
    this.render();
    if (window.dashboardModule) window.dashboardModule.render();
  }
}

window.todoModule = new TodoModule();
