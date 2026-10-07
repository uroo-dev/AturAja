/**
 * Backup Module - Export/Import JSON, Validation, Auto-backup Reminders
 */

class BackupModule {
  constructor() {
    this.setupAutoBackupReminder();
  }

  exportJSON() {
    const data = window.state.getState();
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const a = document.createElement('a');
    a.href = url;
    a.download = `studentflow-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    localStorage.setItem('studentflow_last_backup', Date.now().toString());
    Utils.showToast('📥 Data cadangan (backup) berhasil diekspor!', { type: 'success' });
  }

  validateJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed !== 'object' || parsed === null) {
        return { valid: false, error: 'Format JSON tidak valid (bukan object).' };
      }
      if (!parsed.todos || !Array.isArray(parsed.todos)) {
        return { valid: false, error: 'Data JSON harus memiliki array "todos".' };
      }
      return { valid: true, data: parsed };
    } catch (e) {
      return { valid: false, error: 'Gagal membaca JSON: ' + e.message };
    }
  }

  importJSON(jsonString, mode = 'replace') {
    const validation = this.validateJSON(jsonString);
    if (!validation.valid) {
      return { success: false, message: validation.error };
    }

    const imported = validation.data;
    const current = window.state.getState();

    if (mode === 'replace') {
      window.state.state = {
        version: '2.0.0',
        profile: imported.profile || current.profile,
        todos: imported.todos || [],
        schedule: imported.schedule || current.schedule,
        projects: imported.projects || [],
        finances: imported.finances || current.finances,
        habits: imported.habits || [],
        pomodoro: imported.pomodoro || current.pomodoro,
        settings: { ...current.settings, ...(imported.settings || {}) }
      };
    } else if (mode === 'merge') {
      const existingTodoIds = new Set(current.todos.map(t => t.id));
      (imported.todos || []).forEach(t => {
        if (!existingTodoIds.has(t.id)) current.todos.push(t);
      });

      const existingProjIds = new Set(current.projects.map(p => p.id));
      (imported.projects || []).forEach(p => {
        if (!existingProjIds.has(p.id)) current.projects.push(p);
      });

      const existingTxIds = new Set((current.finances.transactions || []).map(tx => tx.id));
      (imported.finances?.transactions || []).forEach(tx => {
        if (!existingTxIds.has(tx.id)) current.finances.transactions.push(tx);
      });
    }

    window.state.saveState();
    return { success: true, message: 'Data berhasil diimpor (' + (mode === 'replace' ? 'Timpa data' : 'Gabung data') + ').' };
  }

  setupAutoBackupReminder() {
    const lastBackup = localStorage.getItem('studentflow_last_backup');
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    if (!lastBackup || Date.now() - parseInt(lastBackup) > sevenDays) {
      setTimeout(() => {
        Utils.showToast('💾 Pengingat: Unduh cadangan (backup) data mingguanmu!', {
          duration: 9000,
          action: {
            text: 'Ekspor Sekarang',
            onClick: () => this.exportJSON()
          }
        });
      }, 4000);
    }
  }
}

window.backupModule = new BackupModule();
