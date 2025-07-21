'use client';

import { useState, useEffect } from 'react';

import { formatNumberInput, parseNumberInput } from '@/utils/currency';

import { Input } from './input';

interface NumberInputProps {
  value?: number;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}

export function NumberInput({
  value,
  onChange,
  placeholder = '0',
  className,
  disabled,
  min,
  max,
}: NumberInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Update display value when value prop changes
  useEffect(() => {
    if (!isFocused) {
      if (value !== undefined && value !== null) {
        setDisplayValue(formatNumberInput(value));
      } else {
        setDisplayValue('');
      }
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    // Parse the value and call onChange
    const numericValue = parseNumberInput(inputValue);

    // Apply min/max constraints
    let finalValue = numericValue;
    if (finalValue !== undefined) {
      if (min !== undefined && finalValue < min) {
        finalValue = min;
      }
      if (max !== undefined && finalValue > max) {
        finalValue = max;
      }
    }

    onChange(finalValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number when focused for easier editing
    if (value !== undefined && value !== null) {
      setDisplayValue(value.toString());
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format with thousand separators when not focused
    if (value !== undefined && value !== null) {
      setDisplayValue(formatNumberInput(value));
    } else if (displayValue === '') {
      setDisplayValue('');
    }
  };

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );
}
