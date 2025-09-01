import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Truck, CheckCircle, Lock, Calendar, User, Building, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

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
        return;
      }
      
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

    if (paymentMethod === 'credit_card') {
      const cardNumberDigits = formData.cardNumber.replace(/\s/g, '');
      
      if (!cardNumberDigits) {
        newErrors.cardNumber = 'Card number is required';
      } else if (cardNumberDigits.length !== 16) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }
      
      if (!formData.cardName.trim()) {
        newErrors.cardName = 'Cardholder name is required';
      }
      
      if (!formData.expiryDate) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Please enter expiry date in MM/YY format';
      } else {
        const [month, year] = formData.expiryDate.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        if (parseInt(month) < 1 || parseInt(month) > 12) {
          newErrors.expiryDate = 'Invalid month';
        } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
          newErrors.expiryDate = 'Card has expired';
        }
      }
      
      if (!formData.cvv) {
        newErrors.cvv = 'CVV is required';
      } else if (formData.cvv.length < 3) {
        newErrors.cvv = 'CVV must be at least 3 digits';
      }
    }

    if (paymentMethod === 'bank_transfer') {
      if (!formData.bankName.trim()) {
        newErrors.bankName = 'Bank name is required';
      }
      if (!formData.accountNumber.trim()) {
        newErrors.accountNumber = 'Account number is required';
      }
    }

    if (paymentMethod === 'paypal') {
      if (!formData.paypalEmail.trim()) {
        newErrors.paypalEmail = 'PayPal email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.paypalEmail)) {
        newErrors.paypalEmail = 'Please enter a valid email address';
      }
    }

    if (paymentMethod === 'cash_on_delivery') {
      if (!formData.codConfirmation) {
        newErrors.codConfirmation = 'Please confirm cash on delivery';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setErrors({}); // Clear errors when switching methods
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare payment data based on selected method
      let paymentData = {
        paymentMethod: paymentMethod,
        paymentCompleted: true
      };

      // Add method-specific data (in real app, this would be handled securely)
      if (paymentMethod === 'credit_card') {
        paymentData.paymentDetails = {
          cardLast4: formData.cardNumber.slice(-4),
          cardName: formData.cardName
        };
      } else if (paymentMethod === 'paypal') {
        paymentData.paymentDetails = {
          paypalEmail: formData.paypalEmail
        };
      } else if (paymentMethod === 'bank_transfer') {
        paymentData.paymentDetails = {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber.slice(-4) // Only store last 4 digits
        };
      }

      // Save payment information to the order
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/order/${orderId}/payment`,
        paymentData
      );

      if (response.data.success) {
        // Clear stored order data
        localStorage.removeItem("orderData");
        
        // Navigate to order confirmation/success page
        navigate(`/order-success/${orderId}`);
      } else {
        console.error('Failed to process payment:', response.data.message);
        alert('Payment processing failed. Please try again.');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('An error occurred during payment processing. Please try again.');
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
                          Additional COD fee of Rs. 50 will be added to your total.
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
                        I understand that I need to pay Rs. {(orderData.total + 50).toFixed(2)} in cash when my order is delivered.
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

                  {paymentMethod === 'cash_on_delivery' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">COD Fee:</span>
                      <span className="font-medium">Rs. 50.00</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-lg font-semibold text-gray-900">
                        Rs. {(paymentMethod === 'cash_on_delivery' ? orderData.total + 50 : orderData.total).toFixed(2)}
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