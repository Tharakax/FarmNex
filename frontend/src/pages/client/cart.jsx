import React, { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Heart } from 'lucide-react';

import { addToCart , removeFromCart , getCart , updateQuantity } from '../../utils/cart.js';
import { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { handleImageError, getProductPlaceholder } from '../../utils/imageUtils';
import { getLoggedInUser } from '../../utils/userUtils';

// Configure axios defaults
axios.defaults.timeout = 10000; // 10 second timeout
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Resolve image URL to absolute path if needed
const resolveImage = (src, productName = 'Product') => {
  if (!src) return getProductPlaceholder(productName);
  if (src.startsWith('http')) return src;
  const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  if (src.startsWith('/')) return `${base}${src}`;
  return `${base}/uploads/${src}`;
};

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
const navigate = useNavigate();
  // Load cart data on component mount
  useEffect(() => {
    const loadCart = () => {
      try {
        setLoading(true);
        const cartData =  getCart();
        setCart(cartData);
        
        // If cart is empty, stay on page and show empty state instead of redirecting
      } catch (error) {
        console.error("Error loading cart:", error);
        setCart([]);
        // On error, keep user on cart page to allow retry
      } finally {
        setLoading(false);
      }
    };

    loadCart();

    // Optional: Listen for storage changes from other tabs

  }, [navigate]);

  // Calculate totals
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 2000 ? 0 : 15; // Free shipping over LKR 2000
  const discount = subtotal > 3000 ? subtotal * 0.05 : 0; // 5% discount over LKR 3000
  const total = subtotal + tax + shipping - discount;

  // Cart actions
  const handleQuantityChange = (productId, newQuantity) => {
    try {
      const updatedCart =  updateQuantity(productId, newQuantity);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleRemoveItem = (productId) => {
    try {
      const updatedCart =  removeFromCart(productId);
      setCart(updatedCart);
      
      // Auto-redirect if cart becomes empty
      if (!updatedCart || updatedCart.length === 0) {
        // Optionally keep user on cart page; they can click Continue Shopping
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleSaveForLater = (item) => {
    try {
      // Save to a separate saved items localStorage
      const savedItemsKey = "savedItems";
      let currentSavedItems = localStorage.getItem(savedItemsKey);
      currentSavedItems = currentSavedItems ? JSON.parse(currentSavedItems) : [];
      
      // Add item to saved items if not already there
      if (!currentSavedItems.find(savedItem => savedItem.productId === item.productId)) {
        currentSavedItems.push(item);
        localStorage.setItem(savedItemsKey, JSON.stringify(currentSavedItems));
        setSavedItems(currentSavedItems);
      }
      
      // Remove from cart
      const updatedCart =  removeFromCart(item.productId);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error saving item for later:", error);
    }
  };

  const handleMoveToCart = (item) => {
    try {
      // Add to cart
      const updatedCart =  addToCart({
        _id: item.productId,
        name: item.name,
        price: item.price,
        images: [item.image]
      }, 1);
      setCart(updatedCart);
      
      // Remove from saved items
      const savedItemsKey = "savedItems";
      let currentSavedItems = localStorage.getItem(savedItemsKey);
      currentSavedItems = currentSavedItems ? JSON.parse(currentSavedItems) : [];
      currentSavedItems = currentSavedItems.filter(savedItem => savedItem.productId !== item.productId);
      localStorage.setItem(savedItemsKey, JSON.stringify(currentSavedItems));
      setSavedItems(currentSavedItems);
    } catch (error) {
      console.error("Error moving item to cart:", error);
    }
  };

  const handleClearCart = () => {
    try {
      localStorage.setItem("cart", JSON.stringify([]));
      setCart([]);
      
      // Auto-redirect after clearing cart
      // Stay on cart page; show it as empty
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };
  // Retry function for network requests
  const makeRequestWithRetry = async (url, data, options, maxRetries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt} of ${maxRetries} - Making request to:`, url);
        const response = await axios.post(url, data, {
          ...options,
          timeout: 10000 // 10 second timeout
        });
        return response;
      } catch (error) {
        console.log(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Only retry on network errors, not server errors
        if (error.response) {
          // Server responded with an error status, don't retry
          throw error;
        }
        
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff
      }
    }
  };

  // Test server connectivity
  const testServerConnection = async () => {
    try {
      const testUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/health`;
      const response = await fetch(testUrl, {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      console.log('Server connectivity test failed:', error.message);
      return false;
    }
  };

  async function handleCheckout() {
    try {
      setCheckoutLoading(true);
      console.log('Starting checkout process...');
      
      // Validate cart is not empty
      if (!cart || cart.length === 0) {
        alert('Your cart is empty. Please add items before checkout.');
        return;
      }

      // Test server connectivity first
      console.log('Testing server connectivity...');
      const isServerReachable = await testServerConnection();
      if (!isServerReachable) {
        console.log('Server connectivity test failed, but proceeding with retry logic...');
      }

      // Prepare order data from cart - optimize payload size
      const currentUser = getLoggedInUser();
      const orderData = {
        items: cart.map(item => {
          // Preserve usable image without corrupting data URLs
          let image = item.image;
          if (typeof image === 'string') {
            // if it's a backend path or full URL, keep as is
            if (image.startsWith('http') || image.startsWith('/')) {
              // ok
            } else if (image.startsWith('data:image')) {
              // keep full data URL (do NOT truncate)
            } else if (Array.isArray(item.images) && item.images.length) {
              // fallback to first product image if provided as array
              image = item.images[0];
            }
          }
          return ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image,
            description: item.description ? item.description.substring(0, 200) : ''
          });
        }),
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        discount: discount,
        total: total,
        status: 'pending',
        // Pre-fill contact using logged-in user when available
        contactEmail: currentUser?.email || undefined,
        contactName: currentUser?.name || undefined
      };

      console.log('Order data prepared:', orderData);
      localStorage.setItem("orderData", JSON.stringify(orderData));
      
      // Prepare headers - include auth token if available
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Try to get auth token from localStorage or sessionStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || sessionStorage.getItem('authToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Auth token found and added to headers');
      } else {
        console.log('No auth token found - proceeding as guest checkout');
      }
      
      // Make API request with retry logic
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/order`;
      console.log('Making request to:', apiUrl);
      
      const response = await makeRequestWithRetry(apiUrl, orderData, { headers });
      
      console.log('Checkout response:', response.data);
      
      // If successful, clear the cart and redirect to order confirmation
      if (response.data.success) {
        handleClearCart();
        console.log("Order created successfully with ID:", response.data.order._id);
        navigate(`/shipping/${response.data.order._id}`);
      } else {
        console.error('Checkout failed:', response.data.message);
        alert(`Checkout failed: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      
      let errorMessage = 'An error occurred during checkout. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        console.error('Server response error:', error.response.data);
        if (error.response.status === 413) {
          errorMessage = 'Order data is too large. Please try with fewer items or contact support.';
        } else {
          errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        errorMessage = 'Unable to connect to server. Please check your connection and try again.';
      } else if (error.code === 'ECONNABORTED') {
        // Request timeout
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else {
        // Something else happened
        console.error('Request setup error:', error.message);
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setCheckoutLoading(false);
    }
  };
  // Load saved items on mount
  useEffect(() => {
    try {
      const savedItemsKey = "savedItems";
      let currentSavedItems = localStorage.getItem(savedItemsKey);
      currentSavedItems = currentSavedItems ? JSON.parse(currentSavedItems) : [];
      setSavedItems(currentSavedItems);
    } catch (error) {
      console.error("Error loading saved items:", error);
    }
  }, []);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* Removed local back/continue button to avoid overlap with global back button */}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          /* Loading State */
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your cart...</p>
          </div>
        ) : (
          /* Cart Content */
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Cart Items - Left Side */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                    <button
                      onClick={handleClearCart}
                      className="text-sm text-red-600 hover:text-red-800 transition-colors"
                    >
                      Clear all items
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {cart.map((item) => (
                    <div key={item.productId} className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            src={resolveImage(item.image, item.name)}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-lg bg-gray-100"
                            onError={(e) => handleImageError(e, 96, 96, item.name || 'Product')}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-sm text-gray-500 mb-3">
                              {item.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-600">Qty:</span>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                  <Minus size={16} />
                                </button>
                                
                                <span className="text-sm font-medium px-3 py-1 bg-gray-50 rounded border min-w-[3rem] text-center">
                                  {item.quantity}
                                </span>
                                
                                <button
                                  onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 ml-auto">
                              <button
                                onClick={() => handleSaveForLater(item)}
                                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                              >
                                <Heart size={16} />
                                <span>Save for later</span>
                              </button>
                              
                              <button
                                onClick={() => handleRemoveItem(item.productId)}
                                className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 size={16} />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          <p className="text-lg font-semibold text-gray-900">
                            LKR {(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            LKR {item.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saved Items */}
              {savedItems.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm mt-6">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Saved for Later</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {savedItems.map((item) => (
                        <div key={item.productId} className="border rounded-lg p-4">
                          <img
                            src={resolveImage(item.image, item.name)}
                            alt={item.name}
                            className="w-full h-32 object-cover rounded-md mb-3"
                            onError={(e) => handleImageError(e, 200, 128, item.name || 'Product')}
                          />
                          <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                          <p className="text-sm text-gray-500 mb-2">LKR {item.price.toFixed(2)}</p>
                          <button
                            onClick={() => handleMoveToCart(item)}
                            className="w-full bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                          >
                            Move to Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary - Right Side */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-sm sticky top-24">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({totalItems} items):</span>
                      <span className="font-medium">LKR {subtotal.toFixed(2)}</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Discount (5%):</span>
                        <span className="text-green-600 font-medium">-LKR {discount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="font-medium">
                        {shipping === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `LKR ${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">LKR {tax.toFixed(2)}</span>
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total:</span>
                        <span className="text-lg font-semibold text-gray-900">LKR {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button 
                    onClick={() => {handleCheckout()}}
                    disabled={checkoutLoading}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      checkoutLoading 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}>
                      {checkoutLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        'Proceed to Checkout'
                      )}
                    </button>
                    
                    <button 
onClick={() => {navigate("/customerdash")}}
                    className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                      Continue Shopping
                    </button>
                  </div>

                  {subtotal < 100 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Free shipping</span> on orders over LKR 2000.
                        Add <span className="font-medium">LKR {(2000 - subtotal).toFixed(2)}</span> more to qualify!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

