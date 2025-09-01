import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Unified Inventory API service functions
export const inventoryAPI = {
  // Get all inventory items (products + supplies)
  getAllInventoryItems: async () => {
    try {
      const [productsResponse, suppliesResponse] = await Promise.all([
        api.get('/api/product'),
        api.get('/api/supplies') // This would be the supplies endpoint
      ]);
      
      const products = productsResponse.data.map(item => ({
        ...item,
        type: 'product',
        quantity: item.stock?.current || 0,
        minQuantity: item.stock?.minimum || 5,
        maxQuantity: item.stock?.maximum || 100,
        category: item.category,
        unitPrice: item.price
      }));

      // For now, we'll use mock data for supplies since the API might not exist yet
      const supplies = [
        {
          _id: 'supply_1',
          name: 'Organic Tomato Seeds',
          type: 'supply',
          category: 'seeds',
          quantity: 50,
          unit: 'packets',
          minQuantity: 10,
          maxQuantity: 100,
          unitPrice: 15.99,
          supplier: 'Green Seeds Co.',
          purchaseDate: '2024-08-01',
          expiryDate: '2025-08-01',
          location: 'Storage Room A',
          status: 'in-stock',
          lastUsed: '2024-08-15',
          notes: 'Premium organic seeds for greenhouse cultivation'
        },
        {
          _id: 'supply_2',
          name: 'NPK Fertilizer 10-10-10',
          type: 'supply',
          category: 'fertilizers',
          quantity: 5,
          unit: 'bags (50kg)',
          minQuantity: 10,
          maxQuantity: 50,
          unitPrice: 45.00,
          supplier: 'Farm Supply Inc.',
          purchaseDate: '2024-07-15',
          expiryDate: '2026-07-15',
          location: 'Fertilizer Shed',
          status: 'low-stock',
          lastUsed: '2024-08-20',
          notes: 'General purpose fertilizer for vegetable crops'
        },
        {
          _id: 'supply_3',
          name: 'Garden Hoe',
          type: 'supply',
          category: 'tools',
          quantity: 3,
          unit: 'pieces',
          minQuantity: 2,
          maxQuantity: 5,
          unitPrice: 35.00,
          supplier: 'ToolMaster',
          purchaseDate: '2024-05-15',
          expiryDate: null,
          location: 'Tool Storage',
          status: 'maintenance',
          lastUsed: '2024-08-25',
          notes: 'Handle needs replacement on one hoe'
        }
      ];

      return {
        success: true,
        data: {
          products,
          supplies,
          all: [...products, ...supplies]
        },
      };
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch inventory',
      };
    }
  },

  // Get products only
  getProducts: async () => {
    try {
      const response = await api.get('/api/product');
      const products = response.data.map(item => ({
        ...item,
        type: 'product',
        quantity: item.stock?.current || 0,
        minQuantity: item.stock?.minimum || 5,
        maxQuantity: item.stock?.maximum || 100,
        unitPrice: item.price
      }));

      return {
        success: true,
        data: products,
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch products',
      };
    }
  },

  // Get supplies only
  getSupplies: async () => {
    try {
      // Mock supplies data for now - replace with actual API call when available
      const supplies = [
        {
          _id: 'supply_1',
          name: 'Organic Tomato Seeds',
          type: 'supply',
          category: 'seeds',
          quantity: 50,
          unit: 'packets',
          minQuantity: 10,
          maxQuantity: 100,
          unitPrice: 15.99,
          supplier: 'Green Seeds Co.',
          purchaseDate: '2024-08-01',
          expiryDate: '2025-08-01',
          location: 'Storage Room A',
          status: 'in-stock',
          lastUsed: '2024-08-15',
          notes: 'Premium organic seeds for greenhouse cultivation'
        },
        {
          _id: 'supply_2',
          name: 'NPK Fertilizer 10-10-10',
          type: 'supply',
          category: 'fertilizers',
          quantity: 5,
          unit: 'bags (50kg)',
          minQuantity: 10,
          maxQuantity: 50,
          unitPrice: 45.00,
          supplier: 'Farm Supply Inc.',
          purchaseDate: '2024-07-15',
          expiryDate: '2026-07-15',
          location: 'Fertilizer Shed',
          status: 'low-stock',
          lastUsed: '2024-08-20',
          notes: 'General purpose fertilizer for vegetable crops'
        },
        {
          _id: 'supply_3',
          name: 'Irrigation Drip Tape',
          type: 'supply',
          category: 'irrigation',
          quantity: 200,
          unit: 'meters',
          minQuantity: 50,
          maxQuantity: 500,
          unitPrice: 1.25,
          supplier: 'IrrigationPro',
          purchaseDate: '2024-06-01',
          expiryDate: null,
          location: 'Tool Shed',
          status: 'in-stock',
          lastUsed: '2024-08-10',
          notes: 'High-quality drip irrigation tape for efficient watering'
        },
        {
          _id: 'supply_4',
          name: 'Garden Hoe',
          type: 'supply',
          category: 'tools',
          quantity: 3,
          unit: 'pieces',
          minQuantity: 2,
          maxQuantity: 5,
          unitPrice: 35.00,
          supplier: 'ToolMaster',
          purchaseDate: '2024-05-15',
          expiryDate: null,
          location: 'Tool Storage',
          status: 'maintenance',
          lastUsed: '2024-08-25',
          notes: 'Handle needs replacement on one hoe'
        },
        {
          _id: 'supply_5',
          name: 'Organic Pesticide Spray',
          type: 'supply',
          category: 'pesticides',
          quantity: 0,
          unit: 'bottles (1L)',
          minQuantity: 5,
          maxQuantity: 20,
          unitPrice: 28.50,
          supplier: 'EcoFarm Solutions',
          purchaseDate: '2024-07-01',
          expiryDate: '2025-07-01',
          location: 'Chemical Storage',
          status: 'out-of-stock',
          lastUsed: '2024-08-20',
          notes: 'Natural pesticide for organic farming'
        },
        {
          _id: 'supply_6',
          name: 'Diesel Fuel',
          type: 'supply',
          category: 'fuel',
          quantity: 150,
          unit: 'liters',
          minQuantity: 100,
          maxQuantity: 500,
          unitPrice: 1.45,
          supplier: 'FuelStation',
          purchaseDate: '2024-08-20',
          expiryDate: null,
          location: 'Fuel Tank',
          status: 'in-stock',
          lastUsed: '2024-08-26',
          notes: 'For tractors and farm equipment'
        }
      ];

      return {
        success: true,
        data: supplies,
      };
    } catch (error) {
      console.error('Error fetching supplies:', error);
      return {
        success: false,
        error: 'Failed to fetch supplies',
      };
    }
  },

  // Create new supply
  createSupply: async (supplyData) => {
    try {
      // In a real app, this would be: const response = await api.post('/api/supplies', supplyData);
      // For now, simulate the creation
      const newSupply = {
        _id: `supply_${Date.now()}`,
        ...supplyData,
        type: 'supply',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: newSupply,
      };
    } catch (error) {
      console.error('Error creating supply:', error);
      return {
        success: false,
        error: 'Failed to create supply',
      };
    }
  },

  // Update supply
  updateSupply: async (id, supplyData) => {
    try {
      // In a real app, this would be: const response = await api.put(`/api/supplies/${id}`, supplyData);
      const updatedSupply = {
        _id: id,
        ...supplyData,
        type: 'supply',
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: updatedSupply,
      };
    } catch (error) {
      console.error('Error updating supply:', error);
      return {
        success: false,
        error: 'Failed to update supply',
      };
    }
  },

  // Delete supply
  deleteSupply: async (id) => {
    try {
      // In a real app, this would be: const response = await api.delete(`/api/supplies/${id}`);
      return {
        success: true,
        data: { message: 'Supply deleted successfully' },
      };
    } catch (error) {
      console.error('Error deleting supply:', error);
      return {
        success: false,
        error: 'Failed to delete supply',
      };
    }
  },

  // Update inventory quantity (works for both products and supplies)
  updateInventoryQuantity: async (id, type, newQuantity) => {
    try {
      if (type === 'product') {
        // Update product stock
        const response = await api.put(`/api/product/${id}`, {
          'stock.current': newQuantity
        });
        return {
          success: true,
          data: response.data,
        };
      } else {
        // Update supply quantity
        const response = await api.put(`/api/supplies/${id}`, {
          quantity: newQuantity
        });
        return {
          success: true,
          data: response.data,
        };
      }
    } catch (error) {
      console.error('Error updating inventory quantity:', error);
      return {
        success: false,
        error: 'Failed to update inventory quantity',
      };
    }
  },

  // Get low stock items (both products and supplies)
  getLowStockItems: async () => {
    try {
      const result = await inventoryAPI.getAllInventoryItems();
      if (result.success) {
        const lowStockItems = result.data.all.filter(item => {
          const current = item.quantity || 0;
          const minimum = item.minQuantity || 5;
          return current <= minimum;
        });

        return {
          success: true,
          data: lowStockItems,
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      return {
        success: false,
        error: 'Failed to fetch low stock items',
      };
    }
  },

  // Get inventory statistics
  getInventoryStats: async () => {
    try {
      const result = await inventoryAPI.getAllInventoryItems();
      if (result.success) {
        const { products, supplies, all } = result.data;

        const stats = {
          total: {
            items: all.length,
            value: all.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0),
            products: products.length,
            supplies: supplies.length,
          },
          products: {
            total: products.length,
            value: products.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0),
            lowStock: products.filter(item => item.quantity <= item.minQuantity && item.quantity > 0).length,
            outOfStock: products.filter(item => item.quantity === 0).length,
          },
          supplies: {
            total: supplies.length,
            value: supplies.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0),
            lowStock: supplies.filter(item => item.quantity <= item.minQuantity && item.quantity > 0).length,
            outOfStock: supplies.filter(item => item.quantity === 0).length,
            maintenance: supplies.filter(item => item.status === 'maintenance').length,
            expired: supplies.filter(item => 
              item.expiryDate && new Date(item.expiryDate) < new Date()
            ).length,
          },
          alerts: {
            lowStock: all.filter(item => item.quantity <= item.minQuantity && item.quantity > 0).length,
            outOfStock: all.filter(item => item.quantity === 0).length,
            maintenance: supplies.filter(item => item.status === 'maintenance').length,
            expired: supplies.filter(item => 
              item.expiryDate && new Date(item.expiryDate) < new Date()
            ).length,
          }
        };

        return {
          success: true,
          data: stats,
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      return {
        success: false,
        error: 'Failed to fetch inventory statistics',
      };
    }
  },

  // Create inventory usage record
  recordUsage: async (itemId, type, quantityUsed, purpose) => {
    try {
      const usageRecord = {
        itemId,
        type,
        quantityUsed,
        purpose,
        date: new Date().toISOString(),
        userId: 'current-user-id', // Get from auth context
      };

      // In a real app: const response = await api.post('/api/inventory/usage', usageRecord);
      
      return {
        success: true,
        data: usageRecord,
      };
    } catch (error) {
      console.error('Error recording usage:', error);
      return {
        success: false,
        error: 'Failed to record usage',
      };
    }
  },

  // Get usage history
  getUsageHistory: async (itemId = null, days = 30) => {
    try {
      const endpoint = itemId 
        ? `/api/inventory/usage/${itemId}?days=${days}`
        : `/api/inventory/usage?days=${days}`;
      
      // In a real app: const response = await api.get(endpoint);
      
      // Mock usage history
      const mockHistory = [
        {
          _id: '1',
          itemId: 'supply_2',
          itemName: 'NPK Fertilizer 10-10-10',
          type: 'supply',
          quantityUsed: 2,
          purpose: 'Fertilizing tomato field',
          date: '2024-08-20T10:30:00Z',
          user: 'John Smith'
        },
        {
          _id: '2',
          itemId: 'product_1',
          itemName: 'Tomatoes',
          type: 'product',
          quantityUsed: 50,
          purpose: 'Sale to customer',
          date: '2024-08-19T14:15:00Z',
          user: 'John Smith'
        }
      ];

      return {
        success: true,
        data: mockHistory,
      };
    } catch (error) {
      console.error('Error fetching usage history:', error);
      return {
        success: false,
        error: 'Failed to fetch usage history',
      };
    }
  },

  // Bulk update inventory levels
  bulkUpdateInventory: async (updates) => {
    try {
      // updates is an array of { id, type, quantity, action }
      const promises = updates.map(update => {
        if (update.type === 'product') {
          return api.put(`/api/product/${update.id}`, {
            'stock.current': update.quantity
          });
        } else {
          return api.put(`/api/supplies/${update.id}`, {
            quantity: update.quantity
          });
        }
      });

      await Promise.all(promises);

      return {
        success: true,
        data: { message: 'Bulk update completed successfully' },
      };
    } catch (error) {
      console.error('Error bulk updating inventory:', error);
      return {
        success: false,
        error: 'Failed to update inventory items',
      };
    }
  },

  // Create restock order
  createRestockOrder: async (items) => {
    try {
      const order = {
        _id: `order_${Date.now()}`,
        items,
        status: 'pending',
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        totalValue: items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      };

      // In a real app: const response = await api.post('/api/inventory/restock-order', order);

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      console.error('Error creating restock order:', error);
      return {
        success: false,
        error: 'Failed to create restock order',
      };
    }
  }
};

export default inventoryAPI;
