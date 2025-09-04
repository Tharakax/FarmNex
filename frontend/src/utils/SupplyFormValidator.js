import { FormValidator } from './validation';

/**
 * Supply form validation rules
 */
export const SupplyValidationRules = {
  name: (validator, value) => 
    validator
      .required(value, 'Supply name')
      .minLength(value, 2, 'Supply name')
      .maxLength(value, 100, 'Supply name'),

  category: (validator, value) => 
    validator.required(value, 'Category'),

  quantity: (validator, value, allValues) => {
    validator
      .required(value, 'Quantity')
      .numeric(value, 'Quantity')
      .minValue(value, 0, 'Quantity');
    
    // Check quantity relationship with min/max if they exist
    const minQuantity = Number(allValues.minQuantity);
    const maxQuantity = Number(allValues.maxQuantity);
    
    if (maxQuantity > 0 && Number(value) > maxQuantity) {
      validator.addError('quantity', `Quantity should not exceed maximum quantity (${maxQuantity})`);
    }
    
    return validator;
  },

  unit: (validator, value) => 
    validator.required(value, 'Unit'),

  price: (validator, value) => 
    validator
      .required(value, 'Unit price')
      .numeric(value, 'Unit price')
      .positiveNumber(value, 'Unit price'),

  minQuantity: (validator, value, allValues) => {
    validator
      .numeric(value, 'Minimum quantity')
      .minValue(value, 0, 'Minimum quantity');
    
    const maxQuantity = Number(allValues.maxQuantity);
    if (maxQuantity > 0 && Number(value) >= maxQuantity) {
      validator.addError('minQuantity', 'Minimum quantity must be less than maximum quantity');
    }
    
    return validator;
  },

  maxQuantity: (validator, value, allValues) => {
    validator
      .numeric(value, 'Maximum quantity')
      .minValue(value, 1, 'Maximum quantity');
    
    const minQuantity = Number(allValues.minQuantity);
    if (minQuantity > 0 && Number(value) <= minQuantity) {
      validator.addError('maxQuantity', 'Maximum quantity must be greater than minimum quantity');
    }
    
    return validator;
  },

  supplier: (validator, value) => 
    validator.maxLength(value, 100, 'Supplier name'),

  location: (validator, value) => 
    validator.maxLength(value, 100, 'Storage location'),

  purchaseDate: (validator, value) => {
    if (value) {
      const purchaseDate = new Date(value);
      const currentDate = new Date();
      
      if (purchaseDate > currentDate) {
        validator.addError('purchaseDate', 'Purchase date cannot be in the future');
      }
    }
    return validator;
  },

  expiryDate: (validator, value, allValues) => {
    if (value) {
      const expiryDate = new Date(value);
      const currentDate = new Date();
      const purchaseDate = allValues.purchaseDate ? new Date(allValues.purchaseDate) : null;
      
      // Expiry date should be in the future or today
      if (expiryDate < currentDate) {
        validator.addError('expiryDate', 'Item is already expired');
      }
      
      // Expiry date should be after purchase date
      if (purchaseDate && expiryDate <= purchaseDate) {
        validator.addError('expiryDate', 'Expiry date must be after purchase date');
      }
    }
    return validator;
  },

  notes: (validator, value) => 
    validator.maxLength(value, 500, 'Notes'),
};

/**
 * Validate the entire supply form
 * @param {Object} formData - The form data to validate
 * @returns {Object} - { isValid: boolean, errors: Object, errorMessages: Array }
 */
export const validateSupplyForm = (formData) => {
  const validator = new FormValidator();
  const validationFields = [
    'name', 
    'category', 
    'quantity', 
    'unit', 
    'price', 
    'minQuantity', 
    'maxQuantity',
    'supplier',
    'location',
    'purchaseDate',
    'expiryDate',
    'notes'
  ];
  
  // Validate each field
  validationFields.forEach(field => {
    if (SupplyValidationRules[field]) {
      SupplyValidationRules[field](validator, formData[field], formData);
    }
  });
  
  // Add business logic validations
  
  // Validate stock relationships
  const quantity = Number(formData.quantity || 0);
  const minQuantity = Number(formData.minQuantity || 0);
  const maxQuantity = Number(formData.maxQuantity || 0);
  
  if (minQuantity > 0 && maxQuantity > 0) {
    if (minQuantity >= maxQuantity) {
      validator.addError('stockRange', 'Minimum quantity must be less than maximum quantity');
    }
  }
  
  // Convert errors to messages array for display
  const errorMessages = Object.entries(validator.getAllErrors())
    .map(([field, errors]) => ({ field, message: errors[0] }));
  
  return {
    isValid: !validator.hasErrors(),
    errors: validator.getAllErrors(),
    errorMessages
  };
};

/**
 * Get real-time CSS classes for form fields based on validation state
 * @param {string} field - Field name
 * @param {Object} errors - Form errors object
 * @param {Object} touched - Form touched fields object
 * @returns {string} - CSS classes for the input
 */
export const getFieldClasses = (field, errors, touched) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none';
  
  if (touched && touched[field]) {
    if (errors && errors[field]?.length > 0) {
      return `${baseClasses} border-red-500 bg-red-50 focus:border-red-500`;
    }
    return `${baseClasses} border-green-500 bg-green-50 focus:border-green-500`;
  }
  
  return `${baseClasses} border-gray-300`;
};

/**
 * Format and clean supply form data for submission
 * @param {Object} formData - Raw form data 
 * @returns {Object} - Clean formatted data for API submission
 */
export const formatSupplyData = (formData) => {
  // Create a clean version of the form data
  return {
    name: formData.name?.trim(),
    category: formData.category,
    quantity: parseInt(formData.quantity) || 0,
    unit: formData.unit?.trim(),
    price: parseFloat(formData.price) || 0,
    minQuantity: parseInt(formData.minQuantity) || 5,
    maxQuantity: parseInt(formData.maxQuantity) || 100,
    supplier: formData.supplier?.trim() || '',
    location: formData.location?.trim() || '',
    purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
    expiryDate: formData.expiryDate || null,
    notes: formData.notes?.trim() || '',
    status: getSupplyStatus(
      parseInt(formData.quantity) || 0, 
      parseInt(formData.minQuantity) || 5, 
      formData.expiryDate
    )
  };
};

/**
 * Calculate supply status based on quantity and expiry
 */
export const getSupplyStatus = (quantity, minQuantity, expiryDate) => {
  const current = quantity || 0;
  const minimum = minQuantity || 5;
  const isExpired = expiryDate && new Date(expiryDate) < new Date();

  if (isExpired) return 'expired';
  if (current === 0) return 'out-of-stock';
  if (current <= minimum) return 'low-stock';
  return 'in-stock';
};

export default {
  SupplyValidationRules,
  validateSupplyForm,
  getFieldClasses,
  formatSupplyData,
  getSupplyStatus
};
