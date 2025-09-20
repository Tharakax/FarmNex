import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Minus, AlertCircle, Save, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI } from '../../services/productAPI';
import { FormValidator } from '../../utils/validation';
import { showError, showSuccess, showLoading, showValidationError, showWarning, showConfirm, showToast } from '../../utils/sweetAlert';

const AddProductForm = ({ isOpen, onClose, product = null, onProductSaved }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const [errors, setErrors] = useState({});

  // Form state matching the product model
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    displayprice: '',
    category: 'vegetables',
    stock: {
      current: '',
      maximum: '',
      minimum: '',
    },
    unit: 'kg',
    images: [],
    isFeatured: false,
    discount: 0,
    tags: [],
    shelfLife: '',
    storageInstructions: '',
  });

  const [newTag, setNewTag] = useState('');

  // Helper to read errors either by field key or by pretty label
  const getError = (key, label) => {
    const val = errors[key] ?? errors[label];
    if (!val) return null;
    return Array.isArray(val) ? (val[0] || null) : val;
  };

  // Categories matching the product model
  const categories = [
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'leafy-greens', label: 'Leafy Greens' },
    { value: 'root-vegetables', label: 'Root Vegetables' },
    { value: 'berries', label: 'Berries' },
    { value: 'animal-products', label: 'Animal Products' },
    { value: 'dairy-products', label: 'Dairy Products' },
    { value: 'meats', label: 'Meats' },
  ];

  // Units matching the product model
  const units = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'lb', label: 'Pound (lb)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'L', label: 'Liter (L)' },
    { value: 'piece', label: 'Piece' },
    { value: 'bunch', label: 'Bunch' },
    { value: 'pack', label: 'Pack' },
  ];

  // Initialize form data when product prop changes (for editing)
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        displayprice: product.displayprice || product.price || '',
        category: product.category || 'vegetables',
        stock: {
          current: product.stock?.current || '',
          maximum: product.stock?.maximum || '',
          minimum: product.stock?.minimum || '',
        },
        unit: product.unit || 'kg',
        images: product.images || [],
        isFeatured: product.isFeatured || false,
        discount: product.discount || 0,
        tags: product.tags || [],
        shelfLife: product.shelfLife || '',
        storageInstructions: product.storageInstructions || '',
      });
      setImagePreview(product.images || []);
    }
  }, [product]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        description: '',
        price: '',
        displayprice: '',
        category: 'vegetables',
        stock: {
          current: '',
          maximum: '',
          minimum: '',
        },
        unit: 'kg',
        images: [],
        isFeatured: false,
        discount: 0,
        tags: [],
        shelfLife: '',
        storageInstructions: '',
      });
      setImagePreview([]);
      setErrors({
        'stock.current': 'Current Stock is required and cannot be empty'
      });
      setNewTag('');
    }
  }, [isOpen]);

  // Auto-calculate discount when price or displayprice changes
  useEffect(() => {
    if (formData.price && formData.displayprice) {
      const calculatedDiscount = calculateDiscount(formData.price, formData.displayprice);
      if (calculatedDiscount !== formData.discount) {
        setFormData(prev => ({
          ...prev,
          discount: calculatedDiscount
        }));
      }
    }
  }, [formData.price, formData.displayprice]);

  // Function to calculate discount percentage
  const calculateDiscount = (originalPrice, displayPrice) => {
    const price = parseFloat(originalPrice) || 0;
    const discountedPrice = parseFloat(displayPrice) || 0;
    
    if (price <= 0 || discountedPrice <= 0 || discountedPrice >= price) {
      return 0;
    }
    
    const discountAmount = price - discountedPrice;
    const discountPercentage = (discountAmount / price) * 100;
    return Math.round(discountPercentage * 100) / 100; // Round to 2 decimal places
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('stock.')) {
      const stockField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        stock: {
          ...prev.stock,
          [stockField]: value
        }
      }));
    } else {
      const updatedFormData = {
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Auto-calculate discount when price or displayprice changes
      if (name === 'price' || name === 'displayprice') {
        const price = name === 'price' ? value : formData.price;
        const displayPrice = name === 'displayprice' ? value : formData.displayprice;
        const calculatedDiscount = calculateDiscount(price, displayPrice);
        updatedFormData.discount = calculatedDiscount;
      }
      
      setFormData(updatedFormData);
    }

    // Clear specific field error when user starts typing
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }

    // Real-time comprehensive validation
    validateField(name, type === 'checkbox' ? checked : value);
  };

  // Real-time comprehensive validation - validates all related fields simultaneously
  const validateField = (fieldName, fieldValue) => {
    const validator = new FormValidator();
    
    // Always run comprehensive validation to catch all related field errors
    validateAllFields(validator);
    
    // Set all errors at once with equal priority
    const allErrors = validator.getAllErrors();
    setErrors(allErrors);
  };
  
  // Comprehensive validation function that validates all fields
  const validateAllFields = (validator) => {
    // Validate Product Name
    validator.required(formData.name, 'Product Name')
             .minLength(formData.name, 2, 'Product Name')
             .maxLength(formData.name, 100, 'Product Name');
    
    // Validate Description
    validator.required(formData.description, 'Description')
             .minLength(formData.description, 10, 'Description')
             .maxLength(formData.description, 1000, 'Description');
    
    // Validate Price
    validator.required(formData.price, 'Price')
             .price(formData.price, 'Price')
             .minValue(formData.price, 0.01, 'Price')
             .maxValue(formData.price, 999999, 'Price');
    
    // Validate Category
    validator.required(formData.category, 'Category');
    
    // Validate Unit
    validator.required(formData.unit, 'Unit');
    
    // Validate Current Stock
    const trimmedCurrentStock = String(formData.stock.current || '').trim();
    if (!trimmedCurrentStock || trimmedCurrentStock === '' || formData.stock.current === null || formData.stock.current === undefined) {
      validator.addError('Current Stock', 'Current Stock is required and cannot be empty');
    } else if (isNaN(Number(trimmedCurrentStock)) || Number(trimmedCurrentStock) < 1) {
      validator.addError('Current Stock', 'Current Stock must be at least 1 (cannot be 0 or out of stock)');
    } else {
      validator.numeric(formData.stock.current, 'Current Stock')
               .minValue(formData.stock.current, 1, 'Current Stock');
    }
    
    // Validate Maximum Stock (Required)
    const trimmedMaximumStock = String(formData.stock.maximum ?? '').trim();
    validator.required(trimmedMaximumStock, 'Maximum Stock');
    if (trimmedMaximumStock !== '') {
      validator.numeric(trimmedMaximumStock, 'Maximum Stock')
               .minValue(trimmedMaximumStock, 2, 'Maximum Stock');
      
      // Cross-validation: Maximum > Current
      const currentNum = Number(String(formData.stock.current ?? '').trim());
      const maxNum = Number(trimmedMaximumStock);
      if (!Number.isNaN(currentNum) && maxNum <= currentNum) {
        validator.addError('Maximum Stock', 'Maximum stock must be greater than current stock');
      }
      
      // Cross-validation: Maximum > Minimum
      const trimmedMinimumForCompare = String(formData.stock.minimum ?? '').trim();
      const minNum = Number(trimmedMinimumForCompare);
      if (trimmedMinimumForCompare !== '' && !Number.isNaN(minNum) && maxNum <= minNum) {
        validator.addError('Maximum Stock', 'Maximum stock must be greater than minimum stock');
      }
    }
    
    // Validate Minimum Stock (Required)
    const trimmedMinimumStock = String(formData.stock.minimum ?? '').trim();
    validator.required(trimmedMinimumStock, 'Minimum Stock');
    if (trimmedMinimumStock !== '') {
      validator.numeric(trimmedMinimumStock, 'Minimum Stock')
               .minValue(trimmedMinimumStock, 0, 'Minimum Stock');
      
      // Cross-validation: Minimum < Current
      const currentNumForMin = Number(String(formData.stock.current ?? '').trim());
      const minNum = Number(trimmedMinimumStock);
      if (!Number.isNaN(currentNumForMin) && !Number.isNaN(minNum) && minNum >= currentNumForMin) {
        validator.addError('Minimum Stock', 'Minimum stock must be less than current stock');
      }
    }
    
    // Validate Display Price (Required)
    const displayPriceStr = String(formData.displayprice ?? '').trim();
    validator.required(displayPriceStr, 'Display Price');
    if (displayPriceStr !== '') {
      validator.price(displayPriceStr, 'Display Price')
               .minValue(displayPriceStr, 0.01, 'Display Price')
               .maxValue(displayPriceStr, 999999, 'Display Price');
      
      // Cross-validation: Display Price <= Regular Price
      const priceStr = String(formData.price ?? '').trim();
      if (priceStr !== '' && Number(displayPriceStr) > Number(priceStr)) {
        validator.addError('Display Price', 'Display price cannot be greater than regular price');
      }
    }
    
    // Validate Shelf Life (Required)
    const shelfLifeStr = String(formData.shelfLife ?? '').trim();
    validator.required(shelfLifeStr, 'Shelf Life');
    if (shelfLifeStr !== '') {
      validator.numeric(shelfLifeStr, 'Shelf Life')
               .minValue(shelfLifeStr, 1, 'Shelf Life')
               .maxValue(shelfLifeStr, 365, 'Shelf Life');
    }
    
    // Validate Storage Instructions (Required)
    validator.required(formData.storageInstructions, 'Storage Instructions');
    if (formData.storageInstructions && formData.storageInstructions.trim() !== '') {
      validator.minLength(formData.storageInstructions.trim(), 5, 'Storage Instructions')
               .maxLength(formData.storageInstructions, 500, 'Storage Instructions');
    }
    
    // Validate Images (Required)
    if (formData.images.length === 0) {
      validator.addError('Images', 'Please add at least one product image');
    } else if (formData.images.length > 5) {
      validator.addError('Images', 'Maximum 5 images allowed per product');
    }
    
    // Validate Tags (Required)
    if (formData.tags.length === 0) {
      validator.addError('Tags', 'At least one tag is required');
    } else if (formData.tags.length > 10) {
      validator.addError('Tags', 'Maximum 10 tags allowed');
    }
    
    // Validate individual tags
    formData.tags.forEach((tag, index) => {
      if (!tag || tag.trim().length === 0) {
        validator.addError('Tags', `Tag ${index + 1} cannot be empty`);
      } else if (tag.trim().length < 2) {
        validator.addError('Tags', `Tag "${tag}" must be at least 2 characters long`);
      } else if (tag.trim().length > 30) {
        validator.addError('Tags', `Tag "${tag}" must be less than 30 characters`);
      }
    });
    
    // Check for duplicate tags
    const duplicateTags = formData.tags.filter((tag, index) => formData.tags.indexOf(tag) !== index);
    if (duplicateTags.length > 0) {
      validator.addError('Tags', `Duplicate tags found: ${duplicateTags.join(', ')}`);
    }
    
    // Validate new tag input if it has content
    if (newTag && newTag.trim() !== '') {
      if (newTag.trim().length < 2) {
        validator.addError('newTag', 'Tag must be at least 2 characters long');
      } else if (newTag.trim().length > 30) {
        validator.addError('newTag', 'Tag must be less than 30 characters');
      } else if (formData.tags.includes(newTag.trim())) {
        validator.addError('newTag', 'This tag already exists');
      }
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) {
      return;
    }
    
    // Check if adding these images would exceed limit
    if (formData.images.length + files.length > 5) {
      showToast('Maximum 5 images allowed per product', 'error');
      return;
    }
    
    let validFiles = 0;
    let invalidFiles = 0;
    
    files.forEach(file => {
      // Check file size (5MB limit per image)
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles++;
        showToast(`Image "${file.name}" is too large (max 5MB)`, 'error');
        return;
      }
      
      if (file.type.startsWith('image/')) {
        validFiles++;
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target.result;
          setImagePreview(prev => [...prev, imageUrl]);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, imageUrl]
          }));
          
          // Show success toast for each successful upload
          showToast(`Image "${file.name}" added successfully`, 'success');
          
          // Trigger comprehensive validation after image upload
          setTimeout(() => validateField('images', [...formData.images, imageUrl]), 100);
        };
        reader.readAsDataURL(file);
      } else {
        invalidFiles++;
        showToast(`"${file.name}" is not a valid image file`, 'error');
      }
    });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
    
    // Trigger comprehensive validation after image removal
    setTimeout(() => validateField('images', newImages), 100);
  };

  const addTag = () => {
    const trimmedTag = newTag.trim();
    
    if (!trimmedTag) {
      showToast('Please enter a tag name', 'warning');
      return;
    }
    
    if (formData.tags.includes(trimmedTag)) {
      showToast('This tag already exists', 'warning');
      return;
    }
    
    if (formData.tags.length >= 10) {
      showToast('Maximum 10 tags allowed', 'error');
      return;
    }
    
    if (trimmedTag.length > 30) {
      showToast('Tag must be less than 30 characters', 'error');
      return;
    }
    
    const newTags = [...formData.tags, trimmedTag];
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }));
    setNewTag('');
    showToast(`Tag "${trimmedTag}" added successfully`, 'success');
    
    // Trigger comprehensive validation after tag addition
    setTimeout(() => validateField('tags', newTags), 100);
  };

  const removeTag = (tagToRemove) => {
    const newTags = formData.tags.filter(tag => tag !== tagToRemove);
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }));
    
    // Trigger comprehensive validation after tag removal
    setTimeout(() => validateField('tags', newTags), 100);
  };

  // Check if form has unsaved changes
  const hasUnsavedChanges = () => {
    return (
      formData.name.trim() !== '' ||
      formData.description.trim() !== '' ||
      formData.price !== '' ||
      formData.displayprice !== '' ||
      formData.stock.current !== '' ||
      formData.stock.maximum !== '' ||
      formData.stock.minimum !== '' ||
      formData.shelfLife !== '' ||
      formData.storageInstructions.trim() !== '' ||
      formData.tags.length > 0 ||
      formData.images.length > 0 ||
      formData.category !== 'vegetables' ||
      formData.unit !== 'kg' ||
      formData.isFeatured !== false
    );
  };

  // Handle form close with confirmation if there are unsaved changes
  const handleFormClose = async () => {
    if (hasUnsavedChanges() && !product) {
      const result = await showConfirm(
        'You have unsaved changes. Are you sure you want to close this form? All your progress will be lost.',
        'Unsaved Changes',
        {
          icon: 'warning',
          confirmButtonText: 'Yes, Close',
          cancelButtonText: 'Continue Editing',
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6'
        }
      );
      
      if (!result.isConfirmed) {
        return; // User chose to continue editing
      }
    }
    
    onClose();
  };

  const validateForm = async () => {
    const validator = new FormValidator();
    
    // Use comprehensive validation function
    validateAllFields(validator);
    
    const validationErrors = validator.getAllErrors();
    setErrors(validationErrors);
    
    // Show all validation errors with equal priority if there are any
    if (validator.hasErrors()) {
      await showValidationError(
        validationErrors,
        'Please Fix All Validation Errors - All Fields Are Equally Important'
      );
    }
    
    return !validator.hasErrors();
  };

  const handleSubmit = async (e) => {
    console.log('🚀 handleSubmit called!', { e, product, loading });
    e?.preventDefault();
    
    if (loading) {
      console.log('⚠️ Already loading, ignoring click');
      return;
    }

    console.log('📝 Current form data:', formData);
    console.log('❌ Current errors:', errors);
    
    // Validate before submit (applies to both add and edit)
    console.log('🔍 Starting validation...');
    const isValid = await validateForm();
    console.log('✅ Validation result:', isValid);
    
    if (!isValid) {
      console.log('❌ Validation failed - stopping submit');
      return;
    }

    setLoading(true);
    
    try {
      // Show loading dialog
      const loadingAlert = showLoading(
        product ? 'Updating Product' : 'Creating Product',
        product ? 'Please wait while we update your product...' : 'Please wait while we create your product...'
      );

      // Prepare data for submission
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        displayprice: parseFloat(formData.displayprice) || parseFloat(formData.price),
        discount: parseFloat(formData.discount) || 0,
        shelfLife: formData.shelfLife ? parseInt(formData.shelfLife) : undefined,
        stock: {
          current: parseInt(formData.stock.current),
          maximum: formData.stock.maximum ? parseInt(formData.stock.maximum) : 100,
          minimum: formData.stock.minimum ? parseInt(formData.stock.minimum) : 1,
        }
      };

      let result;
      if (product) {
        // Update existing product
        result = await productAPI.updateProduct(product._id, productData);
      } else {
        // Create new product
        result = await productAPI.createProduct(productData);
      }

      // Close loading dialog
      if (loadingAlert && typeof loadingAlert.close === 'function') {
        loadingAlert.close();
      }

      if (result.success) {
        await showSuccess(
          product ? 'Product Updated!' : 'Product Created!',
          product ? 'Your product has been updated successfully.' : 'Your product has been created successfully.'
        );
        onProductSaved?.(result.data);
        onClose();
      } else {
        await showError('Save Failed', result.error || 'Failed to save product. Please try again.');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      
      let errorMessage = 'Failed to save product. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      await showError('Save Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={handleFormClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onBlur={() => validateField('name', formData.name)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${getError('name','Product Name') ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter product name"
              />
              {getError('name','Product Name') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getError('name','Product Name')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                onBlur={() => validateField('category', formData.category)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${getError('category','Category') ? 'border-red-500' : 'border-gray-300'}`}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {getError('category','Category') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getError('category','Category')}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={() => validateField('description', formData.description)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${getError('description','Description') ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Describe your product..."
            />
            {getError('description','Description') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {getError('description','Description')}
              </p>
            )}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (LKR) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                onBlur={() => validateField('price', formData.price)}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${getError('price','Price') ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="0.00"
              />
              {getError('price','Price') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getError('price','Price')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Price (LKR) *
              </label>
              <input
                type="number"
                name="displayprice"
                value={formData.displayprice}
                onChange={handleInputChange}
                onBlur={() => validateField('displayprice', formData.displayprice)}
                required
                step="0.01"
                min="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${getError('displayprice','Display Price') ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter display price"
              />
              {getError('displayprice','Display Price') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getError('displayprice','Display Price')}
                </p>
              )}
              {!formData.displayprice && !errors.displayprice && (
                <p className="mt-1 text-xs text-orange-600">
                  WARNING: Display Price is required (must be less than or equal to regular price)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount (%) 
                <span className="text-xs text-green-600 font-normal ml-1">- Auto-calculated</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  readOnly
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-xs text-gray-400">%</span>
                </div>
              </div>
              {formData.price && formData.displayprice && formData.discount > 0 && (
                <p className="mt-1 text-xs text-green-600">
                  Savings: LKR {(parseFloat(formData.price) - parseFloat(formData.displayprice)).toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Unit and Stock */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                onBlur={() => validateField('unit', formData.unit)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${getError('unit','Unit') ? 'border-red-500' : 'border-gray-300'}`}
              >
                {units.map(unit => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
              {getError('unit','Unit') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getError('unit','Unit')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stock *
              </label>
              <input
                type="number"
                name="stock.current"
                value={formData.stock.current}
                onChange={handleInputChange}
                onBlur={() => validateField('stock.current', formData.stock.current)}
                required
                min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${getError('stock.current','Current Stock') ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter current stock quantity"
              />
              {getError('stock.current','Current Stock') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getError('stock.current','Current Stock')}
                </p>
              )}
              {!formData.stock.current && !getError('stock.current','Current Stock') && (
                <p className="mt-1 text-xs text-orange-600">
                  WARNING: This field is required - minimum stock is 1 (cannot be 0 or out of stock)
                </p>
              )}
            </div>
          </div>

          {/* Additional Stock Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Stock *
              </label>
              <input
                type="number"
                name="stock.maximum"
                value={formData.stock.maximum}
                onChange={handleInputChange}
                onBlur={() => validateField('stock.maximum', formData.stock.maximum)}
                required
                min="2"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${getError('stock.maximum','Maximum Stock') ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter maximum stock quantity"
              />
              {getError('stock.maximum','Maximum Stock') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getError('stock.maximum','Maximum Stock')}
                </p>
              )}
              {!formData.stock.maximum && !getError('stock.maximum','Maximum Stock') && (
                <p className="mt-1 text-xs text-orange-600">
                  WARNING: Maximum Stock is required - must be greater than current stock
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Stock *
              </label>
              <input
                type="number"
                name="stock.minimum"
                value={formData.stock.minimum}
                onChange={handleInputChange}
                onBlur={() => validateField('stock.minimum', formData.stock.minimum)}
                required
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${getError('stock.minimum','Minimum Stock') ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter minimum stock"
              />
              {getError('stock.minimum','Minimum Stock') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getError('stock.minimum','Minimum Stock')}
                </p>
              )}
              {!formData.stock.minimum && !getError('stock.minimum','Minimum Stock') && (
                <p className="mt-1 text-xs text-orange-600">
                  WARNING: Minimum Stock is required (must be &lt; current stock)
                </p>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shelf Life (days) *
              </label>
              <input
                type="number"
                name="shelfLife"
                value={formData.shelfLife}
                onChange={handleInputChange}
                onBlur={() => validateField('shelfLife', formData.shelfLife)}
                required
                min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${getError('shelfLife','Shelf Life') ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter shelf life in days"
              />
              {getError('shelfLife','Shelf Life') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getError('shelfLife','Shelf Life')}
                </p>
              )}
              {!formData.shelfLife && !getError('shelfLife','Shelf Life') && (
                <p className="mt-1 text-xs text-orange-600">
                  WARNING: Shelf Life is required (1-365 days)
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                onBlur={() => validateField('isFeatured', formData.isFeatured)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="isFeatured" className="ml-2 text-sm font-medium text-gray-700">
                Feature this product
              </label>
            </div>
          </div>

          {/* Storage Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Storage Instructions *
            </label>
            <textarea
              name="storageInstructions"
              value={formData.storageInstructions}
              onChange={handleInputChange}
              onBlur={() => validateField('storageInstructions', formData.storageInstructions)}
              required
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${getError('storageInstructions','Storage Instructions') ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter storage instructions"
            />
            {getError('storageInstructions','Storage Instructions') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {getError('storageInstructions','Storage Instructions')}
              </p>
            )}
            {!formData.storageInstructions && !getError('storageInstructions','Storage Instructions') && (
              <p className="mt-1 text-xs text-orange-600">
                WARNING: Storage Instructions is required (5-500 characters)
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags *
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                name="newTag"
                value={newTag}
                onChange={(e) => {
                  setNewTag(e.target.value);
                  validateField('newTag', e.target.value);
                }}
                onBlur={() => validateField('newTag', newTag)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.newTag || errors.Tags ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {/* Tags validation feedback */}
            {(errors.newTag || errors.Tags) && (
              <div className="mt-2">
                {errors.newTag && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.newTag}
                  </p>
                )}
                {errors.Tags && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.Tags}
                  </p>
                )}
              </div>
            )}
            {/* Tags requirement notice */}
            {formData.tags.length === 0 && !errors.Tags && (
              <div className="mt-2">
                <p className="text-sm text-orange-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  WARNING: At least one tag is required
                </p>
              </div>
            )}
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>
            
            {/* Image Upload */}
            <div className="mb-4">
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-500">Click to upload images</span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image Preview */}
            {imagePreview.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreview.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Image validation feedback */}
            {errors.Images && (
              <div className="mt-2">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.Images}
                </p>
              </div>
            )}
            
            {/* Image requirement notice */}
            {formData.images.length === 0 && !errors.Images && (
              <div className="mt-2">
                <p className="text-sm text-orange-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  WARNING: At least one product image is required
                </p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleFormClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={(e) => {
                console.log('🖱️ Update Product button clicked!');
                console.log('Event object:', e);
                console.log('Loading state:', loading);
                console.log('Product data:', product);
                handleSubmit(e);
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;
