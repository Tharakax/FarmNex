import React from 'react';
import { Package, Grid, List } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductList = ({ 
  products, 
  loading, 
  onEdit, 
  onDelete, 
  onView, 
  viewMode = 'grid',
  onViewModeChange 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">Start by adding your first product to the catalog.</p>
      </div>
    );
  }

  return (
    <div>
      {/* View Mode Toggle */}
      {onViewModeChange && (
        <div className="flex items-center justify-end mb-4">
          <div className="flex bg-white rounded-lg shadow-sm border">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-l-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-green-100 text-green-600 border-r border-green-200'
                  : 'text-gray-500 hover:text-gray-700 border-r border-gray-200'
              }`}
              title="Grid View"
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-r-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-green-100 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="List View"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Products Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map(product => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className="flex">
                {/* Product Image */}
                <div className="w-32 h-32 flex-shrink-0">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop';
                    }}
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        {product.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Uncategorized'}
                        {product.isFeatured && (
                          <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                            Featured
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Price and Stock */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <span className="font-semibold text-lg text-gray-900">
                            LKR {product.displayprice || product.price}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">/{product.unit}</span>
                          {product.displayprice && product.displayprice !== product.price && (
                            <span className="text-sm text-gray-400 line-through ml-2">
                              LKR {product.price}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          Stock: {product.stock?.current || 0} {product.unit}
                        </div>

                        {/* Stock Status */}
                        <div>
                          {(() => {
                            const current = product.stock?.current || 0;
                            const minimum = product.stock?.minimum || 5;
                            
                            if (current === 0) {
                              return (
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                                  Out of Stock
                                </span>
                              );
                            } else if (current <= minimum) {
                              return (
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                                  Low Stock
                                </span>
                              );
                            } else {
                              return (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                  In Stock
                                </span>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => onView?.(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Package className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit?.(product)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Edit Product"
                      >
                        <Grid className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
