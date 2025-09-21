import React from 'react';
import { showError, showWarning } from './sweetAlert';

// Common validation patterns
const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[1-9][\d]{0,15}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  cardNumber: /^\d{13,19}$/,
  cvv: /^\d{3,4}$/,
  expiryDate: /^(0[1-9]|1[0-2])\/\d{2}$/,
  postalCode: /^[A-Za-z0-9\s-]{3,10}$/,
  price: /^\d+(\.\d{1,2})?$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
};

// Validation error messages
const ERROR_MESSAGES = {
  required: (field) => `${field} is required`,
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  password: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  passwordMatch: 'Passwords do not match',
  cardNumber: 'Please enter a valid card number',
  cvv: 'Please enter a valid CVV',
  expiryDate: 'Please enter a valid expiry date (MM/YY)',
  expiryPast: 'Card has expired',
  postalCode: 'Please enter a valid postal code',
  minLength: (field, min) => `${field} must be at least ${min} characters`,
  maxLength: (field, max) => `${field} must not exceed ${max} characters`,
  minValue: (field, min) => `${field} must be at least ${min}`,
  maxValue: (field, max) => `${field} must not exceed ${max}`,
  price: 'Please enter a valid price',
  url: 'Please enter a valid URL',
  fileSize: (maxMB) => `File size must not exceed ${maxMB}MB`,
  fileType: (types) => `File must be of type: ${types.join(', ')}`,
  numeric: 'Please enter a valid number',
  positiveNumber: 'Please enter a positive number'
};

/**
 * Validation utility class
 */
export class FormValidator {
  constructor() {
    this.errors = {};
    this.isValid = true;
  }

  // Reset validation state
  reset() {
    this.errors = {};
    this.isValid = true;
    return this;
  }

  // Add error for a field
  addError(field, message) {
    if (!this.errors[field]) {
      this.errors[field] = [];
    }
    this.errors[field].push(message);
    this.isValid = false;
    return this;
  }

  // Get errors for a field
  getFieldErrors(field) {
    return this.errors[field] || [];
  }

  // Get first error for a field
  getFieldError(field) {
    const errors = this.getFieldErrors(field);
    return errors.length > 0 ? errors[0] : '';
  }

  // Get all errors
  getAllErrors() {
    return this.errors;
  }

  // Check if form is valid
  hasErrors() {
    return !this.isValid;
  }

  // Show validation errors using SweetAlert
  async showErrors() {
    if (!this.isValid) {
      const errorList = Object.entries(this.errors)
        .map(([field, errors]) => `${field}: ${errors[0]}`)
        .join('\n');
      
      await showError('Validation Error', errorList);
    }
  }

  // Required field validation
  required(value, field) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      this.addError(field, ERROR_MESSAGES.required(field));
    }
    return this;
  }

  // Email validation
  email(value, field = 'Email') {
    if (value && !VALIDATION_PATTERNS.email.test(value)) {
      this.addError(field, ERROR_MESSAGES.email);
    }
    return this;
  }

  // Phone validation
  phone(value, field = 'Phone') {
    if (value && !VALIDATION_PATTERNS.phone.test(value.replace(/\D/g, ''))) {
      this.addError(field, ERROR_MESSAGES.phone);
    }
    return this;
  }

  // Password validation
  password(value, field = 'Password') {
    if (value && !VALIDATION_PATTERNS.password.test(value)) {
      this.addError(field, ERROR_MESSAGES.password);
    }
    return this;
  }

  // Password match validation
  passwordMatch(password, confirmPassword, field = 'Confirm Password') {
    if (password !== confirmPassword) {
      this.addError(field, ERROR_MESSAGES.passwordMatch);
    }
    return this;
  }

  // Credit card number validation
  cardNumber(value, field = 'Card Number') {
    if (value) {
      const cleanValue = value.replace(/\D/g, '');
      if (!VALIDATION_PATTERNS.cardNumber.test(cleanValue)) {
        this.addError(field, ERROR_MESSAGES.cardNumber);
      } else {
        // Luhn algorithm validation
        if (!this.luhnCheck(cleanValue)) {
          this.addError(field, ERROR_MESSAGES.cardNumber);
        }
      }
    }
    return this;
  }

  // CVV validation
  cvv(value, field = 'CVV') {
    if (value && !VALIDATION_PATTERNS.cvv.test(value)) {
      this.addError(field, ERROR_MESSAGES.cvv);
    }
    return this;
  }

  // Expiry date validation
  expiryDate(value, field = 'Expiry Date') {
    if (value) {
      if (!VALIDATION_PATTERNS.expiryDate.test(value)) {
        this.addError(field, ERROR_MESSAGES.expiryDate);
      } else {
        // Check if expired
        const [month, year] = value.split('/').map(Number);
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          this.addError(field, ERROR_MESSAGES.expiryPast);
        }
      }
    }
    return this;
  }

  // Postal code validation
  postalCode(value, field = 'Postal Code') {
    if (value && !VALIDATION_PATTERNS.postalCode.test(value)) {
      this.addError(field, ERROR_MESSAGES.postalCode);
    }
    return this;
  }

  // Length validation
  minLength(value, min, field) {
    if (value && value.length < min) {
      this.addError(field, ERROR_MESSAGES.minLength(field, min));
    }
    return this;
  }

  maxLength(value, max, field) {
    if (value && value.length > max) {
      this.addError(field, ERROR_MESSAGES.maxLength(field, max));
    }
    return this;
  }

  // Numeric validation
  numeric(value, field) {
    if (value && isNaN(Number(value))) {
      this.addError(field, ERROR_MESSAGES.numeric);
    }
    return this;
  }

  // Price validation
  price(value, field = 'Price') {
    if (value && !VALIDATION_PATTERNS.price.test(value)) {
      this.addError(field, ERROR_MESSAGES.price);
    }
    return this;
  }

  // Positive number validation
  positiveNumber(value, field) {
    if (value && Number(value) <= 0) {
      this.addError(field, ERROR_MESSAGES.positiveNumber);
    }
    return this;
  }

  // Min/Max value validation
  minValue(value, min, field) {
    if (value && Number(value) < min) {
      this.addError(field, ERROR_MESSAGES.minValue(field, min));
    }
    return this;
  }

  maxValue(value, max, field) {
    if (value && Number(value) > max) {
      this.addError(field, ERROR_MESSAGES.maxValue(field, max));
    }
    return this;
  }

  // URL validation
  url(value, field = 'URL') {
    if (value && !VALIDATION_PATTERNS.url.test(value)) {
      this.addError(field, ERROR_MESSAGES.url);
    }
    return this;
  }

  // File validation
  file(file, options = {}, field = 'File') {
    if (file) {
      const { maxSizeMB = 5, allowedTypes = [] } = options;
      
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        this.addError(field, ERROR_MESSAGES.fileSize(maxSizeMB));
      }
      
      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        this.addError(field, ERROR_MESSAGES.fileType(allowedTypes));
      }
    }
    return this;
  }

  // Custom validation
  custom(condition, field, message) {
    if (!condition) {
      this.addError(field, message);
    }
    return this;
  }

  // Luhn algorithm for credit card validation
  luhnCheck(cardNumber) {
    let sum = 0;
    let shouldDouble = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i), 10);
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return (sum % 10) === 0;
  }
}

