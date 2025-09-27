import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/env.js';

const OrdersRemade = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
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

      return {
        ...order,
        _id: normalizedId,
        contactName: safeContactName,
        contactEmail: safeContactEmail,
        contactPhone: order?.contactPhone || order?.shippingAddress?.phone || 'N/A',
        total: Number(order?.total ?? order?.totalAmount ?? order?.amount ?? 0),
        status: order?.status || 'pending',
        createdAt: order?.createdAt || order?.updatedAt || new Date().toISOString(),
        items: Array.isArray(order?.items) ? order.items : [],
        paymentcompleted: (order?.paymentcompleted ?? order?.paymentCompleted) || false,
        paymentMethod: order?.paymentMethod || 'N/A',
        shippingAddress: order?.shippingAddress || {},
      };
    });


  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = getAuthHeaders();

      // Try multiple endpoints, then fall back to a sample/debug endpoint so the UI stays responsive
      const endpoints = [
        `${API_BASE_URL}/api/order/admin-orders`,
        `${API_BASE_URL}/api/order/admin/dashboard`,
        `${API_BASE_URL}/api/order`,
        `${API_BASE_URL}/orders`,
        `${API_BASE_URL}/api/order/debug/all`
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
            // debug/dashboard style
            ordersData = res.data.data.sampleOrders || res.data.data.orders || [];
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
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const headers = getAuthHeaders();
      const endpoints = [
        `${API_BASE_URL}/api/order/admin/status/${orderId}`,
        `${API_BASE_URL}/api/order/status/${orderId}`
      ];

      let success = false;
      for (const endpoint of endpoints) {
        try {
          await axios.put(endpoint, { status: newStatus }, { headers });
          success = true;
          break;
        } catch {}
      }

      // Local fallback: update UI state regardless of server response
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      if (!success) alert('Updated locally.');
    } catch (e) {
      console.error(e);
    }
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
      for (const endpoint of endpoints) {
        try {
          await axios.delete(endpoint, { headers });
          success = true;
          break;
        } catch {}
      }
      setOrders(prev => prev.filter(o => o._id !== orderId));
      if (!success) alert('Deleted locally.');
    } catch (e) {
      console.error(e);
      setOrders(prev => prev.filter(o => o._id !== orderId));
      alert('Deleted locally despite error.');
    }
  };



  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  const formatDate = (ds) => new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-gray-600 mt-1 text-sm">View orders, change status, and delete orders</p>
          {error && <p className="text-yellow-700 mt-1 text-sm">{error}</p>}
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={fetchOrders} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Refresh</button>
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
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded"
                    >
                      {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => { setSelectedOrder(order); setShowModal(true); }} className="text-blue-600 hover:text-blue-900">View</button>
                    <button onClick={() => handleDelete(order._id)} className="text-red-600 hover:text-red-900">Delete</button>
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
                  <div className="text-sm text-gray-800">
                    <p><strong>Method:</strong> {selectedOrder.paymentMethod || 'N/A'}</p>
                    <p><strong>Status:</strong> {selectedOrder.paymentcompleted ? 'Completed' : 'Pending'}</p>
                    <p><strong>Total:</strong> {formatCurrency(selectedOrder.total)}</p>
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

              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Raw Order JSON</h4>
                <pre className="text-xs bg-white border border-gray-200 rounded p-2 overflow-x-auto">{JSON.stringify(selectedOrder, null, 2)}</pre>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersRemade;
