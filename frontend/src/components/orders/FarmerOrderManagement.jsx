import React, { useEffect, useState, useMemo } from 'react';
import { ShoppingCart, Clock, CheckCircle, XCircle, Package, Eye, X, RefreshCw, Trash2 } from 'lucide-react';
import { orderAPI as api } from '../../services/orderAPI.js';

const StatusPill = ({ status }) => {
  const config = {
    pending: { cls: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
    processing: { cls: 'bg-blue-100 text-blue-800', icon: Package, label: 'Processing' },
    shipped: { cls: 'bg-purple-100 text-purple-800', icon: Package, label: 'Shipped' },
    delivered: { cls: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Delivered' },
    cancelled: { cls: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
  };
  const c = config[status] || config.pending;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${c.cls}`}>
      <Icon className="h-4 w-4 mr-1" />
      {c.label}
    </span>
  );
};

const FarmerOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayOrders: 0,
    averageOrderValue: 0,
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getMyOrders();
      if (!res.success) throw new Error(res.error || 'Failed to load orders');
      const normalized = (res.data || []).map(o => ({
        _id: o._id || o.id || o.orderId,
        createdAt: o.createdAt || o.orderDate || new Date().toISOString(),
        total: Number(o.total ?? o.totalAmount ?? o.amount ?? 0),
        status: o.status || 'pending',
        items: Array.isArray(o.items) ? o.items : [],
        paymentMethod: o.paymentMethod || 'N/A',
      }));
      setOrders(normalized);
      // Calculate analytics similar to admin
      const displayedOrders = normalized.length;
      const totalSpent = normalized.reduce((sum, o) => sum + (o.total || 0), 0);
      const pendingOrders = normalized.filter(o => o.status === 'pending').length;
      const completedOrders = normalized.filter(o => o.status === 'delivered').length;
      const averageOrderValue = displayedOrders > 0 ? totalSpent / displayedOrders : 0;
      const today = new Date().toDateString();
      const todayOrders = normalized.filter(o => new Date(o.createdAt).toDateString() === today).length;
      setAnalytics({ totalOrders: displayedOrders, totalSpent, pendingOrders, completedOrders, todayOrders, averageOrderValue });
    } catch (e) {
      console.error('FarmerOrderManagement: fetch error', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = useMemo(() => {
    let list = orders.filter(o => {
      const matchSearch = !search || (o._id || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
    if (dateFilter !== 'all') {
      const now = new Date();
      let filterDate = null;
      switch (dateFilter) {
        case 'today':
          filterDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          filterDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          filterDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          filterDate = null;
      }
      if (filterDate) {
        list = list.filter(o => new Date(o.createdAt) >= filterDate);
      }
    }
    return list;
  }, [orders, search, statusFilter, dateFilter]);

  const onCancel = async (orderId, currentStatus) => {
    if (!['pending', 'processing'].includes(currentStatus)) return;
    if (!window.confirm('Cancel this order?')) return;
    try {
      const res = await api.cancelOrder(orderId);
      if (res.success) {
        setOrders(prev => prev.map(o => (o._id === orderId ? { ...o, status: 'cancelled' } : o)));
        alert('Order cancelled');
      } else {
        alert(res.error || 'Failed to cancel order');
      }
    } catch (e) {
      alert(e.message || 'Failed to cancel order');
    }
  };

  const onDelete = async (orderId, status) => {
    if (!['pending', 'cancelled'].includes(status)) {
      alert('Only pending or cancelled orders can be deleted.');
      return;
    }
    if (!window.confirm('Delete this order? This action cannot be undone.')) return;
    try {
      const res = await api.deleteOrder(orderId);
      if (res.success) {
        setOrders(prev => prev.filter(o => o._id !== orderId));
        alert('Order deleted');
      } else {
        alert(res.error || 'Failed to delete order');
      }
    } catch (e) {
      alert(e.message || 'Failed to delete order');
    }
  };

  const formatCurrency = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n) || 0);
  const formatDate = (d) => new Date(d).toLocaleString();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded"><ShoppingCart className="h-5 w-5 text-green-700" /></div>
          <h2 className="text-xl font-semibold text-gray-800">Order Management</h2>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID"
            className="border rounded px-3 py-2 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
          </select>
          <button onClick={fetchOrders} className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded">
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </button>
        </div>
      </div>

      {/* Analytics summary (similar in spirit to admin) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded">
          <div className="text-xs text-gray-500">Total Orders</div>
          <div className="text-xl font-semibold">{analytics.totalOrders}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <div className="text-xs text-gray-500">Total Spent</div>
          <div className="text-xl font-semibold">{formatCurrency(analytics.totalSpent)}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <div className="text-xs text-gray-500">Pending</div>
          <div className="text-xl font-semibold">{analytics.pendingOrders}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <div className="text-xs text-gray-500">Avg. Order</div>
          <div className="text-xl font-semibold">{formatCurrency(analytics.averageOrderValue)}</div>
        </div>
      </div>

      {loading && (
        <div className="py-12 text-center text-gray-500">Loading orders...</div>
      )}
      {error && !loading && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700">{error}</div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="py-12 text-center text-gray-500">No orders found.</div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{(o._id || '').slice(0, 8)}...</td>
                  <td className="py-3 px-4 text-sm">{formatDate(o.createdAt)}</td>
                  <td className="py-3 px-4 font-medium">{formatCurrency(o.total)}</td>
                  <td className="py-3 px-4"><StatusPill status={o.status} /></td>
                  <td className="py-3 px-4 text-sm">{o.items?.length || 0}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSelectedOrder(o); setShowOrderModal(true); }}
                        className="inline-flex items-center px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                        title="View"
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </button>
                      {['pending', 'processing'].includes(o.status) && (
                        <button
                          onClick={() => onCancel(o._id, o.status)}
                          className="inline-flex items-center px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-800 rounded"
                          title="Cancel"
                        >
                          <X className="h-4 w-4 mr-1" /> Cancel
                        </button>
                      )}
                      {['pending', 'cancelled'].includes(o.status) && (
                        <button
                          onClick={() => onDelete(o._id, o.status)}
                          className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order details modal (simple) */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Order {(selectedOrder._id || '').slice(0, 8)}...</h3>
              <button onClick={() => setShowOrderModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500">Date</div>
                <div className="text-sm">{formatDate(selectedOrder.createdAt)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Total</div>
                <div className="text-sm font-medium">{formatCurrency(selectedOrder.total)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div><StatusPill status={selectedOrder.status} /></div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Items</div>
                <div className="text-sm">{selectedOrder.items?.length || 0}</div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Items</div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(selectedOrder.items || []).map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="truncate mr-2">{it.name || it.title || it.productName || `Item ${idx+1}`}</div>
                    <div className="text-gray-600">x{it.quantity || 1}</div>
                    <div className="font-medium">{formatCurrency(it.price || it.total || 0)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerOrderManagement;
