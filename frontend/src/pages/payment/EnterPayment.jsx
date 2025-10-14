import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowLeft, CreditCard, Truck, CheckCircle, Lock, Calendar, User, AlertCircle, Shield } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FormValidator } from '../../utils/validation';
import { showError, showSuccess, showLoading } from '../../utils/sweetAlert';
import { handleImageError, getProductPlaceholder } from '../../utils/imageUtils';

// Resolve image URL to handle malformed data URLs
const resolveImage = (src, itemName = 'Product') => {
  if (!src) return getProductPlaceholder(itemName);
  
  // Handle malformed data URLs that have URL prefixes
  if (src.includes('data:image')) {
    const dataUrlIndex = src.indexOf('data:image');
    if (dataUrlIndex > 0) {
      // Extract just the data URL part
      const cleanDataUrl = src.substring(dataUrlIndex);
      
      // Check if the data URL is corrupted (too short to be valid)
      if (cleanDataUrl.length < 500) {
        return getProductPlaceholder(itemName);
      }
      
      return cleanDataUrl;
    }
    
    // Check if it's a corrupted short data URL without prefix
    if (src.length < 500) {
      return getProductPlaceholder(itemName);
    }
    
    return src; // It's already a proper data URL
  }
  
  // Handle external via.placeholder URLs - replace with local placeholders
  if (src.includes('via.placeholder.com')) {
    return getProductPlaceholder(itemName);
  }
  
  if (src.startsWith('http')) return src;
  const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  if (src.startsWith('/')) return `${base}${src}`;
  // assume it's an uploads-relative path
  return `${base}/uploads/${src}`;
};

