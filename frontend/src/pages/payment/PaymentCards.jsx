import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Star, StarOff, Loader, AlertCircle, Check, X, Edit } from 'lucide-react';
import { showDeleteConfirm } from '../../utils/sweetAlert';

// API configuration
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Real API functions
const api = {
  async getUserPaymentMethods() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/payment`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch payment methods`);
    }
    
    return await response.json();
  },

  async addPaymentMethod(data) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }
    
    // Generate a unique paymentMethodId for the card
    const paymentMethodId = `pm_${data.cardBrand}_${data.last4}_${Date.now()}`;
    
    const requestData = {
      paymentMethodId,
      cardBrand: data.cardBrand,
      last4: data.last4,
      expMonth: data.expMonth,
      expYear: data.expYear,
      billingDetails: data.billingDetails,
      isDefault: data.isDefault
    };
    
    const response = await fetch(`${API_BASE_URL}/api/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to add payment method`);
    }
    
    return await response.json();
  },

  async deletePaymentMethod(id) {
    const response = await fetch(`${API_BASE_URL}/api/payment/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete payment method');
    }
    
    return await response.json();
  },

  async updatePaymentMethod(id, data) {
    const response = await fetch(`${API_BASE_URL}/api/payment/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        billingDetails: data.billingDetails,
        isDefault: data.isDefault
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update payment method');
    }
    
    return await response.json();
  },

  async setDefaultPaymentMethod(id) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/payment/${id}/default`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to set default payment method`);
    }
    
    return await response.json();
  }
};

