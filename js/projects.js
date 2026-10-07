/**
 * Project Tracker Module (Kanban Board) - Drag & Drop, WIP Limit Warnings, Time Logging, Templates & Archiving
 */

class ProjectsModule {
  constructor() {
    this.currentViewMode = 'active'; // 'active' or 'archived'
    this.selectedCategory = 'all';
    this.editingProjectId = null;
    this.tempLinks = [];
    this.draggedCardId = null;
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    const filterCat = document.getElementById('project-filter-category');
    if (filterCat) {
      filterCat.addEventListener('change', (e) => {
        this.selectedCategory = e.target.value;
        this.render();
      });
    }

    const viewActiveBtn = document.getElementById('project-view-active');
    const viewArchivedBtn = document.getElementById('project-view-archived');
    if (viewActiveBtn && viewArchivedBtn) {
      viewActiveBtn.addEventListener('click', () => {
        this.currentViewMode = 'active';
        viewActiveBtn.classList.add('active');
        viewArchivedBtn.classList.remove('active');
        this.render();
      });
      viewArchivedBtn.addEventListener('click', () => {
        this.currentViewMode = 'archived';
        viewArchivedBtn.classList.add('active');
        viewActiveBtn.classList.remove('active');
        this.render();
      });
    }
  }

  getProjects() {
    const data = window.storage.getData();
    return data.projects || [];
  }

  render() {
    this.checkWipLimit();
    this.renderColumns();
  }

  checkWipLimit() {
    const projects = this.getProjects().filter(p => !p.archived);
    const inProgressCount = projects.filter(p => p.status === 'inprogress').length;
    const settings = window.storage.getData().settings || {};
    const limit = settings.wipProjectLimit || 3;

    const alertBanner = document.getElementById('project-wip-alert');
    if (alertBanner) {
      if (inProgressCount > limit) {
        alertBanner.classList.remove('hidden');
        alertBanner.innerHTML = `
          <div class="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-rose-400 text-xs font-semibold mb-4">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-triangle-exclamation text-base"></i>
              <span>Peringatan WIP Limit: Kamu punya <strong>${inProgressCount} proyek In-Progress</strong> (Batas rekomendasi: ${limit}). Selesaikan proyek yang ada sebelum memulai yang baru!</span>
            </div>
          </div>
        `;
      } else {
        alertBanner.classList.add('hidden');
        alertBanner.innerHTML = '';
      }
    }
  }

  renderColumns() {
    const columns = [
      { key: 'backlog', title: 'Backlog', icon: 'fa-inbox', color: 'slate' },
      { key: 'todo', title: 'To Do', icon: 'fa-list-ul', color: 'blue' },
      { key: 'inprogress', title: 'In Progress', icon: 'fa-spinner', color: 'amber' },
      { key: 'review', title: 'Review / Testing', icon: 'fa-magnifying-glass-chart', color: 'indigo' },
      { key: 'done', title: 'Done / Completed', icon: 'fa-circle-check', color: 'emerald' }
    ];

    const isArchivedMode = this.currentViewMode === 'archived';
    let allProjects = this.getProjects().filter(p => isArchivedMode ? p.archived : !p.archived);

    if (this.selectedCategory !== 'all') {
      allProjects = allProjects.filter(p => p.category === this.selectedCategory);
    }

    const container = document.getElementById('kanban-board-container');
    if (!container) return;

    let html = `<div class="grid grid-cols-1 md:grid-cols-5 gap-4">`;

    columns.forEach(col => {
      const colCards = allProjects.filter(p => (p.status || 'backlog') === col.key);

      html += `
        <div class="kanban-column bg-slate-900/50 rounded-2xl p-3 border border-slate-800/80 flex flex-col min-h-[500px]"
             data-column="${col.key}">

          <!-- Column Header -->
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div class="flex items-center gap-2">
              <i class="fa-solid ${col.icon} text-${col.color}-400 text-sm"></i>
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300">${col.title}</h4>
            </div>
            <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              ${colCards.length}
            </span>
          </div>

          <!-- Cards List -->
          <div class="kanban-cards-area flex-1 space-y-3"
               ondragover="event.preventDefault()"
               ondrop="window.projectsModule.handleDrop(event, '${col.key}')">
            ${colCards.map(p => this.renderCard(p)).join('')}
            ${colCards.length === 0 ? `
              <div class="h-28 border-2 border-dashed border-slate-800/60 rounded-xl flex items-center justify-center text-[11px] text-slate-500 font-medium">
                Tarik kartu ke sini
              </div>
            ` : ''}
          </div>

        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;

    this.attachCardDragEvents();
  }

  renderCard(project) {
    const est = project.estimatedHours || 0;
    const logged = project.loggedHours || 0;
    const progress = est > 0 ? Math.min(100, Math.round((logged / est) * 100)) : (project.status === 'done' ? 100 : 0);

    const settings = window.storage.getData().settings || {};
    const catColors = settings.categoryColors || DEFAULT_CATEGORY_COLORS;
    const catColor = catColors[project.category] || '#3B82F6';

    const tags = project.tags || [];
    const links = project.links || [];

    let priorityBadge = '';
    if (project.priority === 'High') {
      priorityBadge = `<span class="badge badge-danger text-[10px]">High</span>`;
    } else if (project.priority === 'Medium') {
      priorityBadge = `<span class="badge badge-warning text-[10px]">Med</span>`;
    } else {
      priorityBadge = `<span class="badge badge-info text-[10px]">Low</span>`;
    }

    return `
      <div class="project-card bg-slate-800/90 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-xl p-3.5 shadow-sm transition-all cursor-grab active:cursor-grabbing group relative"
           draggable="true" data-id="${project.id}">

        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded text-white" style="background-color: ${catColor}">
            ${project.category}
          </span>
          <div class="flex items-center gap-1">
            ${priorityBadge}
            <button onclick="window.projectsModule.openModal('${project.id}')"
                    class="text-slate-400 hover:text-blue-400 p-1 rounded hover:bg-slate-700/40 text-xs">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
          </div>
        </div>

        <h5 class="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition-colors break-words">
          ${this.escapeHTML(project.title)}
        </h5>

        ${project.description ? `<p class="text-xs text-slate-400 mt-1 line-clamp-2">${this.escapeHTML(project.description)}</p>` : ''}

        <!-- Tags -->
        ${tags.length > 0 ? `
          <div class="flex flex-wrap gap-1 mt-2">
            ${tags.map(t => `<span class="text-[10px] bg-slate-900/80 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700/50">#${this.escapeHTML(t)}</span>`).join('')}
          </div>
        ` : ''}

        <!-- Links/Attachments -->
        ${links.length > 0 ? `
          <div class="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-slate-700/40">
            ${links.map(l => `
              <a href="${this.escapeHTML(l.url)}" target="_blank" rel="noopener"
                 class="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-md hover:underline">
                <i class="fa-solid fa-link text-[10px]"></i>
                <span class="max-w-[100px] truncate">${this.escapeHTML(l.title || 'Link')}</span>
              </a>
            `).join('')}
          </div>
        ` : ''}

        <!-- Time Log & Progress Bar -->
        <div class="mt-3 pt-2 border-t border-slate-700/40">
          <div class="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span class="flex items-center gap-1"><i class="fa-regular fa-clock text-blue-400"></i> ${logged} / ${est} jam</span>
            <span class="font-bold text-slate-200">${progress}%</span>
          </div>
          <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div class="bg-gradient-to-r from-blue-500 to-indigo-400 h-1.5 rounded-full transition-all" style="width: ${progress}%"></div>
          </div>
        </div>

        <!-- Quick Actions (Log Hours, Move, Archive) -->
        <div class="flex items-center justify-between gap-1 mt-3 pt-2 text-xs border-t border-slate-700/40">
          <div class="flex items-center gap-1">
            <button onclick="window.projectsModule.quickLogTime('${project.id}', 1)"
                    class="px-1.5 py-0.5 bg-slate-700 hover:bg-blue-600 text-slate-200 hover:text-white rounded text-[10px] transition-colors" title="Tambah 1 Jam Kerja">
              +1h
            </button>
            <button onclick="window.projectsModule.quickLogTime('${project.id}', 0.5)"
                    class="px-1.5 py-0.5 bg-slate-700 hover:bg-blue-600 text-slate-200 hover:text-white rounded text-[10px] transition-colors" title="Tambah 30 Menit">
              +0.5h
            </button>
          </div>

          <div class="flex items-center gap-1">
            <!-- Mobile column shift selector -->
            <select onchange="window.projectsModule.updateProjectStatus('${project.id}', this.value)"
                    class="bg-slate-900 border border-slate-700 text-[10px] text-slate-300 rounded px-1 py-0.5 md:hidden">
              <option value="backlog" ${project.status === 'backlog' ? 'selected' : ''}>Backlog</option>
              <option value="todo" ${project.status === 'todo' ? 'selected' : ''}>Todo</option>
              <option value="inprogress" ${project.status === 'inprogress' ? 'selected' : ''}>In Progress</option>
              <option value="review" ${project.status === 'review' ? 'selected' : ''}>Review</option>
              <option value="done" ${project.status === 'done' ? 'selected' : ''}>Done</option>
            </select>

            <button onclick="window.projectsModule.toggleArchive('${project.id}')"
                    class="text-slate-400 hover:text-amber-400 p-1 rounded text-xs" title="${project.archived ? 'Buka Arsip' : 'Arsipkan'}">
              <i class="fa-solid ${project.archived ? 'fa-box-open' : 'fa-box-archive'}"></i>
            </button>
            <button onclick="window.projectsModule.deleteProject('${project.id}')"
                    class="text-slate-400 hover:text-rose-400 p-1 rounded text-xs" title="Hapus">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>

      </div>
    `;
  }

  attachCardDragEvents() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        this.draggedCardId = card.dataset.id;
        card.classList.add('opacity-40');
        e.dataTransfer.setData('text/plain', card.dataset.id);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('opacity-40');
      });
    });
  }

  handleDrop(e, targetStatus) {
    e.preventDefault();
    const projectId = this.draggedCardId || e.dataTransfer.getData('text/plain');
    if (!projectId) return;

    this.updateProjectStatus(projectId, targetStatus);
    this.draggedCardId = null;
  }

  updateProjectStatus(projectId, newStatus) {
    const data = window.storage.getData();
    const project = data.projects.find(p => p.id === projectId);
    if (!project) return;

    // Check WIP limit if moving into 'inprogress'
    if (newStatus === 'inprogress' && project.status !== 'inprogress') {
      const currentActive = data.projects.filter(p => !p.archived && p.status === 'inprogress').length;
      const limit = data.settings?.wipProjectLimit || 3;
      if (currentActive >= limit) {
        window.notifications.showToast(`Peringatan: Proyek In-Progress sudah mencapai batas ${limit}!`, 'warning');
      }
    }

    project.status = newStatus;
    if (newStatus === 'done') {
      window.todoModule.triggerConfetti();
      window.notifications.showToast(`Proyek "${project.title}" selesai! 🏆`, 'success');
    }

    window.storage.saveData();
    this.render();
    if (window.dashboardModule) window.dashboardModule.render();
  }

  quickLogTime(projectId, hours) {
    const data = window.storage.getData();
    const project = data.projects.find(p => p.id === projectId);
    if (!project) return;

    project.loggedHours = Math.round(((project.loggedHours || 0) + hours) * 10) / 10;

    // Also record in pomodoro/work stats
    if (project.category === 'Coding') {
      data.pomodoro.totalCodingMinutes = (data.pomodoro.totalCodingMinutes || 0) + (hours * 60);
    } else {
      data.pomodoro.totalStudyMinutes = (data.pomodoro.totalStudyMinutes || 0) + (hours * 60);
    }

    window.storage.saveData();
    this.render();
    window.notifications.showToast(`+${hours} jam dicatat untuk "${project.title}"`, 'success');
    if (window.dashboardModule) window.dashboardModule.render();
  }

  toggleArchive(projectId) {
    const data = window.storage.getData();
    const project = data.projects.find(p => p.id === projectId);
    if (!project) return;

    project.archived = !project.archived;
    window.storage.saveData();
    this.render();
    window.notifications.showToast(project.archived ? 'Proyek diarsipkan.' : 'Proyek dikembalikan dari arsip.', 'info');
  }

  deleteProject(projectId) {
    if (!confirm('Hapus proyek ini secara permanen?')) return;
    const data = window.storage.getData();
    data.projects = data.projects.filter(p => p.id !== projectId);
    window.storage.saveData();
    this.render();
    window.notifications.showToast('Proyek dihapus.', 'info');
    if (window.dashboardModule) window.dashboardModule.render();
  }

  openModal(projectId = null) {
    this.editingProjectId = projectId;
    const modal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('project-modal-title');
    const form = document.getElementById('project-form');
    if (!modal || !form) return;

    form.reset();
    this.tempLinks = [];

    if (projectId) {
      modalTitle.textContent = 'Edit Proyek';
      const project = this.getProjects().find(p => p.id === projectId);
      if (project) {
        document.getElementById('project-input-title').value = project.title;
        document.getElementById('project-input-description').value = project.description || '';
        document.getElementById('project-input-category').value = project.category;
        document.getElementById('project-input-priority').value = project.priority;
        document.getElementById('project-input-status').value = project.status || 'backlog';
        document.getElementById('project-input-esthours').value = project.estimatedHours || 0;
        document.getElementById('project-input-loggedhours').value = project.loggedHours || 0;
        document.getElementById('project-input-tags').value = (project.tags || []).join(', ');
        document.getElementById('project-input-duedate').value = project.dueDate || '';
        this.tempLinks = JSON.parse(JSON.stringify(project.links || []));
      }
    } else {
      modalTitle.textContent = 'Buat Proyek Baru';
      const now = new Date();
      now.setDate(now.getDate() + 14);
      document.getElementById('project-input-duedate').value = now.toISOString().split('T')[0];
    }

    this.renderLinkInputs();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeModal() {
    const modal = document.getElementById('project-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    this.editingProjectId = null;
    this.tempLinks = [];
  }

  addLinkField(title = '', url = '') {
    this.tempLinks.push({ title, url });
    this.renderLinkInputs();
  }

  removeLinkField(idx) {
    this.tempLinks.splice(idx, 1);
    this.renderLinkInputs();
  }

  renderLinkInputs() {
    const container = document.getElementById('project-modal-links-container');
    if (!container) return;

    container.innerHTML = this.tempLinks.map((l, i) => `
      <div class="flex items-center gap-2">
        <input type="text" value="${this.escapeHTML(l.title)}"
               oninput="window.projectsModule.tempLinks[${i}].title = this.value"
               placeholder="Judul (e.g. GitHub)"
               class="w-1/3 bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-lg px-2.5 py-2">
        <input type="url" value="${this.escapeHTML(l.url)}"
               oninput="window.projectsModule.tempLinks[${i}].url = this.value"
               placeholder="https://..."
               class="flex-1 bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-lg px-2.5 py-2">
        <button type="button" onclick="window.projectsModule.removeLinkField(${i})" class="text-rose-400 hover:text-rose-300 p-1.5">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join('');
  }

  applyTemplate(templateType) {
    const templates = {
      webapp: {
        title: 'Fullstack Web App Project',
        description: 'Membangun aplikasi web dengan REST API, database & dashboard interaktif.',
        category: 'Coding',
        priority: 'High',
        estimatedHours: 30,
        tags: ['WebDev', 'JavaScript', 'Database', 'API']
      },
      mobileapp: {
        title: 'Mobile App Project',
        description: 'Membangun aplikasi mobile cross-platform responsive.',
        category: 'Coding',
        priority: 'Medium',
        estimatedHours: 25,
        tags: ['Mobile', 'Flutter', 'UI/UX']
      },
      tka: {
        title: 'Mastery Soal TKA Saintek / Soshum',
        description: 'Target penguasaan 500 butir soal subtes prioritas dan simulasi try out berkala.',
        category: 'TKA',
        priority: 'High',
        estimatedHours: 40,
        tags: ['TKA', 'UTBK', 'Simulasi', 'Drill']
      },
      portfolio: {
        title: 'Online Portfolio & GitHub Showcase',
        description: 'Merapikan readme repositori, dokumentasi API, dan landing page portfolio.',
        category: 'Coding',
        priority: 'Medium',
        estimatedHours: 15,
        tags: ['Portfolio', 'GitHub', 'Showcase']
      }
    };

    const t = templates[templateType];
    if (!t) return;

    document.getElementById('project-input-title').value = t.title;
    document.getElementById('project-input-description').value = t.description;
    document.getElementById('project-input-category').value = t.category;
    document.getElementById('project-input-priority').value = t.priority;
    document.getElementById('project-input-esthours').value = t.estimatedHours;
    document.getElementById('project-input-tags').value = t.tags.join(', ');
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('project-input-title').value.trim();
    if (!title) {
      window.notifications.showToast('Judul proyek wajib diisi!', 'warning');
      return;
    }

    const description = document.getElementById('project-input-description').value.trim();
    const category = document.getElementById('project-input-category').value;
    const priority = document.getElementById('project-input-priority').value;
    const status = document.getElementById('project-input-status').value;
    const estimatedHours = parseFloat(document.getElementById('project-input-esthours').value) || 0;
    const loggedHours = parseFloat(document.getElementById('project-input-loggedhours').value) || 0;
    const rawTags = document.getElementById('project-input-tags').value;
    const dueDate = document.getElementById('project-input-duedate').value;

    const tags = rawTags.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const validLinks = this.tempLinks.filter(l => l.url && l.url.trim().length > 0);

    const data = window.storage.getData();

    if (this.editingProjectId) {
      const project = data.projects.find(p => p.id === this.editingProjectId);
      if (project) {
        project.title = title;
        project.description = description;
        project.category = category;
        project.priority = priority;
        project.status = status;
        project.estimatedHours = estimatedHours;
        project.loggedHours = loggedHours;
        project.tags = tags;
        project.dueDate = dueDate;
        project.links = validLinks;
      }
      window.notifications.showToast('Proyek berhasil diperbarui.', 'success');
    } else {
      const newProject = {
        id: 'proj-' + Date.now(),
        title,
        description,
        category,
        priority,
        status,
        estimatedHours,
        loggedHours,
        tags,
        dueDate,
        links: validLinks,
        archived: false,
        createdAt: new Date().toISOString()
      };
      data.projects.unshift(newProject);
      window.notifications.showToast('Proyek baru berhasil dibuat.', 'success');
    }

    window.storage.saveData();
    this.closeModal();
    this.render();
    if (window.dashboardModule) window.dashboardModule.render();
  }

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g,
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}

// Global instance
window.projectsModule = new ProjectsModule();
