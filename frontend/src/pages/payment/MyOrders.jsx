import React, { useState, useEffect } from 'react';
import { Calendar, Package, Eye, CreditCard, ShoppingBag, Clock, Truck, CheckCircle, XCircle, Download } from 'lucide-react';
import { orderAPI } from '../../services/orderAPI';
import { handleImageError, resolveProductImage, getProductPlaceholder } from '../../utils/imageUtils';
import { exportToPDF } from '../../utils/exportUtils';
import { toast } from 'react-hot-toast';

// Using shared resolver from imageUtils

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Order states from order.js schema
  const orderStates = {
    all: { label: 'All Orders', icon: ShoppingBag, color: 'text-green-600' },
    pending: { label: 'Pending', icon: Clock, color: 'text-yellow-600' },
    processing: { label: 'Processing', icon: Package, color: 'text-blue-600' },
    shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-600' },
    delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600' }
  };

  // Test our utility functions on component mount
  useEffect(() => {
    console.log('Testing getProductPlaceholder:', getProductPlaceholder('Test Product'));
    console.log('Testing generatePlaceholder directly');
    
    try {
      const testPlaceholder = getProductPlaceholder('Organic Carrots');
      console.log('Generated placeholder for Organic Carrots:', testPlaceholder.substring(0, 50) + '...');
    } catch (error) {
      console.error('Error generating placeholder:', error);
    }
  }, []);

  // Fetch orders from API (testing endpoint for demo without auth)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');

        const result = await orderAPI.getMyOrders();
        if (result.success) {
          setOrders(result.data || []);
        } else {
          setError(result.error || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // PDF Generation Function using standardized FarmNex format
  const generatePDF = async () => {
    setGeneratingPDF(true);
    
    try {
      // Filter orders based on active tab
      const reportOrders = activeTab === 'all' ? orders : orders.filter(order => order.status === activeTab);
      
      // Define column structure for orders export
      const orderColumns = [
        { header: 'Order ID', key: 'orderId' },
        { header: 'Date', key: 'date' },
        { header: 'Status', key: 'status' },
        { header: 'Customer', key: 'customer' },
        { header: 'Items', key: 'items' },
        { header: 'Subtotal', key: 'subtotal' },
        { header: 'Tax', key: 'tax' },
        { header: 'Shipping', key: 'shipping' },
        { header: 'Discount', key: 'discount' },
        { header: 'Total', key: 'total' },
        { header: 'Payment', key: 'payment' },
        { header: 'Method', key: 'method' },
        { header: 'Refund', key: 'refund' }
      ];
      
      // Prepare data for export
      const exportData = reportOrders.map(order => ({
        orderId: order._id?.slice(-8).toUpperCase() || 'N/A',
        date: new Date(order.createdAt).toLocaleDateString(),
        status: orderStates[order.status]?.label || order.status,
        customer: order.contactName || order.contactEmail || 'N/A',
        items: order.items?.length || 0,
        subtotal: `Rs. ${order.subtotal?.toFixed(2) || '0.00'}`,
        tax: `Rs. ${order.tax?.toFixed(2) || '0.00'}`,
        shipping: `Rs. ${order.shipping?.toFixed(2) || '0.00'}`,
        discount: order.discount > 0 ? `-Rs. ${order.discount.toFixed(2)}` : 'Rs. 0.00',
        total: `Rs. ${order.total?.toFixed(2) || '0.00'}`,
        payment: order.paymentcompleted ? 'Paid' : 'Pending',
        method: order.paymentMethod?.replace('_', ' ').toUpperCase() || 'N/A',
        refund: Number(order.refundAmount || 0) > 0 ? `Rs. ${Number(order.refundAmount).toFixed(2)}` : 'None'
      }));

      // Calculate summary statistics
      const totalSpent = reportOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const paidOrders = reportOrders.filter(order => order.paymentcompleted).length;
      const pendingPayment = reportOrders.filter(order => !order.paymentcompleted).length;
      const deliveredOrders = reportOrders.filter(order => order.status === 'delivered').length;
      const totalRefunds = reportOrders.reduce((sum, order) => sum + Number(order.refundAmount || 0), 0);

      // Generate filename
      const fileName = `orders-report-${activeTab}-${new Date().toISOString().split('T')[0]}`;
      
      // Use standardized export function with correct parameter order
      await exportToPDF(
        exportData, 
        'Orders Report', 
        orderColumns, 
        fileName, 
        'orders',
        {
          subtitle: `${orderStates[activeTab]?.label || 'All Orders'} - ${reportOrders.length} orders`,
          summary: {
            title: 'Order Summary',
            metrics: {
              'Total Orders': reportOrders.length.toString(),
              'Total Amount': `Rs. ${totalSpent.toFixed(2)}`,
              'Paid Orders': paidOrders.toString(),
              'Pending Payment': pendingPayment.toString(),
              'Delivered Orders': deliveredOrders.toString(),
              'Total Refunds': `Rs. ${totalRefunds.toFixed(2)}`
            }
          }
        }
      );
      
      toast.success('Orders report downloaded successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    activeTab === 'all' || order.status === activeTab
  );

  const getStatusBadge = (status) => {
    const stateInfo = orderStates[status] || orderStates.pending;
    const IconComponent = stateInfo.icon;
    
    return (
      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
        status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        status === 'processing' ? 'bg-blue-100 text-blue-800' :
        status === 'shipped' ? 'bg-purple-100 text-purple-800' :
        status === 'delivered' ? 'bg-green-100 text-green-800' :
        status === 'cancelled' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        <IconComponent size={14} />
        {stateInfo.label}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewOrder = (orderId) => {
    // Navigate to order details page
    window.location.href = `/order-details/${orderId}`;
    // Or if using React Router: navigate(`/order-details/${orderId}`);
  };

  const handlePayNow = (orderId) => {
    // Navigate to payment page
    window.location.href = `/payment/${orderId}`;
    // Or if using React Router: navigate(`/payment/${orderId}`);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await orderAPI.cancelOrder(orderId);
      
      if (result.success) {
        // Update the local state to reflect the cancellation
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: 'cancelled' } 
              : order
          )
        );
        alert('Order cancelled successfully!');
      } else {
        alert('Failed to cancel order: ' + result.error);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-green-700">Loading your orders...</p>
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
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-green-900 mb-2">My Orders</h1>
              <p className="text-green-700">Track and manage all your orders</p>
            </div>
            
            {/* PDF Download Button */}
            <button
              onClick={generatePDF}
              disabled={generatingPDF || orders.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                generatingPDF || orders.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {generatingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Download Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-green-200 mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            {Object.entries(orderStates).map(([key, state]) => {
              const IconComponent = state.icon;
              const count = key === 'all' ? orders.length : orders.filter(order => order.status === key).length;
              
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === key
                      ? 'bg-green-500 text-white border-b-2 border-green-600'
                      : 'text-green-700 hover:bg-green-100'
                  }`}
                >
                  <IconComponent size={16} />
                  {state.label}
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                    activeTab === key
                      ? 'bg-green-600 text-white'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-green-200 p-8 text-center">
              <ShoppingBag size={48} className="mx-auto text-green-300 mb-4" />
              <p className="text-green-600 text-lg font-medium mb-2">No orders found</p>
              <p className="text-green-500">
                {activeTab === 'all' 
                  ? "You haven't placed any orders yet." 
                  : `No ${orderStates[activeTab].label.toLowerCase()} orders found.`}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border border-green-200 p-6 hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-green-900">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Calendar size={14} />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-900">Rs. {order.total.toFixed(2)}</p>
                    {Number(order.refundAmount || 0) > 0 && (
                      <p className="text-sm text-red-600">Refund: -Rs. {Number(order.refundAmount).toFixed(2)}</p>
                    )}
                    <p className="text-sm text-green-600">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-green-100 pt-4 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        {item.image ? (
                          <img 
                          src={resolveProductImage(item.image, item.name)} 
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover bg-green-200"
                          onError={(e) => {
                            console.log(`Image failed to load for ${item.name}:`, e.target.src.substring(0, 100));
                            handleImageError(e, 48, 48, item.name || 'Product');
                          }}
                        />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-green-200 flex items-center justify-center">
                            <div className="text-green-500 text-center">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-green-900 truncate">{item.name}</p>
                          <div className="flex items-center justify-between text-sm text-green-600">
                            <span>Qty: {item.quantity}</span>
                            <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-green-100 pt-4 mb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-green-600">Subtotal</p>
                      <p className="font-semibold text-green-900">Rs. {order.subtotal.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-green-600">Tax</p>
                      <p className="font-semibold text-green-900">Rs. {order.tax.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-green-600">Shipping</p>
                      <p className="font-semibold text-green-900">Rs. {order.shipping.toFixed(2)}</p>
                    </div>
                    {order.discount > 0 && (
                      <div className="text-center">
                        <p className="text-green-600">Discount</p>
                        <p className="font-semibold text-green-900">-Rs. {order.discount.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Status */}
                <div className="border-t border-green-100 pt-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Payment Status</p>
                      <p className={`font-medium ${order.paymentcompleted ? 'text-green-800' : 'text-yellow-800'}`}>
                        {order.paymentcompleted ? 'Paid' : 'Pending Payment'}
                      </p>
                      {Number(order.refundAmount || 0) > 0 && (
                        <p className="text-sm text-red-600">Refunded {order.refundStatus ? `(${order.refundStatus})` : ''}: Rs. {Number(order.refundAmount).toFixed(2)} {order.refundTxnId ? `• TXN ${order.refundTxnId}` : ''}</p>
                      )}
                    </div>
                    {order.paymentMethod && (
                      <div className="text-right">
                        <p className="text-sm text-green-600">Payment Method</p>
                        <p className="font-medium text-green-900 capitalize">
                          {order.paymentMethod.replace('_', ' ')}
                        </p>
                        {Number(order.refundAmount || 0) > 0 && (
                          <a href={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/order/credit-note/${order._id}/pdf`} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 text-sm text-blue-600 hover:underline">Download Credit Note</a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                {(order.contactEmail || order.contactPhone) && (
                  <div className="border-t border-green-100 pt-4 mb-4">
                    <p className="text-sm text-green-600 mb-2">Contact Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {order.contactEmail && (
                        <p className="text-green-900">
                          <span className="font-medium">Email:</span> {order.contactEmail}
                        </p>
                      )}
                      {order.contactPhone && (
                        <p className="text-green-900">
                          <span className="font-medium">Phone:</span> {order.contactPhone}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleViewOrder(order._id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  
                  {!order.paymentcompleted && (
                    <button
                      onClick={() => handlePayNow(order._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CreditCard size={16} />
                      Pay Now
                    </button>
                  )}
                  
                  {/* Cancel Order Button - Only show for pending/processing orders */}
                  {(['pending', 'processing'].includes(order.status)) && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <XCircle size={16} />
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Summary Stats */}
        {orders.length > 0 && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4 text-center">
              <p className="text-2xl font-bold text-green-900">{orders.length}</p>
              <p className="text-sm text-green-600">Total Orders</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4 text-center">
              <p className="text-2xl font-bold text-green-900">
                Rs. {orders.reduce((sum, order) => sum + Math.max(0, order.total - Number(order.refundAmount || 0)), 0).toFixed(2)}
              </p>
              <p className="text-sm text-green-600">Total Spent (net)</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4 text-center">
              <p className="text-2xl font-bold text-green-900">
                {orders.filter(order => order.status === 'delivered').length}
              </p>
              <p className="text-sm text-green-600">Delivered</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4 text-center">
              <p className="text-2xl font-bold text-green-900">
                {orders.filter(order => !order.paymentcompleted).length}
              </p>
              <p className="text-sm text-green-600">Pending Payment</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;