const PaymentCardsManager = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const loadPaymentMethods = async () => {
    setLoading(true);
    clearMessages();
    try {
      const response = await api.getUserPaymentMethods();
      if (response.success) {
        setCards(response.data);
      } else {
        setError(response.message || 'Failed to load payment methods');
      }
    } catch (err) {
      console.error('Error loading payment methods:', err);
      if (err.message.includes('401') || err.message.includes('Authentication')) {
        setError('Please log in to view payment methods');
      } else {
        setError('Failed to load payment methods');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async (cardData) => {
    setLoading(true);
    clearMessages();
    try {
      const response = await api.addPaymentMethod(cardData);
      if (response.success) {
        setCards(prev => [response.data, ...prev]);
        setShowAddForm(false);
        setSuccess('Payment method added successfully');
      } else {
        setError(response.message || 'Failed to add payment method');
      }
    } catch (err) {
      console.error('Error adding payment method:', err);
      if (err.message.includes('401') || err.message.includes('Authentication')) {
        setError('Please log in to add payment methods');
      } else {
        setError(err.message || 'Failed to add payment method');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setShowAddForm(true);
  };

  const handleUpdateCard = async (cardData) => {
    setLoading(true);
    clearMessages();
    try {
      const response = await api.updatePaymentMethod(editingCard._id, cardData);
      if (response.success) {
        setCards(prev => prev.map(card => 
          card._id === editingCard._id ? response.data : card
        ));
        setShowAddForm(false);
        setEditingCard(null);
        setSuccess('Payment method updated successfully');
      }
    } catch (err) {
      setError(err.message || 'Failed to update payment method');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    const result = await showDeleteConfirm('this payment method');
    
    if (!result.isConfirmed) return;
    
    setLoading(true);
    clearMessages();
    try {
      const response = await api.deletePaymentMethod(cardId);
      if (response.success) {
        setCards(prev => prev.filter(card => card._id !== cardId));
        setSuccess('Payment method deleted successfully');
      }
    } catch (err) {
      setError('Failed to delete payment method');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (cardId) => {
    setLoading(true);
    clearMessages();
    try {
      const response = await api.setDefaultPaymentMethod(cardId);
      if (response.success) {
        setCards(prev => prev.map(card => ({
          ...card,
          isDefault: card._id === cardId
        })));
        setSuccess('Default payment method updated');
      }
    } catch (err) {
      setError('Failed to set default payment method');
    } finally {
      setLoading(false);
    }
  };

  const getCardIcon = (brand) => {
    const brandColors = {
      visa: 'text-blue-600',
      mastercard: 'text-red-600',
      amex: 'text-green-600',
      discover: 'text-orange-600',
      jcb: 'text-purple-600',
      diners: 'text-gray-600',
      unionpay: 'text-red-500',
      unknown: 'text-gray-500'
    };
    return brandColors[brand] || 'text-gray-500';
  };

  const formatExpiryDate = (month, year) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  if (loading && cards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payment methods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
              <button
                onClick={() => setShowAddForm(true)}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Add Card
              </button>
            </div>
            
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-3">
                <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-800">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-3 flex items-start gap-3">
                <Check className="text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-green-800">{success}</p>
              </div>
            )}
          </div>

          <div className="p-6">
            {cards.length === 0 && !showAddForm ? (
              <div className="text-center py-12">
                <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
                <p className="text-gray-600 mb-4">Add your first payment method to get started.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Add Payment Method
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {cards.map((card) => (
                  <div key={card._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded flex items-center justify-center border">
                          <CreditCard size={20} className={getCardIcon(card.cardBrand)} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {card.cardBrand.charAt(0).toUpperCase() + card.cardBrand.slice(1)} •••• {card.last4}
                            </p>
                            {card.isDefault && (
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                                <Star size={12} />
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {card.billingDetails?.name} • Expires {formatExpiryDate(card.expMonth, card.expYear)}
                          </p>
                          {card.billingDetails?.address && (
                            <p className="text-xs text-gray-500">
                              {card.billingDetails.address.city}, {card.billingDetails.address.state || card.billingDetails.address.province}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCard(card)}
                          disabled={loading}
                          className="text-gray-400 hover:text-blue-500 disabled:opacity-50 transition-colors p-1"
                          title="Edit card"
                        >
                          <Edit size={18} />
                        </button>
                        {!card.isDefault && (
                          <button
                            onClick={() => handleSetDefault(card._id)}
                            disabled={loading}
                            className="text-gray-400 hover:text-yellow-500 disabled:opacity-50 transition-colors p-1"
                            title="Set as default"
                          >
                            <StarOff size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCard(card._id)}
                          disabled={loading}
                          className="text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors p-1"
                          title="Delete card"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

      </div>
      
      {showAddForm && (
        <AddCardModal 
          onClose={() => {
            setShowAddForm(false);
            setEditingCard(null);
            clearMessages();
          }}
          onAdd={editingCard ? handleUpdateCard : handleAddCard}
          editingCard={editingCard}
          loading={loading}
        />
      )}
    </div>
  );
};

const AddCardModal = ({ onClose, onAdd, editingCard, loading }) => {
  const [formData, setFormData] = useState({
    accountNumber: editingCard ? '**** **** **** ' + editingCard.last4 : '',
    cardBrand: editingCard ? editingCard.cardBrand : '',
    last4: editingCard ? editingCard.last4 : '',
    expMonth: editingCard ? editingCard.expMonth : '',
    expYear: editingCard ? editingCard.expYear : '',
    billingDetails: {
      name: editingCard ? editingCard.billingDetails?.name || '' : '',
      email: editingCard ? editingCard.billingDetails?.email || '' : '',
      address: {
        line1: editingCard ? editingCard.billingDetails?.address?.line1 || '' : '',
        city: editingCard ? editingCard.billingDetails?.address?.city || '' : '',
        province: editingCard ? (editingCard.billingDetails?.address?.state || editingCard.billingDetails?.address?.province || '') : '',
        postal_code: editingCard ? editingCard.billingDetails?.address?.postal_code || '' : '',
        country: 'Sri Lanka'
      }
    },
    isDefault: editingCard ? editingCard.isDefault : false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Sri Lankan provinces
  const sriLankanProvinces = [
    'Western Province',
    'Central Province',
    'Southern Province',
    'Northern Province',
    'Eastern Province',
    'North Western Province',
    'North Central Province',
    'Uva Province',
    'Sabaragamuwa Province'
  ];

  // Function to detect card type based on card number
  const detectCardType = (cardNumber) => {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    // Visa: starts with 4
    if (/^4/.test(cleaned)) {
      return 'visa';
    }
    
    // Mastercard: starts with 5 or 2
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
      return 'mastercard';
    }
    
    // American Express: starts with 34 or 37
    if (/^3[47]/.test(cleaned)) {
      return 'amex';
    }
    
    // Discover: starts with 6
    if (/^6(?:011|5)/.test(cleaned)) {
      return 'discover';
    }
    
    // JCB: starts with 35
    if (/^35/.test(cleaned)) {
      return 'jcb';
    }
    
    // Diners Club: starts with 30 or 36
    if (/^3[068]/.test(cleaned)) {
      return 'diners';
    }
    
    // UnionPay: starts with 62
    if (/^62/.test(cleaned)) {
      return 'unionpay';
    }
    
    return 'unknown';
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'accountNumber':
        if (!value) error = 'Account number is required';
        else if (!/^\d{16}$/.test(value)) error = 'Must be exactly 16 digits';
        break;
      case 'last4':
        if (!value) error = 'Last 4 digits are required';
        else if (!/^\d{4}$/.test(value)) error = 'Must be exactly 4 digits';
        break;
      case 'cardBrand':
        if (!value) error = 'Card brand is required';
        break;
      case 'expMonth':
        if (!value) error = 'Expiration month is required';
        break;
      case 'expYear':
        if (!value) error = 'Expiration year is required';
        break;
      case 'billingDetails.name':
        if (!value) error = 'Cardholder name is required';
        else if (value.length < 2) error = 'Name must be at least 2 characters';
        else if (/\d/.test(value)) error = 'Name cannot contain digits';
        break;
      case 'billingDetails.email':
        if (!value) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
      case 'billingDetails.address.line1':
        if (!value) error = 'Address is required';
        else if (value.length < 5) error = 'Address must be at least 5 characters';
        break;
      case 'billingDetails.address.city':
        if (!value) error = 'City is required';
        else if (value.length < 2) error = 'City must be at least 2 characters';
        break;
      case 'billingDetails.address.province':
        if (!value) error = 'Province is required';
        break;
      case 'billingDetails.address.postal_code':
        if (!value) error = 'Postal code is required';
        else if (!/^\d{5}$/.test(value)) error = 'Postal code must be 5 digits';
        break;
      case 'billingDetails.address.country':
        if (!value) error = 'Country is required';
        else if (value.toLowerCase() !== 'sri lanka') error = 'Country must be Sri Lanka';
        break;
      default:
        break;
    }
    
    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate all fields using the validateField function
    const fieldsToValidate = [
      ...(editingCard ? [] : ['accountNumber']), // Skip account number validation in edit mode
      'expMonth',
      'expYear',
      'billingDetails.name',
      'billingDetails.email',
      'billingDetails.address.line1',
      'billingDetails.address.city',
      'billingDetails.address.province',
      'billingDetails.address.postal_code',
      'billingDetails.address.country'
    ];
    
    fieldsToValidate.forEach(field => {
      let value;
      if (field.includes('.')) {
        const [parent, child, grandchild] = field.split('.');
        value = grandchild ? formData[parent]?.[child]?.[grandchild] : formData[parent]?.[child];
      } else {
        value = formData[field];
      }
      
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    // Ensure last4 is properly set and validated
    const last4Value = formData.last4 || (formData.accountNumber && formData.accountNumber.length >= 4 ? formData.accountNumber.slice(-4) : '');
    const last4Error = validateField('last4', last4Value);
    if (last4Error) {
      newErrors.last4 = last4Error;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate the field that was just blurred
    if (field.includes('.')) {
      const [parent, child, grandchild] = field.split('.');
      const value = grandchild 
        ? formData[parent][child][grandchild] 
        : formData[parent][child];
      
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      const error = validateField(field, formData[field]);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child, grandchild] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: grandchild ? {
            ...prev[parent][child],
            [grandchild]: value
          } : value
        }
      }));
      
      // Real-time validation for nested fields
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
      
      // Mark field as touched for real-time validation
      if (!touched[field]) {
        setTouched(prev => ({ ...prev, [field]: true }));
      }
    } else {
      setFormData(prev => {
        const newData = { ...prev, [field]: value };
        
        // Auto-extract last 4 digits when account number is entered
        if (field === 'accountNumber' && value.length >= 4) {
          newData.last4 = value.slice(-4);
          
          // Auto-detect and store card type based on account number
          const detectedCardType = detectCardType(value);
          newData.cardBrand = detectedCardType;
        }
        
        return newData;
      });
      
      // Real-time validation for top-level fields
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
      
      // Mark field as touched for real-time validation
      if (!touched[field]) {
        setTouched(prev => ({ ...prev, [field]: true }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Remove accountNumber from data sent to API (only save last4)
      const { accountNumber, ...dataToSave } = formData;
      
      // Convert province to state for backend compatibility
      if (dataToSave.billingDetails?.address?.province) {
        dataToSave.billingDetails.address.state = dataToSave.billingDetails.address.province;
        delete dataToSave.billingDetails.address.province;
      }
      
      onAdd(dataToSave);
    }
  };

  const getFieldError = (field) => {
    return touched[field] && errors[field];
  };

  // Check if form is valid for real-time feedback
  const isFormValid = () => {
    const requiredFields = [
      ...(editingCard ? [] : ['accountNumber']), // Skip account number validation in edit mode
      'expMonth',
      'expYear',
      'billingDetails.name',
      'billingDetails.email',
      'billingDetails.address.line1',
      'billingDetails.address.city',
      'billingDetails.address.province',
      'billingDetails.address.postal_code',
      'billingDetails.address.country'
    ];
    
    const basicValidation = requiredFields.every(field => {
      let value;
      if (field.includes('.')) {
        const [parent, child, grandchild] = field.split('.');
        value = grandchild ? formData[parent]?.[child]?.[grandchild] : formData[parent]?.[child];
      } else {
        value = formData[field];
      }
      
      const error = validateField(field, value);
      return !error;
    });
    
    // Also validate last4 field
    const last4Value = formData.last4 || (formData.accountNumber && formData.accountNumber.length >= 4 ? formData.accountNumber.slice(-4) : '');
    const last4Valid = !validateField('last4', last4Value);
    
    return basicValidation && last4Valid;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editingCard ? 'Edit Payment Method' : 'Add Payment Method'}
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {editingCard ? 'Card Number' : 'Account Number *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={editingCard ? undefined : (e) => handleInputChange('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 16))}
                  onBlur={editingCard ? undefined : () => handleBlur('accountNumber')}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    editingCard ? 'border-gray-300 bg-gray-50 text-gray-600' :
                    getFieldError('accountNumber') ? 'border-red-500' : 
                    formData.accountNumber.length === 16 ? 'border-green-500' : 'border-gray-300'
                  }`}
                  placeholder={editingCard ? "Card number cannot be changed" : "1234567890123456"}
                  maxLength={16}
                  disabled={loading || editingCard}
                  readOnly={editingCard}
                />
                {formData.accountNumber && formData.accountNumber.length > 0 && !editingCard && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className={`w-6 h-4 rounded border-2 ${
                      formData.accountNumber.length === 16 && !getFieldError('accountNumber') 
                        ? 'border-green-500 bg-green-100' 
                        : 'border-gray-300 bg-gray-100'
                    }`}>
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                        {formData.accountNumber.length === 16 && !getFieldError('accountNumber') ? '✓' : 
                         formData.accountNumber.length > 0 ? formData.accountNumber.length : ''}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {editingCard && (
                <p className="mt-1 text-sm text-gray-500">Card number cannot be changed for security reasons</p>
              )}
              {!editingCard && getFieldError('accountNumber') && (
                <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
              )}
              {!editingCard && formData.accountNumber && formData.accountNumber.length === 16 && !getFieldError('accountNumber') && (
                <p className="mt-1 text-sm text-green-600">✓ Valid card number</p>
              )}
            </div>

            {/* Card Type Display */}
            {formData.accountNumber && formData.accountNumber.length > 0 && formData.cardBrand && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-8 rounded flex items-center justify-center shadow-sm ${
                    formData.cardBrand === 'visa' ? 'bg-gradient-to-r from-blue-600 to-blue-700' :
                    formData.cardBrand === 'mastercard' ? 'bg-gradient-to-r from-red-500 to-yellow-500' :
                    formData.cardBrand === 'amex' ? 'bg-gradient-to-r from-green-600 to-green-700' :
                    formData.cardBrand === 'discover' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                    formData.cardBrand === 'jcb' ? 'bg-gradient-to-r from-red-600 to-red-700' :
                    formData.cardBrand === 'diners' ? 'bg-gradient-to-r from-purple-600 to-purple-700' :
                    formData.cardBrand === 'unionpay' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                    'bg-gradient-to-r from-gray-500 to-gray-600'
                  }`}>
                    <span className="text-white text-sm font-bold">
                      {formData.cardBrand === 'visa' ? 'VISA' : 
                       formData.cardBrand === 'mastercard' ? 'MC' : 
                       formData.cardBrand === 'amex' ? 'AMEX' : 
                       formData.cardBrand === 'discover' ? 'DISC' : 
                       formData.cardBrand === 'jcb' ? 'JCB' : 
                       formData.cardBrand === 'diners' ? 'DC' : 
                       formData.cardBrand === 'unionpay' ? 'UNION' : '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-900">
                      {formData.cardBrand === 'visa' ? 'Visa' : 
                       formData.cardBrand === 'mastercard' ? 'Mastercard' : 
                       formData.cardBrand === 'amex' ? 'American Express' : 
                       formData.cardBrand === 'discover' ? 'Discover' : 
                       formData.cardBrand === 'jcb' ? 'JCB' : 
                       formData.cardBrand === 'diners' ? 'Diners Club' : 
                       formData.cardBrand === 'unionpay' ? 'UnionPay' : 'Unknown Card Type'}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Auto-detected from card number
                    </p>
                  </div>
                </div>
              </div>
            )}


            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exp Month *
                </label>
                <select
                  value={formData.expMonth}
                  onChange={(e) => handleInputChange('expMonth', e.target.value ? parseInt(e.target.value) : '')}
                  onBlur={() => handleBlur('expMonth')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    getFieldError('expMonth') ? 'border-red-500' : 
                    formData.expMonth ? 'border-green-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value="">Month</option>
                  {months.map(month => (
                    <option key={month} value={month}>
                      {month.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                {getFieldError('expMonth') && (
                  <p className="mt-1 text-sm text-red-600">{errors.expMonth}</p>
                )}
                {formData.expMonth && !getFieldError('expMonth') && (
                  <p className="mt-1 text-sm text-green-600">✓ Month selected</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exp Year *
                </label>
                <select
                  value={formData.expYear}
                  onChange={(e) => handleInputChange('expYear', e.target.value ? parseInt(e.target.value) : '')}
                  onBlur={() => handleBlur('expYear')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    getFieldError('expYear') ? 'border-red-500' : 
                    formData.expYear ? 'border-green-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value="">Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {getFieldError('expYear') && (
                  <p className="mt-1 text-sm text-red-600">{errors.expYear}</p>
                )}
                {formData.expYear && !getFieldError('expYear') && (
                  <p className="mt-1 text-sm text-green-600">✓ Year selected</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name *
                  </label>
                  <input
                    type="text"
                    value={formData.billingDetails.name}
                    onChange={(e) => handleInputChange('billingDetails.name', e.target.value.replace(/[0-9]/g, ''))}
                    onBlur={() => handleBlur('billingDetails.name')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      getFieldError('billingDetails.name') ? 'border-red-500' : 
                      formData.billingDetails.name && formData.billingDetails.name.length >= 2 ? 'border-green-500' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                    disabled={loading}
                  />
                  {getFieldError('billingDetails.name') && (
                    <p className="mt-1 text-sm text-red-600">{errors['billingDetails.name']}</p>
                  )}
                  {formData.billingDetails.name && formData.billingDetails.name.length >= 2 && !getFieldError('billingDetails.name') && (
                    <p className="mt-1 text-sm text-green-600">✓ Valid name</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.billingDetails.email}
                    onChange={(e) => handleInputChange('billingDetails.email', e.target.value)}
                    onBlur={() => handleBlur('billingDetails.email')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      getFieldError('billingDetails.email') ? 'border-red-500' : 
                      formData.billingDetails.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingDetails.email) ? 'border-green-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                    disabled={loading}
                  />
                  {getFieldError('billingDetails.email') && (
                    <p className="mt-1 text-sm text-red-600">{errors['billingDetails.email']}</p>
                  )}
                  {formData.billingDetails.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingDetails.email) && !getFieldError('billingDetails.email') && (
                    <p className="mt-1 text-sm text-green-600">✓ Valid email</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={formData.billingDetails.address.line1}
                    onChange={(e) => handleInputChange('billingDetails.address.line1', e.target.value)}
                    onBlur={() => handleBlur('billingDetails.address.line1')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      getFieldError('billingDetails.address.line1') ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123 Main St"
                    disabled={loading}
                  />
                  {getFieldError('billingDetails.address.line1') && (
                    <p className="mt-1 text-sm text-red-600">{errors['billingDetails.address.line1']}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.billingDetails.address.city}
                      onChange={(e) => handleInputChange('billingDetails.address.city', e.target.value)}
                      onBlur={() => handleBlur('billingDetails.address.city')}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        getFieldError('billingDetails.address.city') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="New York"
                      disabled={loading}
                    />
                    {getFieldError('billingDetails.address.city') && (
                      <p className="mt-1 text-sm text-red-600">{errors['billingDetails.address.city']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province *
                    </label>
                    <select
                      value={formData.billingDetails.address.province}
                      onChange={(e) => handleInputChange('billingDetails.address.province', e.target.value)}
                      onBlur={() => handleBlur('billingDetails.address.province')}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        getFieldError('billingDetails.address.province') ? 'border-red-500' : 
                        formData.billingDetails.address.province ? 'border-green-500' : 'border-gray-300'
                      }`}
                      disabled={loading}
                    >
                      <option value="">Select Province</option>
                      {sriLankanProvinces.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                    {getFieldError('billingDetails.address.province') && (
                      <p className="mt-1 text-sm text-red-600">{errors['billingDetails.address.province']}</p>
                    )}
                    {formData.billingDetails.address.province && !getFieldError('billingDetails.address.province') && (
                      <p className="mt-1 text-sm text-green-600">✓ Province selected</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={formData.billingDetails.address.postal_code}
                      onChange={(e) => handleInputChange('billingDetails.address.postal_code', e.target.value.replace(/\D/g, '').slice(0, 5))}
                      onBlur={() => handleBlur('billingDetails.address.postal_code')}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        getFieldError('billingDetails.address.postal_code') ? 'border-red-500' : 
                        formData.billingDetails.address.postal_code && formData.billingDetails.address.postal_code.length === 5 ? 'border-green-500' : 'border-gray-300'
                      }`}
                      placeholder="12345"
                      maxLength={5}
                      disabled={loading}
                    />
                    {getFieldError('billingDetails.address.postal_code') && (
                      <p className="mt-1 text-sm text-red-600">{errors['billingDetails.address.postal_code']}</p>
                    )}
                    {formData.billingDetails.address.postal_code && formData.billingDetails.address.postal_code.length === 5 && !getFieldError('billingDetails.address.postal_code') && (
                      <p className="mt-1 text-sm text-green-600">✓ Valid postal code</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      value="Sri Lanka"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                      disabled={true}
                    />
                    <p className="mt-1 text-xs text-gray-500">Fixed to Sri Lanka</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                Set as default payment method
              </label>
            </div>

            {/* Progress indicator */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Form Progress</span>
                <span className="text-sm text-gray-500">
                  {(() => {
                    // Count only required fields, excluding isDefault checkbox
                    const requiredFields = [
                      ...(editingCard ? [] : ['accountNumber']), // Skip account number in edit mode
                      'expMonth', 
                      'expYear'
                    ];
                    
                    const billingFields = [
                      'billingDetails.name',
                      'billingDetails.email',
                      'billingDetails.address.line1',
                      'billingDetails.address.city',
                      'billingDetails.address.province',
                      'billingDetails.address.postal_code',
                      'billingDetails.address.country'
                    ];
                    
                    let completedCount = 0;
                    
                    // Check top-level required fields
                    requiredFields.forEach(field => {
                      if (formData[field] && formData[field] !== '') {
                        completedCount++;
                      }
                    });
                    
                    // Check billing fields
                    if (formData.billingDetails.name) completedCount++;
                    if (formData.billingDetails.email) completedCount++;
                    if (formData.billingDetails.address.line1) completedCount++;
                    if (formData.billingDetails.address.city) completedCount++;
                    if (formData.billingDetails.address.province) completedCount++;
                    if (formData.billingDetails.address.postal_code) completedCount++;
                    if (formData.billingDetails.address.country) completedCount++;
                    
                    return `${completedCount} / ${editingCard ? '9' : '10'} fields completed`;
                  })()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isFormValid() ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${(() => {
                      // Count only required fields, excluding isDefault checkbox
                      const requiredFields = [
                        ...(editingCard ? [] : ['accountNumber']), // Skip account number in edit mode
                        'expMonth', 
                        'expYear'
                      ];
                      
                      let completedCount = 0;
                      
                      // Check top-level required fields
                      requiredFields.forEach(field => {
                        if (formData[field] && formData[field] !== '') {
                          completedCount++;
                        }
                      });
                      
                      // Check billing fields
                      if (formData.billingDetails.name) completedCount++;
                      if (formData.billingDetails.email) completedCount++;
                      if (formData.billingDetails.address.line1) completedCount++;
                      if (formData.billingDetails.address.city) completedCount++;
                      if (formData.billingDetails.address.province) completedCount++;
                      if (formData.billingDetails.address.postal_code) completedCount++;
                      if (formData.billingDetails.address.country) completedCount++;
                      
                      return completedCount * (editingCard ? 11.11 : 10); // 100% / 9 fields = 11.11% per field in edit mode
                    })()}%`
                  }}
                ></div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 ${
                  isFormValid() 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } disabled:opacity-50`}
              >
                {loading ? <Loader className="animate-spin h-4 w-4" /> : null}
                {loading ? (editingCard ? 'Updating...' : 'Adding...') : 
                 isFormValid() ? (editingCard ? 'Update Payment Method' : 'Add Payment Method') : 'Complete all fields'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentCardsManager;