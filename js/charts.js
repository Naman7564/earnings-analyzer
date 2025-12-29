/**
 * Charts Module - Chart.js integration
 * Handles all chart rendering for the Earnings Analyzer
 */

const Charts = {
    instances: {},
    colors: {
        cashback: '#10b981',
        referral: '#f59e0b',
        freelance: '#6366f1',
        salary: '#8b5cf6',
        business: '#ec4899',
        passive: '#06b6d4'
    },

    /**
     * Get chart colors based on current theme
     */
    getThemeColors() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return {
            text: isDark ? '#f1f5f9' : '#1a202c',
            grid: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            background: isDark ? '#1e293b' : '#ffffff'
        };
    },

    /**
     * Default chart options
     */
    getDefaultOptions() {
        const themeColors = this.getThemeColors();
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: themeColors.text,
                        font: {
                            family: "'Inter', sans-serif"
                        }
                    }
                },
                tooltip: {
                    backgroundColor: themeColors.background,
                    titleColor: themeColors.text,
                    bodyColor: themeColors.text,
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        family: "'Inter', sans-serif",
                        weight: 600
                    },
                    bodyFont: {
                        family: "'Inter', sans-serif"
                    }
                }
            }
        };
    },

    /**
     * Create or update overview bar chart
     */
    renderOverviewChart(data, labels) {
        const ctx = document.getElementById('overviewChart');
        if (!ctx) return;

        const themeColors = this.getThemeColors();

        if (this.instances.overview) {
            this.instances.overview.destroy();
        }

        this.instances.overview = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Earnings',
                    data: data,
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                ...this.getDefaultOptions(),
                plugins: {
                    ...this.getDefaultOptions().plugins,
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: themeColors.text
                        }
                    },
                    y: {
                        grid: {
                            color: themeColors.grid
                        },
                        ticks: {
                            color: themeColors.text,
                            callback: function (value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Create or update source distribution doughnut chart
     */
    renderSourceChart(data, labels) {
        const ctx = document.getElementById('sourceChart');
        if (!ctx) return;

        if (this.instances.source) {
            this.instances.source.destroy();
        }

        const backgroundColors = labels.map(label => this.colors[label] || '#718096');

        this.instances.source = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels.map(l => this.getCategoryLabel(l)),
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                ...this.getDefaultOptions(),
                cutout: '65%',
                plugins: {
                    ...this.getDefaultOptions().plugins,
                    legend: {
                        position: 'bottom',
                        labels: {
                            ...this.getDefaultOptions().plugins.legend.labels,
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                }
            }
        });
    },

    /**
     * Create or update trend line chart
     */
    renderTrendChart(data, labels) {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        const themeColors = this.getThemeColors();

        if (this.instances.trend) {
            this.instances.trend.destroy();
        }

        this.instances.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Earnings',
                    data: data,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                ...this.getDefaultOptions(),
                plugins: {
                    ...this.getDefaultOptions().plugins,
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: themeColors.text,
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        grid: {
                            color: themeColors.grid
                        },
                        ticks: {
                            color: themeColors.text,
                            callback: function (value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Create or update monthly comparison chart
     */
    renderMonthlyComparisonChart(data, labels) {
        const ctx = document.getElementById('monthlyComparisonChart');
        if (!ctx) return;

        const themeColors = this.getThemeColors();

        if (this.instances.monthlyComparison) {
            this.instances.monthlyComparison.destroy();
        }

        this.instances.monthlyComparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Monthly Earnings',
                    data: data,
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(6, 182, 212, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)'
                    ],
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                ...this.getDefaultOptions(),
                plugins: {
                    ...this.getDefaultOptions().plugins,
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: themeColors.text
                        }
                    },
                    y: {
                        grid: {
                            color: themeColors.grid
                        },
                        ticks: {
                            color: themeColors.text,
                            callback: function (value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Create source distribution chart for analytics
     */
    renderSourceDistributionChart(data, labels) {
        const ctx = document.getElementById('sourceDistributionChart');
        if (!ctx) return;

        if (this.instances.sourceDistribution) {
            this.instances.sourceDistribution.destroy();
        }

        const backgroundColors = labels.map(label => this.colors[label] || '#718096');

        this.instances.sourceDistribution = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels.map(l => this.getCategoryLabel(l)),
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                ...this.getDefaultOptions(),
                plugins: {
                    ...this.getDefaultOptions().plugins,
                    legend: {
                        position: 'bottom',
                        labels: {
                            ...this.getDefaultOptions().plugins.legend.labels,
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                }
            }
        });
    },

    /**
     * Get category display label
     */
    getCategoryLabel(category) {
        const labels = {
            cashback: '💳 Cashback',
            referral: '🤝 Referral',
            freelance: '💼 Freelance',
            salary: '💰 Salary',
            business: '🏢 Business',
            passive: '📈 Passive'
        };
        return labels[category] || category;
    },

    /**
     * Update all charts (call when theme changes)
     */
    updateTheme() {
        Object.values(this.instances).forEach(chart => {
            if (chart) {
                chart.options = { ...chart.options, ...this.getDefaultOptions() };
                chart.update();
            }
        });
    },

    /**
     * Destroy all chart instances
     */
    destroyAll() {
        Object.values(this.instances).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.instances = {};
    }
};
