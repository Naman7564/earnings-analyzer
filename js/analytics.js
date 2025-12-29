/**
 * Analytics Module - Insights and data analysis
 * Provides smart analytics for earnings data
 */

const Analytics = {
    /**
     * Get comprehensive analytics data
     */
    getAnalytics() {
        const earnings = Storage.getEarnings() || [];
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Basic stats
        const totalEntries = earnings.length;
        const totalAmount = Earnings.calculateTotal(earnings);

        // This month
        const monthlyEarnings = earnings.filter(e => new Date(e.date) >= monthStart);
        const monthlyTotal = Earnings.calculateTotal(monthlyEarnings);
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysPassed = now.getDate();
        const avgDaily = daysPassed > 0 ? monthlyTotal / daysPassed : 0;

        // By source
        const bySource = Earnings.getBySource();
        let topSource = null;
        let topSourceAmount = 0;
        Object.entries(bySource).forEach(([source, amount]) => {
            if (amount > topSourceAmount) {
                topSource = source;
                topSourceAmount = amount;
            }
        });

        // Best day
        const byDate = {};
        earnings.forEach(e => {
            if (!byDate[e.date]) byDate[e.date] = 0;
            byDate[e.date] += parseFloat(e.amount || 0);
        });

        let bestDay = null;
        let bestDayAmount = 0;
        Object.entries(byDate).forEach(([date, amount]) => {
            if (amount > bestDayAmount) {
                bestDay = date;
                bestDayAmount = amount;
            }
        });

        return {
            totalEntries,
            totalAmount,
            monthlyTotal,
            avgDaily,
            topSource,
            topSourceAmount,
            bestDay,
            bestDayAmount,
            bySource
        };
    },

    /**
     * Generate smart insights based on data
     */
    getInsights() {
        const earnings = Storage.getEarnings() || [];
        const insights = [];
        const profile = Storage.getProfile();
        const currency = profile?.currency || '₹';

        if (earnings.length === 0) {
            insights.push({
                icon: '🚀',
                text: 'Start adding your earnings to get personalized insights!'
            });
            return insights;
        }

        const summary = Earnings.getSummary();
        const analytics = this.getAnalytics();

        // Trend insight
        if (summary.trend > 0) {
            insights.push({
                icon: '📈',
                text: `Your earnings are up ${summary.trend}% compared to last month. Keep it up!`
            });
        } else if (summary.trend < 0) {
            insights.push({
                icon: '📉',
                text: `Your earnings are down ${Math.abs(summary.trend)}% from last month. Time to explore new opportunities!`
            });
        }

        // Top source insight
        if (analytics.topSource) {
            const percentage = analytics.totalAmount > 0
                ? ((analytics.topSourceAmount / analytics.totalAmount) * 100).toFixed(0)
                : 0;
            insights.push({
                icon: '🏆',
                text: `${Earnings.categoryLabels[analytics.topSource]} is your top earning source (${percentage}% of total earnings).`
            });
        }

        // Diversification insight
        const sources = Object.keys(analytics.bySource).length;
        if (sources === 1) {
            insights.push({
                icon: '💡',
                text: 'Consider diversifying your income streams for financial stability.'
            });
        } else if (sources >= 3) {
            insights.push({
                icon: '🌟',
                text: `Great job! You have ${sources} different income sources.`
            });
        }

        // Goal progress insight
        if (profile?.monthlyGoal > 0) {
            const progress = (summary.monthly / profile.monthlyGoal) * 100;
            const now = new Date();
            const daysPassed = now.getDate();
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const expectedProgress = (daysPassed / daysInMonth) * 100;

            if (progress >= expectedProgress) {
                insights.push({
                    icon: '🎯',
                    text: `You're ahead of your monthly goal! ${progress.toFixed(0)}% achieved with ${daysInMonth - daysPassed} days remaining.`
                });
            } else {
                const needed = profile.monthlyGoal - summary.monthly;
                const perDay = needed / (daysInMonth - daysPassed);
                insights.push({
                    icon: '💪',
                    text: `Earn ${currency}${Earnings.formatAmount(perDay)} per day to reach your monthly goal.`
                });
            }
        }

        // Weekly performance
        if (summary.weekly > 0) {
            const weeklyAvg = summary.weekly / 7;
            insights.push({
                icon: '📅',
                text: `This week: ${currency}${Earnings.formatAmount(summary.weekly)} earned (avg ${currency}${Earnings.formatAmount(weeklyAvg)}/day)`
            });
        }

        // Best day insight
        if (analytics.bestDay) {
            insights.push({
                icon: '🔥',
                text: `Your best earning day was ${Earnings.formatDate(analytics.bestDay)} with ${currency}${Earnings.formatAmount(analytics.bestDayAmount)}.`
            });
        }

        return insights.slice(0, 5); // Return top 5 insights
    },

    /**
     * Render insights in the dashboard
     */
    renderInsights() {
        const container = document.getElementById('insightsList');
        if (!container) return;

        const insights = this.getInsights();

        container.innerHTML = insights.map(insight => `
            <div class="insight-card">
                <span class="insight-icon">${insight.icon}</span>
                <p>${insight.text}</p>
            </div>
        `).join('');
    },

    /**
     * Update analytics view
     */
    updateAnalyticsView() {
        const analytics = this.getAnalytics();
        const profile = Storage.getProfile();
        const currency = profile?.currency || '₹';

        // Update analytics cards
        const topSourceEl = document.getElementById('topSource');
        const topSourceAmountEl = document.getElementById('topSourceAmount');
        const bestDayEl = document.getElementById('bestDay');
        const bestDayAmountEl = document.getElementById('bestDayAmount');
        const avgDailyEl = document.getElementById('avgDaily');
        const totalEntriesEl = document.getElementById('totalEntries');

        if (topSourceEl) {
            topSourceEl.textContent = analytics.topSource
                ? Earnings.categoryIcons[analytics.topSource]
                : '--';
        }
        if (topSourceAmountEl) {
            topSourceAmountEl.textContent = analytics.topSource
                ? `${currency}${Earnings.formatAmount(analytics.topSourceAmount)}`
                : 'No data yet';
        }
        if (bestDayEl) {
            bestDayEl.textContent = analytics.bestDay
                ? Earnings.formatDate(analytics.bestDay)
                : '--';
        }
        if (bestDayAmountEl) {
            bestDayAmountEl.textContent = analytics.bestDay
                ? `${currency}${Earnings.formatAmount(analytics.bestDayAmount)}`
                : 'No data yet';
        }
        if (avgDailyEl) {
            avgDailyEl.textContent = `${currency}${Earnings.formatAmount(analytics.avgDaily)}`;
        }
        if (totalEntriesEl) {
            totalEntriesEl.textContent = analytics.totalEntries;
        }

        // Update trend chart
        const trendPeriod = document.getElementById('trendPeriod')?.value || 30;
        const trendData = Earnings.getByDate(parseInt(trendPeriod));
        const trendLabels = Object.keys(trendData).map(d => {
            const date = new Date(d);
            return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        });
        const trendValues = Object.values(trendData);
        Charts.renderTrendChart(trendValues, trendLabels);

        // Update monthly comparison chart
        const monthlyData = Earnings.getMonthlyTotals(6);
        const monthlyLabels = Object.values(monthlyData).map(m => m.label);
        const monthlyValues = Object.values(monthlyData).map(m => m.total);
        Charts.renderMonthlyComparisonChart(monthlyValues, monthlyLabels);

        // Update source distribution chart
        const bySource = analytics.bySource;
        const sourceLabels = Object.keys(bySource);
        const sourceValues = Object.values(bySource);
        if (sourceLabels.length > 0) {
            Charts.renderSourceDistributionChart(sourceValues, sourceLabels);
        }
    },

    /**
     * Calculate streak (consecutive days with earnings)
     */
    getStreak() {
        const earnings = Storage.getEarnings() || [];
        if (earnings.length === 0) return 0;

        const dates = [...new Set(earnings.map(e => e.date))].sort().reverse();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Check if streak is active (today or yesterday has entry)
        if (dates[0] !== today && dates[0] !== yesterday) {
            return 0;
        }

        let streak = 1;
        let currentDate = new Date(dates[0]);

        for (let i = 1; i < dates.length; i++) {
            const prevDate = new Date(currentDate);
            prevDate.setDate(prevDate.getDate() - 1);

            if (dates[i] === prevDate.toISOString().split('T')[0]) {
                streak++;
                currentDate = prevDate;
            } else {
                break;
            }
        }

        return streak;
    }
};