// Initialize Stripe with your publishable key from environment
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Stripe Payment Form Component
const StripePaymentForm = ({ orderData, orderId, onPaymentSuccess, onPaymentError, loading, setLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState('');
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [useNewCard, setUseNewCard] = useState(false);

  // Fetch saved payment methods
  const fetchSavedPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/payment`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSavedPaymentMethods(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching saved payment methods:', error);
    }
  };

  // Load saved payment methods on component mount
  useEffect(() => {
    fetchSavedPaymentMethods();
  }, []);

  // Handle payment method selection
  const handlePaymentMethodChange = (paymentMethodId) => {
    setSelectedPaymentMethod(paymentMethodId);
    if (paymentMethodId === 'new_card') {
      setUseNewCard(true);
      setSelectedPaymentMethod('');
    } else {
      setUseNewCard(false);
      // Find the selected payment method
      const selectedMethod = savedPaymentMethods.find(method => method._id === paymentMethodId);
      if (selectedMethod) {
        // Auto-fill billing information from saved payment method
        // This helps users complete their order faster with pre-saved information
        console.log('Selected payment method:', selectedMethod);
        
        // If order data has missing billing info, we can suggest using the saved method's billing details
        // Note: We don't automatically overwrite user's order data, just provide suggestions
        if (selectedMethod.billingDetails) {
          console.log('Available billing details from saved card:', {
            name: selectedMethod.billingDetails.name,
            email: selectedMethod.billingDetails.email,
            address: selectedMethod.billingDetails.address
          });
        }
      }
    }
  };

  // Get card brand icon
  const getCardBrandIcon = (brand) => {
    switch (brand) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      case 'discover':
        return '💳';
      default:
        return '💳';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe) {
      return;
    }

    setLoading(true);
    setCardError('');

    // Validate payment method selection
    if (savedPaymentMethods.length > 0 && !selectedPaymentMethod && !useNewCard) {
      setCardError('Please select a payment method');
      setLoading(false);
      return;
    }

    // Check if using saved payment method or new card
    if (selectedPaymentMethod && !useNewCard) {
      // Using saved payment method
      const selectedMethod = savedPaymentMethods.find(method => method._id === selectedPaymentMethod);
      if (!selectedMethod) {
        setCardError('Selected payment method not found');
        setLoading(false);
        return;
      }

      try {
        // Create payment intent with saved payment method
        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/stripe/create-payment-intent`,
          {
            amount: Math.round(orderData.total * 100),
            currency: 'lkr',
            orderId: orderId,
            contactEmail: orderData.contactEmail,
            paymentMethodId: selectedMethod.paymentMethodId // Use saved payment method
          }
        );

        if (!data.success) {
          const errorMessage = data.message || 'Failed to create payment intent';
          console.error('Payment intent creation failed:', errorMessage);
          throw new Error(errorMessage);
        }

        // Confirm payment with saved payment method
        const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: selectedMethod.paymentMethodId
        });

        if (error) {
          console.error('Payment confirmation failed:', error);
          throw new Error(error.message || 'Payment confirmation failed');
        }

        if (paymentIntent.status === 'succeeded') {
          onPaymentSuccess();
        } else {
          throw new Error('Payment was not successful');
        }
      } catch (error) {
        console.error('Payment error:', error);
        onPaymentError(error.message || 'Payment failed');
      } finally {
        setLoading(false);
      }
    } else {
      // Using new card - validate card element
      if (!elements) {
        setCardError('Card element not available');
        setLoading(false);
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement._empty && cardElement._complete) {
        try {
          // Create payment intent on your server
          const { data } = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/stripe/create-payment-intent`,
            {
              amount: Math.round(orderData.total * 100), // Convert LKR to paisa (1 LKR = 100 paisa)
              currency: 'lkr',
              orderId: orderId,
              contactEmail: orderData.contactEmail
            }
          );

          if (!data.success) {
            const errorMessage = data.message || 'Failed to create payment intent';
            console.error('Payment intent creation failed:', errorMessage);
            throw new Error(errorMessage);
          }

          // Confirm the payment with Stripe
          const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
            payment_method: {
              card: elements.getElement(CardElement),
              billing_details: {
                name: orderData.contactName || 'Customer',
                email: orderData.contactEmail,
                phone: orderData.contactPhone,
                address: {
                  line1: orderData.shippingAddress?.street || '',
                  city: orderData.shippingAddress?.city || '',
                  state: orderData.shippingAddress?.state || '',
                  postal_code: orderData.shippingAddress?.zipCode || '',
                  country: 'LK'
                }
              }
            }
          });

          if (error) {
            setCardError(error.message);
            onPaymentError(error.message);
          } else if (paymentIntent.status === 'succeeded') {
            // Save payment information to your backend
            const paymentData = {
              paymentMethod: 'credit_card',
              paymentCompleted: true,
              paymentDetails: {
                stripePaymentIntentId: paymentIntent.id,
                cardBrand: paymentIntent.payment_method_details?.card?.brand || 'unknown',
                last4: paymentIntent.payment_method_details?.card?.last4 || '****'
              }
            };

            const response = await axios.put(
              `${import.meta.env.VITE_BACKEND_URL}/api/order/payment/${orderId}`,
              paymentData
            );

            if (response.data.success) {
              onPaymentSuccess();
            } else {
              throw new Error(response.data.message || 'Failed to save payment information');
            }
          }
        } catch (error) {
          console.error('Payment error:', error);
          let errorMessage = 'Payment processing failed. Please try again.';
          
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          // Handle specific Stripe errors
          if (error.message?.includes('minimum')) {
            errorMessage = 'The order amount is below the minimum required for card payments. Please try a different payment method.';
          } else if (error.message?.includes('configuration')) {
            errorMessage = 'Payment service is temporarily unavailable. Please try again later or use a different payment method.';
          }
          
          onPaymentError(errorMessage);
        } finally {
          setLoading(false);
        }
      } else {
        setCardError('Please complete your card details');
        setLoading(false);
      }
    }
  };

  // Fixed Stripe card element options (removed invalid padding property)
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  return (
    <div className="space-y-4">
      {/* Payment Method Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Payment Method *
        </label>
        {savedPaymentMethods.length > 0 ? (
          <select
            value={selectedPaymentMethod}
            onChange={(e) => handlePaymentMethodChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a saved payment method</option>
            {savedPaymentMethods.map((method) => (
              <option key={method._id} value={method._id}>
                {getCardBrandIcon(method.cardBrand)} {method.cardBrand.toUpperCase()} •••• {method.last4} 
                {method.isDefault ? ' (Default)' : ''}
              </option>
            ))}
            <option value="new_card">➕ Add New Card</option>
          </select>
        ) : (
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              No saved payment methods found. You can add payment methods in your account settings for faster checkout.
            </p>
          </div>
        )}
        {!selectedPaymentMethod && savedPaymentMethods.length > 0 && (
          <p className="text-red-500 text-sm mt-1">Please select a payment method</p>
        )}
      </div>

      {/* Card Details - Show only if new card is selected or no saved methods */}
      {(useNewCard || savedPaymentMethods.length === 0) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details *
          </label>
          <div className={`border rounded-md p-3 ${loading ? 'bg-gray-50' : 'bg-white'}`}>
            <CardElement options={cardElementOptions} />
          </div>
          {cardError && (
            <p className="text-red-500 text-sm mt-1">{cardError}</p>
          )}
        </div>
      )}

      {/* Selected Card Details */}
      {selectedPaymentMethod && !useNewCard && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Selected Payment Method</h4>
          {(() => {
            const selectedMethod = savedPaymentMethods.find(method => method._id === selectedPaymentMethod);
            return selectedMethod ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getCardBrandIcon(selectedMethod.cardBrand)}</div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedMethod.cardBrand.toUpperCase()} •••• {selectedMethod.last4}
                    </p>
                    <p className="text-sm text-gray-600">
                      Expires {selectedMethod.expMonth}/{selectedMethod.expYear}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedMethod.billingDetails.name}
                    </p>
                  </div>
                </div>
                
                {/* Show billing information suggestions */}
                {selectedMethod.billingDetails && (
                  <div className="border-t pt-3 mt-3">
                    <p className="text-xs text-gray-500 mb-2">Saved billing information:</p>
                    <div className="text-sm text-gray-700">
                      <p><strong>Name:</strong> {selectedMethod.billingDetails.name}</p>
                      <p><strong>Email:</strong> {selectedMethod.billingDetails.email}</p>
                      {selectedMethod.billingDetails.address && (
                        <div>
                          <p><strong>Address:</strong></p>
                          <p className="ml-2">
                            {selectedMethod.billingDetails.address.line1}<br/>
                            {selectedMethod.billingDetails.address.line2 && (
                              <>{selectedMethod.billingDetails.address.line2}<br/></>
                            )}
                            {selectedMethod.billingDetails.address.city}, {selectedMethod.billingDetails.address.state}<br/>
                            {selectedMethod.billingDetails.address.postal_code}, {selectedMethod.billingDetails.address.country}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null;
          })()}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!stripe || loading || (!selectedPaymentMethod && !useNewCard && savedPaymentMethods.length > 0)}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          <>
            <Lock size={16} className="mr-2" />
            Pay Securely - Rs. {orderData.total.toFixed(2)}
          </>
        )}
      </button>

      <div className="flex items-center justify-center text-xs text-gray-500 mt-2">
        <Shield size={12} className="mr-1" />
        Payments are secure and encrypted
      </div>
    </div>
  );
};

// Main Payment Component
export default function EnterPayment() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const [formData, setFormData] = useState({
    // Cash on Delivery
    codConfirmation: false,
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
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
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
    
    // Real-time validation
    validateField(name, type === 'checkbox' ? checked : value);
  };

  // Real-time field validation
  const validateField = (fieldName, fieldValue) => {
    const validator = new FormValidator();
    
    // Only validate if the current payment method requires this field
    switch (fieldName) {
      
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

  const handlePaymentSuccess = () => {
    // Clear stored order data
    localStorage.removeItem("orderData");
    // Navigate to order confirmation/success page
    navigate(`/order-success/${orderId}`);
  };

  const handlePaymentError = (errorMessage) => {
    alert(errorMessage);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (paymentMethod === 'credit_card') {
      // Stripe handles this separately
      return;
    }

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
        paymentCompleted: paymentMethod !== 'credit_card' // For non-Stripe payments
      };

      // Add method-specific data
      if (paymentMethod === 'cash_on_delivery') {
        paymentData.paymentDetails = {
          codFee: 50,
          totalWithCod: orderData.total + 50
        };
        // For COD, mark as completed since no immediate payment is required
        paymentData.paymentCompleted = true;
      }

      // Save payment information to the order
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/order/payment/${orderId}`,
        paymentData
      );

      // Close loading dialog
      if (loadingAlert && typeof loadingAlert.close === 'function') {
        loadingAlert.close();
      }

      if (response.data.success) {
        handlePaymentSuccess();
      } else {
        throw new Error(response.data.message || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert(error.response?.data?.message || error.message || 'An error occurred during payment processing. Please try again.');
    } finally {
      setLoading(false);
    }
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
  const finalTotal = paymentMethod === 'cash_on_delivery' ? orderData.total + 50 : orderData.total;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div></div> {/* Empty div for spacing */}
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
            {/* Main form for non-Stripe payments */}
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

                {paymentMethod === 'credit_card' ? (
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      orderData={orderData}
                      orderId={orderId}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                      loading={loading}
                      setLoading={setLoading}
                    />
                  </Elements>
                ) : (
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
                        I understand that I need to pay Rs. {finalTotal.toFixed(2)} in cash when my order is delivered.
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

              {/* Submit button for non-Stripe payments */}
              {paymentMethod !== 'credit_card' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} className="mr-2" />
                        Complete Order - Rs. {finalTotal.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm sticky top-24">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              </div>

              <div className="p-6">
                {/* Shipping Address */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping to:</h3>
                  <p className="text-sm text-gray-700">
                    {orderData.shippingAddress?.name}<br />
                    {orderData.shippingAddress?.street}<br />
                    {orderData.shippingAddress?.city}, {orderData.shippingAddress?.state} {orderData.shippingAddress?.zipCode}<br />
                    {orderData.shippingAddress?.phone}
                  </p>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <img
                          src={resolveImage(item.image, item.name)}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded bg-gray-100"
                          onError={(e) => handleImageError(e, 48, 48, item.name || 'Product')}
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
                        Rs. {finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
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