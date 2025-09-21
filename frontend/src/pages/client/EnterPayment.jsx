import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowLeft, CreditCard, Truck, CheckCircle, Lock, Calendar, User, Building, AlertCircle, Shield } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FormValidator } from '../../utils/validation';
import { showError, showSuccess, showLoading } from '../../utils/sweetAlert';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51Ql5QiIVYLEPquIE4nw8Hl5wXbThqOf9wq4TLcUYcp3jZ17AErbSJNN4d6R8i5IYu1jM0d2lVVpJreLHzl4pj1S600oZqhzeXA');

// Stripe Payment Form Component
const StripePaymentForm = ({ orderData, orderId, onPaymentSuccess, onPaymentError, loading, setLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setCardError('');

    // Validate card element
    const cardElement = elements.getElement(CardElement);
    if (!cardElement._empty && cardElement._complete) {
      try {
        // Create payment intent on your server
        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/stripe/create-payment-intent`,
          {
            amount: Math.round(orderData.total * 100), // Convert to cents
            currency: 'lkr',
            orderId: orderId
          }
        );

        if (!data.success) {
          throw new Error(data.message || 'Failed to create payment intent');
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
        onPaymentError(error.response?.data?.message || error.message || 'Payment processing failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setCardError('Please complete your card details');
      setLoading(false);
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

      <button
        onClick={handleSubmit}
        disabled={!stripe || loading}
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
    // Bank Transfer Details
    bankName: '',
    accountNumber: '',
    
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

    if (paymentMethod === 'bank_transfer') {
      validator.required(formData.bankName, 'Bank Name');
      
      validator.required(formData.accountNumber, 'Account Number')
               .minLength(formData.accountNumber, 8, 'Account Number')
               .maxLength(formData.accountNumber, 20, 'Account Number')
               .custom(/^\d+$/.test(formData.accountNumber || ''), 'Account Number', 'Account number must contain only digits');
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
      if (paymentMethod === 'bank_transfer') {
        paymentData.paymentDetails = {
          bankName: formData.bankName,
          accountLast4: formData.accountNumber.slice(-4) // Only store last 4 digits
        };
      } else if (paymentMethod === 'cash_on_delivery') {
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
                ) : paymentMethod === 'bank_transfer' ? (
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
                        Rs. {finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
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