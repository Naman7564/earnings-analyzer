/**
 * Earnings Module - Manage earning entries
 * Handles CRUD operations and display for earnings
 */

const Earnings = {
    categoryIcons: {
        cashback: '💳',
        referral: '🤝',
        freelance: '💼',
        salary: '💰',
        business: '🏢',
        passive: '📈'
    },

    categoryLabels: {
        cashback: 'Cashback & Rewards',
        referral: 'Referral Earnings',
        freelance: 'Freelance / Project',
        salary: 'Salary / Stipend',
        business: 'Business Income',
        passive: 'Passive Income'
    },

    /**
     * Get all earnings with optional filters
     */
    getFiltered(filters = {}) {
        let earnings = Storage.getEarnings() || [];

        // Filter by category
        if (filters.category && filters.category !== 'all') {
            earnings = earnings.filter(e => e.category === filters.category);
        }

        // Filter by date range
        if (filters.dateRange && filters.dateRange !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            earnings = earnings.filter(e => {
                const earningDate = new Date(e.date);

                switch (filters.dateRange) {
                    case 'today':
                        return earningDate >= today;
                    case 'week':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return earningDate >= weekAgo;
                    case 'month':
                        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                        return earningDate >= monthStart;
                    case 'year':
                        const yearStart = new Date(now.getFullYear(), 0, 1);
                        return earningDate >= yearStart;
                    default:
                        return true;
                }
            });
        }

        return earnings;
    },

    /**
     * Calculate total from earnings array
     */
    calculateTotal(earnings) {
        return earnings.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    },

    /**
     * Get summary statistics
     */
    getSummary() {
        const all = Storage.getEarnings() || [];
        const now = new Date();

        // Total
        const total = this.calculateTotal(all);

        // This week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyEarnings = all.filter(e => new Date(e.date) >= weekAgo);
        const weekly = this.calculateTotal(weeklyEarnings);

        // This month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyEarnings = all.filter(e => new Date(e.date) >= monthStart);
        const monthly = this.calculateTotal(monthlyEarnings);

        // Last month for comparison
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const lastMonthEarnings = all.filter(e => {
            const date = new Date(e.date);
            return date >= lastMonthStart && date <= lastMonthEnd;
        });
        const lastMonth = this.calculateTotal(lastMonthEarnings);

        // Calculate trend
        let trend = 0;
        if (lastMonth > 0) {
            trend = ((monthly - lastMonth) / lastMonth) * 100;
        }

        return {
            total,
            weekly,
            weeklyCount: weeklyEarnings.length,
            monthly,
            monthlyCount: monthlyEarnings.length,
            lastMonth,
            trend: trend.toFixed(1)
        };
    },

    /**
     * Get earnings grouped by source/category
     */
    getBySource() {
        const earnings = Storage.getEarnings() || [];
        const bySource = {};

        earnings.forEach(e => {
            if (!bySource[e.category]) {
                bySource[e.category] = 0;
            }
            bySource[e.category] += parseFloat(e.amount || 0);
        });

        return bySource;
    },

    /**
     * Get earnings by date for charts
     */
    getByDate(days = 30) {
        const earnings = Storage.getEarnings() || [];
        const byDate = {};
        const now = new Date();

        // Initialize dates
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            byDate[dateStr] = 0;
        }

        // Sum earnings by date
        earnings.forEach(e => {
            if (byDate.hasOwnProperty(e.date)) {
                byDate[e.date] += parseFloat(e.amount || 0);
            }
        });

        return byDate;
    },

    /**
     * Get monthly totals for last N months
     */
    getMonthlyTotals(months = 6) {
        const earnings = Storage.getEarnings() || [];
        const monthlyTotals = {};
        const now = new Date();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Initialize months
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = monthNames[date.getMonth()];
            monthlyTotals[key] = { label, total: 0 };
        }

        // Sum earnings by month
        earnings.forEach(e => {
            const date = new Date(e.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyTotals[key]) {
                monthlyTotals[key].total += parseFloat(e.amount || 0);
            }
        });

        return monthlyTotals;
    },

    /**
     * Render earnings list
     */
    renderList(containerId, limit = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let earnings = Storage.getEarnings() || [];

        if (limit) {
            earnings = earnings.slice(0, limit);
        }

        if (earnings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📝</span>
                    <p>No earnings yet. Click "Add Earning" to get started!</p>
                </div>
            `;
            return;
        }

        const profile = Storage.getProfile();
        const currency = profile?.currency || '₹';

        container.innerHTML = earnings.map(earning => `
            <div class="earning-item" data-id="${earning.id}">
                <div class="earning-category-icon">${this.categoryIcons[earning.category] || '💵'}</div>
                <div class="earning-details">
                    <div class="earning-source">${earning.source || this.categoryLabels[earning.category]}</div>
                    <div class="earning-meta">
                        <span>${this.formatDate(earning.date)}</span>
                        <span>•</span>
                        <span>${this.categoryLabels[earning.category]}</span>
                    </div>
                </div>
                <div class="earning-amount">${currency}${this.formatAmount(earning.amount)}</div>
                <div class="earning-actions">
                    <button class="earning-action-btn edit-earning" data-id="${earning.id}" title="Edit">✏️</button>
                    <button class="earning-action-btn delete-earning" data-id="${earning.id}" title="Delete">🗑️</button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        container.querySelectorAll('.edit-earning').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editEarning(btn.dataset.id);
            });
        });

        container.querySelectorAll('.delete-earning').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteEarning(btn.dataset.id);
            });
        });
    },

    /**
     * Render filtered earnings list
     */
    renderFilteredList(containerId, filters) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const earnings = this.getFiltered(filters);
        const profile = Storage.getProfile();
        const currency = profile?.currency || '₹';

        if (earnings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📝</span>
                    <p>No earnings match your filters.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = earnings.map(earning => `
            <div class="earning-item" data-id="${earning.id}">
                <div class="earning-category-icon">${this.categoryIcons[earning.category] || '💵'}</div>
                <div class="earning-details">
                    <div class="earning-source">${earning.source || this.categoryLabels[earning.category]}</div>
                    <div class="earning-meta">
                        <span>${this.formatDate(earning.date)}</span>
                        <span>•</span>
                        <span>${this.categoryLabels[earning.category]}</span>
                        ${earning.notes ? `<span>• ${earning.notes}</span>` : ''}
                    </div>
                </div>
                <div class="earning-amount">${currency}${this.formatAmount(earning.amount)}</div>
                <div class="earning-actions">
                    <button class="earning-action-btn edit-earning" data-id="${earning.id}" title="Edit">✏️</button>
                    <button class="earning-action-btn delete-earning" data-id="${earning.id}" title="Delete">🗑️</button>
                </div>
            </div>
        `).join('');

        // Update filtered total
        const total = this.calculateTotal(earnings);
        const filteredTotalEl = document.getElementById('filteredTotal');
        if (filteredTotalEl) {
            filteredTotalEl.textContent = `${currency}${this.formatAmount(total)}`;
        }

        // Add event listeners
        container.querySelectorAll('.edit-earning').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editEarning(btn.dataset.id);
            });
        });

        container.querySelectorAll('.delete-earning').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteEarning(btn.dataset.id);
            });
        });
    },

    /**
     * Edit an earning
     */
    editEarning(id) {
        const earning = Storage.getEarningById(id);
        if (!earning) return;

        // Populate form
        document.getElementById('earningId').value = id;
        document.getElementById('earningAmount').value = earning.amount;
        document.getElementById('earningCategory').value = earning.category;
        document.getElementById('earningDate').value = earning.date;
        document.getElementById('earningSource').value = earning.source || '';
        document.getElementById('earningNotes').value = earning.notes || '';
        document.getElementById('earningModalTitle').textContent = 'Edit Earning';

        // Open modal
        document.getElementById('addEarningModal').classList.add('active');
    },

    /**
     * Delete an earning
     */
    deleteEarning(id) {
        if (confirm('Are you sure you want to delete this earning?')) {
            Storage.deleteEarning(id);
            Notifications.show('Earning deleted', 'success');

            // Refresh displays
            if (typeof App !== 'undefined') {
                App.refreshDashboard();
            }
        }
    },

    /**
     * Format amount for display
     */
    formatAmount(amount) {
        const num = parseFloat(amount) || 0;
        if (num >= 100000) {
            return (num / 100000).toFixed(1) + 'L';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString('en-IN');
    },

    /**
     * Format date for display
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date >= today) {
            return 'Today';
        } else if (date >= yesterday) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    }
};
