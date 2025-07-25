'use client';

import { useState, useEffect } from 'react';

import { 
    SUPPORTED_CURRENCIES, 
    formatMoneyNumber, 
    parseMoney, 
    getCurrencyDisplayText,
    validateMoneyValue 
} from '@/utils/currency';

import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface MoneyInputProps {
    value?: number;
    currencyCode?: string;
    onChange: (value: number | undefined, currencyCode: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    min?: number;
    max?: number;
    showCurrencyLabel?: boolean;
}

export function MoneyInput({
    value,
    currencyCode = 'USD',
    onChange,
    placeholder = '0',
    className,
    disabled,
    min,
    max,
    showCurrencyLabel = true,
}: MoneyInputProps) {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [currentCurrency, setCurrentCurrency] = useState(currencyCode);

    // Update display value when value prop changes
    useEffect(() => {
        if (!isFocused) {
            if (value !== undefined && value !== null) {
                setDisplayValue(formatMoneyNumber(value, currentCurrency));
            } else {
                setDisplayValue('');
            }
        }
    }, [value, currentCurrency, isFocused]);

    // Update currency when prop changes
    useEffect(() => {
        setCurrentCurrency(currencyCode);
    }, [currencyCode]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setDisplayValue(inputValue);

        // Parse the value
        const parsedValue = parseMoney(inputValue, currentCurrency);
        
        // Validate range
        if (parsedValue !== undefined) {
            if ((min !== undefined && parsedValue < min) || 
                (max !== undefined && parsedValue > max)) {
                return; // Don't update if out of range
            }
        }

        onChange(parsedValue, currentCurrency);
    };

    const handleCurrencyChange = (newCurrency: string) => {
        setCurrentCurrency(newCurrency);
        onChange(value, newCurrency);
    };

    const handleFocus = () => {
        setIsFocused(true);
        // Show raw number when focused
        if (value !== undefined && value !== null) {
            setDisplayValue(value.toString());
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        
        // Validate the final value
        if (value !== undefined) {
            const validation = validateMoneyValue(value, currentCurrency);
            if (!validation.isValid) {
                // Reset to previous valid value or empty
                setDisplayValue('');
                onChange(undefined, currentCurrency);
                return;
            }
        }

        // Format with currency-specific formatting when not focused
        if (value !== undefined && value !== null) {
            setDisplayValue(formatMoneyNumber(value, currentCurrency));
        } else if (displayValue === '') {
            setDisplayValue('');
        }
    };

    const currencyConfig = SUPPORTED_CURRENCIES[currentCurrency.toUpperCase()];
    const currencySymbol = currencyConfig ? currencyConfig.symbol : currentCurrency;

    return (
        <div className={`flex gap-2 ${className || ''}`}>
            {/* Currency Selector */}
            <Select
                value={currentCurrency}
                onValueChange={handleCurrencyChange}
                disabled={disabled}
            >
                <SelectTrigger className="w-32">
                    <SelectValue>
                        {showCurrencyLabel ? (
                            <span className="flex items-center gap-1">
                                <span className="font-medium">{currencySymbol}</span>
                                <span className="text-xs text-muted-foreground">{currentCurrency}</span>
                            </span>
                        ) : (
                            currencySymbol
                        )}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {Object.values(SUPPORTED_CURRENCIES).map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center justify-between w-full">
                                <span className="flex items-center gap-2">
                                    <span className="font-medium">{currency.symbol}</span>
                                    <span className="text-sm">{currency.code}</span>
                                </span>
                                <span className="text-xs text-muted-foreground ml-2">
                                    {currency.displayName}
                                </span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Amount Input */}
            <div className="flex-1 relative">
                <Input
                    type="text"
                    value={displayValue}
                    onChange={handleAmountChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="pr-8"
                />
                {!isFocused && currencyConfig && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                        {currencySymbol}
                    </div>
                )}
            </div>
        </div>
    );
}

// Simplified version for inline use
export function SimpleMoneyInput({
    value,
    currencyCode = 'USD',
    onChange,
    placeholder = '0',
    className,
    disabled,
}: Omit<MoneyInputProps, 'showCurrencyLabel' | 'min' | 'max'>) {
    return (
        <MoneyInput
            value={value}
            currencyCode={currencyCode}
            onChange={onChange}
            placeholder={placeholder}
            className={className}
            disabled={disabled}
            showCurrencyLabel={false}
        />
    );
}
