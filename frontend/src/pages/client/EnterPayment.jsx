import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Truck, CheckCircle, Lock, Calendar, User, Building, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FormValidator } from '../../utils/validation';
import { showError, showSuccess, showLoading } from '../../utils/sweetAlert';

export default function EnterPayment() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const [formData, setFormData] = useState({
    // Credit Card Details
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    
    // Bank Transfer Details
    bankName: '',
    accountNumber: '',
    
    // PayPal Details
    paypalEmail: '',
    
    // Cash on Delivery
    codConfirmation: false,
    
    // Billing Address (if different from shipping)
    billingDifferent: false,
    billingAddress: {
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Sri Lanka'
    }
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
    } else {
      // Format card number with spaces
      if (name === 'cardNumber') {
        const formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
        if (formattedValue.length <= 19) { // 16 digits + 3 spaces
          setFormData(prev => ({
            ...prev,
            [name]: formattedValue
          }));
        }
        // Real-time validation for card number
        validateField(name, formattedValue);
        return;
      }
      
      // Format expiry date
      if (name === 'expiryDate') {
        const formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/');
        if (formattedValue.length <= 5) {
          setFormData(prev => ({
            ...prev,
            [name]: formattedValue
          }));
        }
        // Real-time validation for expiry date
        validateField(name, formattedValue);
        return;
      }
      
      // Limit CVV to 4 digits
      if (name === 'cvv') {
        const formattedValue = value.replace(/\D/g, '');
        if (formattedValue.length <= 4) {
          setFormData(prev => ({
            ...prev,
            [name]: formattedValue
          }));
        }
        // Real-time validation for CVV
        validateField(name, formattedValue);
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field and perform real-time validation
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
    
    // Real-time validation for other fields
    if (name !== 'cardNumber' && name !== 'expiryDate' && name !== 'cvv') {
      validateField(name, type === 'checkbox' ? checked : value);
    }
  };

  // Real-time field validation
  const validateField = (fieldName, fieldValue) => {
    const validator = new FormValidator();
    
    // Only validate if the current payment method requires this field
    switch (fieldName) {
      case 'cardNumber':
        if (paymentMethod === 'credit_card') {
          const cleanValue = fieldValue.replace(/\s/g, '');
          validator.required(cleanValue, 'Card Number')
                   .cardNumber(cleanValue, 'Card Number');
        }
        break;
      
      case 'cardName':
        if (paymentMethod === 'credit_card') {
          validator.required(fieldValue, 'Cardholder Name')
                   .minLength(fieldValue, 2, 'Cardholder Name')
                   .maxLength(fieldValue, 50, 'Cardholder Name')
                   .custom(/^[a-zA-Z\s]+$/.test(fieldValue || ''), 'Cardholder Name', 'Please enter a valid name (letters and spaces only)');
        }
        break;
      
      case 'expiryDate':
        if (paymentMethod === 'credit_card') {
          validator.required(fieldValue, 'Expiry Date')
                   .expiryDate(fieldValue, 'Expiry Date');
        }
        break;
      
      case 'cvv':
        if (paymentMethod === 'credit_card') {
          validator.required(fieldValue, 'CVV')
                   .cvv(fieldValue, 'CVV');
        }
        break;
      
      case 'paypalEmail':
        if (paymentMethod === 'paypal') {
          validator.required(fieldValue, 'PayPal Email')
                   .email(fieldValue, 'PayPal Email');
        }
        break;
      
      case 'bankName':
        if (paymentMethod === 'bank_transfer') {
          validator.required(fieldValue, 'Bank Name');
        }
        break;
      
      case 'accountNumber':
        if (paymentMethod === 'bank_transfer') {
          validator.required(fieldValue, 'Account Number')
                   .minLength(fieldValue, 8, 'Account Number')
                   .maxLength(fieldValue, 20, 'Account Number')
                   .custom(/^\d+$/.test(fieldValue || ''), 'Account Number', 'Account number must contain only digits');
        }
        break;
      
      case 'codConfirmation':
        if (paymentMethod === 'cash_on_delivery') {
          validator.custom(fieldValue === true, 'COD Confirmation', 'Please confirm cash on delivery payment');
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

  const validateForm = () => {
    const validator = new FormValidator();
    
    // Validate based on payment method
    if (paymentMethod === 'credit_card') {
      const cleanCardNumber = formData.cardNumber.replace(/\s/g, '');
      
      validator.required(cleanCardNumber, 'Card Number')
               .cardNumber(cleanCardNumber, 'Card Number');
      
      validator.required(formData.cardName, 'Cardholder Name')
               .minLength(formData.cardName, 2, 'Cardholder Name')
               .maxLength(formData.cardName, 50, 'Cardholder Name')
               .custom(/^[a-zA-Z\s]+$/.test(formData.cardName || ''), 'Cardholder Name', 'Please enter a valid name (letters and spaces only)');
      
      validator.required(formData.expiryDate, 'Expiry Date')
               .expiryDate(formData.expiryDate, 'Expiry Date');
      
      validator.required(formData.cvv, 'CVV')
               .cvv(formData.cvv, 'CVV');
    }

    if (paymentMethod === 'bank_transfer') {
      validator.required(formData.bankName, 'Bank Name');
      
      validator.required(formData.accountNumber, 'Account Number')
               .minLength(formData.accountNumber, 8, 'Account Number')
               .maxLength(formData.accountNumber, 20, 'Account Number')
               .custom(/^\d+$/.test(formData.accountNumber || ''), 'Account Number', 'Account number must contain only digits');
    }

    if (paymentMethod === 'paypal') {
      validator.required(formData.paypalEmail, 'PayPal Email')
               .email(formData.paypalEmail, 'PayPal Email');
    }

    if (paymentMethod === 'cash_on_delivery') {
      validator.custom(formData.codConfirmation === true, 'COD Confirmation', 'Please confirm cash on delivery payment');
    }

    // Additional business validations
    if (!orderData) {
      validator.addError('Order', 'Order data is missing. Please refresh the page.');
    }

    if (orderData && orderData.items && orderData.items.length === 0) {
      validator.addError('Cart', 'Your cart is empty. Please add items before proceeding.');
    }

    const validationErrors = validator.getAllErrors();
    setErrors(validationErrors);
    
    return !validator.hasErrors();
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setErrors({}); // Clear errors when switching methods
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Comprehensive validation before submission
    if (!validateForm()) {
      await showError('Payment Validation Failed', 'Please fix the errors below and try again.');
      return;
    }

    setLoading(true);
    
    try {
      // Show loading dialog
      const loadingAlert = showLoading(
        'Processing Payment',
        `Processing your ${paymentMethod.replace('_', ' ')} payment. Please do not close this page...`
      );

      // Prepare payment data based on selected method
      let paymentData = {
        paymentMethod: paymentMethod,
        paymentCompleted: true,
        amount: paymentMethod === 'cash_on_delivery' ? orderData.total + 50 : orderData.total
      };

      // Add method-specific data (in real app, this would be handled securely)
      if (paymentMethod === 'credit_card') {
        paymentData.paymentDetails = {
          cardLast4: formData.cardNumber.replace(/\s/g, '').slice(-4),
          cardName: formData.cardName,
          cardType: getCardType(formData.cardNumber)
        };
      } else if (paymentMethod === 'paypal') {
        paymentData.paymentDetails = {
          paypalEmail: formData.paypalEmail
        };
      } else if (paymentMethod === 'bank_transfer') {
        paymentData.paymentDetails = {
          bankName: formData.bankName,
          accountLast4: formData.accountNumber.slice(-4) // Only store last 4 digits
        };
      } else if (paymentMethod === 'cash_on_delivery') {
        paymentData.paymentDetails = {
          codFee: 50,
          totalWithCod: orderData.total + 50
        };
      }

      // Save payment information to the order
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/order/${orderId}/payment`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Close loading dialog
      if (loadingAlert && typeof loadingAlert.close === 'function') {
        loadingAlert.close();
      }

      if (response.data.success) {
        // Clear stored order data
        localStorage.removeItem("orderData");
        
        // Show success message
        await showSuccess(
          'Payment Successful!',
          `Your ${paymentMethod.replace('_', ' ')} payment has been processed successfully. You will be redirected to the order confirmation page.`
        );
        
        // Navigate to order confirmation/success page
        navigate(`/order-success/${orderId}`);
      } else {
        console.error('Failed to process payment:', response.data.message);
        await showError(
          'Payment Processing Failed',
          response.data.message || 'There was an error processing your payment. Please try again or contact support.'
        );
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      
      let errorMessage = 'An unexpected error occurred during payment processing.';
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid payment information. Please check your details and try again.';
            break;
          case 401:
            errorMessage = 'You are not authorized to complete this payment. Please log in and try again.';
            navigate('/login');
            return;
          case 403:
            errorMessage = 'Payment declined. Please check your payment method or try a different one.';
            break;
          case 404:
            errorMessage = 'Order not found. Please return to your cart and try again.';
            break;
          case 500:
            errorMessage = 'Server error occurred. Please try again in a few minutes.';
            break;
          case 502:
          case 503:
          case 504:
            errorMessage = 'Payment service is temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = error.response.data?.message || 'Payment processing failed. Please try again.';
        }
      } else if (error.request) {
        errorMessage = 'Unable to connect to payment server. Please check your internet connection and try again.';
      }
      
      await showError('Payment Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to determine card type
  const getCardType = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (/^4/.test(cleanNumber)) return 'Visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'MasterCard';
    if (/^3[47]/.test(cleanNumber)) return 'American Express';
    if (/^6/.test(cleanNumber)) return 'Discover';
    return 'Unknown';
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading payment details...</p>
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
              onClick={() => navigate(`/shipping/${orderId}`)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Shipping</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
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
            <div className="w-12 h-px bg-green-600"></div>
            <div className="flex items-center space-x-2 text-green-600">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">✓</span>
              </div>
              <span className="text-sm font-medium">Shipping</span>
            </div>
            <div className="w-12 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <CreditCard size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Payment Form - Left Side */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Method Selection */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <CreditCard size={20} className="text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
                </div>

                <div className="space-y-4">
                  {/* Credit Card */}
                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={(e) => handlePaymentMethodChange(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <CreditCard size={20} className="text-gray-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Credit/Debit Card</div>
                      <div className="text-sm text-gray-500">Visa, MasterCard, American Express</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Lock size={16} className="text-green-600" />
                      <span className="text-xs text-green-600">Secure</span>
                    </div>
                  </label>

                  {/* PayPal */}
                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => handlePaymentMethodChange(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">PayPal</div>
                      <div className="text-sm text-gray-500">Pay with your PayPal account</div>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) => handlePaymentMethodChange(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <Building size={20} className="text-gray-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Bank Transfer</div>
                      <div className="text-sm text-gray-500">Direct bank transfer</div>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={(e) => handlePaymentMethodChange(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <Truck size={20} className="text-gray-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Cash on Delivery</div>
                      <div className="text-sm text-gray-500">Pay when you receive your order</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>

                {paymentMethod === 'credit_card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.cardNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.cardName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.cardName && (
                        <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                            errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.expiryDate && (
                          <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV *
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                            errors.cvv ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.cvv && (
                          <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PayPal Email *
                    </label>
                    <input
                      type="email"
                      name="paypalEmail"
                      value={formData.paypalEmail}
                      onChange={handleInputChange}
                      placeholder="your@paypal.com"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.paypalEmail ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.paypalEmail && (
                      <p className="text-red-500 text-sm mt-1">{errors.paypalEmail}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      You will be redirected to PayPal to complete your payment.
                    </p>
                  </div>
                )}

                {paymentMethod === 'bank_transfer' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name *
                      </label>
                      <select
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.bankName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select your bank</option>
                        <option value="Commercial Bank">Commercial Bank</option>
                        <option value="People's Bank">People's Bank</option>
                        <option value="Bank of Ceylon">Bank of Ceylon</option>
                        <option value="Hatton National Bank">Hatton National Bank</option>
                        <option value="Sampath Bank">Sampath Bank</option>
                        <option value="Seylan Bank">Seylan Bank</option>
                        <option value="DFCC Bank">DFCC Bank</option>
                        <option value="National Development Bank">National Development Bank</option>
                      </select>
                      {errors.bankName && (
                        <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        placeholder="Your account number"
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.accountNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.accountNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>
                      )}
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Important:</strong> After placing your order, you will receive bank transfer instructions via email. 
                        Please complete the transfer within 24 hours to confirm your order.
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cash_on_delivery' && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 mb-3">
                        With Cash on Delivery, you can pay for your order when it's delivered to your door. 
                        Please have the exact amount ready.
                      </p>
                      <div className="flex items-start space-x-2">
                        <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-700">
                        Additional COD fee of LKR 50 will be added to your total.
                        </p>
                      </div>
                    </div>
                    
                    <label className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        name="codConfirmation"
                        checked={formData.codConfirmation}
                        onChange={handleInputChange}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        I understand that I need to pay LKR {(orderData.total + 50).toFixed(2)} in cash when my order is delivered.
                      </span>
                    </label>
                    {errors.codConfirmation && (
                      <p className="text-red-500 text-sm">{errors.codConfirmation}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Lock size={16} className="text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Secure Payment</p>
                    <p className="text-xs text-green-700">
                      Your payment information is encrypted and secure. We never store your card details.
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
                        LKR {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">LKR {orderData.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {orderData.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount:</span>
                      <span className="text-green-600 font-medium">-LKR {orderData.discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">
                      {orderData.shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `LKR ${orderData.shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">LKR {orderData.tax.toFixed(2)}</span>
                  </div>

                  {paymentMethod === 'cash_on_delivery' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">COD Fee:</span>
                      <span className="font-medium">LKR 50.00</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-lg font-semibold text-gray-900">
                        LKR {(paymentMethod === 'cash_on_delivery' ? orderData.total + 50 : orderData.total).toFixed(2)}
                      </span>
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
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Order</span>
                        <CheckCircle size={16} />
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate(`/shipping/${orderId}`)}
                    className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Back to Shipping
                  </button>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <CheckCircle size={16} className="text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">
                        Order Protection
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Your order is protected with our 30-day money-back guarantee and secure payment processing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}