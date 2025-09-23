import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Package, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCart, updateQuantity, removeFromCart } from '../../utils/cart';
import toast from 'react-hot-toast';

const DashboardShoppingCart = ({ onBrowseProducts }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = () => {
    try {
      const cart = getCart();
      setCartItems(cart);
      setLoading(false);
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Failed to load cart items');
      setLoading(false);
    }
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        handleRemoveItem(productId);
        return;
      }
      
      const updatedCart = updateQuantity(productId, newQuantity);
      setCartItems(updatedCart);
      toast.success('Quantity updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = (productId) => {
    try {
      const updatedCart = removeFromCart(productId);
      setCartItems(updatedCart);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    // Navigate to checkout page
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-6">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Your cart is empty</h3>
        <p className="text-gray-600 mb-6">Add some products to your cart to get started</p>
        <button 
          onClick={() => onBrowseProducts ? onBrowseProducts() : navigate('/products')}
          className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all font-semibold hover:scale-105 shadow-md"
        >
          <Package className="w-5 h-5" />
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
          <p className="text-gray-600 mt-1">
            You have {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-green-600">Rs. {calculateTotal().toFixed(2)}</p>
        </div>
      </div>

      {/* Cart Items */}
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div
            key={item.productId}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              {/* Product Image */}
              <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1506617420156-8e4536971650?w=150&h=150&fit=crop'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-lg font-bold text-green-600">Rs. {item.price}</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item.productId)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Item Total */}
              <div className="text-right min-w-[5rem]">
                <p className="text-sm text-gray-600">Subtotal</p>
                <p className="font-bold text-gray-900">Rs. {(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-gray-600">
            <span>Items ({cartItems.length})</span>
            <span>Rs. {calculateTotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>Rs. 150.00</span>
          </div>
          <div className="border-t border-green-200 pt-2 mt-2">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>Rs. {(calculateTotal() + 150).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleProceedToCheckout}
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-all font-semibold hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          Proceed to Checkout
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Continue Shopping */}
      <div className="text-center">
        <button
          onClick={() => onBrowseProducts ? onBrowseProducts() : navigate('/products')}
          className="text-green-600 hover:text-green-700 font-medium transition-colors"
        >
          ← Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default DashboardShoppingCart;