/**
 * Finance Tracker Module - Income/Expense Tracking, Budget Limits, Financial Goals, Charts & CSV Export
 */

class FinanceModule {
  constructor() {
    this.currentMonthFilter = new Date().toISOString().substring(0, 7); // YYYY-MM
    this.typeFilter = 'all'; // 'all', 'income', 'expense'
    this.charts = {};
    this.editingTransactionId = null;
    this.editingGoalId = null;
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    const monthPicker = document.getElementById('finance-month-picker');
    if (monthPicker) {
      monthPicker.value = this.currentMonthFilter;
      monthPicker.addEventListener('change', (e) => {
        this.currentMonthFilter = e.target.value;
        this.render();
      });
    }

    const typeFilterSelect = document.getElementById('finance-type-filter');
    if (typeFilterSelect) {
      typeFilterSelect.addEventListener('change', (e) => {
        this.typeFilter = e.target.value;
        this.renderTransactionsList();
      });
    }
  }

  getFinances() {
    const data = window.storage.getData();
    return data.finances || { transactions: [], budgets: {}, goals: [] };
  }

  render() {
    this.renderSummaryCards();
    this.renderBudgetProgress();
    this.renderGoals();
    this.renderTransactionsList();
    this.renderCharts();
  }

  formatIDR(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  getMonthTransactions() {
    const finances = this.getFinances();
    const txs = finances.transactions || [];
    return txs.filter(t => t.date && t.date.startsWith(this.currentMonthFilter));
  }

  renderSummaryCards() {
    const txs = this.getMonthTransactions();

    const totalIncome = txs
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const totalExpense = txs
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const netSavings = totalIncome - totalExpense;

    const elIncome = document.getElementById('finance-stat-income');
    const elExpense = document.getElementById('finance-stat-expense');
    const elSavings = document.getElementById('finance-stat-savings');

    if (elIncome) elIncome.textContent = this.formatIDR(totalIncome);
    if (elExpense) elExpense.textContent = this.formatIDR(totalExpense);
    if (elSavings) {
      elSavings.textContent = this.formatIDR(netSavings);
      elSavings.className = `text-lg sm:text-2xl font-bold font-mono ${netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;
    }
  }

  renderBudgetProgress() {
    const container = document.getElementById('finance-budgets-container');
    if (!container) return;

    const finances = this.getFinances();
    const budgets = finances.budgets || {};
    const txs = this.getMonthTransactions().filter(t => t.type === 'expense');

    const spentByCategory = {};
    txs.forEach(t => {
      spentByCategory[t.category] = (spentByCategory[t.category] || 0) + (parseFloat(t.amount) || 0);
    });

    const categories = Object.keys(budgets);
    if (categories.length === 0) {
      container.innerHTML = '<p class="text-xs text-slate-500 italic">Belum ada anggaran bulanan yang diatur.</p>';
      return;
    }

    let html = '';
    categories.forEach(cat => {
      const budgetLimit = budgets[cat] || 0;
      const spent = spentByCategory[cat] || 0;
      const percent = budgetLimit > 0 ? Math.min(100, Math.round((spent / budgetLimit) * 100)) : 0;
      const isOver = spent > budgetLimit;

      let barColor = 'from-emerald-500 to-teal-400';
      if (percent > 70 && percent <= 90) barColor = 'from-amber-500 to-yellow-400';
      if (percent > 90 || isOver) barColor = 'from-rose-500 to-red-400';

      html += `
        <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 space-y-1.5">
          <div class="flex items-center justify-between text-xs font-semibold">
            <span class="text-slate-200">${this.escapeHTML(cat)}</span>
            <span class="${isOver ? 'text-rose-400 font-bold' : 'text-slate-400'} font-mono">
              ${this.formatIDR(spent)} / ${this.formatIDR(budgetLimit)}
            </span>
          </div>
          <div class="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
            <div class="bg-gradient-to-r ${barColor} h-2 rounded-full transition-all duration-300" style="width: ${percent}%"></div>
          </div>
          <div class="flex items-center justify-between text-[10px] text-slate-400">
            <span>Terpakai: ${percent}%</span>
            <span>${isOver ? '<strong class="text-rose-400">Over Budget!</strong>' : 'Sisa: ' + this.formatIDR(Math.max(0, budgetLimit - spent))}</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  renderGoals() {
    const container = document.getElementById('finance-goals-container');
    if (!container) return;

    const finances = this.getFinances();
    const goals = finances.goals || [];

    if (goals.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
          <p class="text-xs">Belum ada target tabungan impian.</p>
          <button onclick="window.financeModule.openGoalModal()" class="mt-2 text-xs text-blue-400 hover:underline">
            + Tambah Target Baru
          </button>
        </div>
      `;
      return;
    }

    let html = '';
    goals.forEach(g => {
      const target = g.targetAmount || 1;
      const current = g.currentAmount || 0;
      const percent = Math.min(100, Math.round((current / target) * 100));

      html += `
        <div class="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 space-y-3 relative group">
          <div class="flex items-start justify-between gap-2">
            <div>
              <h5 class="text-sm font-semibold text-slate-100">${this.escapeHTML(g.name)}</h5>
              ${g.notes ? `<p class="text-xs text-slate-400 mt-0.5">${this.escapeHTML(g.notes)}</p>` : ''}
              ${g.targetDate ? `<p class="text-[11px] text-amber-400/90 mt-1"><i class="fa-regular fa-calendar-check mr-1"></i>Target: ${g.targetDate}</p>` : ''}
            </div>
            <div class="flex items-center gap-1">
              <button onclick="window.financeModule.openGoalModal('${g.id}')"
                      class="text-slate-400 hover:text-blue-400 p-1.5 rounded hover:bg-slate-700/50 text-xs">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button onclick="window.financeModule.deleteGoal('${g.id}')"
                      class="text-slate-400 hover:text-rose-400 p-1.5 rounded hover:bg-slate-700/50 text-xs">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between text-xs font-mono font-semibold mb-1">
              <span class="text-emerald-400">${this.formatIDR(current)}</span>
              <span class="text-slate-400">Target: ${this.formatIDR(target)}</span>
            </div>
            <div class="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
              <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all" style="width: ${percent}%"></div>
            </div>
            <div class="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
              <span>Progres: <strong class="text-emerald-400">${percent}%</strong></span>
              <button onclick="window.financeModule.addFundsToGoal('${g.id}')"
                      class="text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg font-semibold transition-colors">
                + Tambah Tabungan
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  renderTransactionsList() {
    const container = document.getElementById('finance-transactions-container');
    if (!container) return;

    let txs = this.getMonthTransactions();

    if (this.typeFilter !== 'all') {
      txs = txs.filter(t => t.type === this.typeFilter);
    }

    // Sort by date desc
    txs.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (txs.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-500">
          <i class="fa-solid fa-receipt text-3xl mb-2 text-slate-600"></i>
          <p class="text-xs">Tidak ada transaksi tercatat untuk bulan ini.</p>
        </div>
      `;
      return;
    }

    let html = '<div class="divide-y divide-slate-800">';
    txs.forEach(t => {
      const isIncome = t.type === 'income';
      html += `
        <div class="py-3 flex items-center justify-between gap-3 group hover:bg-slate-800/40 px-2 rounded-xl transition-colors">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
              isIncome ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
            }">
              <i class="fa-solid ${isIncome ? 'fa-arrow-down-left' : 'fa-arrow-up-right'}"></i>
            </div>
            <div class="min-w-0">
              <h6 class="text-xs sm:text-sm font-semibold text-slate-200 truncate">${this.escapeHTML(t.notes || t.category)}</h6>
              <div class="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span class="bg-slate-800 px-1.5 py-0.2 rounded text-slate-300 font-medium">${this.escapeHTML(t.category)}</span>
                <span>${t.date}</span>
                ${t.paymentMethod ? `<span>• ${this.escapeHTML(t.paymentMethod)}</span>` : ''}
                ${t.isRecurring ? `<span class="text-indigo-400"><i class="fa-solid fa-arrows-rotate"></i></span>` : ''}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-xs sm:text-sm font-mono font-bold ${isIncome ? 'text-emerald-400' : 'text-slate-200'}">
              ${isIncome ? '+' : '-'}${this.formatIDR(t.amount)}
            </span>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onclick="window.financeModule.openTransactionModal('${t.id}')" class="p-1 text-slate-400 hover:text-blue-400 rounded text-xs">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button onclick="window.financeModule.deleteTransaction('${t.id}')" class="p-1 text-slate-400 hover:text-rose-400 rounded text-xs">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';

    container.innerHTML = html;
  }

  renderCharts() {
    if (typeof Chart === 'undefined') return;

    const txs = this.getMonthTransactions();

    // 1. Monthly Category Breakdown (Doughnut Chart)
    const expenseTxs = txs.filter(t => t.type === 'expense');
    const catMap = {};
    expenseTxs.forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + (parseFloat(t.amount) || 0);
    });

    const catLabels = Object.keys(catMap);
    const catValues = Object.values(catMap);

    const ctxCat = document.getElementById('chart-finance-categories');
    if (ctxCat) {
      if (this.charts.category) this.charts.category.destroy();
      this.charts.category = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
          labels: catLabels.length > 0 ? catLabels : ['Belum Ada Data'],
          datasets: [{
            data: catValues.length > 0 ? catValues : [1],
            backgroundColor: [
              '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6', '#64748B'
            ],
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

    // 2. Income vs Expense Trend Bar Chart (Last 6 Months)
    const allTxs = this.getFinances().transactions || [];
    const last6Months = [];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthD = new Date(d.getFullYear(), d.getMonth() - i, 1);
      last6Months.push(monthD.toISOString().substring(0, 7));
    }

    const incomeTrend = [];
    const expenseTrend = [];

    last6Months.forEach(m => {
      const mIn = allTxs.filter(t => t.date && t.date.startsWith(m) && t.type === 'income').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      const mEx = allTxs.filter(t => t.date && t.date.startsWith(m) && t.type === 'expense').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      incomeTrend.push(mIn);
      expenseTrend.push(mEx);
    });

    const ctxTrend = document.getElementById('chart-finance-trend');
    if (ctxTrend) {
      if (this.charts.trend) this.charts.trend.destroy();
      this.charts.trend = new Chart(ctxTrend, {
        type: 'bar',
        data: {
          labels: last6Months.map(m => {
            const [y, mon] = m.split('-');
            return new Date(y, mon - 1).toLocaleDateString('id-ID', { month: 'short' });
          }),
          datasets: [
            {
              label: 'Pemasukan',
              data: incomeTrend,
              backgroundColor: '#10B981',
              borderRadius: 6
            },
            {
              label: 'Pengeluaran',
              data: expenseTrend,
              backgroundColor: '#EF4444',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { grid: { display: false }, ticks: { color: '#94A3B8' } },
            y: { grid: { color: '#334155' }, ticks: { color: '#94A3B8' } }
          },
          plugins: {
            legend: {
              labels: { color: '#94A3B8', font: { size: 10 } }
            }
          }
        }
      });
    }
  }

  openTransactionModal(txId = null) {
    this.editingTransactionId = txId;
    const modal = document.getElementById('finance-modal');
    const modalTitle = document.getElementById('finance-modal-title');
    const form = document.getElementById('finance-form');
    if (!modal || !form) return;

    form.reset();

    if (txId) {
      modalTitle.textContent = 'Edit Transaksi';
      const tx = (this.getFinances().transactions || []).find(t => t.id === txId);
      if (tx) {
        document.getElementById('finance-input-type').value = tx.type;
        document.getElementById('finance-input-category').value = tx.category;
        document.getElementById('finance-input-amount').value = tx.amount;
        document.getElementById('finance-input-date').value = tx.date;
        document.getElementById('finance-input-notes').value = tx.notes || '';
        document.getElementById('finance-input-payment').value = tx.paymentMethod || 'Cash';
        document.getElementById('finance-input-recurring').checked = !!tx.isRecurring;
      }
    } else {
      modalTitle.textContent = 'Catat Transaksi';
      document.getElementById('finance-input-date').value = new Date().toISOString().split('T')[0];
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeTransactionModal() {
    const modal = document.getElementById('finance-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    this.editingTransactionId = null;
  }

  handleTransactionSubmit(e) {
    e.preventDefault();
    const type = document.getElementById('finance-input-type').value;
    const category = document.getElementById('finance-input-category').value;
    const amount = parseFloat(document.getElementById('finance-input-amount').value);
    const date = document.getElementById('finance-input-date').value;
    const notes = document.getElementById('finance-input-notes').value.trim();
    const paymentMethod = document.getElementById('finance-input-payment').value;
    const isRecurring = document.getElementById('finance-input-recurring').checked;

    if (!amount || amount <= 0) {
      window.notifications.showToast('Jumlah nominal harus lebih dari 0!', 'warning');
      return;
    }

    const data = window.storage.getData();
    if (!data.finances) data.finances = { transactions: [], budgets: {}, goals: [] };

    if (this.editingTransactionId) {
      const tx = data.finances.transactions.find(t => t.id === this.editingTransactionId);
      if (tx) {
        tx.type = type;
        tx.category = category;
        tx.amount = amount;
        tx.date = date;
        tx.notes = notes;
        tx.paymentMethod = paymentMethod;
        tx.isRecurring = isRecurring;
      }
      window.notifications.showToast('Transaksi diperbarui.', 'success');
    } else {
      const newTx = {
        id: 'fn-' + Date.now(),
        type,
        category,
        amount,
        date,
        notes,
        paymentMethod,
        isRecurring
      };
      data.finances.transactions.unshift(newTx);
      window.notifications.showToast('Transaksi dicatat.', 'success');
    }

    window.storage.saveData();
    this.closeTransactionModal();
    this.render();
    if (window.dashboardModule) window.dashboardModule.render();
  }

  deleteTransaction(txId) {
    if (!confirm('Hapus transaksi ini?')) return;
    const data = window.storage.getData();
    if (data.finances && data.finances.transactions) {
      data.finances.transactions = data.finances.transactions.filter(t => t.id !== txId);
      window.storage.saveData();
      this.render();
      window.notifications.showToast('Transaksi dihapus.', 'info');
      if (window.dashboardModule) window.dashboardModule.render();
    }
  }

  // --- GOALS ---

  openGoalModal(goalId = null) {
    this.editingGoalId = goalId;
    const modal = document.getElementById('goal-modal');
    const modalTitle = document.getElementById('goal-modal-title');
    const form = document.getElementById('goal-form');
    if (!modal || !form) return;

    form.reset();

    if (goalId) {
      modalTitle.textContent = 'Edit Target Finansial';
      const goal = (this.getFinances().goals || []).find(g => g.id === goalId);
      if (goal) {
        document.getElementById('goal-input-name').value = goal.name;
        document.getElementById('goal-input-target').value = goal.targetAmount;
        document.getElementById('goal-input-current').value = goal.currentAmount;
        document.getElementById('goal-input-date').value = goal.targetDate || '';
        document.getElementById('goal-input-notes').value = goal.notes || '';
      }
    } else {
      modalTitle.textContent = 'Target Tabungan Baru';
      const now = new Date();
      now.setMonth(now.getMonth() + 6);
      document.getElementById('goal-input-date').value = now.toISOString().split('T')[0];
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeGoalModal() {
    const modal = document.getElementById('goal-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    this.editingGoalId = null;
  }

  handleGoalSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('goal-input-name').value.trim();
    const targetAmount = parseFloat(document.getElementById('goal-input-target').value) || 0;
    const currentAmount = parseFloat(document.getElementById('goal-input-current').value) || 0;
    const targetDate = document.getElementById('goal-input-date').value;
    const notes = document.getElementById('goal-input-notes').value.trim();

    if (!name || targetAmount <= 0) {
      window.notifications.showToast('Nama target & nominal target wajib diisi!', 'warning');
      return;
    }

    const data = window.storage.getData();
    if (!data.finances.goals) data.finances.goals = [];

    if (this.editingGoalId) {
      const goal = data.finances.goals.find(g => g.id === this.editingGoalId);
      if (goal) {
        goal.name = name;
        goal.targetAmount = targetAmount;
        goal.currentAmount = currentAmount;
        goal.targetDate = targetDate;
        goal.notes = notes;
      }
      window.notifications.showToast('Target finansial diperbarui.', 'success');
    } else {
      const newGoal = {
        id: 'goal-' + Date.now(),
        name,
        targetAmount,
        currentAmount,
        targetDate,
        notes
      };
      data.finances.goals.push(newGoal);
      window.notifications.showToast('Target tabungan baru ditambahkan!', 'success');
    }

    window.storage.saveData();
    this.closeGoalModal();
    this.render();
  }

  addFundsToGoal(goalId) {
    const amountStr = prompt('Masukkan jumlah setoran tabungan (Rp):', '50000');
    if (!amountStr) return;
    const amount = parseFloat(amountStr.replace(/[^0-9]/g, ''));
    if (!amount || amount <= 0) return;

    const data = window.storage.getData();
    const goal = (data.finances.goals || []).find(g => g.id === goalId);
    if (!goal) return;

    goal.currentAmount = (goal.currentAmount || 0) + amount;

    // Optional: Record automatic expense transaction in category 'Savings'
    const todayStr = new Date().toISOString().split('T')[0];
    data.finances.transactions.unshift({
      id: 'fn-' + Date.now(),
      type: 'expense',
      category: 'Savings',
      amount: amount,
      date: todayStr,
      notes: `Setoran tabungan: ${goal.name}`,
      paymentMethod: 'Transfer',
      isRecurring: false
    });

    if (goal.currentAmount >= goal.targetAmount) {
      window.todoModule.triggerConfetti();
      window.notifications.showToast(`🎉 Selamat! Target "${goal.name}" tercapai!`, 'success');
    } else {
      window.notifications.showToast(`+${this.formatIDR(amount)} ditambahkan ke "${goal.name}"`, 'success');
    }

    window.storage.saveData();
    this.render();
    if (window.dashboardModule) window.dashboardModule.render();
  }

  deleteGoal(goalId) {
    if (!confirm('Hapus target tabungan ini?')) return;
    const data = window.storage.getData();
    if (data.finances && data.finances.goals) {
      data.finances.goals = data.finances.goals.filter(g => g.id !== goalId);
      window.storage.saveData();
      this.render();
      window.notifications.showToast('Target dihapus.', 'info');
    }
  }

  // --- CSV EXPORT ---

  exportCSV() {
    const txs = this.getFinances().transactions || [];
    if (txs.length === 0) {
      window.notifications.showToast('Belum ada transaksi untuk diekspor.', 'warning');
      return;
    }

    let csvContent = 'ID,Tanggal,Tipe,Kategori,Nominal,Metode_Pembayaran,Catatan\n';
    txs.forEach(t => {
      const cleanNote = (t.notes || '').replace(/"/g, '""');
      csvContent += `"${t.id}","${t.date}","${t.type}","${t.category}","${t.amount}","${t.paymentMethod || ''}","${cleanNote}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_keuangan_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.notifications.showToast('Laporan CSV berhasil diunduh.', 'success');
  }

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g,
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}

// Global instance
window.financeModule = new FinanceModule();