// Helper functions for form state management
export const createFormState = (initialValues = {}) => {
  return {
    values: { ...initialValues },
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true
  };
};

export const updateFormField = (formState, setFormState, field, value) => {
  setFormState(prev => ({
    ...prev,
    values: {
      ...prev.values,
      [field]: value
    },
    touched: {
      ...prev.touched,
      [field]: true
    }
  }));
};

export const setFormErrors = (formState, setFormState, errors) => {
  setFormState(prev => ({
    ...prev,
    errors,
    isValid: Object.keys(errors).length === 0
  }));
};

export const setFormSubmitting = (setFormState, isSubmitting) => {
  setFormState(prev => ({
    ...prev,
    isSubmitting
  }));
};

// Real-time validation hook
export const useFormValidation = (initialValues = {}, validationRules = {}) => {
  const [formState, setFormState] = React.useState(createFormState(initialValues));
  
  const validateField = (field, value) => {
    const validator = new FormValidator();
    
    if (validationRules[field]) {
      validationRules[field](validator, value, formState.values);
    }
    
    const fieldErrors = validator.getFieldErrors(field);
    setFormErrors(formState, setFormState, {
      ...formState.errors,
      [field]: fieldErrors
    });
    
    return fieldErrors.length === 0;
  };
  
  const validateForm = () => {
    const validator = new FormValidator();
    
    Object.keys(validationRules).forEach(field => {
      validationRules[field](validator, formState.values[field], formState.values);
    });
    
    setFormErrors(formState, setFormState, validator.getAllErrors());
    return !validator.hasErrors();
  };
  
  const handleFieldChange = (field, value) => {
    updateFormField(formState, setFormState, field, value);
    if (formState.touched[field]) {
      validateField(field, value);
    }
  };
  
  const handleSubmit = async (submitFunction) => {
    setFormSubmitting(setFormState, true);
    
    try {
      if (validateForm()) {
        await submitFunction(formState.values);
      } else {
        const validator = new FormValidator();
        Object.keys(validationRules).forEach(field => {
          validationRules[field](validator, formState.values[field], formState.values);
        });
        await validator.showErrors();
      }
    } finally {
      setFormSubmitting(setFormState, false);
    }
  };
  
  return {
    formState,
    handleFieldChange,
    handleSubmit,
    validateField,
    validateForm
  };
};

// Pre-built validation rule sets
export const ValidationRules = {
  email: (validator, value) => validator.required(value, 'Email').email(value),
  password: (validator, value) => validator.required(value, 'Password').password(value),
  confirmPassword: (validator, value, allValues) => 
    validator.required(value, 'Confirm Password').passwordMatch(allValues.password, value),
  name: (validator, value, field = 'Name') => 
    validator.required(value, field).minLength(value, 2, field),
  phone: (validator, value) => validator.required(value, 'Phone').phone(value),
  price: (validator, value) => 
    validator.required(value, 'Price').price(value).positiveNumber(value, 'Price'),
  cardNumber: (validator, value) => validator.required(value, 'Card Number').cardNumber(value),
  cvv: (validator, value) => validator.required(value, 'CVV').cvv(value),
  expiryDate: (validator, value) => validator.required(value, 'Expiry Date').expiryDate(value)
};

// Export default validator instance for quick use
export default FormValidator;
