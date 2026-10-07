/**
 * Settings & User Profile Module - Editable Profile, Avatar Upload, Theme & Accent Customizer, Schedule Defaults
 */

class SettingsModule {
  constructor() {
    this.pendingImportJSON = null;
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    // Profile Form
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => this.handleProfileSubmit(e));
    }

    // Avatar Input
    const avatarInput = document.getElementById('avatar-input');
    if (avatarInput) {
      avatarInput.addEventListener('change', (e) => this.handleAvatarUpload(e));
    }

    // Theme Toggle Buttons
    const themeButtons = document.querySelectorAll('.theme-toggle-btn');
    themeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        themeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setTheme(btn.dataset.theme);
      });
    });

    // Accent Color Picker & Dots
    const accentInput = document.getElementById('accent-color');
    if (accentInput) {
      accentInput.addEventListener('input', (e) => this.setAccentColor(e.target.value));
    }

    const colorDots = document.querySelectorAll('.color-dot');
    colorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        colorDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        const color = dot.dataset.color;
        if (accentInput) accentInput.value = color;
        this.setAccentColor(color);
      });
    });

    // Toggles (Notifications & Sound)
    const notifToggle = document.getElementById('notifications-toggle');
    if (notifToggle) {
      notifToggle.addEventListener('change', (e) => {
        window.state.updateProfile({ notificationsEnabled: e.target.checked });
        if (e.target.checked) window.notifications.requestPermission();
      });
    }

    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
      soundToggle.addEventListener('change', (e) => {
        window.state.updateProfile({ soundEnabled: e.target.checked });
        Utils.showToast(e.target.checked ? 'Suara notifikasi diaktifkan' : 'Suara notifikasi dinonaktifkan', { type: 'info' });
      });
    }

    // Daily Schedule Defaults Inputs
    const wakeInput = document.getElementById('wake-time');
    const sleepInput = document.getElementById('sleep-time');
    const codingHrsInput = document.getElementById('coding-hours');
    const studyHrsInput = document.getElementById('study-hours');

    [wakeInput, sleepInput, codingHrsInput, studyHrsInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('change', () => {
          window.state.updateProfile({
            wakeTime: wakeInput ? wakeInput.value : '04:30',
            sleepTime: sleepInput ? sleepInput.value : '22:00',
            dailyCodingHours: codingHrsInput ? parseFloat(codingHrsInput.value) : 2.0,
            weeklyStudyHours: studyHrsInput ? parseFloat(studyHrsInput.value) : 20
          });
          Utils.showToast('Jadwal harian diperbarui.', { type: 'success' });
        });
      }
    });

    // Test Notification Button
    const testBtn = document.getElementById('test-notification-btn');
    if (testBtn) {
      testBtn.addEventListener('click', async () => {
        const granted = await window.notifications.requestPermission();
        if (granted) {
          window.notifications.sendSystemNotification('🔔 Uji Coba StudentFlow', {
            body: 'Notifikasi browser & efek suara berfungsi optimal!'
          });
          Utils.showToast('Uji notifikasi berhasil dikirim.', { type: 'success' });
        }
      });
    }

    // Export / Import / Reset
    const exportBtn = document.getElementById('export-data-btn');
    if (exportBtn) exportBtn.addEventListener('click', () => window.backupModule.exportJSON());

    const importBtn = document.getElementById('import-data-btn');
    const importFileInput = document.getElementById('import-file');
    if (importBtn && importFileInput) {
      importBtn.addEventListener('click', () => importFileInput.click());
      importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          this.openImportModal(event.target.result);
        };
        reader.readAsText(file);
        importFileInput.value = '';
      });
    }

    const resetBtn = document.getElementById('reset-all-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('PERINGATAN: Semua data tugas, jadwal, proyek, keuangan & profil akan direset permanen ke bawaan. Lanjutkan?')) {
          window.state.resetAll();
          Utils.showToast('Data berhasil direset ke setelan awal.', { type: 'info' });
          setTimeout(() => location.reload(), 700);
        }
      });
    }
  }

  render() {
    const profile = window.state.getProfile();

    // Populate profile inputs
    const nameInp = document.getElementById('user-name');
    const emailInp = document.getElementById('user-email');
    const schoolInp = document.getElementById('user-school');
    const gradeInp = document.getElementById('user-grade');
    const avatarImg = document.getElementById('avatar-preview');
    const headerAvatar = document.getElementById('header-user-avatar');
    const headerName = document.getElementById('header-user-name');

    if (nameInp) nameInp.value = profile.name || '';
    if (emailInp) emailInp.value = profile.email || '';
    if (schoolInp) schoolInp.value = profile.school || '';
    if (gradeInp) gradeInp.value = profile.grade || '12';

    if (avatarImg) {
      avatarImg.src = profile.avatar || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%234F46E5"/><text x="50" y="62" font-size="36" text-anchor="middle" fill="white" font-family="sans-serif" font-weight="bold">' + (profile.name ? profile.name.charAt(0).toUpperCase() : 'S') + '</text></svg>';
    }

    if (headerAvatar) {
      headerAvatar.src = avatarImg ? avatarImg.src : '';
    }
    if (headerName) {
      headerName.textContent = profile.name || 'Siswa Kelas 12';
    }

    // Theme
    this.applyTheme(profile.theme || 'dark');
    const themeBtns = document.querySelectorAll('.theme-toggle-btn');
    themeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === profile.theme);
    });

    // Accent Color
    this.applyAccentColor(profile.accentColor || '#4F46E5');
    const accentInput = document.getElementById('accent-color');
    if (accentInput) accentInput.value = profile.accentColor || '#4F46E5';

    // Toggles
    const notifToggle = document.getElementById('notifications-toggle');
    const soundToggle = document.getElementById('sound-toggle');
    if (notifToggle) notifToggle.checked = !!profile.notificationsEnabled;
    if (soundToggle) soundToggle.checked = !!profile.soundEnabled;

    // Schedule Defaults
    const wakeInput = document.getElementById('wake-time');
    const sleepInput = document.getElementById('sleep-time');
    const codingHrsInput = document.getElementById('coding-hours');
    const studyHrsInput = document.getElementById('study-hours');

    if (wakeInput) wakeInput.value = profile.wakeTime || '04:30';
    if (sleepInput) sleepInput.value = profile.sleepTime || '22:00';
    if (codingHrsInput) codingHrsInput.value = profile.dailyCodingHours || 2.0;
    if (studyHrsInput) studyHrsInput.value = profile.weeklyStudyHours || 20;
  }

  handleProfileSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const school = document.getElementById('user-school').value.trim();
    const grade = document.getElementById('user-grade').value;

    window.state.updateProfile({ name, email, school, grade });
    Utils.showToast('👤 Profil berhasil disimpan!', { type: 'success' });
    this.render();
  }

  handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      Utils.showToast('Ukuran foto profil maksimal 2MB!', { type: 'danger' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      window.state.updateProfile({ avatar: base64 });
      this.render();
      Utils.showToast('Foto profil diperbarui!', { type: 'success' });
    };
    reader.readAsDataURL(file);
  }

  setTheme(theme) {
    window.state.updateProfile({ theme });
    this.applyTheme(theme);
    Utils.showToast(`Tema ${theme === 'dark' ? 'Gelap' : 'Terang'} aktif`, { type: 'info' });
  }

  applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
    } else {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    }
  }

  setAccentColor(color) {
    window.state.updateProfile({ accentColor: color });
    this.applyAccentColor(color);
  }

  applyAccentColor(color) {
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--primary-dark', color);
  }

  openImportModal(jsonString) {
    this.pendingImportJSON = jsonString;
    const modal = document.getElementById('import-confirm-modal');
    if (modal) modal.classList.remove('hidden');
  }

  closeImportModal() {
    const modal = document.getElementById('import-confirm-modal');
    if (modal) modal.classList.add('hidden');
    this.pendingImportJSON = null;
  }

  confirmImport(mode) {
    if (!this.pendingImportJSON) return;
    const res = window.backupModule.importJSON(this.pendingImportJSON, mode);
    this.closeImportModal();
    if (res.success) {
      Utils.showToast(res.message, { type: 'success' });
      setTimeout(() => location.reload(), 600);
    } else {
      Utils.showToast('Gagal: ' + res.message, { type: 'danger' });
    }
  }
}

window.settingsModule = new SettingsModule();
