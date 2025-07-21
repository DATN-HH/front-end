export const formatCurrency = (amount: number | undefined | null) => {
  if (!amount && amount !== 0) return '-';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
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
