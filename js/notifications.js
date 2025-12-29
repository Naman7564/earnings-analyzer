/**
 * Notifications Module - Toast notifications and alerts
 * Handles in-app notifications and feedback
 */

const Notifications = {
    container: null,
    timeout: 4000,

    /**
     * Initialize notifications
     */
    init() {
        this.container = document.getElementById('toastContainer');
    },

    /**
     * Show a toast notification
     * @param {string} message - The notification message
     * @param {string} type - Type: 'success', 'error', 'info'
     * @param {string} icon - Optional custom icon
     */
    show(message, type = 'info', icon = null) {
        if (!this.container) {
            this.init();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const defaultIcons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️'
        };

        const toastIcon = icon || defaultIcons[type] || 'ℹ️';

        toast.innerHTML = `
            <span class="toast-icon">${toastIcon}</span>
            <div class="toast-content">
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close">×</button>
        `;

        // Add close functionality
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.dismiss(toast);
        });

        // Add to container
        this.container.appendChild(toast);

        // Auto dismiss
        setTimeout(() => {
            this.dismiss(toast);
        }, this.timeout);
    },

    /**
     * Dismiss a toast
     */
    dismiss(toast) {
        if (!toast || !toast.parentNode) return;

        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    },

    /**
     * Show success notification
     */
    success(message) {
        this.show(message, 'success');
    },

    /**
     * Show error notification
     */
    error(message) {
        this.show(message, 'error');
    },

    /**
     * Show info notification
     */
    info(message) {
        this.show(message, 'info');
    },

    /**
     * Show earning added notification with amount
     */
    earningAdded(amount, category) {
        const profile = Storage.getProfile();
        const currency = profile?.currency || '₹';
        const categoryLabel = Earnings.categoryLabels[category] || category;
        this.show(
            `${currency}${Earnings.formatAmount(amount)} added to ${categoryLabel}`,
            'success',
            '💰'
        );
    },

    /**
     * Show goal progress notification
     */
    goalProgress(percentage) {
        if (percentage >= 100) {
            this.show('🎉 Congratulations! You\'ve reached your monthly goal!', 'success', '🏆');
        } else if (percentage >= 75) {
            this.show(`Almost there! ${percentage.toFixed(0)}% of your goal completed.`, 'info', '🎯');
        } else if (percentage >= 50) {
            this.show(`Halfway there! ${percentage.toFixed(0)}% of your goal completed.`, 'info', '💪');
        }
    },

    /**
     * Check and show smart insights
     */
    showSmartInsight() {
        const insights = Analytics.getInsights();
        if (insights.length > 0) {
            const randomInsight = insights[Math.floor(Math.random() * insights.length)];
            this.show(randomInsight.text, 'info', randomInsight.icon);
        }
    }
};

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    Notifications.init();
});
