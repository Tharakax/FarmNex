import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Package, 
  MapPin, 
  CreditCard, 
  User, 
  Phone, 
  Mail, 
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Copy,
  StickyNote
} from 'lucide-react';

const ViewOrder = ({ orderId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get order ID from URL if not passed as prop
  const getOrderIdFromUrl = () => {
    if (orderId) return orderId;
    const path = window.location.pathname;
    const matches = path.match(/\/order-details\/(.+)/);
    return matches ? matches[1] : null;
  };

  const currentOrderId = getOrderIdFromUrl();

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch order details from API
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        
        if (!token) {
          setError('Please log in to view order details');
          setLoading(false);
          return;
        }

        if (!currentOrderId) {
          setError('Order ID not found');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:3000/api/order/${currentOrderId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          setOrder(data.order);
        } else {
          setError(data.message || 'Failed to fetch order details');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };

    if (currentOrderId) {
      fetchOrderDetails();
    }
  }, [currentOrderId]);

  const getStatusDetails = (status) => {
    const statusMap = {
      pending: { 
        label: 'Pending', 
        icon: Clock, 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        description: 'Your order has been received and is awaiting processing.'
      },
      processing: { 
        label: 'Processing', 
        icon: Package, 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        description: 'Your order is being prepared for shipment.'
      },
      shipped: { 
        label: 'Shipped', 
        icon: Truck, 
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        description: 'Your order has been shipped and is on its way.'
      },
      delivered: { 
        label: 'Delivered', 
        icon: CheckCircle, 
        color: 'bg-green-100 text-green-800 border-green-200',
        description: 'Your order has been successfully delivered.'
      },
      cancelled: { 
        label: 'Cancelled', 
        icon: XCircle, 
        color: 'bg-red-100 text-red-800 border-red-200',
        description: 'This order has been cancelled.'
      }
    };
    return statusMap[status] || statusMap.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(order._id);
    // Simple alert - you could replace with a toast notification
    alert('Order ID copied to clipboard!');
  };

  const handleBackToOrders = () => {
    window.location.href = '/orders';
  };

  const handlePayNow = () => {
    window.location.href = `/payment/${currentOrderId}`;
  };

  const downloadReceipt = () => {
    window.open(`http://localhost:3000/api/order/receipt/${currentOrderId}/pdf`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-green-700">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-sm border border-red-200 p-8 max-w-md">
          <XCircle size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-xl font-semibold mb-2 text-red-800">Error</p>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={handleBackToOrders} 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="mx-auto text-green-300 mb-4" />
          <p className="text-green-600 text-lg font-medium">Order not found</p>
          <button 
            onClick={handleBackToOrders} 
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const statusDetails = getStatusDetails(order.status);
  const StatusIcon = statusDetails.icon;

  return (
    <div className="min-h-screen bg-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToOrders}
            className="flex items-center gap-2 text-green-700 hover:text-green-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Orders
          </button>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-green-900 mb-2">Order Details</h1>
              <div className="flex items-center gap-3">
                <span className="text-green-700">Order ID: #{order._id.slice(-8).toUpperCase()}</span>
                <button
                  onClick={copyOrderId}
                  className="text-green-600 hover:text-green-800 transition-colors"
                  title="Copy Order ID"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex gap-3">
              {order.paymentcompleted && (
                <button
                  onClick={downloadReceipt}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Download size={16} />
                  Receipt
                </button>
              )}
              
              {!order.paymentcompleted && (
                <button
                  onClick={handlePayNow}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CreditCard size={16} />
                  Pay Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className={`bg-white rounded-lg shadow-sm border-2 ${statusDetails.color.split(' ')[2]} p-6 mb-6`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-full ${statusDetails.color}`}>
              <StatusIcon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-green-900">Order {statusDetails.label}</h2>
              <p className="text-green-700">{statusDetails.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-green-700">
              <Calendar size={16} />
              <span>Placed: {formatDate(order.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <Package size={16} />
              <span>Updated: {formatDate(order.updatedAt)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover bg-green-200"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.png';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-green-600 mt-1">{item.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-green-700">Quantity: {item.quantity}</span>
                        <div className="text-right">
                          <p className="text-sm text-green-600">${item.price.toFixed(2)} each</p>
                          <p className="font-semibold text-green-900">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  Shipping Address
                </h3>
                <div className="text-green-800">
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  {order.shippingAddress.phone && (
                    <p className="mt-2 flex items-center gap-2">
                      <Phone size={14} />
                      {order.shippingAddress.phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Contact Information */}
            {(order.contactEmail || order.contactPhone || order.contactName) && (
              <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <User size={20} />
                  Contact Information
                </h3>
                <div className="space-y-2 text-green-800">
                  {order.contactName && (
                    <p className="flex items-center gap-2">
                      <User size={14} />
                      {order.contactName}
                    </p>
                  )}
                  {order.contactEmail && (
                    <p className="flex items-center gap-2">
                      <Mail size={14} />
                      {order.contactEmail}
                    </p>
                  )}
                  {order.contactPhone && (
                    <p className="flex items-center gap-2">
                      <Phone size={14} />
                      {order.contactPhone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <StickyNote size={20} />
                  Order Notes
                </h3>
                <p className="text-green-800 bg-green-50 p-3 rounded-lg">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-green-800">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-800">
                  <span>Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-800">
                  <span>Shipping</span>
                  <span>${order.shipping.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-800">
                    <span>Discount</span>
                    <span>-${order.discount.toFixed(2)}</span>
                  </div>
                )}
                <hr className="border-green-200" />
                <div className="flex justify-between text-lg font-semibold text-green-900">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                <CreditCard size={20} />
                Payment Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-700">Status</span>
                  <span className={`font-medium ${order.paymentcompleted ? 'text-green-800' : 'text-yellow-800'}`}>
                    {order.paymentcompleted ? 'Paid' : 'Pending'}
                  </span>
                </div>
                {order.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Method</span>
                    <span className="text-green-800 capitalize">
                      {order.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                )}
                {!order.paymentcompleted && (
                  <div className="mt-4">
                    <button
                      onClick={handlePayNow}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CreditCard size={16} />
                      Complete Payment
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Billing Address */}
            {order.billingAddress && (
              <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  Billing Address
                </h3>
                <div className="text-green-800">
                  <p className="font-medium">{order.billingAddress.name}</p>
                  <p>{order.billingAddress.street}</p>
                  <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}</p>
                  {order.billingAddress.country && <p>{order.billingAddress.country}</p>}
                </div>
              </div>
            )}

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Order Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-green-900">Order Placed</p>
                    <p className="text-xs text-green-600">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                
                {order.paymentcompleted && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-green-900">Payment Confirmed</p>
                      <p className="text-xs text-green-600">Payment processed successfully</p>
                    </div>
                  </div>
                )}

                {['processing', 'shipped', 'delivered'].includes(order.status) && (
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${order.status === 'processing' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                    <div>
                      <p className="text-sm font-medium text-green-900">Order Processing</p>
                      <p className="text-xs text-green-600">Your order is being prepared</p>
                    </div>
                  </div>
                )}

                {['shipped', 'delivered'].includes(order.status) && (
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${order.status === 'shipped' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                    <div>
                      <p className="text-sm font-medium text-green-900">Order Shipped</p>
                      <p className="text-xs text-green-600">Your order is on its way</p>
                    </div>
                  </div>
                )}

                {order.status === 'delivered' && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-green-900">Order Delivered</p>
                      <p className="text-xs text-green-600">Package delivered successfully</p>
                    </div>
                  </div>
                )}

                {order.status === 'cancelled' && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-red-900">Order Cancelled</p>
                      <p className="text-xs text-red-600">This order has been cancelled</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleBackToOrders}
                  className="w-full text-left px-3 py-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                >
                  View All Orders
                </button>
                
                {order.paymentcompleted && (
                  <button
                    onClick={downloadReceipt}
                    className="w-full text-left px-3 py-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    Download Receipt
                  </button>
                )}
                
                <button
                  onClick={() => window.location.href = '/contact'}
                  className="w-full text-left px-3 py-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOrder;