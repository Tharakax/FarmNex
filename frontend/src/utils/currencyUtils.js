/**
 * Currency Utilities for Sri Lankan Rupees (LKR)
 * Centralizes all currency formatting across the FarmNex application
 */

/**
 * Format amount in Sri Lankan Rupees (LKR)
 * @param {number} amount - The amount to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted currency string
 */
export const formatLKR = (amount, options = {}) => {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
    compact = false
  } = options;

  const numAmount = Number(amount) || 0;

  if (compact && numAmount >= 1000) {
    // Show compact format for large numbers (e.g., "LKR 1.5K")
    if (numAmount >= 1000000) {
      const millions = numAmount / 1000000;
      return showSymbol 
        ? `LKR ${millions.toFixed(1)}M`
        : `${millions.toFixed(1)}M`;
    } else if (numAmount >= 1000) {
      const thousands = numAmount / 1000;
      return showSymbol 
        ? `LKR ${thousands.toFixed(1)}K`
        : `${thousands.toFixed(1)}K`;
    }
  }

  // Standard formatting with proper Sri Lankan number formatting
  const formatted = new Intl.NumberFormat('en-LK', {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping: true
  }).format(numAmount);

  return showSymbol ? `LKR ${formatted}` : formatted;
};

/**
 * Legacy formatCurrency function for backward compatibility
 * @param {number} amount - The amount to format
 * @param {number} decimals - Number of decimal places (optional)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, decimals = 2) => {
  return formatLKR(amount, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Format currency without symbol
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted number string
 */
export const formatAmount = (amount) => {
  return formatLKR(amount, { showSymbol: false });
};

/**
 * Format currency in compact form (for charts and small displays)
 * @param {number} amount - The amount to format
 * @returns {string} - Compact formatted currency string
 */
export const formatCompactLKR = (amount) => {
  return formatLKR(amount, { compact: true });
};

/**
 * Parse currency string back to number
 * @param {string} currencyString - Currency string like "LKR 1,234.56"
 * @returns {number} - Parsed number
 */
export const parseLKR = (currencyString) => {
  if (typeof currencyString !== 'string') return Number(currencyString) || 0;
  
  // Remove LKR, commas, and other non-numeric characters except decimal point
  const cleanString = currencyString.replace(/[^\d.-]/g, '');
  return Number(cleanString) || 0;
};

/**
 * Validate if a currency amount is valid
 * @param {any} amount - Amount to validate
 * @returns {boolean} - True if valid currency amount
 */
export const isValidCurrencyAmount = (amount) => {
  const num = Number(amount);
  return !isNaN(num) && isFinite(num) && num >= 0;
};

/**
 * Currency constants
 */
export const CURRENCY = {
  CODE: 'LKR',
  SYMBOL: 'Rs.',
  NAME: 'Sri Lankan Rupee',
  LOCALE: 'en-LK'
};

export default {
  formatLKR,
  formatCurrency,
  formatAmount,
  formatCompactLKR,
  parseLKR,
  isValidCurrencyAmount,
  CURRENCY
};