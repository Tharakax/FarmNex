import React, { useState, useEffect } from 'react';
import { Calendar, Package, Eye, CreditCard, ShoppingBag, Clock, Truck, CheckCircle, XCircle, Download } from 'lucide-react';

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

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        
        if (!token) {
          setError('Please log in to view your orders');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:3000/api/order/my-orders', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          setOrders(data.orders || []);
        } else {
          setError(data.message || 'Failed to fetch orders');
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

  // PDF Generation Function
  const generatePDF = async () => {
    setGeneratingPDF(true);
    
    try {
      // Ensure jsPDF is loaded
      if (!window.jspdf) {
        throw new Error('PDF library not loaded');
      }

      // Create a new jsPDF instance
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Set up colors
      const primaryColor = [34, 197, 94]; // Green-500
      const darkColor = [20, 83, 45]; // Green-900
      
      // Header
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('ORDER REPORT', 20, 20);
      
      // Date and summary info
      doc.setTextColor(...darkColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Generated on: ${currentDate}`, 20, 40);
      
      // Filter orders based on active tab
      const reportOrders = activeTab === 'all' ? orders : orders.filter(order => order.status === activeTab);
      
      doc.text(`Report Type: ${orderStates[activeTab].label}`, 20, 48);
      doc.text(`Total Orders: ${reportOrders.length}`, 20, 56);
      
      let yPosition = 70;
      
      // Summary Statistics
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('SUMMARY', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkColor);
      
      const totalSpent = reportOrders.reduce((sum, order) => sum + order.total, 0);
      const paidOrders = reportOrders.filter(order => order.paymentcompleted).length;
      const pendingPayment = reportOrders.filter(order => !order.paymentcompleted).length;
      const deliveredOrders = reportOrders.filter(order => order.status === 'delivered').length;
      
      doc.text(`Total Amount: $${totalSpent.toFixed(2)}`, 20, yPosition);
      doc.text(`Paid Orders: ${paidOrders}`, 20, yPosition + 8);
      doc.text(`Pending Payment: ${pendingPayment}`, 20, yPosition + 16);
      doc.text(`Delivered Orders: ${deliveredOrders}`, 20, yPosition + 24);
      
      yPosition += 40;
      
      // Orders List
      if (reportOrders.length > 0) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('ORDER DETAILS', 20, yPosition);
        yPosition += 15;
        
        reportOrders.forEach((order, index) => {
          // Check if we need a new page
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Order header background
          doc.setFillColor(248, 250, 252);
          doc.rect(15, yPosition - 5, 180, 20, 'F');
          
          // Order ID and date
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...darkColor);
          doc.text(`Order #${order._id.slice(-8).toUpperCase()}`, 20, yPosition + 5);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          doc.text(`Date: ${orderDate}`, 20, yPosition + 12);
          
          // Status and total
          doc.text(`Status: ${orderStates[order.status].label}`, 120, yPosition + 5);
          doc.setFont('helvetica', 'bold');
          doc.text(`Total: $${order.total.toFixed(2)}`, 120, yPosition + 12);
          
          yPosition += 25;
          
          // Order items
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text('Items:', 25, yPosition);
          yPosition += 8;
          
          order.items.forEach((item, itemIndex) => {
            doc.setFont('helvetica', 'normal');
            doc.text(`• ${item.name}`, 30, yPosition);
            doc.text(`Qty: ${item.quantity}`, 120, yPosition);
            doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 160, yPosition);
            yPosition += 6;
          });
          
          // Order totals
          yPosition += 5;
          doc.setFont('helvetica', 'normal');
          doc.text(`Subtotal: $${order.subtotal.toFixed(2)}`, 25, yPosition);
          doc.text(`Tax: $${order.tax.toFixed(2)}`, 80, yPosition);
          doc.text(`Shipping: $${order.shipping.toFixed(2)}`, 120, yPosition);
          if (order.discount > 0) {
            doc.text(`Discount: -$${order.discount.toFixed(2)}`, 160, yPosition);
          }
          
          yPosition += 8;
          
          // Payment info
          doc.text(`Payment: ${order.paymentcompleted ? 'Paid' : 'Pending'}`, 25, yPosition);
          if (order.paymentMethod) {
            doc.text(`Method: ${order.paymentMethod.replace('_', ' ').toUpperCase()}`, 80, yPosition);
          }
          
          yPosition += 15;
          
          // Separator line
          doc.setDrawColor(229, 231, 235);
          doc.line(20, yPosition, 190, yPosition);
          yPosition += 10;
        });
      } else {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text('No orders found for the selected filter.', 20, yPosition);
      }
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(`Page ${i} of ${pageCount}`, 180, 285);
        doc.text('Generated from Order Management System', 20, 285);
      }
      
      // Save the PDF
      const fileName = `orders-report-${activeTab}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
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

  // Load jsPDF library
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.jspdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.async = true;
      script.onload = () => {
        console.log('jsPDF loaded successfully');
      };
      document.head.appendChild(script);
    }
  }, []);

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
                    <p className="text-2xl font-bold text-green-900">${order.total.toFixed(2)}</p>
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
                            src={item.image} 
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover bg-green-200"
                            onError={(e) => {
                              e.target.src = '/placeholder-image.png';
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
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
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
                      <p className="font-semibold text-green-900">${order.subtotal.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-green-600">Tax</p>
                      <p className="font-semibold text-green-900">${order.tax.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-green-600">Shipping</p>
                      <p className="font-semibold text-green-900">${order.shipping.toFixed(2)}</p>
                    </div>
                    {order.discount > 0 && (
                      <div className="text-center">
                        <p className="text-green-600">Discount</p>
                        <p className="font-semibold text-green-900">-${order.discount.toFixed(2)}</p>
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
                    </div>
                    {order.paymentMethod && (
                      <div className="text-right">
                        <p className="text-sm text-green-600">Payment Method</p>
                        <p className="font-medium text-green-900 capitalize">
                          {order.paymentMethod.replace('_', ' ')}
                        </p>
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
                ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
              </p>
              <p className="text-sm text-green-600">Total Spent</p>
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