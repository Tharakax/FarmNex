import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/env.js';
import ExportSplitButton from '../../features/reports/ExportSplitButton.jsx';
import { formatCurrency } from '../../utils/currencyUtils.js';
import { Calendar, User, CreditCard } from 'lucide-react';

// Status config for professional, consistent styling
const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_STYLES = {
  pending:    'bg-yellow-100 text-yellow-800 border-yellow-300',
  processing: 'bg-blue-100 text-blue-800 border-blue-300',
  shipped:    'bg-purple-100 text-purple-800 border-purple-300',
  delivered:  'bg-emerald-100 text-emerald-800 border-emerald-300',
  cancelled:  'bg-rose-100 text-rose-800 border-rose-300'
};

const Spinner = () => (
  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent align-middle" />
);

const OrdersRemade = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    thisMonthRevenue: 0,
    byStatus: { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 }
  });
  const [savingStatus, setSavingStatus] = useState({}); // { [orderId]: true }
  // Refund modal state (must be declared before any early returns)
  const [showRefund, setShowRefund] = useState(false);
  const [refundForm, setRefundForm] = useState({ amount: 0, note: '' });
  
  // Date selection state for reports
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [dateSelectionType, setDateSelectionType] = useState('range'); // 'range' or 'specific'
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [specificDate, setSpecificDate] = useState('');
  
  // User filter state
  const [showUserFilter, setShowUserFilter] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  // Payment status filter state
  const [showPaymentFilter, setShowPaymentFilter] = useState(false);
  const [paymentFilters, setPaymentFilters] = useState({
    pending: false,
    completed: false
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  // Determine if current user is admin from token/localStorage
  const isAdmin = useMemo(() => {
    try {
      const raw = (localStorage.getItem('token') || sessionStorage.getItem('authToken') || '').trim();
      if (!raw) return false;
      const token = /^Bearer\b/i.test(raw) ? raw.split(' ')[1] : raw;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = String(payload.role || payload.Role || payload.userRole || '').toLowerCase();
      return role === 'admin' || role === 'superadmin' || role === 'farmer' || role === 'farmstaff';
    } catch {
      return false;
    }
  }, []);

  // Build Authorization header correctly even if stored token already contains "Bearer"
  const getAuthHeaders = () => {
    const raw = (localStorage.getItem('token') || sessionStorage.getItem('authToken') || '').trim();
    if (!raw) return {};
    // Normalize to "Bearer <token>"
    let tokenPart = raw;
    if (/^Bearer\b/i.test(raw)) {
      tokenPart = raw.replace(/^Bearer\s*[.:]*/i, '');
    }
    const header = `Bearer ${tokenPart}`.trim();
    return { Authorization: header };
  };

  const normalizeOrders = (data = []) =>
    (Array.isArray(data) ? data : []).map((order) => {
      const firstName = order?.customerId?.firstName ?? '';
      const lastName = order?.customerId?.lastName ?? '';
      const fullName = order?.customerId?.fullName ?? '';
      const combinedName = [firstName, lastName].filter(Boolean).join(' ').trim();

      const userEmail = order?.customerId?.email ? String(order.customerId.email).trim() : '';
      // Prefer populated customer email if present; fall back to contactEmail
      const safeContactEmail = userEmail
        ? userEmail
        : ((order?.contactEmail ? String(order.contactEmail).trim() : '') || 'N/A');

      // Derive a readable name from email local-part when nothing else is available
      let nameFromEmail = '';
      if (safeContactEmail && safeContactEmail !== 'N/A') {
        try {
          const local = safeContactEmail.split('@')[0] || '';
          nameFromEmail = local.replace(/[._-]+/g, ' ').trim();
          if (nameFromEmail) {
            nameFromEmail = nameFromEmail.split(' ').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          }
        } catch {}
      }

      // Prefer any customerId name if present (regardless of role), then contact/shipping, then derived-from-email
      const safeContactName = (fullName ? String(fullName).trim() : '')
        || combinedName
        || (order?.contactName ? String(order.contactName).trim() : '')
        || (order?.shippingAddress?.name ? String(order.shippingAddress.name).trim() : '')
        || nameFromEmail
        || 'Unknown Customer';

      const rawId = order?._id || order?.id || order?.orderId;
      const normalizedId = rawId ? rawId.toString() : `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Normalize payment method to a human-friendly label (only credit card supported)
      const rawMethod = order?.paymentMethod || '';
      const paymentMethod = (() => {
        const m = rawMethod.toLowerCase();
        if (m === 'credit_card') return 'Credit card';
        return 'Credit card'; // Default to credit card since that's all we support
      })();

      // Build best-available shipping address
      const hasAny = (obj) => !!obj && Object.values(obj).some(v => Boolean(v));
      let shipping = hasAny(order?.shippingAddress) ? order.shippingAddress
                  : hasAny(order?.billingAddress) ? order.billingAddress
                  : null;
      if (!shipping) {
        const fallbackStreet = order?.customerId?.address || '';
        const fallbackPhone = order?.customerId?.phone || '';
        if (fallbackStreet || fallbackPhone) {
          shipping = {
            name: safeContactName,
            street: fallbackStreet || undefined,
            city: undefined,
            state: undefined,
            zipCode: undefined,
            phone: fallbackPhone || undefined
          };
        }
      }

      const contactPhone = order?.contactPhone || order?.shippingAddress?.phone || order?.customerId?.phone || 'N/A';

      return {
        ...order,
        _id: normalizedId,
        contactName: safeContactName,
        contactEmail: safeContactEmail,
        contactPhone,
        total: Number(order?.total ?? order?.totalAmount ?? order?.amount ?? 0),
        status: order?.status || 'pending',
        createdAt: order?.createdAt || order?.updatedAt || new Date().toISOString(),
        items: Array.isArray(order?.items) ? order.items : [],
        paymentcompleted: (order?.paymentcompleted ?? order?.paymentCompleted) || false,
        paymentMethod,
        // Refund fields (defaults)
        refundStatus: order?.refundStatus || 'none',
        refundAmount: Number(order?.refundAmount || 0),
        refundAt: order?.refundAt || null,
        refundTxnId: order?.refundTxnId || '',
        refundMethod: order?.refundMethod || '',
        refundNote: order?.refundNote || '',
        shippingAddress: shipping || {},
      };
    });


  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = getAuthHeaders();

      // Query only real endpoints (remove any mock/debug fallbacks)
      const endpoints = [
        `${API_BASE_URL}/api/order/admin-orders`,
        `${API_BASE_URL}/api/order`,
        `${API_BASE_URL}/orders`
      ];

      let ordersData = [];
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          const res = await axios.get(endpoint, { headers });
          if (res.data?.success && res.data?.orders) {
            ordersData = res.data.orders;
          } else if (Array.isArray(res.data)) {
            ordersData = res.data;
          } else if (res.data?.success && res.data?.data) {
            // dashboard style payloads return orders under data.orders
            ordersData = res.data.data.orders || [];
          }
          if (ordersData.length) break;
        } catch (err) {
          lastError = err;
          continue;
        }
      }

      if (!ordersData.length) {
        // As a last resort, keep the UI working with an empty list but show error
        setError(lastError?.response?.data?.message || lastError?.message || 'No order endpoints responded');
        setOrders([]);
        setLoading(false);
        return;
      }

      const normalized = normalizeOrders(ordersData);
      setOrders(normalized);
      // If a modal is open, keep its selected order in sync
      setSelectedOrder(prev => prev ? normalized.find(o => o._id === prev._id) || prev : prev);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    // Optional confirmation when cancelling
    if (newStatus === 'cancelled' && !window.confirm('Cancel this order?')) return;

    const headers = getAuthHeaders();
    const endpoints = [
      `${API_BASE_URL}/api/order/admin/status/${orderId}`,
      `${API_BASE_URL}/api/order/status/${orderId}`
    ];

    // Optimistic update with revert on failure
    setSavingStatus(prev => ({ ...prev, [orderId]: true }));
    let prevStatus = null;
    setOrders(prev => prev.map(o => {
      if (o._id === orderId) { prevStatus = o.status; return { ...o, status: newStatus }; }
      return o;
    }));

    let ok = false; let lastErr = null;
    for (const endpoint of endpoints) {
      try {
        const res = await axios.put(endpoint, { status: newStatus }, { headers });
        if (res?.data?.success || res?.status === 200) { ok = true; break; }
        lastErr = res?.data;
      } catch (err) {
        lastErr = err?.response?.data || { message: err?.message };
      }
    }

    if (!ok) {
      // Revert
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: prevStatus } : o));
      alert(lastErr?.message || 'Failed to update status.');
    }

    setSavingStatus(prev => { const copy = { ...prev }; delete copy[orderId]; return copy; });
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      const headers = getAuthHeaders();
      const endpoints = [
        `${API_BASE_URL}/api/order/admin/delete/${orderId}`,
        `${API_BASE_URL}/api/order/${orderId}`
      ];
      let success = false;
      let lastErr = null;
      for (const endpoint of endpoints) {
        try {
          const res = await axios.delete(endpoint, { headers });
          if (res?.data?.success || res?.status === 200 || res?.status === 204) {
            success = true;
            break;
          }
          lastErr = res?.data;
        } catch (err) {
          lastErr = err?.response?.data || { message: err?.message };
        }
      }
      if (success) {
        setOrders(prev => prev.filter(o => o._id !== orderId));
      } else {
        const msg = lastErr?.message || 'Delete failed on server. Order was not removed.';
        alert(msg);
      }
    } catch (e) {
      console.error(e);
      alert('Delete failed.');
    }
  };



  const formatDate = (ds) => new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });


  // Handle date range changes
  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clear date selection
  const clearDateSelection = () => {
    setDateRange({
      startDate: '',
      endDate: ''
    });
    setSpecificDate('');
  };

  // Get unique users from orders
  const getUniqueUsers = useMemo(() => {
    const users = new Set();
    orders.forEach(order => {
      const userName = order.contactName || order?.customerId?.fullName || 'Unknown Customer';
      const userEmail = order.contactEmail || order?.customerId?.email || '';
      if (userName && userName !== 'Unknown Customer') {
        users.add(JSON.stringify({ name: userName, email: userEmail }));
      }
    });
    return Array.from(users).map(userStr => JSON.parse(userStr));
  }, [orders]);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!userSearchTerm) return getUniqueUsers;
    return getUniqueUsers.filter(user => 
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  }, [getUniqueUsers, userSearchTerm]);

  // Clear user selection
  const clearUserSelection = () => {
    setSelectedUser('');
    setUserSearchTerm('');
  };

  // Handle payment filter changes
  const handlePaymentFilterChange = (filterType) => {
    setPaymentFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  // Clear payment filters
  const clearPaymentFilters = () => {
    setPaymentFilters({
      pending: false,
      completed: false
    });
  };

  // Apply filters to orders for current view
  const filteredOrders = useMemo(() => {
    let filtered = orders;
    
    // Apply date filtering
    if (dateSelectionType === 'specific' && specificDate) {
      const selectedDate = new Date(specificDate);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startOfDay && orderDate <= endOfDay;
      });
    } else if (dateSelectionType === 'range' && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    // Apply user filtering
    if (selectedUser) {
      const selectedUserData = JSON.parse(selectedUser);
      filtered = filtered.filter(order => {
        const orderUserName = order.contactName || order?.customerId?.fullName || '';
        const orderUserEmail = order.contactEmail || order?.customerId?.email || '';
        return orderUserName === selectedUserData.name && orderUserEmail === selectedUserData.email;
      });
    }

    // Apply payment status filtering
    if (paymentFilters.pending || paymentFilters.completed) {
      filtered = filtered.filter(order => {
        const isCompleted = order.paymentcompleted;
        if (paymentFilters.pending && paymentFilters.completed) {
          return true; // Show both pending and completed
        } else if (paymentFilters.pending) {
          return !isCompleted; // Show only pending
        } else if (paymentFilters.completed) {
          return isCompleted; // Show only completed
        }
        return true;
      });
    }

    return filtered;
  }, [orders, dateSelectionType, specificDate, dateRange, selectedUser, paymentFilters]);

  // Calculate analytics for filtered orders
  const filteredAnalytics = useMemo(() => {
    const normalized = Array.isArray(filteredOrders) ? filteredOrders : [];
    const totalOrders = normalized.length;
    const totalRevenue = normalized.reduce((sum, o) => sum + (Number(o.total) - Number(o.refundAmount || 0) || 0), 0);
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
    const now = new Date();
    const thisMonthRevenue = normalized
      .filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const byStatus = normalized.reduce((acc, o) => {
      const s = (o.status || 'pending');
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 });
    
    return { totalOrders, totalRevenue, avgOrderValue, thisMonthRevenue, byStatus };
  }, [filteredOrders]);

  const handleGenerate = async (format) => {
    if (!Array.isArray(orders) || orders.length === 0) {
      alert('No orders to export yet.');
      return;
    }

    if (filteredOrders.length === 0) {
      alert('No orders found for the selected filters.');
      return;
    }

    const sales = filteredOrders.map(o => ({
      customer: { name: o.contactName },
      createdAt: o.createdAt,
      items: Array.isArray(o.items) ? o.items : [],
      totalAmount: Number(o.total) || 0,
      paymentMethod: o.paymentMethod,
      status: o.status
    }));

    // Generate period description
    let period = 'Current View';
    const filters = [];
    
    if (dateSelectionType === 'specific' && specificDate) {
      filters.push(`Date: ${specificDate}`);
    } else if (dateSelectionType === 'range' && dateRange.startDate && dateRange.endDate) {
      filters.push(`Date Range: ${dateRange.startDate} to ${dateRange.endDate}`);
    }
    
    if (selectedUser) {
      const selectedUserData = JSON.parse(selectedUser);
      filters.push(`User: ${selectedUserData.name}`);
    }
    
    if (filters.length > 0) {
      period = filters.join(', ');
    }

    const { default: ExportService } = await import('../../services/exportService.js');
    try {
      if (format === 'excel') {
        if (ExportService.exportSales?.toExcel) {
          ExportService.exportSales.toExcel(sales, period);
        } else {
          alert('Excel export not available.');
        }
      } else {
        ExportService.exportSales.toPDF(sales, period);
      }
    } catch (e) {
      console.error('Export error:', e);
      alert('Export failed. See console for details.');
    }
  };


  // Recompute analytics whenever orders change so the summary updates after deletes/updates
  useEffect(() => {
    const normalized = Array.isArray(orders) ? orders : [];
    const totalOrders = normalized.length;
    const totalRevenue = normalized.reduce((sum, o) => sum + (Number(o.total) - Number(o.refundAmount || 0) || 0), 0);
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
    const now = new Date();
    const thisMonthRevenue = normalized
      .filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const byStatus = normalized.reduce((acc, o) => {
      const s = (o.status || 'pending');
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 });
    setAnalytics({ totalOrders, totalRevenue, avgOrderValue, thisMonthRevenue, byStatus });
  }, [orders]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }


  // Refund modal handlers

  const openRefundModal = (order) => {
    // Check if order is eligible for refund (credit card only)
    const paymentMethod = (order.paymentMethod || '').toLowerCase().replace(/\s+/g, '_');
    if (!paymentMethod || (paymentMethod !== 'credit_card' && paymentMethod !== 'creditcard')) {
      alert('Refunds are only available for credit card payments processed through Stripe.');
      return;
    }

    // Additional checks for refund eligibility
    if (!order.paymentcompleted) {
      alert('Refunds are only available for orders with completed payments.');
      return;
    }

    if (order.status !== 'cancelled') {
      alert('Refunds are only available for cancelled orders.');
      return;
    }
    
    const remaining = Math.max(0, Number(order.total || 0) - Number(order.refundAmount || 0));
    if (remaining <= 0) {
      alert('This order has already been fully refunded.');
      return;
    }

    setRefundForm({ amount: remaining, note: '' });
    setShowRefund(true);
  };

  const submitRefund = async () => {
    try {
      // Validate refund amount
      const remaining = Math.max(0, Number(selectedOrder.total || 0) - Number(selectedOrder.refundAmount || 0));
      if (Number(refundForm.amount) <= 0 || Number(refundForm.amount) > remaining) {
        alert(`Invalid refund amount. Maximum refundable amount is ${formatCurrency(remaining)}.`);
        return;
      }

      const headers = getAuthHeaders();
      const res = await axios.post(`${API_BASE_URL}/api/order/refund/${selectedOrder._id}`, {
        amount: Number(refundForm.amount),
        note: refundForm.note
      }, { headers });

      if (res.data?.success) {
        const updated = res.data?.order;
        if (updated) {
          const normalized = normalizeOrders([updated])[0];
          setOrders(prev => prev.map(o => o._id === updated._id ? normalized : o));
          setSelectedOrder(normalized);
          
          // Show success message
          alert(`Refund of ${formatCurrency(refundForm.amount)} processed successfully!`);
          
          // One-click open credit note after refund
          const url = `${API_BASE_URL}/api/order/credit-note/${normalized._id}/pdf`;
          window.open(url, '_blank');
        }
        setShowRefund(false);
      } else {
        alert(res.data?.message || 'Refund failed');
      }
    } catch (err) {
      console.error('Refund error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Refund failed. Please try again.';
      alert(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-gray-600 mt-1 text-sm">View orders, change status, and delete orders</p>
          {error && <p className="text-yellow-700 mt-1 text-sm">{error}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowDateSelector(!showDateSelector)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:text-green-700 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
          >
            <Calendar size={14} />
            {(dateRange.startDate && dateRange.endDate) || specificDate ? 'Date Filter Active' : 'Select Date Filter'}
          </button>
          <button
            onClick={() => setShowUserFilter(!showUserFilter)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <User size={14} />
            {selectedUser ? 'User Filter Active' : 'Filter by User'}
          </button>
          <button
            onClick={() => setShowPaymentFilter(!showPaymentFilter)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-700 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <CreditCard size={14} />
            {paymentFilters.pending || paymentFilters.completed ? 'Payment Filter Active' : 'Filter by Payment'}
          </button>
          <ExportSplitButton onGenerate={handleGenerate} />
          <button onClick={fetchOrders} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Refresh</button>
        </div>
      </div>

      {/* Date Selection */}
      {showDateSelector && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          {/* Date Selection Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Filter Type</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="range"
                  checked={dateSelectionType === 'range'}
                  onChange={(e) => setDateSelectionType(e.target.value)}
                  className="mr-2 text-green-600 focus:ring-green-500"
                />
                Date Range
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="specific"
                  checked={dateSelectionType === 'specific'}
                  onChange={(e) => setDateSelectionType(e.target.value)}
                  className="mr-2 text-green-600 focus:ring-green-500"
                />
                Specific Date
              </label>
            </div>
          </div>

          {/* Date Range Selection */}
          {dateSelectionType === 'range' && (
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  min={dateRange.startDate || undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          )}

          {/* Specific Date Selection */}
          {dateSelectionType === 'specific' && (
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                <input
                  type="date"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex-1"></div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={clearDateSelection}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => setShowDateSelector(false)}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Done
            </button>
          </div>

          {/* Filter Status */}
          {(dateRange.startDate || dateRange.endDate || specificDate) && (
            <div className="mt-3 p-2 bg-green-50 rounded-md">
              <p className="text-sm text-green-700">
                <strong>Active Filter:</strong> {
                  dateSelectionType === 'specific' 
                    ? `Specific Date: ${specificDate}`
                    : `Date Range: ${dateRange.startDate || 'No start date'} to ${dateRange.endDate || 'No end date'}`
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* User Filter */}
      {showUserFilter && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Customer/User</label>
            
            {/* Search Input */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* User Selection */}
            {filteredUsers.length > 0 ? (
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                {filteredUsers.map((user, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedUser(JSON.stringify(user))}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                      selectedUser === JSON.stringify(user) ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900">{user.name}</div>
                    {user.email && <div className="text-sm text-gray-500">{user.email}</div>}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                {userSearchTerm ? 'No users found matching your search.' : 'No users found in orders.'}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={clearUserSelection}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => setShowUserFilter(false)}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>

          {/* Filter Status */}
          {selectedUser && (
            <div className="mt-3 p-2 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Active Filter:</strong> {
                  (() => {
                    const userData = JSON.parse(selectedUser);
                    return `${userData.name}${userData.email ? ` (${userData.email})` : ''}`;
                  })()
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Payment Status Filter */}
      {showPaymentFilter && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Filter by Payment Status</label>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={paymentFilters.pending}
                  onChange={() => handlePaymentFilterChange('pending')}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Pending Payment</span>
                </div>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={paymentFilters.completed}
                  onChange={() => handlePaymentFilterChange('completed')}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Completed Payment</span>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={clearPaymentFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => setShowPaymentFilter(false)}
              className="px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Done
            </button>
          </div>

          {/* Filter Status */}
          {(paymentFilters.pending || paymentFilters.completed) && (
            <div className="mt-3 p-2 bg-purple-50 rounded-md">
              <p className="text-sm text-purple-700">
                <strong>Active Filters:</strong> {
                  (() => {
                    const filters = [];
                    if (paymentFilters.pending) filters.push('Pending Payment');
                    if (paymentFilters.completed) filters.push('Completed Payment');
                    return filters.join(' • ');
                  })()
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Analytics summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-xs text-gray-500">Total Orders {(dateRange.startDate || dateRange.endDate || specificDate || selectedUser || paymentFilters.pending || paymentFilters.completed) && '(Filtered)'}</div>
          <div className="text-2xl font-semibold">{filteredAnalytics.totalOrders}</div>
        </div>
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-xs text-gray-500">Total Revenue {(dateRange.startDate || dateRange.endDate || specificDate || selectedUser || paymentFilters.pending || paymentFilters.completed) && '(Filtered)'}</div>
          <div className="text-2xl font-semibold">{formatCurrency(filteredAnalytics.totalRevenue)}</div>
        </div>
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-xs text-gray-500">Average Order {(dateRange.startDate || dateRange.endDate || specificDate || selectedUser || paymentFilters.pending || paymentFilters.completed) && '(Filtered)'}</div>
          <div className="text-2xl font-semibold">{formatCurrency(filteredAnalytics.avgOrderValue)}</div>
        </div>
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-xs text-gray-500">This Month {(dateRange.startDate || dateRange.endDate || specificDate || selectedUser || paymentFilters.pending || paymentFilters.completed) && '(Filtered)'}</div>
          <div className="text-2xl font-semibold">{formatCurrency(filteredAnalytics.thisMonthRevenue)}</div>
        </div>
      </div>

      {/* Filter Status */}
      {(dateRange.startDate || dateRange.endDate || specificDate || selectedUser || paymentFilters.pending || paymentFilters.completed) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700">
                Showing {filteredOrders.length} of {orders.length} orders
              </span>
            </div>
            <div className="text-xs text-blue-600">
              {(() => {
                const filters = [];
                if (dateRange.startDate && dateRange.endDate) {
                  filters.push(`Date: ${dateRange.startDate} to ${dateRange.endDate}`);
                } else if (specificDate) {
                  filters.push(`Date: ${specificDate}`);
                }
                if (selectedUser) {
                  const userData = JSON.parse(selectedUser);
                  filters.push(`User: ${userData.name}`);
                }
                if (paymentFilters.pending || paymentFilters.completed) {
                  const paymentFiltersList = [];
                  if (paymentFilters.pending) paymentFiltersList.push('Pending Payment');
                  if (paymentFilters.completed) paymentFiltersList.push('Completed Payment');
                  filters.push(`Payment: ${paymentFiltersList.join(', ')}`);
                }
                return filters.join(' • ');
              })()}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{(order._id || '').toString().slice(-8)}</div>
                    <div className="text-xs text-gray-500">{order.items?.length || 0} items</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.contactName || order?.customerId?.fullName || 'Unknown Customer'}</div>
                    <div className="text-xs text-gray-500">{order.contactEmail || order?.customerId?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <select
                        aria-label="Change status"
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        disabled={!isAdmin || !!savingStatus[order._id]}
                        className={`px-3 py-1 rounded-full border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-800 border-gray-300'} ${(!isAdmin || savingStatus[order._id]) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {savingStatus[order._id] && <Spinner />}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => { setSelectedOrder(order); setShowModal(true); }} className="text-blue-600 hover:text-blue-900">View</button>
                    {isAdmin && (
                      <button onClick={() => handleDelete(order._id)} className="text-red-600 hover:text-red-900">Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">Orders will appear here once customers start placing them.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Order #{(selectedOrder._id || '').toString().slice(-8)}</h3>
                <p className="text-sm text-gray-600">Placed: {formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <div className="p-4 space-y-4">
              {/* Order Status */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">Order Status</h4>
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => {
                          handleStatusUpdate(selectedOrder._id, e.target.value);
                          // Update the selectedOrder state to reflect the change immediately
                          setSelectedOrder(prev => ({ ...prev, status: e.target.value }));
                        }}
                        disabled={!!savingStatus[selectedOrder._id]}
                        className={`px-3 py-1 rounded-full border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 ${STATUS_STYLES[selectedOrder.status] || 'bg-gray-100 text-gray-800 border-gray-300'} ${(!isAdmin || savingStatus[selectedOrder._id]) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {savingStatus[selectedOrder._id] && <Spinner />}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full border text-sm font-medium ${STATUS_STYLES[selectedOrder.status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                    {selectedOrder.status || 'pending'}
                  </span>
                  {selectedOrder.status && (
                    <span className="text-sm text-gray-600">
                      {selectedOrder.status === 'pending' && '⏳ Awaiting processing'}
                      {selectedOrder.status === 'processing' && '🔄 Being prepared'}
                      {selectedOrder.status === 'shipped' && '🚚 On the way'}
                      {selectedOrder.status === 'delivered' && '✅ Delivered successfully'}
                      {selectedOrder.status === 'cancelled' && '❌ Order cancelled'}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Customer</h4>
                  <div className="text-sm text-gray-800">
                    <p><strong>Name:</strong> {selectedOrder.contactName || selectedOrder?.customerId?.fullName || 'Unknown Customer'}</p>
                    <p><strong>Email:</strong> {selectedOrder.contactEmail || selectedOrder?.customerId?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedOrder.contactPhone || 'N/A'}</p>
                    {selectedOrder.customerId && (
                      <p className="mt-1 text-green-700 text-xs">✓ Linked to customer account</p>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Payment</h4>
                  <div className="text-sm text-gray-800 space-y-1">
                    <p><strong>Method:</strong> {selectedOrder.paymentMethod || 'N/A'}</p>
                    <p><strong>Status:</strong> {selectedOrder.paymentcompleted ? 'Completed' : 'Pending'}</p>
                    <p><strong>Total:</strong> {formatCurrency(selectedOrder.total)}</p>
                    {Number(selectedOrder.refundAmount || 0) > 0 && (
                      <>
                        <p className="text-rose-700"><strong>Refund:</strong> {formatCurrency(selectedOrder.refundAmount)} ({selectedOrder.refundStatus || 'processed'}) {selectedOrder.refundTxnId ? ` • TXN ${selectedOrder.refundTxnId}` : ''}</p>
                        <a href={`${API_BASE_URL}/api/order/credit-note/${selectedOrder._id}/pdf`} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 text-sm text-blue-600 hover:underline">Download Credit Note</a>
                      </>
                    )}
                    {isAdmin && (() => {
                      const paymentMethod = (selectedOrder.paymentMethod || '').toLowerCase().replace(/\s+/g, '_');
                      const isCreditCard = paymentMethod === 'credit_card' || paymentMethod === 'creditcard';
                      const isCompleted = selectedOrder.paymentcompleted;
                      const isCancelled = selectedOrder.status === 'cancelled';
                      const hasRemainingAmount = Number(selectedOrder.refundAmount || 0) < Number(selectedOrder.total || 0);
                      
                      return isCreditCard && isCompleted && isCancelled && hasRemainingAmount;
                    })() && (
                      <button onClick={() => openRefundModal(selectedOrder)} className="mt-2 px-3 py-1 text-sm bg-rose-600 text-white rounded hover:bg-rose-700">Issue Refund</button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                <div className="text-sm text-gray-800">
                  {selectedOrder.shippingAddress ? (
                    <>
                      <p>{selectedOrder.shippingAddress?.name || 'N/A'}</p>
                      <p>{selectedOrder.shippingAddress?.street || 'N/A'}</p>
                      <p>{[
                        selectedOrder.shippingAddress?.city,
                        selectedOrder.shippingAddress?.state,
                        selectedOrder.shippingAddress?.zipCode
                      ].filter(Boolean).join(', ') || 'N/A'}</p>
                    </>
                  ) : (
                    <p>N/A</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Items ({selectedOrder.items?.length || 0})</h4>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((it, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{it.name} × {it.quantity}</span>
                      <span>{formatCurrency(it.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}
      {showRefund && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Issue Refund</h3>
              <p className="text-xs text-gray-500">Order #{(selectedOrder._id || '').toString().slice(-8)}</p>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs text-gray-600">Amount</label>
                <input type="number" min={0} step={0.01} value={refundForm.amount}
                  onChange={e => setRefundForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded" />
                <p className="text-xs text-gray-500">Max: {formatCurrency(Math.max(0, (Number(selectedOrder.total||0) - Number(selectedOrder.refundAmount||0))))}</p>
              </div>
              <div>
                <label className="text-xs text-gray-600">Refund Method</label>
                <div className="w-full mt-1 px-3 py-2 bg-gray-50 border rounded text-gray-700">
                  Credit Card (Stripe)
                </div>
                <p className="text-xs text-gray-500 mt-1">Refunds are processed automatically through Stripe</p>
              </div>
              <div>
                <label className="text-xs text-gray-600">Note</label>
                <textarea rows={3} value={refundForm.note} onChange={e => setRefundForm(f => ({ ...f, note: e.target.value }))} className="w-full mt-1 px-3 py-2 border rounded" />
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button onClick={() => setShowRefund(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Cancel</button>
              <button onClick={submitRefund} className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700">Confirm Refund</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersRemade;

