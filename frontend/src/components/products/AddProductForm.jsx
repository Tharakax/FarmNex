import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Minus, AlertCircle, Save, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI } from '../../services/productAPI';
import { FormValidator } from '../../utils/validation';
import { showError, showSuccess, showLoading } from '../../utils/sweetAlert';

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
      setErrors({});
      setNewTag('');
    }
  }, [isOpen]);

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
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear specific field error when user starts typing
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }

    // Real-time validation for current field
    validateField(name, type === 'checkbox' ? checked : value);
  };

  // Real-time field validation
  const validateField = (fieldName, fieldValue) => {
    const validator = new FormValidator();
    
    switch (fieldName) {
      case 'name':
        validator.required(fieldValue, 'Product Name')
                 .minLength(fieldValue, 2, 'Product Name')
                 .maxLength(fieldValue, 100, 'Product Name');
        break;
      
      case 'description':
        validator.required(fieldValue, 'Description')
                 .minLength(fieldValue, 10, 'Description')
                 .maxLength(fieldValue, 1000, 'Description');
        break;
      
      case 'price':
        validator.required(fieldValue, 'Price')
                 .price(fieldValue, 'Price')
                 .minValue(fieldValue, 0.01, 'Price')
                 .maxValue(fieldValue, 999999, 'Price');
        break;
      
      case 'displayprice':
        if (fieldValue) {
          validator.price(fieldValue, 'Display Price')
                   .minValue(fieldValue, 0.01, 'Display Price');
        }
        break;
      
      case 'discount':
        if (fieldValue) {
          validator.numeric(fieldValue, 'Discount')
                   .minValue(fieldValue, 0, 'Discount')
                   .maxValue(fieldValue, 100, 'Discount');
        }
        break;
      
      case 'stock.current':
        validator.required(fieldValue, 'Current Stock')
                 .numeric(fieldValue, 'Current Stock')
                 .minValue(fieldValue, 0, 'Current Stock');
        break;
      
      case 'stock.maximum':
        if (fieldValue) {
          validator.numeric(fieldValue, 'Maximum Stock')
                   .minValue(fieldValue, 1, 'Maximum Stock');
          
          // Ensure maximum is greater than current
          if (formData.stock.current && Number(fieldValue) < Number(formData.stock.current)) {
            validator.addError('Maximum Stock', 'Maximum stock must be greater than current stock');
          }
        }
        break;
      
      case 'stock.minimum':
        if (fieldValue) {
          validator.numeric(fieldValue, 'Minimum Stock')
                   .minValue(fieldValue, 0, 'Minimum Stock');
          
          // Ensure minimum is less than current
          if (formData.stock.current && Number(fieldValue) > Number(formData.stock.current)) {
            validator.addError('Minimum Stock', 'Minimum stock must be less than current stock');
          }
        }
        break;
      
      case 'shelfLife':
        if (fieldValue) {
          validator.numeric(fieldValue, 'Shelf Life')
                   .minValue(fieldValue, 1, 'Shelf Life')
                   .maxValue(fieldValue, 365, 'Shelf Life');
        }
        break;
        
      case 'storageInstructions':
        if (fieldValue) {
          validator.maxLength(fieldValue, 500, 'Storage Instructions');
        }
        break;
    }

    const fieldErrors = validator.getFieldErrors(fieldName);
    if (fieldErrors.length > 0) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldErrors[0]
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target.result;
          setImagePreview(prev => [...prev, imageUrl]);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, imageUrl]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = async () => {
    const validator = new FormValidator();
    
    // Validate all required fields
    validator.required(formData.name, 'Product Name')
             .minLength(formData.name, 2, 'Product Name')
             .maxLength(formData.name, 100, 'Product Name');
    
    validator.required(formData.description, 'Description')
             .minLength(formData.description, 10, 'Description')
             .maxLength(formData.description, 1000, 'Description');
    
    validator.required(formData.price, 'Price')
             .price(formData.price, 'Price')
             .minValue(formData.price, 0.01, 'Price')
             .maxValue(formData.price, 999999, 'Price');
    
    validator.required(formData.stock.current, 'Current Stock')
             .numeric(formData.stock.current, 'Current Stock')
             .minValue(formData.stock.current, 0, 'Current Stock');
    
    // Validate optional fields if they have values
    if (formData.displayprice) {
      validator.price(formData.displayprice, 'Display Price')
               .minValue(formData.displayprice, 0.01, 'Display Price');
    }
    
    if (formData.discount) {
      validator.numeric(formData.discount, 'Discount')
               .minValue(formData.discount, 0, 'Discount')
               .maxValue(formData.discount, 100, 'Discount');
    }
    
    if (formData.stock.maximum) {
      validator.numeric(formData.stock.maximum, 'Maximum Stock')
               .minValue(formData.stock.maximum, 1, 'Maximum Stock');
      
      if (formData.stock.current && Number(formData.stock.maximum) < Number(formData.stock.current)) {
        validator.addError('Maximum Stock', 'Maximum stock must be greater than current stock');
      }
    }
    
    if (formData.stock.minimum) {
      validator.numeric(formData.stock.minimum, 'Minimum Stock')
               .minValue(formData.stock.minimum, 0, 'Minimum Stock');
      
      if (formData.stock.current && Number(formData.stock.minimum) > Number(formData.stock.current)) {
        validator.addError('Minimum Stock', 'Minimum stock must be less than current stock');
      }
    }
    
    if (formData.shelfLife) {
      validator.numeric(formData.shelfLife, 'Shelf Life')
               .minValue(formData.shelfLife, 1, 'Shelf Life')
               .maxValue(formData.shelfLife, 365, 'Shelf Life');
    }
    
    if (formData.storageInstructions) {
      validator.maxLength(formData.storageInstructions, 500, 'Storage Instructions');
    }
    
    // Custom business logic validations
    if (formData.images.length === 0) {
      validator.addError('Images', 'Please add at least one product image');
    }
    
    if (formData.tags.length > 10) {
      validator.addError('Tags', 'Maximum 10 tags allowed');
    }
    
    const validationErrors = validator.getAllErrors();
    setErrors(validationErrors);
    
    // Show SweetAlert with all validation errors if there are any
    if (validator.hasErrors()) {
      const errorList = Object.entries(validationErrors)
        .map(([field, errors]) => `• ${errors[0]}`)
        .join('\n');
      
      await showError(
        errorList,
        'Please Fix These Validation Errors'
      );
    }
    
    return !validator.hasErrors();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Comprehensive validation
    if (!(await validateForm())) {
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
          minimum: formData.stock.minimum ? parseInt(formData.stock.minimum) : 5,
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
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
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
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe your product..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.description}
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
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.price}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Price (LKR)
              </label>
              <input
                type="number"
                name="displayprice"
                value={formData.displayprice}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Leave empty to use price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {units.map(unit => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
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
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors['stock.current'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors['stock.current'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors['stock.current']}
                </p>
              )}
            </div>
          </div>

          {/* Additional Stock Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Stock
              </label>
              <input
                type="number"
                name="stock.maximum"
                value={formData.stock.maximum}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Stock
              </label>
              <input
                type="number"
                name="stock.minimum"
                value={formData.stock.minimum}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="5"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shelf Life (days)
              </label>
              <input
                type="number"
                name="shelfLife"
                value={formData.shelfLife}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="7"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
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
              Storage Instructions
            </label>
            <textarea
              name="storageInstructions"
              value={formData.storageInstructions}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="How should this product be stored?"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
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
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
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
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
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
