import { FormValidator } from './validation';

/**
 * Supply form validation rules with enhanced business logic
 */
export const SupplyValidationRules = {
  name: (validator, value) => {
    validator
      .required(value, 'Supply name')
      .minLength(value, 2, 'Supply name')
      .maxLength(value, 100, 'Supply name');
    
    // Enhanced validation: Check for valid characters
    if (value && !/^[a-zA-Z0-9\s\-\(\)\.\&]+$/.test(value)) {
      validator.addError('name', 'Supply name contains invalid characters. Only letters, numbers, spaces, hyphens, parentheses, periods, and & are allowed.');
    }
    
    // Check for inappropriate words/spam
    const forbiddenWords = ['test', 'dummy', 'fake', 'spam'];
    if (value && forbiddenWords.some(word => value.toLowerCase().includes(word))) {
      validator.addError('name', 'Please use a proper supply name. Avoid test or placeholder names.');
    }
    
    return validator;
  },

  category: (validator, value) => {
    validator.required(value, 'Category');
    
    // Validate against allowed categories
    const allowedCategories = [
      'seeds', 'fertilizers', 'pesticides', 'tools', 'irrigation',
      'animal-feed', 'machinery', 'equipment', 'soil-amendments', 'greenhouse-supplies', 'fuel'
    ];
    
    if (value && !allowedCategories.includes(value)) {
      validator.addError('category', 'Please select a valid category from the dropdown.');
    }
    
    return validator;
  },

  quantity: (validator, value, allValues) => {
    validator
      .required(value, 'Quantity')
      .numeric(value, 'Quantity')
      .minValue(value, 0, 'Quantity');
    
    // Enhanced validation: Check for reasonable quantity limits
    const numValue = Number(value);
    if (numValue > 999999) {
      validator.addError('quantity', 'Quantity seems unreasonably high. Please verify the amount.');
    }
    
    // Check for decimal quantities where integers expected
    const category = allValues.category;
    const integersOnly = ['tools', 'machinery', 'equipment'];
    if (category && integersOnly.includes(category) && numValue % 1 !== 0) {
      validator.addError('quantity', `${category} quantities must be whole numbers (no decimals).`);
    }
    
    // Check quantity relationship with min/max if they exist
    const minQuantity = Number(allValues.minQuantity);
    const maxQuantity = Number(allValues.maxQuantity);
    
    if (maxQuantity > 0 && numValue > maxQuantity) {
      validator.addError('quantity', `Current quantity (${numValue}) exceeds your set maximum (${maxQuantity}). Consider updating your maximum or reducing quantity.`);
    }
    
    if (minQuantity > 0 && numValue < minQuantity && numValue > 0) {
      validator.addError('quantity', `Warning: Current quantity (${numValue}) is below your minimum stock level (${minQuantity}). This will trigger low stock alerts.`);
    }
    
    return validator;
  },

  unit: (validator, value) => {
    validator.required(value, 'Unit');
    
    // Enhanced validation: Suggest proper units
    if (value) {
      const commonUnits = [
        'pieces', 'pcs', 'units', 'kg', 'grams', 'g', 'liters', 'l', 'ml',
        'bags', 'bottles', 'packets', 'boxes', 'meters', 'm', 'cm', 'feet',
        'gallons', 'tons', 'pounds', 'lbs', 'rolls', 'sheets'
      ];
      
      const inputUnit = value.toLowerCase().trim();
      const isValidUnit = commonUnits.some(unit => 
        inputUnit.includes(unit) || unit.includes(inputUnit)
      );
      
      if (!isValidUnit && inputUnit.length > 0) {
        validator.addError('unit', `Please use a standard unit (e.g., pieces, kg, liters, bags, etc.). Current: "${value}"`);
      }
      
      // Check unit length
      if (value.length > 50) {
        validator.addError('unit', 'Unit description is too long. Please use a shorter, standard unit name.');
      }
    }
    
    return validator;
  },

  price: (validator, value, allValues) => {
    validator
      .required(value, 'Unit price')
      .numeric(value, 'Unit price')
      .positiveNumber(value, 'Unit price');
    
    const numValue = Number(value);
    
    // Enhanced validation: Check for reasonable price ranges
    if (numValue > 1000000) {
      validator.addError('price', 'Unit price seems extremely high. Please verify the amount.');
    }
    
    if (numValue < 0.01 && numValue > 0) {
      validator.addError('price', 'Unit price is too low. Minimum price is 0.01.');
    }
    
    // Category-specific price validation
    const category = allValues.category;
    const quantity = Number(allValues.quantity || 1);
    const totalValue = numValue * quantity;
    
    if (category === 'seeds' && numValue > 10000) {
      validator.addError('price', 'Seed prices typically range from 10-5000 LKR. Please verify this high price.');
    }
    
    if (category === 'tools' && numValue < 100) {
      validator.addError('price', 'Tool prices are typically above 100 LKR. Please verify this low price.');
    }
    
    // Warn about high-value items
    if (totalValue > 500000) {
      validator.addError('price', `High-value alert: Total value is ${totalValue.toFixed(2)} LKR. Please confirm this is correct.`);
    }
    
    return validator;
  },

  minQuantity: (validator, value, allValues) => {
    validator
      .required(value, 'Minimum quantity')
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

  supplier: (validator, value) => {
    validator.required(value, 'Supplier name');
    
    if (value) {
      validator.maxLength(value, 100, 'Supplier name');
      
      // Enhanced validation: Check for proper supplier name format
      if (value.trim().length < 2 && value.trim().length > 0) {
        validator.addError('supplier', 'Supplier name is too short. Please provide a proper supplier name.');
      }
      
      // Check for valid characters
      if (!/^[a-zA-Z0-9\s\-\(\)\.\&\,\']+$/.test(value)) {
        validator.addError('supplier', 'Supplier name contains invalid characters. Only letters, numbers, spaces, and basic punctuation are allowed.');
      }
      
      // Check for placeholder text
      const placeholderWords = ['unknown', 'tbd', 'tbc', 'pending', 'n/a', 'na'];
      if (placeholderWords.some(word => value.toLowerCase().trim() === word)) {
        validator.addError('supplier', 'Please provide a proper supplier name instead of placeholder text.');
      }
    }
    
    return validator;
  },

  location: (validator, value) => {
    validator.required(value, 'Storage location');
    
    if (value) {
      validator.maxLength(value, 100, 'Storage location');
      
      // Enhanced validation: Check for proper location format
      if (value.trim().length < 2 && value.trim().length > 0) {
        validator.addError('location', 'Storage location is too short. Please provide a clear location description.');
      }
      
      // Suggest proper location formats
      const commonLocations = ['shed', 'storage', 'room', 'barn', 'warehouse', 'field', 'greenhouse'];
      const hasLocationKeyword = commonLocations.some(loc => value.toLowerCase().includes(loc));
      
      if (!hasLocationKeyword && value.trim().length > 0) {
        validator.addError('location', 'Consider using descriptive location terms like "Storage Room A", "Tool Shed", "Main Warehouse", etc.');
      }
    }
    
    return validator;
  },

  purchaseDate: (validator, value, allValues) => {
    const category = allValues.category;
    
    // Categories that require purchase date for proper inventory tracking
    const requiresPurchaseDate = [
      'seeds', 'fertilizers', 'pesticides', 'animal-feed', 'soil-amendments'
    ];
    
    if (requiresPurchaseDate.includes(category)) {
      validator.required(value, `Purchase date is required for ${category} to ensure proper inventory tracking`);
    }
    
    if (value) {
      const purchaseDate = new Date(value);
      const currentDate = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 10);
      
      // Enhanced validation: Date range checks
      if (purchaseDate > currentDate) {
        validator.addError('purchaseDate', 'Purchase date cannot be in the future. Please select today or an earlier date.');
      }
      
      if (purchaseDate < oneYearAgo) {
        validator.addError('purchaseDate', 'Purchase date is more than 10 years ago. Please verify this date is correct.');
      }
      
      // Warn about very recent purchases without receipt verification
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (purchaseDate > yesterday) {
        // This is just a warning, not an error
        // validator.addWarning('purchaseDate', 'Recent purchase detected. Ensure you have proper receipts for record keeping.');
      }
    }
    return validator;
  },

  expiryDate: (validator, value, allValues) => {
    const category = allValues.category;
    
    // Categories that MUST have expiry dates for safety and compliance
    const requiresExpiryDate = [
      'seeds', 'fertilizers', 'pesticides', 'animal-feed', 'soil-amendments'
    ];
    
    // Categories that should NOT have expiry dates
    const nonExpiringCategories = ['tools', 'machinery', 'equipment', 'irrigation'];
    
    if (requiresExpiryDate.includes(category)) {
      validator.required(value, `Expiry date is required for ${category} for safety and compliance reasons`);
    }
    
    if (value) {
      const expiryDate = new Date(value);
      const currentDate = new Date();
      const purchaseDate = allValues.purchaseDate ? new Date(allValues.purchaseDate) : null;
      
      // Enhanced validation: Category-specific expiry checks
      if (nonExpiringCategories.includes(category)) {
        validator.addError('expiryDate', `${category} typically don't have expiry dates. Consider leaving this field empty.`);
      }
      
      // Expiry date validation
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      if (expiryDate < currentDate) {
        validator.addError('expiryDate', 'This item is already expired. Consider removing it from inventory or updating the date.');
      } else if (expiryDate < threeDaysFromNow) {
        validator.addError('expiryDate', 'This item will expire very soon (within 3 days). Ensure immediate usage or disposal.');
      }
      
      // Expiry date should be after purchase date
      if (purchaseDate) {
        if (expiryDate <= purchaseDate) {
          validator.addError('expiryDate', 'Expiry date must be after the purchase date.');
        }
        
        // Check for reasonable shelf life
        const daysDifference = (expiryDate - purchaseDate) / (1000 * 60 * 60 * 24);
        
        if (category === 'seeds' && daysDifference < 30) {
          validator.addError('expiryDate', 'Seeds typically have shelf life of months or years. Please verify this short expiry period.');
        }
        
        if (category === 'fertilizers' && daysDifference < 90) {
          validator.addError('expiryDate', 'Fertilizers typically have shelf life of several months. Please verify this short expiry period.');
        }
        
        if (daysDifference > 3650) { // 10 years
          validator.addError('expiryDate', 'Expiry date is more than 10 years away. Please verify this date is correct.');
        }
      }
    }
    return validator;
  },

  notes: (validator, value) => {
    if (value) {
      validator.maxLength(value, 500, 'Notes');
      
      // Enhanced validation: Check for meaningful content
      if (value.trim().length < 5 && value.trim().length > 0) {
        validator.addError('notes', 'Notes are too short. Please provide meaningful information or leave empty.');
      }
      
      // Check for inappropriate content
      const inappropriateWords = ['test', 'lorem ipsum', 'dummy', 'placeholder'];
      if (inappropriateWords.some(word => value.toLowerCase().includes(word))) {
        validator.addError('notes', 'Please provide meaningful notes instead of placeholder or test content.');
      }
      
      // Encourage specific information
      const goodKeywords = ['quality', 'condition', 'source', 'purpose', 'maintenance', 'usage'];
      const hasGoodKeywords = goodKeywords.some(keyword => value.toLowerCase().includes(keyword));
      
      if (value.length > 50 && !hasGoodKeywords) {
        // This is just a suggestion, not an error
        // validator.addWarning('notes', 'Consider adding information about quality, condition, intended use, or maintenance requirements.');
      }
    }
    
    return validator;
  },
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
  // Map frontend unit names to backend enum values
  const unitMapping = {
    'pieces': 'piece',
    'pcs': 'piece', 
    'units': 'piece',
    'kg': 'kg',
    'kilograms': 'kg',
    'grams': 'g',
    'g': 'g',
    'liters': 'liter',
    'l': 'liter',
    'bags': 'bag',
    'bottles': 'bottle',
    'packets': 'pack',
    'boxes': 'pack',
    'meters': 'piece', // fallback for non-standard units
    'gallons': 'gallon',
    'pounds': 'lb',
    'lbs': 'lb'
  };
  
  // Get mapped unit or default to 'piece'
  const rawUnit = (formData.unit?.trim() || '').toLowerCase();
  const mappedUnit = unitMapping[rawUnit] || 'piece';
  
  // Create a clean version of the form data matching backend schema
  const cleanData = {
    name: formData.name?.trim(),
    description: formData.notes?.trim() || formData.name?.trim() || 'Farm supply item', // Backend requires description
    category: formData.category,
    quantity: parseInt(formData.quantity) || 0,
    unit: mappedUnit,
    price: parseFloat(formData.price) || 0,
    minQuantity: parseInt(formData.minQuantity) || 5,
    maxQuantity: parseInt(formData.maxQuantity) || 100,
    
    // Supplier object structure (backend expects nested object)
    supplier: {
      name: formData.supplier?.trim() || 'Unknown Supplier'
    },
    
    // Storage object structure (backend expects nested object) 
    storage: {
      location: formData.location?.trim() || '',
      temperature: 'room-temp', // default value
      instructions: ''
    },
    
    expiryDate: formData.expiryDate || null,
    lastRestocked: formData.purchaseDate ? new Date(formData.purchaseDate) : new Date(),
    
    // Additional fields that might be expected
    isActive: true
  };
  
  return cleanData;
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
