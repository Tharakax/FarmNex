import React, { useState } from 'react';
import { 
  Edit2, 
  Trash2, 
  Star, 
  Package, 
  DollarSign, 
  AlertTriangle,
  Eye,
  Tag,
  Calendar,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI } from '../../services/productAPI';
import { showDeleteConfirm } from '../../utils/sweetAlert';

const ProductCard = ({ product, onEdit, onDelete, onView, isPublicView = false }) => {
  const [loading, setLoading] = useState(false);
  
  const handleDelete = async () => {
    const result = await showDeleteConfirm(product.name);
    
    if (!result.isConfirmed) {
      return;
    }

    setLoading(true);
    try {
      const deleteResult = await productAPI.deleteProduct(product._id);
      if (deleteResult.success) {
        toast.success('Product deleted successfully!');
        onDelete?.(product._id);
      } else {
        toast.error(deleteResult.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = () => {
    const current = product.stock?.current || 0;
    const minimum = product.stock?.minimum || 5;
    
    if (current === 0) return { status: 'out', color: 'bg-red-100 text-red-800', text: 'Out of Stock' };
    if (current <= minimum) return { status: 'low', color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' };
    return { status: 'good', color: 'bg-green-100 text-green-800', text: 'In Stock' };
  };

  const stockStatus = getStockStatus();
  const defaultImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop';
  const productImage = product.images && product.images.length > 0 ? product.images[0] : defaultImage;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200">
        <img 
          src={productImage} 
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
        
        {/* Featured Badge */}
        {product.isFeatured && (
          <div className="absolute top-2 left-2">
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-2 right-2">
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {product.discount}% OFF
            </span>
          </div>
        )}

        {/* Stock Status */}
        <div className="absolute bottom-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
            {stockStatus.text}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">
            {product.name}
          </h3>
          {!isPublicView && (
            <div className="flex space-x-1">
              <button
                onClick={() => onView?.(product)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEdit?.(product)}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Edit Product"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                title="Delete Product"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Category */}
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Tag className="h-3 w-3 mr-1" />
          {product.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Uncategorized'}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Price and Stock Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
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
          
          {!isPublicView && (
            <div className="flex items-center text-sm text-gray-500">
              <Package className="h-4 w-4 mr-1" />
              <span>{product.stock?.current || 0} {product.unit}</span>
            </div>
          )}
        </div>

        {/* Stock Warning - Modified for public view */}
        {stockStatus.status === 'low' && (
          <div className="flex items-center text-xs text-yellow-600 bg-yellow-50 p-2 rounded mb-3">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {isPublicView ? 'Limited quantities available - order soon!' : `Stock running low! Only ${product.stock?.current} left.`}
          </div>
        )}

        {stockStatus.status === 'out' && (
          <div className="flex items-center text-xs text-red-600 bg-red-50 p-2 rounded mb-3">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {isPublicView ? 'This product is currently unavailable.' : 'Product is out of stock!'}
          </div>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                +{product.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="flex items-center justify-center pt-3 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(product.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
