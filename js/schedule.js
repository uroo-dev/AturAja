/**
 * Time Blocking Scheduler Module - Visual Timeline (04:00 - 23:00), Templates, Conflict Detection, Weekly View & Print
 */

class ScheduleModule {
  constructor() {
    this.currentDate = new Date().toISOString().split('T')[0];
    this.viewMode = 'daily'; // 'daily' or 'weekly'
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
    if (prevDayBtn) {
      prevDayBtn.addEventListener('click', () => this.shiftDay(-1));
    }

    const nextDayBtn = document.getElementById('schedule-next-day');
    if (nextDayBtn) {
      nextDayBtn.addEventListener('click', () => this.shiftDay(1));
    }

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
    const data = window.storage.getData();
    if (!data.schedule) data.schedule = {};
    return data.schedule[dateStr] || [];
  }

  detectConflicts(blocks) {
    // Return set of block IDs that overlap with another block
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
          break; // Since sorted
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
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      titleEl.textContent = d.toLocaleDateString('id-ID', options);
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
    const totalMinutes = (endHour - startHour) * 60; // 19 hrs * 60 = 1140 min

    let timelineHtml = `
      <div class="schedule-timeline-wrapper relative bg-slate-900/60 rounded-2xl p-4 md:p-6 border border-slate-800">
        ${conflicts.size > 0 ? `
          <div class="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-amber-400 text-xs font-semibold">
            <i class="fa-solid fa-triangle-exclamation text-base"></i>
            <span>Peringatan Konflik Waktu: Ditemukan ${conflicts.size} jadwal yang bertabrakan pada hari ini.</span>
          </div>
        ` : ''}

        <!-- Hourly Grid lines (04:00 - 23:00) -->
        <div class="relative min-h-[960px] border-l-2 border-slate-700/60 ml-12 sm:ml-16">
    `;

    // Render hour lines
    for (let h = startHour; h <= endHour; h++) {
      const topPercent = ((h - startHour) * 60 / totalMinutes) * 100;
      const hourStr = String(h).padStart(2, '0') + ':00';
      timelineHtml += `
        <div class="absolute w-full flex items-center pointer-events-none" style="top: ${topPercent}%;">
          <span class="absolute -left-14 sm:-left-16 text-xs font-mono font-semibold text-slate-500">${hourStr}</span>
          <div class="w-full border-b border-slate-800/80"></div>
        </div>
      `;
    }

    // Render current time indicator if today
    if (isToday && currentMinutes >= startHour * 60 && currentMinutes <= endHour * 60) {
      const currentPercent = ((currentMinutes - startHour * 60) / totalMinutes) * 100;
      timelineHtml += `
        <div class="absolute w-full flex items-center z-20 pointer-events-none" style="top: ${currentPercent}%;">
          <div class="w-3 h-3 rounded-full bg-rose-500 -ml-1.5 shadow-lg shadow-rose-500/50"></div>
          <div class="w-full border-b-2 border-rose-500 shadow-sm"></div>
          <span class="text-[10px] font-mono font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded ml-2">SEKARANG</span>
        </div>
      `;
    }

    // Render schedule blocks
    blocks.forEach((block) => {
      const bStart = Math.max(startHour * 60, this.timeToMinutes(block.startTime));
      const bEnd = Math.min(endHour * 60, this.timeToMinutes(block.endTime));
      if (bEnd <= bStart) return;

      const topPercent = ((bStart - startHour * 60) / totalMinutes) * 100;
      const heightPercent = ((bEnd - bStart) / totalMinutes) * 100;
      const isConflict = conflicts.has(block.id);
      const isCurrentActive = isToday && currentMinutes >= bStart && currentMinutes <= bEnd;

      const settings = window.storage.getData().settings || {};
      const catColors = settings.categoryColors || DEFAULT_CATEGORY_COLORS;
      const blockColor = block.color || catColors[block.category] || '#3B82F6';

      timelineHtml += `
        <div class="absolute left-2 right-2 rounded-xl p-3 shadow-md border transition-all cursor-pointer group hover:z-30 ${
          isCurrentActive ? 'ring-2 ring-blue-400 shadow-blue-500/20' : ''
        } ${isConflict ? 'border-amber-400 ring-1 ring-amber-400/50' : 'border-slate-700/50'}"
             style="top: ${topPercent}%; height: max(48px, ${heightPercent}%); background-color: ${blockColor}25; border-left: 4px solid ${blockColor};"
             onclick="window.scheduleModule.openModal('${block.id}')">

          <div class="flex items-start justify-between gap-2 overflow-hidden h-full">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs font-bold text-slate-200">${block.startTime} - ${block.endTime}</span>
                <span class="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded text-white" style="background-color: ${blockColor}">
                  ${block.category}
                </span>
                ${isConflict ? '<span class="text-amber-400 text-xs" title="Konflik waktu!"><i class="fa-solid fa-triangle-exclamation"></i></span>' : ''}
              </div>
              <h5 class="text-sm font-semibold text-slate-100 truncate mt-0.5">${this.escapeHTML(block.activity)}</h5>
              ${block.notes ? `<p class="text-xs text-slate-300/80 truncate mt-0.5">${this.escapeHTML(block.notes)}</p>` : ''}
            </div>

            <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button type="button" onclick="event.stopPropagation(); window.scheduleModule.deleteBlock('${block.id}')"
                      class="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-slate-800/80 text-xs">
                <i class="fa-solid fa-trash-can"></i>
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

    // Get 7 days starting from Monday of current week
    const current = new Date(this.currentDate);
    const dayOfWeek = current.getDay(); // 0 is Sun
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
    const settings = window.storage.getData().settings || {};
    const catColors = settings.categoryColors || DEFAULT_CATEGORY_COLORS;

    let html = `
      <div class="grid grid-cols-1 md:grid-cols-7 gap-3">
    `;

    days.forEach((dayStr, idx) => {
      const blocks = this.getDaySchedule(dayStr);
      const isSelected = dayStr === this.currentDate;
      const isToday = dayStr === new Date().toISOString().split('T')[0];
      const d = new Date(dayStr);

      html += `
        <div class="bg-slate-900/60 rounded-2xl p-3 border ${isSelected ? 'border-blue-500' : 'border-slate-800'} flex flex-col min-h-[300px]">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div>
              <span class="text-xs font-bold ${isToday ? 'text-blue-400' : 'text-slate-400'}">${dayNames[idx]}</span>
              <h5 class="text-sm font-semibold text-slate-100">${d.getDate()}</h5>
            </div>
            <button onclick="window.scheduleModule.selectDay('${dayStr}')"
                    class="text-xs px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
              Lihat
            </button>
          </div>

          <div class="space-y-1.5 flex-1 overflow-y-auto max-h-[400px]">
            ${blocks.length === 0 ? '<p class="text-[11px] text-slate-500 italic py-4 text-center">Kosong</p>' : ''}
            ${blocks.map(b => {
              const col = b.color || catColors[b.category] || '#3B82F6';
              return `
                <div class="p-2 rounded-lg text-xs border border-slate-800/80 cursor-pointer hover:border-slate-600"
                     style="background-color: ${col}20; border-left: 3px solid ${col};"
                     onclick="window.scheduleModule.selectDay('${dayStr}'); window.scheduleModule.openModal('${b.id}')">
                  <div class="font-mono text-[10px] text-slate-400 font-semibold">${b.startTime}</div>
                  <div class="font-medium text-slate-200 truncate">${this.escapeHTML(b.activity)}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });

    html += `</div>`;
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
      // Pick next logical time slot
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
      window.notifications.showToast('Nama aktivitas wajib diisi!', 'warning');
      return;
    }

    const category = document.getElementById('schedule-input-category').value;
    const startTime = document.getElementById('schedule-input-start').value;
    const endTime = document.getElementById('schedule-input-end').value;
    const notes = document.getElementById('schedule-input-notes').value.trim();

    if (this.timeToMinutes(endTime) <= this.timeToMinutes(startTime)) {
      window.notifications.showToast('Waktu selesai harus lebih besar dari waktu mulai!', 'warning');
      return;
    }

    const data = window.storage.getData();
    if (!data.schedule) data.schedule = {};
    if (!data.schedule[this.currentDate]) data.schedule[this.currentDate] = [];

    const settings = data.settings || {};
    const catColors = settings.categoryColors || DEFAULT_CATEGORY_COLORS;
    const color = catColors[category] || '#3B82F6';

    if (this.editingBlockId) {
      const b = data.schedule[this.currentDate].find(x => x.id === this.editingBlockId);
      if (b) {
        b.activity = activity;
        b.category = category;
        b.startTime = startTime;
        b.endTime = endTime;
        b.notes = notes;
        b.color = color;
      }
      window.notifications.showToast('Blok waktu diperbarui.', 'success');
    } else {
      const newBlock = {
        id: 'sch-' + Date.now(),
        startTime,
        endTime,
        activity,
        category,
        notes,
        color
      };
      data.schedule[this.currentDate].push(newBlock);
      // Sort blocks by start time
      data.schedule[this.currentDate].sort((a, b) => this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime));
      window.notifications.showToast('Blok waktu ditambahkan.', 'success');
    }

    window.storage.saveData();
    this.closeModal();
    this.render();
    if (window.dashboardModule) window.dashboardModule.render();
  }

  deleteBlock(blockId) {
    if (!confirm('Hapus blok jadwal ini?')) return;
    const data = window.storage.getData();
    if (data.schedule && data.schedule[this.currentDate]) {
      data.schedule[this.currentDate] = data.schedule[this.currentDate].filter(b => b.id !== blockId);
      window.storage.saveData();
      this.render();
      window.notifications.showToast('Blok waktu dihapus.', 'info');
      if (window.dashboardModule) window.dashboardModule.render();
    }
  }

  applyTemplate(templateKey) {
    const data = window.storage.getData();
    const templates = data.schedule?.templates || INITIAL_DATA.schedule.templates;
    const templateBlocks = templates[templateKey];

    if (!templateBlocks) {
      window.notifications.showToast('Template tidak ditemukan.', 'warning');
      return;
    }

    if (this.getDaySchedule(this.currentDate).length > 0) {
      if (!confirm(`Jadwal untuk tanggal ${this.currentDate} sudah ada. Timpa dengan template ${templateKey.toUpperCase()}?`)) {
        return;
      }
    }

    if (!data.schedule) data.schedule = {};
    data.schedule[this.currentDate] = JSON.parse(JSON.stringify(templateBlocks)).map(b => ({
      ...b,
      id: 'sch-' + Date.now() + '-' + Math.floor(Math.random()*1000)
    }));

    window.storage.saveData();
    this.render();
    window.notifications.showToast(`Template "${templateKey.toUpperCase()}" berhasil diterapkan!`, 'success');
    if (window.dashboardModule) window.dashboardModule.render();
  }

  duplicatePreviousDay() {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() - 1);
    const yesterdayStr = d.toISOString().split('T')[0];
    const yesterdayBlocks = this.getDaySchedule(yesterdayStr);

    if (yesterdayBlocks.length === 0) {
      window.notifications.showToast(`Tidak ada jadwal di hari kemarin (${yesterdayStr}) untuk disalin.`, 'warning');
      return;
    }

    const data = window.storage.getData();
    if (!data.schedule) data.schedule = {};
    data.schedule[this.currentDate] = JSON.parse(JSON.stringify(yesterdayBlocks)).map(b => ({
      ...b,
      id: 'sch-' + Date.now() + '-' + Math.floor(Math.random()*1000)
    }));

    window.storage.saveData();
    this.render();
    window.notifications.showToast(`Jadwal dari kemarin (${yesterdayStr}) berhasil disalin!`, 'success');
  }

  printSchedule() {
    window.print();
  }

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g,
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}

// Global instance
window.scheduleModule = new ScheduleModule();
