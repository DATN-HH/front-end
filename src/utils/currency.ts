// Supported currencies with their configurations
export interface CurrencyConfig {
    code: string;
    symbol: string;
    decimalPlaces: number;
    displayName: string;
    locale: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
    USD: { code: 'USD', symbol: '$', decimalPlaces: 2, displayName: 'US Dollar', locale: 'en-US' },
    VND: { code: 'VND', symbol: '₫', decimalPlaces: 0, displayName: 'Vietnamese Dong', locale: 'vi-VN' },
    EUR: { code: 'EUR', symbol: '€', decimalPlaces: 2, displayName: 'Euro', locale: 'de-DE' },
    GBP: { code: 'GBP', symbol: '£', decimalPlaces: 2, displayName: 'British Pound Sterling', locale: 'en-GB' },
    JPY: { code: 'JPY', symbol: '¥', decimalPlaces: 0, displayName: 'Japanese Yen', locale: 'ja-JP' },
    CNY: { code: 'CNY', symbol: '¥', decimalPlaces: 2, displayName: 'Chinese Yuan', locale: 'zh-CN' },
    SGD: { code: 'SGD', symbol: 'S$', decimalPlaces: 2, displayName: 'Singapore Dollar', locale: 'en-SG' },
    THB: { code: 'THB', symbol: '฿', decimalPlaces: 2, displayName: 'Thai Baht', locale: 'th-TH' },
};

// Legacy function for backward compatibility
export const formatCurrency = (amount: number | undefined | null) => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

// Enhanced currency formatting with multi-currency support
export const formatMoney = (
    amount: number | undefined | null,
    currencyCode: string = 'USD'
): string => {
    if (!amount && amount !== 0) return '-';

    const config = SUPPORTED_CURRENCIES[currencyCode.toUpperCase()];
    if (!config) {
        // Fallback for unsupported currencies
        return `${currencyCode} ${amount.toFixed(2)}`;
    }

    try {
        return new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: config.code,
            minimumFractionDigits: config.decimalPlaces,
            maximumFractionDigits: config.decimalPlaces,
        }).format(amount);
    } catch (error) {
        // Fallback if Intl.NumberFormat fails
        return `${config.symbol}${amount.toFixed(config.decimalPlaces)}`;
    }
};

export const formatNumber = (value: number | undefined | null) => {
    if (!value && value !== 0) return '';
    return new Intl.NumberFormat('vi-VN').format(value);
};

export const parseNumber = (value: string) => {
    // Remove all non-digit characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? undefined : num;
};

// Format number with thousand separators for display
export const formatNumberInput = (value: number | undefined) => {
    if (!value && value !== 0) return '';
    return value.toLocaleString('vi-VN');
};

// Parse formatted number back to number
export const parseNumberInput = (value: string) => {
    if (!value) return undefined;
    // Remove thousand separators and convert to number
    const cleaned = value.replace(/,/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? undefined : num;
};

// Format money value without currency symbol (just the number)
export const formatMoneyNumber = (
    amount: number | undefined | null,
    currencyCode: string = 'USD'
): string => {
    if (!amount && amount !== 0) return '';

    const config = SUPPORTED_CURRENCIES[currencyCode.toUpperCase()];
    if (!config) {
        return amount.toFixed(2);
    }

    try {
        return new Intl.NumberFormat(config.locale, {
            minimumFractionDigits: config.decimalPlaces,
            maximumFractionDigits: config.decimalPlaces,
        }).format(amount);
    } catch (error) {
        return amount.toFixed(config.decimalPlaces);
    }
};

// Parse money string back to number
export const parseMoney = (value: string, currencyCode: string = 'USD'): number | undefined => {
    if (!value || value.trim() === '') return undefined;

    const config = SUPPORTED_CURRENCIES[currencyCode.toUpperCase()];

    // Remove currency symbol and whitespace
    let cleaned = value.trim();
    if (config) {
        cleaned = cleaned.replace(config.symbol, '').trim();
    }

    // Remove thousand separators
    cleaned = cleaned.replace(/,/g, '');

    const num = parseFloat(cleaned);
    return isNaN(num) ? undefined : num;
};

// Validate money value for a currency
export const validateMoneyValue = (
    value: number | undefined | null,
    currencyCode: string = 'USD'
): { isValid: boolean; error?: string } => {
    if (value === null || value === undefined) {
        return { isValid: false, error: 'Value is required' };
    }

    const config = SUPPORTED_CURRENCIES[currencyCode.toUpperCase()];
    if (!config) {
        return { isValid: false, error: `Unsupported currency: ${currencyCode}` };
    }

    // Check decimal places
    const decimalPlaces = (value.toString().split('.')[1] || '').length;
    if (decimalPlaces > config.decimalPlaces) {
        return {
            isValid: false,
            error: `Too many decimal places for ${config.code}. Maximum: ${config.decimalPlaces}`
        };
    }

    // Check value range (basic validation)
    const maxValue = 999999999.9999;
    const minValue = -999999999.9999;

    if (value > maxValue || value < minValue) {
        return { isValid: false, error: 'Value is out of allowed range' };
    }

    return { isValid: true };
};

// Get currency symbol
export const getCurrencySymbol = (currencyCode: string): string => {
    const config = SUPPORTED_CURRENCIES[currencyCode.toUpperCase()];
    return config ? config.symbol : currencyCode;
};

// Get currency display text for UI
export const getCurrencyDisplayText = (currencyCode: string): string => {
    const config = SUPPORTED_CURRENCIES[currencyCode.toUpperCase()];
    return config ? `${config.code} (${config.symbol}) - ${config.displayName}` : currencyCode;
};

// Get all supported currency codes
export const getSupportedCurrencies = (): string[] => {
    return Object.keys(SUPPORTED_CURRENCIES);
};

// Check if currency uses decimal places
export const currencyHasDecimals = (currencyCode: string): boolean => {
    const config = SUPPORTED_CURRENCIES[currencyCode.toUpperCase()];
    return config ? config.decimalPlaces > 0 : true;
};

// Format for compact display (K, M notation)
export const formatMoneyCompact = (
    amount: number | undefined | null,
    currencyCode: string = 'USD'
): string => {
    if (!amount && amount !== 0) return '-';

    const config = SUPPORTED_CURRENCIES[currencyCode.toUpperCase()];
    const symbol = config ? config.symbol : currencyCode;

    if (Math.abs(amount) >= 1000000) {
        return `${symbol}${(amount / 1000000).toFixed(1)}M`;
    } else if (Math.abs(amount) >= 1000) {
        return `${symbol}${(amount / 1000).toFixed(1)}K`;
    } else {
        return formatMoney(amount, currencyCode);
    }
};
