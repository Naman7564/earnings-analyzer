/**
 * Goals Module - Goal tracking and achievements
 * Manages earning goals and achievement badges
 */

const Goals = {
    achievements: {
        firstEarning: {
            id: 'firstEarning',
            icon: '🌟',
            title: 'First Earning',
            description: 'Add your first earning entry'
        },
        diversified: {
            id: 'diversified',
            icon: '📊',
            title: 'Diversified',
            description: 'Earn from 3+ sources'
        },
        goalSetter: {
            id: 'goalSetter',
            icon: '🎯',
            title: 'Goal Setter',
            description: 'Set your first monthly goal'
        },
        goalCrusher: {
            id: 'goalCrusher',
            icon: '💪',
            title: 'Goal Crusher',
            description: 'Achieve 100% of monthly goal'
        },
        onFire: {
            id: 'onFire',
            icon: '🔥',
            title: 'On Fire',
            description: '7-day earning streak'
        },
        highRoller: {
            id: 'highRoller',
            icon: '💰',
            title: 'High Roller',
            description: 'Earn ₹10,000+ in a single entry'
        }
    },

    /**
     * Get current goal progress
     */
    getProgress() {
        const profile = Storage.getProfile();
        const monthlyGoal = profile?.monthlyGoal || 0;
        const summary = Earnings.getSummary();
        const monthlyEarned = summary.monthly;

        const percentage = monthlyGoal > 0
            ? Math.min((monthlyEarned / monthlyGoal) * 100, 100)
            : 0;

        const remaining = Math.max(monthlyGoal - monthlyEarned, 0);

        return {
            goal: monthlyGoal,
            earned: monthlyEarned,
            remaining,
            percentage: percentage.toFixed(1),
            isComplete: monthlyEarned >= monthlyGoal && monthlyGoal > 0
        };
    },

    /**
     * Update goal display in dashboard
     */
    updateDashboardGoal() {
        const progress = this.getProgress();
        const profile = Storage.getProfile();
        const currency = profile?.currency || '₹';

        const goalProgressEl = document.getElementById('goalProgress');
        const goalFillEl = document.getElementById('goalProgressFill');

        if (goalProgressEl) {
            goalProgressEl.textContent = progress.goal > 0
                ? `${progress.percentage}%`
                : 'Not set';
        }
        if (goalFillEl) {
            goalFillEl.style.width = `${progress.percentage}%`;
        }
    },

    /**
     * Update goals view
     */
    updateGoalsView() {
        const progress = this.getProgress();
        const profile = Storage.getProfile();
        const currency = profile?.currency || '₹';

        // Update goal card
        const goalAmountEl = document.getElementById('currentGoalAmount');
        const goalEarnedEl = document.getElementById('goalEarned');
        const goalRemainingEl = document.getElementById('goalRemaining');
        const goalFillLargeEl = document.getElementById('goalFillLarge');

        if (goalAmountEl) {
            goalAmountEl.textContent = progress.goal > 0
                ? `${currency}${Earnings.formatAmount(progress.goal)}`
                : 'Not set';
        }
        if (goalEarnedEl) {
            goalEarnedEl.textContent = `${currency}${Earnings.formatAmount(progress.earned)}`;
        }
        if (goalRemainingEl) {
            goalRemainingEl.textContent = `${currency}${Earnings.formatAmount(progress.remaining)}`;
        }
        if (goalFillLargeEl) {
            goalFillLargeEl.style.width = `${progress.percentage}%`;
        }

        // Update achievements
        this.updateAchievements();
    },

    /**
     * Check and unlock achievements
     */
    checkAchievements() {
        const earnings = Storage.getEarnings() || [];
        const profile = Storage.getProfile();
        const unlockedAchievements = [];

        // First Earning
        if (earnings.length >= 1) {
            if (Storage.unlockAchievement('firstEarning')) {
                unlockedAchievements.push(this.achievements.firstEarning);
            }
        }

        // Diversified (3+ sources)
        const sources = new Set(earnings.map(e => e.category)).size;
        if (sources >= 3) {
            if (Storage.unlockAchievement('diversified')) {
                unlockedAchievements.push(this.achievements.diversified);
            }
        }

        // Goal Setter
        if (profile?.monthlyGoal > 0) {
            if (Storage.unlockAchievement('goalSetter')) {
                unlockedAchievements.push(this.achievements.goalSetter);
            }
        }

        // Goal Crusher
        const progress = this.getProgress();
        if (progress.isComplete) {
            if (Storage.unlockAchievement('goalCrusher')) {
                unlockedAchievements.push(this.achievements.goalCrusher);
            }
        }

        // On Fire (7-day streak)
        const streak = Analytics.getStreak();
        if (streak >= 7) {
            if (Storage.unlockAchievement('onFire')) {
                unlockedAchievements.push(this.achievements.onFire);
            }
        }

        // High Roller (10K+ single entry)
        const hasHighRoller = earnings.some(e => parseFloat(e.amount) >= 10000);
        if (hasHighRoller) {
            if (Storage.unlockAchievement('highRoller')) {
                unlockedAchievements.push(this.achievements.highRoller);
            }
        }

        // Show notifications for newly unlocked achievements
        unlockedAchievements.forEach(achievement => {
            Notifications.show(
                `Achievement Unlocked: ${achievement.title}!`,
                'success',
                achievement.icon
            );
        });

        return unlockedAchievements;
    },

    /**
     * Update achievements display
     */
    updateAchievements() {
        const container = document.getElementById('achievementsGrid');
        if (!container) return;

        const unlockedAchievements = Storage.getAchievements() || {};

        container.innerHTML = Object.values(this.achievements).map(achievement => `
            <div class="achievement-card ${unlockedAchievements[achievement.id] ? 'unlocked' : 'locked'}">
                <span class="achievement-icon">${achievement.icon}</span>
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
            </div>
        `).join('');
    },

    /**
     * Get motivational tips
     */
    getTips() {
        const earnings = Storage.getEarnings() || [];
        const profile = Storage.getProfile();
        const tips = [];

        // Default tips
        const defaultTips = [
            'Track all your cashback and reward earnings from UPI apps',
            'Share referral codes to earn passive bonuses',
            'Consider freelance opportunities in your skill area',
            'Invest in skills that can increase your earning potential',
            'Set realistic monthly goals and work towards them consistently',
            'Review your expenses to find areas to save money'
        ];

        // Personalized tips based on occupation
        if (profile?.occupation === 'student') {
            tips.push('Look for internship opportunities that offer stipends');
            tips.push('Participate in coding competitions with cash prizes');
            tips.push('Offer tutoring services in subjects you excel at');
        } else if (profile?.occupation === 'freelancer') {
            tips.push('Build a strong portfolio to attract higher-paying clients');
            tips.push('Diversify your client base to reduce dependency');
            tips.push('Consider creating passive income through digital products');
        } else if (profile?.occupation === 'employee') {
            tips.push('Look for side projects that complement your skills');
            tips.push('Consider upskilling for better salary negotiations');
            tips.push('Explore investment opportunities for passive income');
        }

        // Add default tips
        tips.push(...defaultTips.slice(0, 3));

        return tips.slice(0, 5);
    },

    /**
     * Render tips in goals view
     */
    renderTips() {
        const container = document.getElementById('tipsList');
        if (!container) return;

        const tips = this.getTips();

        container.innerHTML = tips.map((tip, index) => `
            <div class="tip-card">
                <span class="tip-number">${index + 1}</span>
                <p>${tip}</p>
            </div>
        `).join('');
    }
};
