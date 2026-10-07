/**
 * Settings Module - Preferences, Theme, Color Customization, Notification Times & Data Backup/Reset
 */

class SettingsModule {
  constructor() {}

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    // Theme toggle
    const themeSelect = document.getElementById('setting-theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        this.setTheme(e.target.value);
      });
    }

    // Export JSON
    const exportBtn = document.getElementById('setting-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        window.storage.exportJSON();
        window.notifications.showToast('Data berhasil diekspor ke file JSON.', 'success');
      });
    }

    // Import JSON
    const importInput = document.getElementById('setting-import-file');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          const validation = window.storage.validateJSON(content);
          if (!validation.valid) {
            window.notifications.showToast('Gagal: ' + validation.error, 'danger');
            return;
          }

          // Open Import Confirmation Modal
          this.openImportModal(content);
        };
        reader.readAsText(file);
        importInput.value = ''; // Reset
      });
    }

    // Reset Data
    const resetBtn = document.getElementById('setting-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('PERINGATAN: Semua data (tugas, jadwal, proyek, keuangan) akan direset ke data default bawaan. Lanjutkan?')) {
          window.storage.resetAllData();
          window.notifications.showToast('Data berhasil direset ke pengaturan awal.', 'info');
          setTimeout(() => location.reload(), 800);
        }
      });
    }

    // Test Notification
    const testNotifBtn = document.getElementById('setting-test-notif-btn');
    if (testNotifBtn) {
      testNotifBtn.addEventListener('click', async () => {
        const granted = await window.notifications.requestPermission();
        if (granted) {
          window.notifications.sendSystemNotification('🔔 Uji Coba Notifikasi', {
            body: 'Notifikasi Student Life Manager berfungsi dengan sempurna!'
          });
          window.notifications.showToast('Notifikasi uji coba dikirim.', 'success');
        }
      });
    }
  }

  getSettings() {
    const data = window.storage.getData();
    return data.settings || {};
  }

  render() {
    const settings = this.getSettings();

    // Set Theme
    const themeSelect = document.getElementById('setting-theme-select');
    if (themeSelect) themeSelect.value = settings.theme || 'dark';
    this.applyTheme(settings.theme || 'dark');

    // Morning and Evening Times
    const morningInput = document.getElementById('setting-morning-time');
    const eveningInput = document.getElementById('setting-evening-time');
    const offsetInput = document.getElementById('setting-due-offset');

    if (morningInput) morningInput.value = settings.morningSummaryTime || '07:00';
    if (eveningInput) eveningInput.value = settings.eveningReviewTime || '20:30';
    if (offsetInput) offsetInput.value = settings.dueReminderOffsetMinutes || 30;

    this.renderCategoryColorPickers();
  }

  renderCategoryColorPickers() {
    const container = document.getElementById('setting-category-colors-container');
    if (!container) return;

    const settings = this.getSettings();
    const colors = settings.categoryColors || DEFAULT_CATEGORY_COLORS;

    let html = '<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">';
    Object.keys(colors).forEach(cat => {
      html += `
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <span class="text-xs font-semibold text-slate-200">${cat}</span>
          <input type="color" value="${colors[cat]}" 
                 onchange="window.settingsModule.updateCategoryColor('${cat}', this.value)"
                 class="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent">
        </div>
      `;
    });
    html += '</div>';

    container.innerHTML = html;
  }

  updateCategoryColor(cat, color) {
    const data = window.storage.getData();
    if (!data.settings.categoryColors) data.settings.categoryColors = {};
    data.settings.categoryColors[cat] = color;
    window.storage.saveData();
    window.notifications.showToast(`Warna kategori ${cat} diperbarui.`, 'success');
    
    // Rerender active views
    if (window.todoModule) window.todoModule.render();
    if (window.scheduleModule) window.scheduleModule.render();
    if (window.projectsModule) window.projectsModule.render();
    if (window.dashboardModule) window.dashboardModule.render();
  }

  saveNotificationPreferences() {
    const morningInput = document.getElementById('setting-morning-time');
    const eveningInput = document.getElementById('setting-evening-time');
    const offsetInput = document.getElementById('setting-due-offset');

    const data = window.storage.getData();
    data.settings.morningSummaryTime = morningInput ? morningInput.value : '07:00';
    data.settings.eveningReviewTime = eveningInput ? eveningInput.value : '20:30';
    data.settings.dueReminderOffsetMinutes = offsetInput ? parseInt(offsetInput.value) : 30;

    window.storage.saveData();
    window.notifications.showToast('Pengaturan notifikasi disimpan.', 'success');
  }

  setTheme(theme) {
    const data = window.storage.getData();
    data.settings.theme = theme;
    window.storage.saveData();
    this.applyTheme(theme);
  }

  applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark');
    } else {
      root.classList.remove('light-theme');
      root.classList.add('dark');
    }
  }

  openImportModal(jsonString) {
    this.pendingImportJSON = jsonString;
    const modal = document.getElementById('import-confirm-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  closeImportModal() {
    const modal = document.getElementById('import-confirm-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    this.pendingImportJSON = null;
  }

  confirmImport(mode) {
    if (!this.pendingImportJSON) return;

    const result = window.storage.importJSON(this.pendingImportJSON, mode);
    this.closeImportModal();

    if (result.success) {
      window.notifications.showToast(result.message, 'success');
      setTimeout(() => location.reload(), 600);
    } else {
      window.notifications.showToast('Gagal: ' + result.message, 'danger');
    }
  }
}

// Global instance
window.settingsModule = new SettingsModule();
