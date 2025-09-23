import React, { useState, useEffect } from 'react';
import { ArrowLeft, Truck, MapPin, User, Phone, Mail, FileText, CreditCard } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function ShippingDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const [formData, setFormData] = useState({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    shippingAddress: {
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      phone: ''
    },
    billingAddress: {
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Sri Lanka'
    },
    notes: '',
    sameAsShipping: true
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Load order data from localStorage on mount
  useEffect(() => {
    const loadOrderData = () => {
      try {
        const storedOrderData = localStorage.getItem("orderData");
        if (storedOrderData) {
          const orderInfo = JSON.parse(storedOrderData);
          setOrderData(orderInfo);
          console.log("Order ID from URL:", orderId);
        } else {
          navigate('/cart');
        }
      } catch (error) {
        console.error('Error loading order data:', error);
        navigate('/cart');
      }
    };

    loadOrderData();
  }, [navigate, orderId]);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    // Sri Lankan phone number validation: supports +94 or 0 prefix
    const phoneRegex = /^(\+94|0)?[1-9]\d{8}$/;
    const cleanPhone = phone.replace(/[\s-]/g, '');
    return phoneRegex.test(cleanPhone);
  };

  const validateName = (name) => {
    // At least 2 characters, letters, spaces, hyphens, and apostrophes only
    const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
    return nameRegex.test(name.trim());
  };

  const validateStreetAddress = (address) => {
    // At least 5 characters, alphanumeric with common punctuation
    return address.trim().length >= 5 && address.trim().length <= 100;
  };

  const validateCity = (city) => {
    // Letters, spaces, hyphens only, 2-50 characters
    const cityRegex = /^[a-zA-Z\s'-]{2,50}$/;
    return cityRegex.test(city.trim());
  };

  const validateZipCode = (zipCode) => {
    // Sri Lankan postal codes: 5 digits
    const zipRegex = /^\d{5}$/;
    return zipRegex.test(zipCode.trim());
  };

  const validateNotes = (notes) => {
    // Optional field, max 500 characters
    return notes.length <= 500;
  };

  // Field validation function
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'contactName':
        if (!value.trim()) {
          error = 'Contact name is required';
        } else if (!validateName(value)) {
          error = 'Please enter a valid name (2-50 characters, letters only)';
        }
        break;
        
      case 'contactEmail':
        if (!value.trim()) {
          error = 'Email address is required';
        } else if (!validateEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;
        
      case 'contactPhone':
        if (!value.trim()) {
          error = 'Phone number is required';
        } else if (!validatePhone(value)) {
          error = 'Please enter a valid Sri Lankan phone number';
        }
        break;
        
      case 'shippingAddress.name':
        if (!value.trim()) {
          error = 'Recipient name is required';
        } else if (!validateName(value)) {
          error = 'Please enter a valid recipient name (2-50 characters, letters only)';
        }
        break;
        
      case 'shippingAddress.street':
        if (!value.trim()) {
          error = 'Street address is required';
        } else if (!validateStreetAddress(value)) {
          error = 'Please enter a valid street address (5-100 characters)';
        }
        break;
        
      case 'shippingAddress.city':
        if (!value.trim()) {
          error = 'City is required';
        } else if (!validateCity(value)) {
          error = 'Please enter a valid city name (2-50 characters, letters only)';
        }
        break;
        
      case 'shippingAddress.state':
        if (!value.trim()) {
          error = 'Province is required';
        }
        break;
        
      case 'shippingAddress.zipCode':
        if (!value.trim()) {
          error = 'Postal code is required';
        } else if (!validateZipCode(value)) {
          error = 'Please enter a valid 5-digit postal code';
        }
        break;
        
      case 'shippingAddress.phone':
        if (!value.trim()) {
          error = 'Phone number is required';
        } else if (!validatePhone(value)) {
          error = 'Please enter a valid Sri Lankan phone number';
        }
        break;
        
      case 'billingAddress.name':
        if (!formData.sameAsShipping && !value.trim()) {
          error = 'Billing name is required';
        } else if (!formData.sameAsShipping && !validateName(value)) {
          error = 'Please enter a valid billing name (2-50 characters, letters only)';
        }
        break;
        
      case 'billingAddress.street':
        if (!formData.sameAsShipping && !value.trim()) {
          error = 'Billing street address is required';
        } else if (!formData.sameAsShipping && !validateStreetAddress(value)) {
          error = 'Please enter a valid billing address (5-100 characters)';
        }
        break;
        
      case 'billingAddress.city':
        if (!formData.sameAsShipping && !value.trim()) {
          error = 'Billing city is required';
        } else if (!formData.sameAsShipping && !validateCity(value)) {
          error = 'Please enter a valid billing city (2-50 characters, letters only)';
        }
        break;
        
      case 'billingAddress.state':
        if (!formData.sameAsShipping && !value.trim()) {
          error = 'Billing province is required';
        }
        break;
        
      case 'billingAddress.zipCode':
        if (!formData.sameAsShipping && !value.trim()) {
          error = 'Billing postal code is required';
        } else if (!formData.sameAsShipping && !validateZipCode(value)) {
          error = 'Please enter a valid 5-digit billing postal code';
        }
        break;
        
      case 'notes':
        if (!validateNotes(value)) {
          error = 'Notes must be less than 500 characters';
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      
      // If "same as shipping" is checked, copy shipping to billing
      if (name === 'sameAsShipping' && checked) {
        setFormData(prev => ({
          ...prev,
          billingAddress: {
            ...prev.shippingAddress,
            country: 'Sri Lanka'
          }
        }));
        
        // Clear billing address errors when same as shipping is checked
        const newErrors = { ...errors };
        Object.keys(newErrors).forEach(key => {
          if (key.startsWith('billingAddress.')) {
            delete newErrors[key];
          }
        });
        setErrors(newErrors);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field in real-time
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Mark field as touched on blur
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field on blur
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate all fields
    newErrors.contactName = validateField('contactName', formData.contactName);
    newErrors.contactEmail = validateField('contactEmail', formData.contactEmail);
    newErrors.contactPhone = validateField('contactPhone', formData.contactPhone);
    
    newErrors['shippingAddress.name'] = validateField('shippingAddress.name', formData.shippingAddress.name);
    newErrors['shippingAddress.street'] = validateField('shippingAddress.street', formData.shippingAddress.street);
    newErrors['shippingAddress.city'] = validateField('shippingAddress.city', formData.shippingAddress.city);
    newErrors['shippingAddress.state'] = validateField('shippingAddress.state', formData.shippingAddress.state);
    newErrors['shippingAddress.zipCode'] = validateField('shippingAddress.zipCode', formData.shippingAddress.zipCode);
    newErrors['shippingAddress.phone'] = validateField('shippingAddress.phone', formData.shippingAddress.phone);
    
    // Only validate billing address if different from shipping
    if (!formData.sameAsShipping) {
      newErrors['billingAddress.name'] = validateField('billingAddress.name', formData.billingAddress.name);
      newErrors['billingAddress.street'] = validateField('billingAddress.street', formData.billingAddress.street);
      newErrors['billingAddress.city'] = validateField('billingAddress.city', formData.billingAddress.city);
      newErrors['billingAddress.state'] = validateField('billingAddress.state', formData.billingAddress.state);
      newErrors['billingAddress.zipCode'] = validateField('billingAddress.zipCode', formData.billingAddress.zipCode);
    }
    
    newErrors.notes = validateField('notes', formData.notes);
    
    // Remove empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) {
        delete newErrors[key];
      }
    });
    
    // Mark all fields as touched
    const allFields = [
      'contactName', 'contactEmail', 'contactPhone',
      'shippingAddress.name', 'shippingAddress.street', 'shippingAddress.city',
      'shippingAddress.state', 'shippingAddress.zipCode', 'shippingAddress.phone',
      'notes'
    ];
    
    if (!formData.sameAsShipping) {
      allFields.push(
        'billingAddress.name', 'billingAddress.street', 'billingAddress.city',
        'billingAddress.state', 'billingAddress.zipCode'
      );
    }
    
    const newTouched = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    
    setTouched(newTouched);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      return;
    }

    setLoading(true);

    try {
      // Prepare shipping data
      const shippingData = {
        contactName: formData.contactName.trim(),
        contactEmail: formData.contactEmail.trim().toLowerCase(),
        contactPhone: formData.contactPhone.replace(/[\s-]/g, ''), // Clean phone number
        shippingAddress: {
          ...formData.shippingAddress,
          name: formData.shippingAddress.name.trim(),
          street: formData.shippingAddress.street.trim(),
          city: formData.shippingAddress.city.trim(),
          zipCode: formData.shippingAddress.zipCode.trim(),
          phone: formData.shippingAddress.phone.replace(/[\s-]/g, '') // Clean phone number
        },
        billingAddress: formData.sameAsShipping ? {
          ...formData.shippingAddress,
          name: formData.shippingAddress.name.trim(),
          street: formData.shippingAddress.street.trim(),
          city: formData.shippingAddress.city.trim(),
          zipCode: formData.shippingAddress.zipCode.trim(),
          country: 'Sri Lanka'
        } : {
          ...formData.billingAddress,
          name: formData.billingAddress.name.trim(),
          street: formData.billingAddress.street.trim(),
          city: formData.billingAddress.city.trim(),
          zipCode: formData.billingAddress.zipCode.trim()
        },
        notes: formData.notes.trim()
      };

      // Save shipping information to the order
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/order/shipping/${orderId}`,
        shippingData
      );

      if (response.data.success) {
        // Store updated order data
        const updatedOrderData = {
          ...orderData,
          ...shippingData
        };
        localStorage.setItem("orderData", JSON.stringify(updatedOrderData));
        
        // Navigate to payment page
        navigate(`/payment/${orderId}`);
      } else {
        console.error('Failed to save shipping information:', response.data.message);
        alert('Failed to save shipping information. Please try again.');
      }
    } catch (error) {
      console.error('Error saving shipping information:', error);
      if (error.response?.data?.errors) {
        // Show validation errors from server
        setErrors(error.response.data.errors);
      } else {
        alert('An error occurred while saving. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get field error class
  const getFieldClass = (fieldName) => {
    const hasError = errors[fieldName] && touched[fieldName];
    return `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
      hasError 
        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
    }`;
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  const totalItems = orderData.items.reduce((total, item) => total + item.quantity, 0);
  const hasErrors = Object.keys(errors).some(key => errors[key] && touched[key]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Cart</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Shipping Details</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2 text-green-600">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">✓</span>
              </div>
              <span className="text-sm font-medium">Cart</span>
            </div>
            <div className="w-12 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Truck size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium">Shipping</span>
            </div>
            <div className="w-12 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <CreditCard size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium">Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Summary */}
      {hasErrors && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Please correct the following errors:
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {Object.keys(errors).map(key => {
                      if (errors[key] && touched[key]) {
                        return <li key={key}>{errors[key]}</li>;
                      }
                      return null;
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Shipping Form - Left Side */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <User size={20} className="text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClass('contactName')}
                      placeholder="Enter your full name"
                      maxLength="50"
                    />
                    {errors.contactName && touched.contactName && (
                      <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClass('contactPhone')}
                      placeholder="+94 XX XXX XXXX or 0XX XXX XXXX"
                    />
                    {errors.contactPhone && touched.contactPhone && (
                      <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClass('contactEmail')}
                    placeholder="your@email.com"
                  />
                  {errors.contactEmail && touched.contactEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin size={20} className="text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="shippingAddress.name"
                      value={formData.shippingAddress.name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClass('shippingAddress.name')}
                      placeholder="Full name of recipient"
                      maxLength="50"
                    />
                    {errors['shippingAddress.name'] && touched['shippingAddress.name'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.name']}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="shippingAddress.street"
                      value={formData.shippingAddress.street}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClass('shippingAddress.street')}
                      placeholder="House number, street name, area"
                      maxLength="100"
                    />
                    {errors['shippingAddress.street'] && touched['shippingAddress.street'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.street']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="shippingAddress.city"
                      value={formData.shippingAddress.city}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClass('shippingAddress.city')}
                      placeholder="City"
                      maxLength="50"
                    />
                    {errors['shippingAddress.city'] && touched['shippingAddress.city'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.city']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="shippingAddress.state"
                      value={formData.shippingAddress.state}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClass('shippingAddress.state')}
                    >
                      <option value="">Select Province</option>
                      <option value="Western">Western Province</option>
                      <option value="Central">Central Province</option>
                      <option value="Southern">Southern Province</option>
                      <option value="Northern">Northern Province</option>
                      <option value="Eastern">Eastern Province</option>
                      <option value="North Western">North Western Province</option>
                      <option value="North Central">North Central Province</option>
                      <option value="Uva">Uva Province</option>
                      <option value="Sabaragamuwa">Sabaragamuwa Province</option>
                    </select>
                    {errors['shippingAddress.state'] && touched['shippingAddress.state'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.state']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="shippingAddress.zipCode"
                      value={formData.shippingAddress.zipCode}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClass('shippingAddress.zipCode')}
                      placeholder="00000"
                      maxLength="5"
                    />
                    {errors['shippingAddress.zipCode'] && touched['shippingAddress.zipCode'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.zipCode']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="shippingAddress.phone"
                      value={formData.shippingAddress.phone}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClass('shippingAddress.phone')}
                      placeholder="+94 XX XXX XXXX or 0XX XXX XXXX"
                    />
                    {errors['shippingAddress.phone'] && touched['shippingAddress.phone'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.phone']}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText size={20} className="text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Billing Address</h2>
                </div>

                <div className="mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="sameAsShipping"
                      checked={formData.sameAsShipping}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Same as shipping address</span>
                  </label>
                </div>

                {!formData.sameAsShipping && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Billing Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="billingAddress.name"
                        value={formData.billingAddress.name}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={getFieldClass('billingAddress.name')}
                        placeholder="Full name for billing"
                        maxLength="50"
                      />
                      {errors['billingAddress.name'] && touched['billingAddress.name'] && (
                        <p className="text-red-500 text-sm mt-1">{errors['billingAddress.name']}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="billingAddress.street"
                        value={formData.billingAddress.street}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={getFieldClass('billingAddress.street')}
                        placeholder="Billing address"
                        maxLength="100"
                      />
                      {errors['billingAddress.street'] && touched['billingAddress.street'] && (
                        <p className="text-red-500 text-sm mt-1">{errors['billingAddress.street']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="billingAddress.city"
                        value={formData.billingAddress.city}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={getFieldClass('billingAddress.city')}
                        placeholder="City"
                        maxLength="50"
                      />
                      {errors['billingAddress.city'] && touched['billingAddress.city'] && (
                        <p className="text-red-500 text-sm mt-1">{errors['billingAddress.city']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Province <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="billingAddress.state"
                        value={formData.billingAddress.state}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={getFieldClass('billingAddress.state')}
                      >
                        <option value="">Select Province</option>
                        <option value="Western">Western Province</option>
                        <option value="Central">Central Province</option>
                        <option value="Southern">Southern Province</option>
                        <option value="Northern">Northern Province</option>
                        <option value="Eastern">Eastern Province</option>
                        <option value="North Western">North Western Province</option>
                        <option value="North Central">North Central Province</option>
                        <option value="Uva">Uva Province</option>
                        <option value="Sabaragamuwa">Sabaragamuwa Province</option>
                      </select>
                      {errors['billingAddress.state'] && touched['billingAddress.state'] && (
                        <p className="text-red-500 text-sm mt-1">{errors['billingAddress.state']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="billingAddress.zipCode"
                        value={formData.billingAddress.zipCode}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={getFieldClass('billingAddress.zipCode')}
                        placeholder="00000"
                        maxLength="5"
                      />
                      {errors['billingAddress.zipCode'] && touched['billingAddress.zipCode'] && (
                        <p className="text-red-500 text-sm mt-1">{errors['billingAddress.zipCode']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        name="billingAddress.country"
                        value={formData.billingAddress.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText size={20} className="text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Additional Notes</h2>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    rows={4}
                    className={getFieldClass('notes')}
                    placeholder="Any special instructions for delivery (maximum 500 characters)"
                    maxLength="500"
                  />
                  <div className="flex justify-between mt-1">
                    {errors.notes && touched.notes && (
                      <p className="text-red-500 text-sm">{errors.notes}</p>
                    )}
                    <p className="text-gray-400 text-xs ml-auto">
                      {formData.notes.length}/500 characters
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm sticky top-24">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              </div>

              <div className="p-6">
                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded bg-gray-100"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        Rs. {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">Rs. {orderData.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {orderData.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount:</span>
                      <span className="text-green-600 font-medium">-Rs. {orderData.discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">
                      {orderData.shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `Rs. ${orderData.shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">Rs. {orderData.tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-lg font-semibold text-gray-900">Rs. {orderData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={loading || hasErrors}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                      loading || hasErrors
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to Payment</span>
                        <CreditCard size={16} />
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate('/cart')}
                    className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Back to Cart
                  </button>
                </div>

                {/* Form Status Indicator */}
                {hasErrors && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">!</span>
                      </div>
                      <p className="text-sm text-red-800 font-medium">
                        Please fix errors above to continue
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Truck size={16} className="text-green-600" />
                    <p className="text-sm text-green-800 font-medium">
                      Free shipping on orders over Rs. 2000
                    </p>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Estimated delivery: 2-5 business days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}