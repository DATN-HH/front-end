// Helper functions for formatting data

export const formatCurrency = (amount: number): string => {
    if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)}K VND`;
    }
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

export const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const formatNumber = (num: number): string => {
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
};
