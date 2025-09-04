import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  Wrench, 
  Leaf, 
  Droplets, 
  Bug, 
  Fuel, 
  HardHat, 
  Package2, 
  ShoppingBag,
  AlertTriangle,
  Eye
} from 'lucide-react';

const UnifiedInventoryDemo = () => {
  const [allItems, setAllItems] = useState([]);

  // Get supplies from localStorage and combine with sample products
  useEffect(() => {
    // Sample products (these would come from API)
    const sampleProducts = [
      {
        _id: 'product_1',
        name: 'Fresh Tomatoes',
        type: 'product',
        category: 'vegetables',
        quantity: 150,
        unit: 'kg',
        price: 350,
        minQuantity: 20,
        maxQuantity: 200
      },
      {
        _id: 'product_2',
        name: 'Organic Lettuce',
        type: 'product',
        category: 'leafy-greens',
        quantity: 75,
        unit: 'heads',
        price: 225,
        minQuantity: 10,
        maxQuantity: 100
      }
    ];

    // Get supplies from localStorage
    const savedSupplies = localStorage.getItem('farmSupplies');
    let supplies = [];
    if (savedSupplies) {
      supplies = JSON.parse(savedSupplies).map(supply => ({
        ...supply,
        type: 'supply'
      }));
    }

    // Combine all items
    setAllItems([...sampleProducts, ...supplies]);
  }, []);

  const getCategoryIcon = (type, category) => {
    if (type === 'product') {
      return Package;
    }
    
    // Supply icons
    const iconMap = {
      tools: Wrench,
      seeds: Leaf,
      fertilizers: Droplets,
      pesticides: Bug,
      irrigation: Droplets,
      fuel: Fuel,
      safety: HardHat,
      packaging: Package2,
      feed: Package2,
    };
    return iconMap[category] || Truck;
  };

  const getItemStatus = (item) => {
    const current = item.quantity || 0;
    const minimum = item.minQuantity || 5;
    
    if (item.type === 'supply') {
      if (item.status === 'maintenance') return { color: 'purple', label: 'Maintenance' };
      if (item.expiryDate && new Date(item.expiryDate) < new Date()) return { color: 'red', label: 'Expired' };
    }
    
    if (current === 0) return { color: 'red', label: 'Out of Stock' };
    if (current <= minimum) return { color: 'orange', label: 'Low Stock' };
    return { color: 'green', label: 'In Stock' };
  };

  const getTypeLabel = (type) => {
    return type === 'product' ? 'Product' : 'Supply';
  };

  const getTypeBadgeColor = (type) => {
    return type === 'product' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🔄 Unified Inventory View</h2>
        <p className="text-gray-600 mb-6">
          This shows how your <strong>supplies</strong> (like your tractor) appear alongside <strong>products</strong> in the inventory system.
        </p>

        {allItems.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No inventory items found. Add some supplies in the Supplies tab to see them here!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allItems.map((item) => {
                  const Icon = getCategoryIcon(item.type, item.category);
                  const status = getItemStatus(item);
                  const totalValue = (item.quantity || 0) * (item.price || 0);
                  
                  return (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 mr-4">
                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <Icon className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.unit}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(item.type)}`}>
                          {getTypeLabel(item.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {item.category.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">
                          {item.quantity || 0} {item.unit}
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {item.minQuantity || 5}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">
                          LKR {(item.price || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">
                          LKR {totalValue.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          status.color === 'green' ? 'bg-green-100 text-green-800' :
                          status.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                          status.color === 'red' ? 'bg-red-100 text-red-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {allItems.filter(item => item.type === 'product').length}
            </div>
            <div className="text-sm text-gray-600">Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {allItems.filter(item => item.type === 'supply').length}
            </div>
            <div className="text-sm text-gray-600">Supplies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              LKR {allItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <Eye className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">How it works:</h3>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• <strong>Products</strong> (🔵) are items you sell (tomatoes, lettuce, etc.)</li>
                <li>• <strong>Supplies</strong> (🟢) are items you use for farming (tractors, seeds, fertilizers, etc.)</li>
                <li>• Both appear together in the inventory view for unified management</li>
                <li>• You can filter by type, category, and status</li>
                <li>• Your tractor will show up here once you add it in the Supplies section!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedInventoryDemo;
