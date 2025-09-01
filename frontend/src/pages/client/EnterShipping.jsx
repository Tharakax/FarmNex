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

  // Load order data from localStorage on mount
    useEffect(() => {
    const loadOrderData = () => {
      try {
        const storedOrderData = localStorage.getItem("orderData");
        if (storedOrderData) {
          const orderInfo = JSON.parse(storedOrderData);
          setOrderData(orderInfo);
          
          // If you have orderId from params, you can use it
          console.log("Order ID from URL:", orderId);
        } else {
          // If no order data found, redirect back to cart
          navigate('/cart');
        }
      } catch (error) {
        console.error('Error loading order data:', error);
        navigate('/cart');
      }
    };

    loadOrderData();
  }, [navigate, orderId]);

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
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Contact information validation
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    }
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Phone number is required';
    }

    // Shipping address validation
    if (!formData.shippingAddress.name.trim()) {
      newErrors['shippingAddress.name'] = 'Recipient name is required';
    }
    if (!formData.shippingAddress.street.trim()) {
      newErrors['shippingAddress.street'] = 'Street address is required';
    }
    if (!formData.shippingAddress.city.trim()) {
      newErrors['shippingAddress.city'] = 'City is required';
    }
    if (!formData.shippingAddress.state.trim()) {
      newErrors['shippingAddress.state'] = 'Province is required';
    }
    if (!formData.shippingAddress.zipCode.trim()) {
      newErrors['shippingAddress.zipCode'] = 'Postal code is required';
    }
    if (!formData.shippingAddress.phone.trim()) {
      newErrors['shippingAddress.phone'] = 'Phone number is required';
    }

    // Billing address validation (only if different from shipping)
    if (!formData.sameAsShipping) {
      if (!formData.billingAddress.name.trim()) {
        newErrors['billingAddress.name'] = 'Billing name is required';
      }
      if (!formData.billingAddress.street.trim()) {
        newErrors['billingAddress.street'] = 'Billing street address is required';
      }
      if (!formData.billingAddress.city.trim()) {
        newErrors['billingAddress.city'] = 'Billing city is required';
      }
      if (!formData.billingAddress.state.trim()) {
        newErrors['billingAddress.state'] = 'Billing province is required';
      }
      if (!formData.billingAddress.zipCode.trim()) {
        newErrors['billingAddress.zipCode'] = 'Billing postal code is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }



    setLoading(true);

    try {
        console.log(orderId);

      // Prepare shipping data
      const shippingData = {
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.sameAsShipping ? formData.shippingAddress : formData.billingAddress,
        notes: formData.notes
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
        console.log("Hi")
        // Navigate to payment page
        navigate(`/payment/${orderId}`);
      } else {
        console.error('Failed to save shipping information:', response.data.message);
        alert('Failed to save shipping information. Please try again.');
      }
    } catch (error) {
      console.error('Error saving shipping information:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Shipping Form - Left Side */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <User size={20} className="text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.contactName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.contactName && (
                      <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+94 XX XXX XXXX"
                    />
                    {errors.contactPhone && (
                      <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.contactEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.contactEmail && (
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
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      name="shippingAddress.name"
                      value={formData.shippingAddress.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors['shippingAddress.name'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Full name of recipient"
                    />
                    {errors['shippingAddress.name'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.name']}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="shippingAddress.street"
                      value={formData.shippingAddress.street}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors['shippingAddress.street'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="House number, street name"
                    />
                    {errors['shippingAddress.street'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.street']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="shippingAddress.city"
                      value={formData.shippingAddress.city}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors['shippingAddress.city'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="City"
                    />
                    {errors['shippingAddress.city'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.city']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province *
                    </label>
                    <select
                      name="shippingAddress.state"
                      value={formData.shippingAddress.state}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors['shippingAddress.state'] ? 'border-red-500' : 'border-gray-300'
                      }`}
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
                    {errors['shippingAddress.state'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.state']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="shippingAddress.zipCode"
                      value={formData.shippingAddress.zipCode}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors['shippingAddress.zipCode'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="00000"
                    />
                    {errors['shippingAddress.zipCode'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.zipCode']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="shippingAddress.phone"
                      value={formData.shippingAddress.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors['shippingAddress.phone'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+94 XX XXX XXXX"
                    />
                    {errors['shippingAddress.phone'] && (
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
                        Billing Name *
                      </label>
                      <input
                        type="text"
                        name="billingAddress.name"
                        value={formData.billingAddress.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors['billingAddress.name'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Full name for billing"
                      />
                      {errors['billingAddress.name'] && (
                        <p className="text-red-500 text-sm mt-1">{errors['billingAddress.name']}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="billingAddress.street"
                        value={formData.billingAddress.street}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors['billingAddress.street'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Billing address"
                      />
                      {errors['billingAddress.street'] && (
                        <p className="text-red-500 text-sm mt-1">{errors['billingAddress.street']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="billingAddress.city"
                        value={formData.billingAddress.city}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors['billingAddress.city'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="City"
                      />
                      {errors['billingAddress.city'] && (
                        <p className="text-red-500 text-sm mt-1">{errors['billingAddress.city']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Province *
                      </label>
                      <select
                        name="billingAddress.state"
                        value={formData.billingAddress.state}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors['billingAddress.state'] ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                      {errors['billingAddress.state'] && (
                        <p className="text-red-500 text-sm mt-1">{errors['billingAddress.state']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="billingAddress.zipCode"
                        value={formData.billingAddress.zipCode}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors['billingAddress.zipCode'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="00000"
                      />
                      {errors['billingAddress.zipCode'] && (
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
                
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special instructions for delivery (optional)"
                />
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
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center space-x-2"
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