export const formatCurrency = (value, { decimals = 0, currency = 'INR', currencySymbol } = {}) => {
  const amount = Number(value) || 0;
  if (currency === 'USD' || currencySymbol === '$') {
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;
  }
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
};

export const formatPriceText = (value, options) => {
  if (typeof value === 'number') return formatCurrency(value, options);
  const match = String(value).match(/[0-9,.]+/);
  if (!match) return String(value);
  const numeric = Number(match[0].replace(/,/g, ''));
  const formatted = formatCurrency(numeric, options);
  return String(value).replace(match[0], formatted.slice(1));
};

export default formatCurrency;
