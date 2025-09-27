import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/env.js';
import ExportSplitButton from '../../features/reports/ExportSplitButton.jsx';
import { PieChart, Pie, Cell, ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend, Line } from 'recharts';
import { formatCurrency, formatCompactLKR } from '../../utils/currencyUtils.js';

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


  const handleGenerate = async (format) => {
    if (!Array.isArray(orders) || orders.length === 0) {
      alert('No orders to export yet.');
      return;
    }
    const sales = orders.map(o => ({
      customer: { name: o.contactName },
      createdAt: o.createdAt,
      items: Array.isArray(o.items) ? o.items : [],
      totalAmount: Number(o.total) || 0,
      paymentMethod: o.paymentMethod,
      status: o.status
    }));
    const period = 'Current View';
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

  // Derived chart data (hooks must stay before any conditional returns)
  const statusData = useMemo(() => {
    const s = analytics.byStatus || {};
    return [
      { name: 'pending', value: s.pending || 0 },
      { name: 'processing', value: s.processing || 0 },
      { name: 'shipped', value: s.shipped || 0 },
      { name: 'delivered', value: s.delivered || 0 },
      { name: 'cancelled', value: s.cancelled || 0 },
    ];
  }, [analytics]);

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

  const revenueSeries = useMemo(() => {
    const map = new Map();
    (orders || []).forEach(o => {
      const key = new Date(o.createdAt).toISOString().split('T')[0];
      const amt = (Number(o.total) - Number(o.refundAmount || 0)) || 0;
      const delivered = (o.status || '').toLowerCase() === 'delivered' ? amt : 0;
      const prev = map.get(key) || { total: 0, delivered: 0 };
      map.set(key, { total: prev.total + amt, delivered: prev.delivered + delivered });
    });
    const arr = Array.from(map.entries()).map(([date, vals]) => ({ date, ...vals }));
    arr.sort((a, b) => new Date(a.date) - new Date(b.date));
    // cumulative
    let cum = 0;
    arr.forEach(p => { cum += p.total; p.cumTotal = cum; });
    return arr;
  }, [orders]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const STATUS_COLORS = {
    pending: '#FCD34D',
    processing: '#60A5FA',
    shipped: '#A78BFA',
    delivered: '#34D399',
    cancelled: '#F87171',
  };

  // Refund modal handlers

  const openRefundModal = (order) => {
    // Check if order is eligible for refund (credit card only)
    if (order.paymentMethod !== 'Credit card') {
      alert('Refunds are only available for credit card payments processed through Stripe.');
      return;
    }
    
    const remaining = Math.max(0, Number(order.total || 0) - Number(order.refundAmount || 0));
    setRefundForm({ amount: remaining, note: '' });
    setShowRefund(true);
  };

  const submitRefund = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await axios.post(`${API_BASE_URL}/api/order/refund/${selectedOrder._id}`, {
        amount: Number(refundForm.amount),
        note: refundForm.note
      }, { headers });
      const updated = res.data?.order;
      if (updated) {
        const normalized = normalizeOrders([updated])[0];
        setOrders(prev => prev.map(o => o._id === updated._id ? normalized : o));
        setSelectedOrder(normalized);
        // One-click open credit note after refund
        const url = `${API_BASE_URL}/api/order/credit-note/${normalized._id}/pdf`;
        // Opening in a new tab; popup blockers usually allow user-initiated actions
        window.open(url, '_blank');
      }
      setShowRefund(false);
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Refund failed');
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
        <div className="flex items-center space-x-3">
          <ExportSplitButton onGenerate={handleGenerate} />
          <button onClick={fetchOrders} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Refresh</button>
        </div>
      </div>

      {/* Analytics summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-xs text-gray-500">Total Orders</div>
          <div className="text-2xl font-semibold">{analytics.totalOrders}</div>
        </div>
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-xs text-gray-500">Total Revenue</div>
          <div className="text-2xl font-semibold">{formatCurrency(analytics.totalRevenue)}</div>
        </div>
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-xs text-gray-500">Average Order</div>
          <div className="text-2xl font-semibold">{formatCurrency(analytics.avgOrderValue)}</div>
        </div>
        <div className="p-4 bg-white rounded-lg border">
          <div className="text-xs text-gray-500">This Month</div>
          <div className="text-2xl font-semibold">{formatCurrency(analytics.thisMonthRevenue)}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Status Distribution</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Legend verticalAlign="top" height={24} />
                <RTooltip formatter={(value, name) => [value, name]} />
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#999'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Revenue Over Time</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={v => formatCompactLKR(v)} width={80} />
                <RTooltip formatter={(v, name) => [formatCurrency(v), name]} labelFormatter={d => `Date: ${d}`} />
                <Area type="monotone" name="Total" dataKey="total" stroke="#10B981" fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" name="Delivered" dataKey="delivered" stroke="#3B82F6" fillOpacity={1} fill="url(#colorDel)" />
                <Line type="monotone" name="Cumulative" dataKey="cumTotal" stroke="#065F46" dot={false} strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

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
              {orders.map(order => (
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
                    {isAdmin && selectedOrder.paymentcompleted && selectedOrder.status === 'cancelled' && ((Number(selectedOrder.refundAmount||0) < Number(selectedOrder.total||0))) && (
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

