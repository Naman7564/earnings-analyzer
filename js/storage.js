/**
 * Storage Module - LocalStorage abstraction layer
 * Handles all data persistence for the Earnings Analyzer app
 */

const Storage = {
    KEYS: {
        PROFILE: 'earningsAnalyzer_profile',
        EARNINGS: 'earningsAnalyzer_earnings',
        SETTINGS: 'earningsAnalyzer_settings',
        ACHIEVEMENTS: 'earningsAnalyzer_achievements'
    },

    /**
     * Initialize storage with default values if empty
     */
    init() {
        if (!this.getProfile()) {
            this.saveProfile({
                name: '',
                username: '',
                email: '',
                mobile: '',
                currency: '₹',
                occupation: 'student',
                monthlyGoal: 0,
                avatar: '',
                createdAt: new Date().toISOString(),
                verified: false
            });
        }

        if (!this.getEarnings()) {
            this.saveEarnings([]);
        }

        if (!this.getSettings()) {
            this.saveSettings({
                theme: 'light',
                notifications: true
            });
        }

        if (!this.getAchievements()) {
            this.saveAchievements({
                firstEarning: false,
                diversified: false,
                goalSetter: false,
                goalCrusher: false,
                onFire: false,
                highRoller: false
            });
        }
    },

    // ==================== Profile Methods ====================
    
    getProfile() {
        const data = localStorage.getItem(this.KEYS.PROFILE);
        return data ? JSON.parse(data) : null;
    },

    saveProfile(profile) {
        localStorage.setItem(this.KEYS.PROFILE, JSON.stringify(profile));
    },

    updateProfile(updates) {
        const profile = this.getProfile();
        const updated = { ...profile, ...updates };
        this.saveProfile(updated);
        return updated;
    },

    // ==================== Earnings Methods ====================
    
    getEarnings() {
        const data = localStorage.getItem(this.KEYS.EARNINGS);
        return data ? JSON.parse(data) : null;
    },

    saveEarnings(earnings) {
        localStorage.setItem(this.KEYS.EARNINGS, JSON.stringify(earnings));
    },

    addEarning(earning) {
        const earnings = this.getEarnings() || [];
        earning.id = this.generateId();
        earning.createdAt = new Date().toISOString();
        earnings.unshift(earning);
        this.saveEarnings(earnings);
        return earning;
    },

    updateEarning(id, updates) {
        const earnings = this.getEarnings() || [];
        const index = earnings.findIndex(e => e.id === id);
        if (index !== -1) {
            earnings[index] = { ...earnings[index], ...updates, updatedAt: new Date().toISOString() };
            this.saveEarnings(earnings);
            return earnings[index];
        }
        return null;
    },

    deleteEarning(id) {
        const earnings = this.getEarnings() || [];
        const filtered = earnings.filter(e => e.id !== id);
        this.saveEarnings(filtered);
        return filtered;
    },

    getEarningById(id) {
        const earnings = this.getEarnings() || [];
        return earnings.find(e => e.id === id);
    },

    // ==================== Settings Methods ====================
    
    getSettings() {
        const data = localStorage.getItem(this.KEYS.SETTINGS);
        return data ? JSON.parse(data) : null;
    },

    saveSettings(settings) {
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    },

    updateSettings(updates) {
        const settings = this.getSettings();
        const updated = { ...settings, ...updates };
        this.saveSettings(updated);
        return updated;
    },

    // ==================== Achievements Methods ====================
    
    getAchievements() {
        const data = localStorage.getItem(this.KEYS.ACHIEVEMENTS);
        return data ? JSON.parse(data) : null;
    },

    saveAchievements(achievements) {
        localStorage.setItem(this.KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    },

    unlockAchievement(achievement) {
        const achievements = this.getAchievements();
        if (achievements && !achievements[achievement]) {
            achievements[achievement] = true;
            this.saveAchievements(achievements);
            return true; // Achievement newly unlocked
        }
        return false;
    },

    // ==================== Utility Methods ====================
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    },

    exportData() {
        return {
            profile: this.getProfile(),
            earnings: this.getEarnings(),
            settings: this.getSettings(),
            achievements: this.getAchievements(),
            exportedAt: new Date().toISOString()
        };
    },

    importData(data) {
        if (data.profile) this.saveProfile(data.profile);
        if (data.earnings) this.saveEarnings(data.earnings);
        if (data.settings) this.saveSettings(data.settings);
        if (data.achievements) this.saveAchievements(data.achievements);
    }
};

// Initialize storage on load
Storage.init();
