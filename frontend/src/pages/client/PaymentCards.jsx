import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Star, StarOff, Loader, AlertCircle, Check, X } from 'lucide-react';

// Mock API functions - replace with your actual API calls
const api = {
  async getUserPaymentMethods() {
    // Replace with actual API call
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            {
              _id: '1',
              paymentMethodId: 'pm_visa_4242',
              cardBrand: 'visa',
              last4: '4242',
              expMonth: 12,
              expYear: 2026,
              billingDetails: { 
                name: 'John Doe',
                email: 'john@example.com',
                address: {
                  line1: '123 Main St',
                  city: 'New York',
                  state: 'NY',
                  postal_code: '10001',
                  country: 'US'
                }
              },
              isDefault: true,
              createdAt: new Date().toISOString()
            },
            {
              _id: '2',
              paymentMethodId: 'pm_master_8888',
              cardBrand: 'mastercard',
              last4: '8888',
              expMonth: 8,
              expYear: 2027,
              billingDetails: { 
                name: 'John Doe',
                email: 'john@example.com'
              },
              isDefault: false,
              createdAt: new Date().toISOString()
            }
          ]
        });
      }, 1000);
    });
  },

  async addPaymentMethod(data) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate validation errors
        if (!data.paymentMethodId) {
          reject({ message: 'Payment method ID is required' });
          return;
        }
        if (!data.last4 || data.last4.length !== 4) {
          reject({ message: 'Last 4 digits must be exactly 4 numbers' });
          return;
        }
        
        resolve({
          success: true,
          data: {
            _id: Date.now().toString(),
            ...data,
            createdAt: new Date().toISOString()
          }
        });
      }, 1000);
    });
  },

  async deletePaymentMethod(id) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  },

  async updatePaymentMethod(id, data) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { _id: id, ...data }
        });
      }, 1000);
    });
  }
};

const PaymentCardsManager = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
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
      }
    } catch (err) {
      setError('Failed to load payment methods');
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
      }
    } catch (err) {
      setError(err.message || 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) return;
    
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
      const response = await api.updatePaymentMethod(cardId, { isDefault: true });
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
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
              clearMessages();
            }}
            onAdd={handleAddCard}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

const AddCardModal = ({ onClose, onAdd, loading }) => {
  const [formData, setFormData] = useState({
    paymentMethodId: '',
    cardBrand: 'visa',
    last4: '',
    expMonth: '',
    expYear: '',
    billingDetails: {
      name: '',
      email: '',
      address: {
        line1: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US'
      }
    },
    isDefault: false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'paymentMethodId':
        if (!value) error = 'Payment method ID is required';
        break;
      case 'last4':
        if (!value) error = 'Last 4 digits are required';
        else if (!/^\d{4}$/.test(value)) error = 'Must be exactly 4 digits';
        break;
      case 'expMonth':
        if (!value) error = 'Expiration month is required';
        break;
      case 'expYear':
        if (!value) error = 'Expiration year is required';
        break;
      case 'billingDetails.email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
      default:
        break;
    }
    
    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    if (!formData.paymentMethodId) newErrors.paymentMethodId = 'Payment method ID is required';
    if (!formData.last4) newErrors.last4 = 'Last 4 digits are required';
    if (!formData.expMonth) newErrors.expMonth = 'Expiration month is required';
    if (!formData.expYear) newErrors.expYear = 'Expiration year is required';
    
    // Validate format
    if (formData.last4 && !/^\d{4}$/.test(formData.last4)) newErrors.last4 = 'Must be exactly 4 digits';
    if (formData.billingDetails.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingDetails.email)) {
      newErrors['billingDetails.email'] = 'Invalid email format';
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
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAdd(formData);
    }
  };

  const getFieldError = (field) => {
    return touched[field] && errors[field];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Add Payment Method</h2>
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
                Payment Method ID *
              </label>
              <input
                type="text"
                value={formData.paymentMethodId}
                onChange={(e) => handleInputChange('paymentMethodId', e.target.value)}
                onBlur={() => handleBlur('paymentMethodId')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  getFieldError('paymentMethodId') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="pm_1234567890"
                disabled={loading}
              />
              {getFieldError('paymentMethodId') && (
                <p className="mt-1 text-sm text-red-600">{errors.paymentMethodId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Brand *
              </label>
              <select
                value={formData.cardBrand}
                onChange={(e) => handleInputChange('cardBrand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">American Express</option>
                <option value="discover">Discover</option>
                <option value="jcb">JCB</option>
                <option value="diners">Diners Club</option>
                <option value="unionpay">UnionPay</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last 4 Digits *
              </label>
              <input
                type="text"
                value={formData.last4}
                onChange={(e) => handleInputChange('last4', e.target.value.replace(/\D/g, '').slice(0, 4))}
                onBlur={() => handleBlur('last4')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  getFieldError('last4') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1234"
                maxLength={4}
                disabled={loading}
              />
              {getFieldError('last4') && (
                <p className="mt-1 text-sm text-red-600">{errors.last4}</p>
              )}
            </div>

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
                    getFieldError('expMonth') ? 'border-red-500' : 'border-gray-300'
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
                    getFieldError('expYear') ? 'border-red-500' : 'border-gray-300'
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
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Details (Optional)</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={formData.billingDetails.name}
                    onChange={(e) => handleInputChange('billingDetails.name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.billingDetails.email}
                    onChange={(e) => handleInputChange('billingDetails.email', e.target.value)}
                    onBlur={() => handleBlur('billingDetails.email')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      getFieldError('billingDetails.email') ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                    disabled={loading}
                  />
                  {getFieldError('billingDetails.email') && (
                    <p className="mt-1 text-sm text-red-600">{errors['billingDetails.email']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={formData.billingDetails.address.line1}
                    onChange={(e) => handleInputChange('billingDetails.address.line1', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main St"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.billingDetails.address.city}
                      onChange={(e) => handleInputChange('billingDetails.address.city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="New York"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.billingDetails.address.state}
                      onChange={(e) => handleInputChange('billingDetails.address.state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="NY"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={formData.billingDetails.address.postal_code}
                      onChange={(e) => handleInputChange('billingDetails.address.postal_code', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="10001"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.billingDetails.address.country}
                      onChange={(e) => handleInputChange('billingDetails.address.country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="US"
                      disabled={loading}
                    />
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

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader className="animate-spin h-4 w-4" /> : null}
                {loading ? 'Adding...' : 'Add Payment Method'}
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