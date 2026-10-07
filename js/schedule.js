/**
 * Time Blocking Scheduler Module - Visual Timeline (04:00 - 23:00), Ready-to-Use Daily Templates, iCal Sync (.ics) & Conflict Detection
 */

class ScheduleModule {
  constructor() {
    this.currentDate = new Date().toISOString().split('T')[0];
    this.viewMode = 'daily';
    this.editingBlockId = null;
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    const datePicker = document.getElementById('schedule-date-picker');
    if (datePicker) {
      datePicker.value = this.currentDate;
      datePicker.addEventListener('change', (e) => {
        this.currentDate = e.target.value;
        this.render();
      });
    }

    const prevDayBtn = document.getElementById('schedule-prev-day');
    if (prevDayBtn) prevDayBtn.addEventListener('click', () => this.shiftDay(-1));

    const nextDayBtn = document.getElementById('schedule-next-day');
    if (nextDayBtn) nextDayBtn.addEventListener('click', () => this.shiftDay(1));

    const todayBtn = document.getElementById('schedule-today-btn');
    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        this.currentDate = new Date().toISOString().split('T')[0];
        if (datePicker) datePicker.value = this.currentDate;
        this.render();
      });
    }

    const viewDailyBtn = document.getElementById('schedule-view-daily');
    const viewWeeklyBtn = document.getElementById('schedule-view-weekly');
    if (viewDailyBtn && viewWeeklyBtn) {
      viewDailyBtn.addEventListener('click', () => {
        this.viewMode = 'daily';
        viewDailyBtn.classList.add('active');
        viewWeeklyBtn.classList.remove('active');
        this.render();
      });
      viewWeeklyBtn.addEventListener('click', () => {
        this.viewMode = 'weekly';
        viewWeeklyBtn.classList.add('active');
        viewDailyBtn.classList.remove('active');
        this.render();
      });
    }
  }

  shiftDay(offset) {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() + offset);
    this.currentDate = d.toISOString().split('T')[0];
    const datePicker = document.getElementById('schedule-date-picker');
    if (datePicker) datePicker.value = this.currentDate;
    this.render();
  }

  getDaySchedule(dateStr) {
    const state = window.state.getState();
    if (!state.schedule) state.schedule = {};
    return state.schedule[dateStr] || [];
  }

  detectConflicts(blocks) {
    const conflictIds = new Set();
    const sorted = [...blocks].sort((a, b) => this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime));

    for (let i = 0; i < sorted.length; i++) {
      const b1 = sorted[i];
      const start1 = this.timeToMinutes(b1.startTime);
      const end1 = this.timeToMinutes(b1.endTime);

      for (let j = i + 1; j < sorted.length; j++) {
        const b2 = sorted[j];
        const start2 = this.timeToMinutes(b2.startTime);
        const end2 = this.timeToMinutes(b2.endTime);

        if (start2 < end1) {
          conflictIds.add(b1.id);
          conflictIds.add(b2.id);
        } else {
          break;
        }
      }
    }
    return conflictIds;
  }

  timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  render() {
    const titleEl = document.getElementById('schedule-current-date-title');
    if (titleEl) {
      const d = new Date(this.currentDate);
      titleEl.textContent = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    if (this.viewMode === 'daily') {
      this.renderDailyTimeline();
    } else {
      this.renderWeeklyView();
    }
  }

  renderDailyTimeline() {
    const container = document.getElementById('schedule-content-container');
    if (!container) return;

    const blocks = this.getDaySchedule(this.currentDate);
    const conflicts = this.detectConflicts(blocks);

    const now = new Date();
    const isToday = this.currentDate === now.toISOString().split('T')[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const startHour = 4;
    const endHour = 23;
    const totalMinutes = (endHour - startHour) * 60;

    let timelineHtml = `
      <div class="clay-card relative p-4 md:p-6">
        
        <!-- Action Toolbar for Calendar Sync & Templates -->
        <div class="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-700/50">
          <div class="flex items-center gap-2">
            <button onclick="window.scheduleModule.openTemplateModal()" class="btn btn-sm btn-primary">
              <i class="fa-solid fa-wand-magic-sparkles text-amber-300"></i> Pilih Template Harian Siap Pakai
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="window.scheduleModule.exportDayToCalendar()" class="btn btn-sm btn-secondary" title="Unduh Kalender .ics untuk dihubungkan ke Google/Apple Calendar">
              <i class="fa-solid fa-calendar-arrow-down text-indigo-400"></i> Hubungkan ke Kalender (.ics)
            </button>
            <button onclick="window.scheduleModule.openModal()" class="btn btn-sm btn-primary">
              <i class="fa-solid fa-plus"></i> Tambah Blok
            </button>
          </div>
        </div>

        ${conflicts.size > 0 ? `
          <div class="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2 text-amber-400 text-xs font-semibold">
            <i class="fa-solid fa-triangle-exclamation text-base"></i>
            <span>Peringatan Tabrakan Jadwal: Ditemukan ${conflicts.size} blok aktivitas yang bertabrakan waktunya.</span>
          </div>
        ` : ''}

        <!-- Hourly Timeline Canvas (04:00 - 23:00) -->
        <div class="relative min-h-[960px] border-l-2 border-slate-700/60 ml-12 sm:ml-16">
    `;

    for (let h = startHour; h <= endHour; h++) {
      const topPercent = ((h - startHour) * 60 / totalMinutes) * 100;
      const hourStr = String(h).padStart(2, '0') + ':00';
      timelineHtml += `
        <div class="absolute w-full flex items-center pointer-events-none" style="top: ${topPercent}%;">
          <span class="absolute -left-14 sm:-left-16 text-xs font-mono font-bold text-slate-400">${hourStr}</span>
          <div class="w-full border-b border-slate-700/40"></div>
        </div>
      `;
    }

    if (isToday && currentMinutes >= startHour * 60 && currentMinutes <= endHour * 60) {
      const currentPercent = ((currentMinutes - startHour * 60) / totalMinutes) * 100;
      timelineHtml += `
        <div class="absolute w-full flex items-center z-20 pointer-events-none" style="top: ${currentPercent}%;">
          <div class="w-3.5 h-3.5 rounded-full bg-rose-500 -ml-1.5 shadow-lg shadow-rose-500/50"></div>
          <div class="w-full border-b-2 border-rose-500"></div>
          <span class="text-[10px] font-mono font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full ml-2 shadow">SEKARANG</span>
        </div>
      `;
    }

    const state = window.state.getState();
    const catColors = state.settings?.categoryColors || {};

    blocks.forEach((block) => {
      const bStart = Math.max(startHour * 60, this.timeToMinutes(block.startTime));
      const bEnd = Math.min(endHour * 60, this.timeToMinutes(block.endTime));
      if (bEnd <= bStart) return;

      const topPercent = ((bStart - startHour * 60) / totalMinutes) * 100;
      const heightPercent = ((bEnd - bStart) / totalMinutes) * 100;
      const isConflict = conflicts.has(block.id);
      const isCurrentActive = isToday && currentMinutes >= bStart && currentMinutes <= bEnd;
      const blockColor = block.color || catColors[block.category] || '#2589FE';

      const gCalUrl = Utils.getGoogleCalendarUrl({ ...block, date: this.currentDate });

      timelineHtml += `
        <div class="absolute left-2 right-2 rounded-2xl p-3 shadow-md border transition-all cursor-pointer group hover:z-30 ${
          isCurrentActive ? 'ring-2 ring-indigo-400 shadow-lg' : ''
        } ${isConflict ? 'border-amber-400' : 'border-slate-700/50'}"
             style="top: ${topPercent}%; height: max(50px, ${heightPercent}%); background-color: ${blockColor}25; border-left: 5px solid ${blockColor};"
             onclick="window.scheduleModule.openModal('${block.id}')">
          
          <div class="flex items-start justify-between gap-2 overflow-hidden h-full">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs font-bold text-slate-100">${block.startTime} - ${block.endTime}</span>
                <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded text-white" style="background-color: ${blockColor}">
                  ${block.category}
                </span>
                ${isConflict ? '<span class="text-amber-400 text-xs" title="Tabrakan jadwal!"><i class="fa-solid fa-triangle-exclamation"></i></span>' : ''}
              </div>
              <h5 class="text-sm font-bold text-slate-100 truncate mt-0.5">${Utils.escapeHTML(block.activity)}</h5>
              ${block.notes ? `<p class="text-xs text-slate-300 truncate mt-0.5">${Utils.escapeHTML(block.notes)}</p>` : ''}
            </div>

            <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5" onclick="event.stopPropagation()">
              <a href="${gCalUrl}" target="_blank" rel="noopener" class="text-indigo-300 hover:text-white p-1 rounded hover:bg-slate-800 text-xs" title="Buka di Google Calendar">
                <i class="fa-solid fa-calendar-plus"></i>
              </a>
              <button type="button" onclick="window.scheduleModule.deleteBlock('${block.id}')" class="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-slate-800 text-xs" title="Hapus">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>

        </div>
      `;
    });

    timelineHtml += `
        </div>
      </div>
    `;

    container.innerHTML = timelineHtml;
  }

  renderWeeklyView() {
    const container = document.getElementById('schedule-content-container');
    if (!container) return;

    const current = new Date(this.currentDate);
    const dayOfWeek = current.getDay();
    const distanceToMon = (dayOfWeek + 6) % 7;
    const monday = new Date(current);
    monday.setDate(current.getDate() - distanceToMon);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }

    const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const state = window.state.getState();
    const catColors = state.settings?.categoryColors || {};

    let html = `
      <div class="clay-card p-4 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-700/50">
          <span class="text-xs font-bold text-slate-300">Tinjauan Jadwal Mingguan</span>
          <button onclick="window.scheduleModule.exportWeekToCalendar()" class="btn btn-sm btn-secondary text-xs">
            <i class="fa-solid fa-calendar-arrow-down text-indigo-400"></i> Ekspor Kalender Seminggu (.ics)
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-7 gap-3">
    `;

    days.forEach((dayStr, idx) => {
      const blocks = this.getDaySchedule(dayStr);
      const isSelected = dayStr === this.currentDate;
      const isToday = dayStr === new Date().toISOString().split('T')[0];
      const d = new Date(dayStr);

      html += `
        <div class="bg-slate-900/60 rounded-2xl p-3 border ${isSelected ? 'border-indigo-500' : 'border-slate-800'} flex flex-col min-h-[300px]">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div>
              <span class="text-xs font-bold ${isToday ? 'text-indigo-400' : 'text-slate-400'}">${dayNames[idx]}</span>
              <h5 class="text-sm font-semibold text-slate-100">${d.getDate()}</h5>
            </div>
            <button onclick="window.scheduleModule.selectDay('${dayStr}')" class="btn btn-sm btn-secondary py-0.5 px-2 text-[10px]">
              Lihat
            </button>
          </div>

          <div class="space-y-1.5 flex-1 overflow-y-auto max-h-[380px]">
            ${blocks.length === 0 ? '<p class="text-[11px] text-slate-500 italic py-4 text-center">Kosong</p>' : ''}
            ${blocks.map(b => {
              const col = b.color || catColors[b.category] || '#2589FE';
              return `
                <div class="p-2 rounded-xl text-xs border border-slate-800 cursor-pointer hover:border-slate-600"
                     style="background-color: ${col}20; border-left: 3px solid ${col};"
                     onclick="window.scheduleModule.selectDay('${dayStr}'); window.scheduleModule.openModal('${b.id}')">
                  <div class="font-mono text-[10px] text-slate-400 font-semibold">${b.startTime} - ${b.endTime}</div>
                  <div class="font-medium text-slate-200 truncate mt-0.5">${Utils.escapeHTML(b.activity)}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
    container.innerHTML = html;
  }

  selectDay(dayStr) {
    this.currentDate = dayStr;
    this.viewMode = 'daily';
    const datePicker = document.getElementById('schedule-date-picker');
    if (datePicker) datePicker.value = dayStr;
    const viewDailyBtn = document.getElementById('schedule-view-daily');
    const viewWeeklyBtn = document.getElementById('schedule-view-weekly');
    if (viewDailyBtn) viewDailyBtn.classList.add('active');
    if (viewWeeklyBtn) viewWeeklyBtn.classList.remove('active');
    this.render();
  }

  // --- READY-TO-USE DAILY TEMPLATES ---

  openTemplateModal() {
    const modal = document.getElementById('template-picker-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  closeTemplateModal() {
    const modal = document.getElementById('template-picker-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  applyDailyTemplate(templateKey) {
    const state = window.state.getState();
    const templates = state.schedule?.templates || {
      weekday: [
        { startTime: '05:00', endTime: '06:30', activity: 'Belajar Pagi: Review Rumus & Soal TKA', category: 'TKA', notes: 'Fokus materi subtes Saintek/Soshum' },
        { startTime: '07:00', endTime: '15:00', activity: 'KBM Sekolah SMA Kelas 12', category: 'School', notes: 'KBM aktif di sekolah' },
        { startTime: '16:00', endTime: '18:00', activity: 'Deep Work: Coding Project Sprint', category: 'Coding', notes: 'Slicing UI & integrasi API' },
        { startTime: '19:30', endTime: '21:30', activity: 'Drill Soal TKA & Try Out Online', category: 'TKA', notes: 'Target min. 25 butir soal' },
        { startTime: '21:30', endTime: '22:30', activity: 'Night Journaling & Wind Down', category: 'Personal', notes: 'Istirahat teratur' }
      ],
      tka_focus: [
        { startTime: '05:00', endTime: '07:00', activity: 'Drill Soal TKA Matematika & Fisika', category: 'TKA', notes: 'Paket UTBK Saintek' },
        { startTime: '08:30', endTime: '11:30', activity: 'Simulasi Try Out Mandiri 150 Menit', category: 'TKA', notes: 'Simulasi tanpa melihat catatan' },
        { startTime: '13:30', endTime: '16:00', activity: 'Bedah Pembahasan Soal yang Salah', category: 'TKA', notes: 'Analisis kelemahan konsep' },
        { startTime: '16:30', endTime: '18:00', activity: 'Olahraga Sore & Refreshing', category: 'Personal', notes: 'Jogging 30 menit' },
        { startTime: '19:30', endTime: '21:30', activity: 'Review Flashcards & Ringkasan Materi', category: 'TKA', notes: 'Hafalan konsep & rumus' }
      ],
      coding_sprint: [
        { startTime: '08:00', endTime: '11:30', activity: 'Coding Sprint: Backend API & Database', category: 'Coding', notes: 'Endpoints, JWT auth & tests' },
        { startTime: '13:00', endTime: '16:30', activity: 'Coding Sprint: Frontend UI & Components', category: 'Coding', notes: 'Tailwind CSS & state management' },
        { startTime: '17:00', endTime: '18:00', activity: 'Code Review & Git Push / Deployment', category: 'Coding', notes: 'Deploy to GitHub Pages / Vercel' },
        { startTime: '19:30', endTime: '21:30', activity: 'Latihan 15 Soal TKA Singkat', category: 'TKA', notes: 'Menjaga streak belajar' }
      ],
      weekend: [
        { startTime: '06:00', endTime: '07:30', activity: 'Olahraga Pagi & Sarapan Sehat', category: 'Personal', notes: 'Kebugaran jasmani' },
        { startTime: '08:30', endTime: '12:00', activity: 'Hackathon / Portfolio Coding Milestone', category: 'Coding', notes: 'Deep focus coding sprint' },
        { startTime: '13:30', endTime: '16:30', activity: 'Simulasi Try Out Akbar Nasional', category: 'TKA', notes: 'Full simulasi SNBT' },
        { startTime: '19:00', endTime: '21:00', activity: 'Diskusi Materi Belajar & Evaluasi', category: 'TKA', notes: 'Bedah soal' }
      ]
    };

    const templateBlocks = templates[templateKey] || templates.weekday;

    if (!state.schedule) state.schedule = {};
    state.schedule[this.currentDate] = JSON.parse(JSON.stringify(templateBlocks)).map(b => ({
      ...b,
      id: Utils.generateId('sch')
    }));

    window.state.saveState();
    this.closeTemplateModal();
    this.render();
    Utils.showToast(`Template jadwal "${templateKey.toUpperCase()}" berhasil diterapkan!`, { type: 'success' });
    if (window.dashboardModule) window.dashboardModule.render();
  }

  // --- CALENDAR EXPORT / SYNC ---

  exportDayToCalendar() {
    const blocks = this.getDaySchedule(this.currentDate);
    if (blocks.length === 0) {
      Utils.showToast('Tidak ada jadwal di tanggal ini untuk diekspor.', { type: 'warning' });
      return;
    }

    const events = blocks.map(b => ({ ...b, date: this.currentDate }));
    Utils.downloadICS(events, `jadwal_${this.currentDate}.ics`);
  }

  exportWeekToCalendar() {
    const state = window.state.getState();
    const allEvents = [];
    Object.keys(state.schedule || {}).forEach(dateStr => {
      if (dateStr !== 'templates') {
        const dayBlocks = state.schedule[dateStr] || [];
        dayBlocks.forEach(b => allEvents.push({ ...b, date: dateStr }));
      }
    });

    if (allEvents.length === 0) {
      Utils.showToast('Belum ada jadwal tersimpan.', { type: 'warning' });
      return;
    }

    Utils.downloadICS(allEvents, 'semua_jadwal_studentflow.ics');
  }

  openModal(blockId = null) {
    this.editingBlockId = blockId;
    const modal = document.getElementById('schedule-modal');
    const modalTitle = document.getElementById('schedule-modal-title');
    const form = document.getElementById('schedule-form');
    if (!modal || !form) return;

    form.reset();

    if (blockId) {
      modalTitle.textContent = 'Edit Blok Waktu';
      const blocks = this.getDaySchedule(this.currentDate);
      const b = blocks.find(x => x.id === blockId);
      if (b) {
        document.getElementById('schedule-input-activity').value = b.activity;
        document.getElementById('schedule-input-category').value = b.category;
        document.getElementById('schedule-input-start').value = b.startTime;
        document.getElementById('schedule-input-end').value = b.endTime;
        document.getElementById('schedule-input-notes').value = b.notes || '';
      }
    } else {
      modalTitle.textContent = 'Tambah Blok Waktu';
      const blocks = this.getDaySchedule(this.currentDate);
      if (blocks.length > 0) {
        const lastBlock = blocks[blocks.length - 1];
        document.getElementById('schedule-input-start').value = lastBlock.endTime || '16:00';
        const [h, m] = (lastBlock.endTime || '16:00').split(':').map(Number);
        const endH = Math.min(23, h + 1);
        document.getElementById('schedule-input-end').value = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      } else {
        document.getElementById('schedule-input-start').value = '08:00';
        document.getElementById('schedule-input-end').value = '09:30';
      }
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeModal() {
    const modal = document.getElementById('schedule-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    this.editingBlockId = null;
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const activity = document.getElementById('schedule-input-activity').value.trim();
    if (!activity) {
      Utils.showToast('Nama aktivitas wajib diisi!', { type: 'danger' });
      return;
    }

    const category = document.getElementById('schedule-input-category').value;
    const startTime = document.getElementById('schedule-input-start').value;
    const endTime = document.getElementById('schedule-input-end').value;
    const notes = document.getElementById('schedule-input-notes').value.trim();

    if (this.timeToMinutes(endTime) <= this.timeToMinutes(startTime)) {
      Utils.showToast('Waktu selesai harus lebih besar dari waktu mulai!', { type: 'danger' });
      return;
    }

    const state = window.state.getState();
    if (!state.schedule) state.schedule = {};
    if (!state.schedule[this.currentDate]) state.schedule[this.currentDate] = [];

    const catColors = state.settings?.categoryColors || {};
    const color = catColors[category] || '#2589FE';

    if (this.editingBlockId) {
      const b = state.schedule[this.currentDate].find(x => x.id === this.editingBlockId);
      if (b) {
        b.activity = activity;
        b.category = category;
        b.startTime = startTime;
        b.endTime = endTime;
        b.notes = notes;
        b.color = color;
      }
      Utils.showToast('Blok waktu diperbarui.', { type: 'success' });
    } else {
      const newBlock = {
        id: Utils.generateId('sch'),
        startTime,
        endTime,
        activity,
        category,
        notes,
        color
      };
      state.schedule[this.currentDate].push(newBlock);
      state.schedule[this.currentDate].sort((a, b) => this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime));
      Utils.showToast('Blok waktu ditambahkan.', { type: 'success' });
    }

    window.state.saveState();
    this.closeModal();
    this.render();
    if (window.dashboardModule) window.dashboardModule.render();
  }

  deleteBlock(blockId) {
    if (!confirm('Hapus blok jadwal ini?')) return;
    const state = window.state.getState();
    if (state.schedule && state.schedule[this.currentDate]) {
      state.schedule[this.currentDate] = state.schedule[this.currentDate].filter(b => b.id !== blockId);
      window.state.saveState();
      this.render();
      Utils.showToast('Blok waktu dihapus.', { type: 'info' });
      if (window.dashboardModule) window.dashboardModule.render();
    }
  }

  printSchedule() {
    window.print();
  }
}

window.scheduleModule = new ScheduleModule();
