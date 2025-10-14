import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Calendar,
  DollarSign,
  Download,
  Filter,
  TrendingUp,
  Package,
  Receipt,
  Eye,
  ChevronDown,
  Search
} from 'lucide-react';
import paymentAPI from '../../services/paymentAPI';
import { handleImageError, getProductPlaceholder } from '../../utils/imageUtils';
import { exportToPDF } from '../../utils/exportUtils';
import { toast } from 'react-hot-toast';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [paymentStats, setPaymentStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    thisMonthAmount: 0,
    averagePayment: 0,
    paymentMethodBreakdown: {},
    recentPayments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [historyResult, statsResult] = await Promise.all([
        paymentAPI.getPaymentHistory(),
        paymentAPI.getPaymentStats()
      ]);

      if (historyResult.success) {
        setPayments(historyResult.data);
      } else {
        throw new Error(historyResult.error || 'Failed to fetch payment history');
      }

      if (statsResult.success) {
        setPaymentStats(statsResult.stats);
      } else {
        console.warn('Failed to fetch payment stats:', statsResult.error);
      }

    } catch (err) {
      console.error('Error fetching payment data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return `LKR ${parseFloat(amount).toFixed(2)}`;
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />;
      case 'paypal':
        return <div className="w-4 h-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">P</div>;
      case 'bank_transfer':
        return <div className="w-4 h-4 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">B</div>;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'delivered': 'bg-green-100 text-green-800',
      'shipped': 'bg-blue-100 text-blue-800',
      'processing': 'bg-yellow-100 text-yellow-800',
      'pending': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusClasses[status?.toLowerCase()] || statusClasses.pending}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMonth = filterMonth === 'all' || 
                        new Date(payment.date).getMonth() === parseInt(filterMonth);
    
    const matchesMethod = filterMethod === 'all' || payment.paymentMethod === filterMethod;
    
    return matchesSearch && matchesMonth && matchesMethod;
  });

  const downloadReceipt = async (payment) => {
    try {
      // Import the PDF utility dynamically to avoid issues
      const { exportReceiptToPDF } = await import('../../utils/exportUtils');
      
      // Create order-like object for receipt generation
      const orderData = {
        _id: payment.orderId,
        id: payment.orderId,
        createdAt: payment.date,
        updatedAt: payment.date,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        paymentcompleted: true,
        contactName: payment.customerName || 'Customer',
        contactEmail: payment.customerEmail || '',
        contactPhone: payment.customerPhone || '',
        shippingAddress: payment.shippingAddress || null,
        items: payment.items,
        subtotal: payment.amount,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: payment.amount,
        refundAmount: 0
      };
      
      await exportReceiptToPDF(orderData, `receipt-${payment.transactionId}`);
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt. Please try again.');
    }
  };

  const exportPaymentReport = async () => {
    try {
      // Define column structure for payments export
      const paymentColumns = [
        { header: 'Transaction ID', key: 'transactionId' },
        { header: 'Date', key: 'date' },
        { header: 'Description', key: 'description' },
        { header: 'Amount', key: 'amount' },
        { header: 'Payment Method', key: 'paymentMethod' },
        { header: 'Status', key: 'status' },
        { header: 'Items Count', key: 'itemsCount' }
      ];
      
      // Prepare data for export
      const exportData = filteredPayments.map(payment => ({
        transactionId: payment.transactionId || 'N/A',
        date: formatDate(payment.date),
        description: payment.description || 'Payment',
        amount: `LKR ${parseFloat(payment.amount).toFixed(2)}`,
        paymentMethod: payment.paymentMethod?.replace('_', ' ').toUpperCase() || 'N/A',
        status: payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1) || 'Pending',
        itemsCount: payment.items?.length || 0
      }));

      // Calculate summary statistics
      const totalAmount = filteredPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      const successfulPayments = filteredPayments.filter(payment => payment.status === 'completed' || payment.status === 'delivered').length;
      const pendingPayments = filteredPayments.filter(payment => payment.status === 'pending').length;

      // Generate filename
      const fileName = `payment-history-${new Date().toISOString().split('T')[0]}`;
      
      // Use standardized export function
      await exportToPDF(
        exportData, 
        'Payment History Report', 
        paymentColumns, 
        fileName, 
        'payments',
        {
          subtitle: `${filteredPayments.length} payments found`,
          summary: {
            title: 'Payment Summary',
            metrics: {
              'Total Payments': filteredPayments.length.toString(),
              'Total Amount': `LKR ${totalAmount.toFixed(2)}`,
              'Successful Payments': successfulPayments.toString(),
              'Pending Payments': pendingPayments.toString(),
              'Average Amount': `LKR ${(totalAmount / filteredPayments.length || 1).toFixed(2)}`
            }
          }
        }
      );
      
      toast.success('Payment report downloaded successfully!');
      
    } catch (error) {
      console.error('Error generating payment report:', error);
      toast.error('Failed to generate payment report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-2">⚠️ Error Loading Payment History</div>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={fetchPaymentData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
        <button 
          onClick={exportPaymentReport}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Payments</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{paymentStats.totalPayments}</div>
          <p className="text-sm text-green-600 mt-1">
            {formatAmount(paymentStats.totalAmount)} total
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">This Month</h3>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatAmount(paymentStats.thisMonthAmount)}
          </div>
          <p className="text-sm text-blue-600 mt-1">
            Current month spending
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Average Payment</h3>
            <DollarSign className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatAmount(paymentStats.averagePayment)}
          </div>
          <p className="text-sm text-purple-600 mt-1">
            Per transaction
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Month Filter */}
          <div className="relative">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Months</option>
              <option value="0">January</option>
              <option value="1">February</option>
              <option value="2">March</option>
              <option value="3">April</option>
              <option value="4">May</option>
              <option value="5">June</option>
              <option value="6">July</option>
              <option value="7">August</option>
              <option value="8">September</option>
              <option value="9">October</option>
              <option value="10">November</option>
              <option value="11">December</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Payment Method Filter */}
          <div className="relative">
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Methods</option>
              <option value="credit_card">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Payment Transactions</h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredPayments.length} of {payments.length} payments
          </p>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No payment history found</p>
            <p className="text-sm text-gray-400">Your completed payments will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      {getPaymentMethodIcon(payment.paymentMethod)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{payment.description}</h4>
                        {getStatusBadge(payment.status)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(payment.date)} • {payment.transactionId}
                      </p>
                      <p className="text-sm text-gray-500">
                        {payment.items.length} item(s) • {payment.paymentMethod.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatAmount(payment.amount)}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadReceipt(payment)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download Receipt"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Payment Details</h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Transaction ID:</span>
                  <p className="font-medium">{selectedPayment.transactionId}</p>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <p className="font-medium">{formatDate(selectedPayment.date)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <p className="font-medium text-green-600">{formatAmount(selectedPayment.amount)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Payment Method:</span>
                  <p className="font-medium">{selectedPayment.paymentMethod.replace('_', ' ')}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedPayment.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={item.image || getProductPlaceholder(item.name || 'Item')} 
                          alt={item.name}
                          className="w-10 h-10 rounded object-cover"
                          onError={(e) => handleImageError(e, 40, 40, item.name || 'Item')}
                        />
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium text-sm">LKR {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => downloadReceipt(selectedPayment)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;