/**
 * App Module - Main Application Controller
 * Handles initialization, navigation, and global events
 */

const App = {
    currentView: 'dashboard',

    /**
     * Initialize the application
     */
    init() {
        // Initialize storage
        Storage.init();

        // Load theme
        this.loadTheme();

        // Setup event listeners
        this.setupNavigation();
        this.setupModals();
        this.setupForms();
        this.setupFilters();
        this.setupMobileMenu();

        // Initial render
        this.refreshDashboard();
        this.updateProfile();

        // Show welcome message if first time
        const profile = Storage.getProfile();
        if (!profile.name) {
            setTimeout(() => {
                Notifications.info('Welcome! Click your profile to get started.');
            }, 1000);
        }
    },

    /**
     * Load saved theme
     */
    loadTheme() {
        const settings = Storage.getSettings();
        const theme = settings?.theme || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeToggle(theme);
    },

    /**
     * Toggle theme
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        Storage.updateSettings({ theme: newTheme });
        this.updateThemeToggle(newTheme);

        // Update charts for new theme
        setTimeout(() => {
            this.refreshDashboard();
            if (this.currentView === 'analytics') {
                Analytics.updateAnalyticsView();
            }
        }, 100);
    },

    /**
     * Update theme toggle button
     */
    updateThemeToggle(theme) {
        const themeIcon = document.querySelector('.theme-icon');
        const themeText = document.querySelector('.theme-text');

        if (themeIcon) themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        if (themeText) themeText.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    },

    /**
     * Setup navigation
     */
    setupNavigation() {
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                this.navigateTo(view);
            });
        });

        // View all link
        document.querySelectorAll('.view-all-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.dataset.view;
                this.navigateTo(view);
            });
        });
    },

    /**
     * Navigate to a view
     */
    navigateTo(view) {
        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });

        // Update views
        document.querySelectorAll('.view').forEach(v => {
            v.classList.toggle('active', v.id === `${view}View`);
        });

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            earnings: 'Earnings',
            analytics: 'Analytics'
        };
        document.getElementById('pageTitle').textContent = titles[view] || 'Dashboard';

        // Load view-specific data
        this.currentView = view;

        if (view === 'earnings') {
            this.refreshEarningsView();
        } else if (view === 'analytics') {
            Analytics.updateAnalyticsView();
        } else if (view === 'dashboard') {
            this.refreshDashboard();
        }

        // Close mobile menu
        document.getElementById('sidebar')?.classList.remove('open');
    },

    /**
     * Setup modals
     */
    setupModals() {
        // Add Earning Modal
        const addEarningBtn = document.getElementById('addEarningBtn');
        const addEarningModal = document.getElementById('addEarningModal');
        const closeEarningModal = document.getElementById('closeEarningModal');
        const cancelEarningBtn = document.getElementById('cancelEarningBtn');

        addEarningBtn?.addEventListener('click', () => {
            this.openEarningModal();
        });

        closeEarningModal?.addEventListener('click', () => {
            this.closeModal('addEarningModal');
        });

        cancelEarningBtn?.addEventListener('click', () => {
            this.closeModal('addEarningModal');
        });

        // Profile Modal - clicking anywhere on profile card opens it
        const profileCard = document.getElementById('profileCard');
        const editProfileBtn = document.getElementById('editProfileBtn');
        const profileModal = document.getElementById('profileModal');
        const closeProfileModal = document.getElementById('closeProfileModal');
        const cancelProfileBtn = document.getElementById('cancelProfileBtn');

        profileCard?.addEventListener('click', () => {
            this.openProfileModal();
        });

        editProfileBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openProfileModal();
        });

        closeProfileModal?.addEventListener('click', () => {
            this.closeModal('profileModal');
        });

        cancelProfileBtn?.addEventListener('click', () => {
            this.closeModal('profileModal');
        });

        // Close modal on overlay click
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                    this.closeModal(modal.id);
                });
            }
        });
    },

    /**
     * Open earning modal
     */
    openEarningModal(earningId = null) {
        const form = document.getElementById('earningForm');
        const title = document.getElementById('earningModalTitle');

        form.reset();
        document.getElementById('earningId').value = '';

        // Set default date to today
        document.getElementById('earningDate').value = new Date().toISOString().split('T')[0];

        title.textContent = earningId ? 'Edit Earning' : 'Add New Earning';

        document.getElementById('addEarningModal').classList.add('active');
    },

    /**
     * Open profile modal
     */
    openProfileModal() {
        const profile = Storage.getProfile();

        document.getElementById('profileNameInput').value = profile.name || '';
        document.getElementById('profileUsername').value = profile.username || '';
        document.getElementById('profileEmail').value = profile.email || '';
        document.getElementById('profileMobile').value = profile.mobile || '';
        document.getElementById('profileCurrency').value = profile.currency || '₹';
        document.getElementById('profileOccupationInput').value = profile.occupation || 'student';

        // Update avatar preview
        const avatarPreview = document.getElementById('avatarPreview');
        if (profile.avatar) {
            avatarPreview.innerHTML = `<img src="${profile.avatar}" alt="Profile">`;
        } else {
            avatarPreview.innerHTML = '👤';
        }

        // Update stats
        const createdAt = new Date(profile.createdAt);
        document.getElementById('memberSince').textContent = createdAt.toLocaleDateString('en-IN', {
            month: 'short',
            year: 'numeric'
        });

        const summary = Earnings.getSummary();
        const currency = profile.currency || '₹';
        document.getElementById('profileTotalEarnings').textContent =
            `${currency}${Earnings.formatAmount(summary.total)}`;

        document.getElementById('profileModal').classList.add('active');
    },

    /**
     * Close modal
     */
    closeModal(modalId) {
        document.getElementById(modalId)?.classList.remove('active');
    },

    /**
     * Setup forms
     */
    setupForms() {
        // Earning Form
        document.getElementById('earningForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEarning();
        });

        // Profile Form
        document.getElementById('profileForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });

        // Avatar Upload
        document.getElementById('avatarUpload')?.addEventListener('change', (e) => {
            this.handleAvatarUpload(e);
        });
    },

    /**
     * Save earning
     */
    saveEarning() {
        const earningId = document.getElementById('earningId').value;
        const amount = parseFloat(document.getElementById('earningAmount').value);
        const category = document.getElementById('earningCategory').value;
        const date = document.getElementById('earningDate').value;
        const source = document.getElementById('earningSource').value;
        const notes = document.getElementById('earningNotes').value;

        if (!amount || !category || !date) {
            Notifications.error('Please fill in all required fields.');
            return;
        }

        const earning = {
            amount,
            category,
            date,
            source,
            notes
        };

        if (earningId) {
            Storage.updateEarning(earningId, earning);
            Notifications.success('Earning updated successfully!');
        } else {
            Storage.addEarning(earning);
            Notifications.earningAdded(amount, category);
        }

        this.closeModal('addEarningModal');
        this.refreshDashboard();
    },

    /**
     * Save profile
     */
    saveProfile() {
        const updates = {
            name: document.getElementById('profileNameInput').value,
            username: document.getElementById('profileUsername').value,
            email: document.getElementById('profileEmail').value,
            mobile: document.getElementById('profileMobile').value,
            currency: document.getElementById('profileCurrency').value,
            occupation: document.getElementById('profileOccupationInput').value
        };

        Storage.updateProfile(updates);
        this.updateProfile();
        this.closeModal('profileModal');
        Notifications.success('Profile updated successfully!');

        // Refresh dashboard for currency changes
        this.refreshDashboard();
    },

    /**
     * Handle avatar upload
     */
    handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = event.target.result;
            document.getElementById('avatarPreview').innerHTML =
                `<img src="${imageData}" alt="Profile">`;
            Storage.updateProfile({ avatar: imageData });
        };
        reader.readAsDataURL(file);
    },

    /**
     * Setup filters
     */
    setupFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const dateFilter = document.getElementById('dateFilter');
        const overviewPeriod = document.getElementById('overviewPeriod');
        const trendPeriod = document.getElementById('trendPeriod');

        categoryFilter?.addEventListener('change', () => this.refreshEarningsView());
        dateFilter?.addEventListener('change', () => this.refreshEarningsView());
        overviewPeriod?.addEventListener('change', () => this.updateOverviewChart());
        trendPeriod?.addEventListener('change', () => Analytics.updateAnalyticsView());
    },

    /**
     * Refresh earnings view with filters
     */
    refreshEarningsView() {
        const category = document.getElementById('categoryFilter')?.value || 'all';
        const dateRange = document.getElementById('dateFilter')?.value || 'all';

        Earnings.renderFilteredList('allEarningsList', { category, dateRange });
    },

    /**
     * Setup mobile menu
     */
    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.getElementById('sidebar');

        mobileMenuBtn?.addEventListener('click', () => {
            sidebar?.classList.toggle('open');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar?.contains(e.target) && !mobileMenuBtn?.contains(e.target)) {
                    sidebar?.classList.remove('open');
                }
            }
        });
    },

    /**
     * Update profile display
     */
    updateProfile() {
        const profile = Storage.getProfile();

        // Update profile card
        const profileName = document.getElementById('profileName');
        const profileOccupation = document.getElementById('profileOccupation');
        const avatarPlaceholder = document.getElementById('avatarPlaceholder');
        const profileImg = document.getElementById('profileImg');

        if (profileName) {
            profileName.textContent = profile.name || 'Welcome!';
        }

        if (profileOccupation) {
            const occupationLabels = {
                student: 'Student',
                freelancer: 'Freelancer',
                employee: 'Employee',
                business: 'Business Owner',
                other: 'Other'
            };
            profileOccupation.textContent = profile.name
                ? occupationLabels[profile.occupation] || 'Set up your profile'
                : 'Set up your profile';
        }

        if (profile.avatar) {
            if (profileImg) {
                profileImg.src = profile.avatar;
                profileImg.style.display = 'block';
            }
            if (avatarPlaceholder) {
                avatarPlaceholder.style.display = 'none';
            }
        } else {
            if (profileImg) profileImg.style.display = 'none';
            if (avatarPlaceholder) avatarPlaceholder.style.display = 'block';
        }
    },

    /**
     * Refresh main dashboard
     */
    refreshDashboard() {
        const summary = Earnings.getSummary();
        const profile = Storage.getProfile();
        const currency = profile?.currency || '₹';

        // Update summary cards
        document.getElementById('totalEarnings').textContent =
            `${currency}${Earnings.formatAmount(summary.total)}`;
        document.getElementById('weeklyEarnings').textContent =
            `${currency}${Earnings.formatAmount(summary.weekly)}`;
        document.getElementById('monthlyEarnings').textContent =
            `${currency}${Earnings.formatAmount(summary.monthly)}`;

        // Calculate yearly earnings
        const now = new Date();
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const allEarnings = Storage.getEarnings() || [];
        const yearlyEarnings = allEarnings.filter(e => new Date(e.date) >= yearStart);
        const yearlyTotal = yearlyEarnings.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

        const yearlyEl = document.getElementById('yearlyEarnings');
        const yearlyTrendEl = document.getElementById('yearlyTrend');
        if (yearlyEl) yearlyEl.textContent = `${currency}${Earnings.formatAmount(yearlyTotal)}`;
        if (yearlyTrendEl) yearlyTrendEl.textContent = `${yearlyEarnings.length} entries`;

        // Update trends
        const trendEl = document.getElementById('totalTrend');
        if (trendEl) {
            const trend = parseFloat(summary.trend);
            trendEl.textContent = `${trend >= 0 ? '+' : ''}${trend}% from last month`;
            trendEl.className = `card-trend ${trend >= 0 ? 'positive' : 'negative'}`;
        }

        document.getElementById('weeklyTrend').textContent = `${summary.weeklyCount} entries`;
        document.getElementById('monthlyTrend').textContent = `${summary.monthlyCount} entries`;

        // Update charts
        this.updateOverviewChart();
        this.updateSourceChart();

        // Update recent earnings
        Earnings.renderList('recentEarningsList', 5);

        // Update insights
        Analytics.renderInsights();
    },

    /**
     * Update overview chart based on selected period
     */
    updateOverviewChart() {
        const period = document.getElementById('overviewPeriod')?.value || 'month';

        let data, labels;

        if (period === 'week') {
            const byDate = Earnings.getByDate(7);
            labels = Object.keys(byDate).map(d => {
                const date = new Date(d);
                return date.toLocaleDateString('en-IN', { weekday: 'short' });
            });
            data = Object.values(byDate);
        } else if (period === 'month') {
            const byDate = Earnings.getByDate(30);
            // Group by week
            const weeks = [];
            const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
            const values = Object.values(byDate);

            for (let i = 0; i < 5; i++) {
                const weekStart = i * 7;
                const weekEnd = Math.min((i + 1) * 7, values.length);
                const weekSum = values.slice(weekStart, weekEnd).reduce((a, b) => a + b, 0);
                if (weekEnd <= values.length) {
                    weeks.push(weekSum);
                }
            }

            labels = weekLabels.slice(0, weeks.length);
            data = weeks;
        } else { // year
            const monthlyData = Earnings.getMonthlyTotals(12);
            labels = Object.values(monthlyData).map(m => m.label);
            data = Object.values(monthlyData).map(m => m.total);
        }

        Charts.renderOverviewChart(data, labels);
    },

    /**
     * Update source distribution chart
     */
    updateSourceChart() {
        const bySource = Earnings.getBySource();
        const labels = Object.keys(bySource);
        const data = Object.values(bySource);

        if (labels.length > 0) {
            Charts.renderSourceChart(data, labels);
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
