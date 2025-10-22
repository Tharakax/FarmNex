import { getLoggedInUser } from '../utils/userUtils';

const API_BASE_URL = 'http://localhost:3000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create headers with auth token
const createHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper: transform orders to payment-history shape
const ordersToPayments = (orders = []) => {
  return (orders || [])
    .filter((o) => o.paymentcompleted === true)
    .map((o) => ({
      id: o._id,
      orderId: o._id,
      date: o.createdAt,
      amount: typeof o.total === 'number' ? o.total : parseFloat(o.total || 0),
      paymentMethod: o.paymentMethod || 'credit_card',
      status: o.status || 'processing',
      items: o.items || [],
      transactionId: `txn_${String(o._id).slice(-8)}`,
      description: `Payment for order ${String(o._id).slice(-8)}`,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const paymentAPI = {
  // Get payment history (completed payments from orders)
  getPaymentHistory: async () => {
    const token = getAuthToken();
    // 1) Try authenticated endpoint first
    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/order/my-orders`, {
          method: 'GET',
          headers: createHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            return { success: true, data: ordersToPayments(data.orders || []) };
          }
        }
      } catch (e) {
        console.warn('Falling back to test payment history due to auth endpoint error:', e?.message);
      }
    }

    // 2) Fallback to test endpoint using logged-in user’s email, then default test email
    try {
      const user = getLoggedInUser();
      let email = (user && user.email) ? user.email : '';
      if (!email) {
        try {
          const cached = localStorage.getItem('orderData');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed?.contactEmail) email = parsed.contactEmail;
          }
        } catch {}
      }
      if (!email) email = 'test@farmnex.com';

      const response = await fetch(`${API_BASE_URL}/order/test-payment-history/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch payment history');
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to fetch payment history');
      return { success: true, data: data.orders || [] };
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get user's payment methods
  getPaymentMethods: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payment/methods`, {
        method: 'GET',
        headers: createHeaders(),
      });

      if (!response.ok) {
        // If endpoint doesn't exist, return mock data for now
        if (response.status === 404) {
          return {
            success: true,
            data: []
          };
        }
        throw new Error('Failed to fetch payment methods');
      }

      const data = await response.json();
      return {
        success: true,
        data: data.paymentMethods || data || []
      };
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  },

  // Get payment statistics
  getPaymentStats: async () => {
    try {
      const paymentHistoryResult = await paymentAPI.getPaymentHistory();
      
      if (!paymentHistoryResult.success) {
        return {
          success: false,
          error: paymentHistoryResult.error,
          stats: {
            totalPayments: 0,
            totalAmount: 0,
            thisMonthAmount: 0,
            averagePayment: 0,
            paymentMethodBreakdown: {},
            recentPayments: []
          }
        };
      }

      const payments = paymentHistoryResult.data || [];
      
      // Calculate total payments and amount
      const totalPayments = payments.length;
      const totalAmount = payments.reduce((total, payment) => total + (parseFloat(payment.amount) || 0), 0);
      
      // Calculate this month's payments
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const thisMonthAmount = payments
        .filter(payment => {
          const paymentDate = new Date(payment.date);
          return paymentDate.getMonth() === currentMonth && 
                 paymentDate.getFullYear() === currentYear;
        })
        .reduce((total, payment) => total + (parseFloat(payment.amount) || 0), 0);

      // Calculate average payment
      const averagePayment = totalPayments > 0 ? totalAmount / totalPayments : 0;

      // Calculate payment method breakdown
      const paymentMethodBreakdown = payments.reduce((breakdown, payment) => {
        const method = payment.paymentMethod || 'Unknown';
        breakdown[method] = (breakdown[method] || 0) + (parseFloat(payment.amount) || 0);
        return breakdown;
      }, {});

      return {
        success: true,
        stats: {
          totalPayments,
          totalAmount,
          thisMonthAmount,
          averagePayment,
          paymentMethodBreakdown,
          recentPayments: payments.slice(0, 5)
        }
      };
    } catch (error) {
      console.error('Error calculating payment stats:', error);
      return {
        success: false,
        error: error.message,
        stats: {
          totalPayments: 0,
          totalAmount: 0,
          thisMonthAmount: 0,
          averagePayment: 0,
          paymentMethodBreakdown: {},
          recentPayments: []
        }
      };
    }
  }
};

export default paymentAPI;