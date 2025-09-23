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

export const orderAPI = {
  // Get current user's orders
  getMyOrders: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/order/my-orders`, {
        method: 'GET',
        headers: createHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      return {
        success: true,
        data: data.orders || data
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  },

  // Create a new order
  createOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/order`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/order/${orderId}`, {
        method: 'GET',
        headers: createHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Calculate user dashboard statistics from orders
  getDashboardStats: async () => {
    try {
      const ordersResult = await orderAPI.getMyOrders();
      
      if (!ordersResult.success) {
        return {
          success: false,
          error: ordersResult.error,
          stats: {
            totalOrders: 0,
            thisMonthSpending: 0,
            recentOrders: []
          }
        };
      }

      const orders = ordersResult.data || [];
      
      // Calculate total orders
      const totalOrders = orders.length;

      // Calculate this month's spending
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const thisMonthSpending = orders
        .filter(order => {
          const orderDate = new Date(order.createdAt || order.orderDate);
          return orderDate.getMonth() === currentMonth && 
                 orderDate.getFullYear() === currentYear;
        })
        .reduce((total, order) => total + (parseFloat(order.totalAmount) || 0), 0);

      // Get recent orders (last 5, sorted by date)
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate))
        .slice(0, 5)
        .map(order => ({
          id: order._id || order.orderId,
          date: new Date(order.createdAt || order.orderDate).toISOString().split('T')[0],
          total: parseFloat(order.totalAmount) || 0,
          status: order.status || 'Processing',
          items: order.items?.length || 0
        }));

      return {
        success: true,
        stats: {
          totalOrders,
          thisMonthSpending,
          recentOrders
        }
      };
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
      return {
        success: false,
        error: error.message,
        stats: {
          totalOrders: 0,
          thisMonthSpending: 0,
          recentOrders: []
        }
      };
    }
  }
};

export default orderAPI;