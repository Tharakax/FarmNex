import React from 'react';
import { 
  Star, 
  ShoppingCart,
  DollarSign, 
  AlertTriangle,
  Tag,
  Heart,
  Plus,
  Minus
} from 'lucide-react';
import StockDisplay from '../StockDisplay';

const CustomerProductCard = ({ product, onAddToCart, onToggleFavorite, isFavorite = false }) => {
  const [quantity, setQuantity] = React.useState(1);

  const getStockStatus = () => {
    const current = product.stock?.current || 0;
    const minimum = product.stock?.minimum || 5;
    
    if (current === 0) return { status: 'out', color: 'bg-red-100 text-red-800', text: 'Out of Stock', available: false };
    if (current <= minimum) return { status: 'low', color: 'bg-yellow-100 text-yellow-800', text: 'Limited Stock', available: true };
    return { status: 'good', color: 'bg-green-100 text-green-800', text: 'Available', available: true };
  };

  const handleAddToCart = () => {
    if (stockStatus.available && onAddToCart) {
      onAddToCart(product, quantity);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1);
  };

  const stockStatus = getStockStatus();
  const defaultImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop';
  const productImage = product.images && product.images.length > 0 ? product.images[0] : defaultImage;
  
  // Calculate discounted price
  const originalPrice = product.price || 0;
  const discountAmount = product.discount ? (originalPrice * product.discount) / 100 : 0;
  const finalPrice = originalPrice - discountAmount;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200">
      {/* Product Image */}
      <div className="relative h-56 bg-gray-200 group">
        <img 
          src={productImage} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
        
        {/* Featured Badge */}
        {product.isFeatured && (
          <div className="absolute top-3 left-3">
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center shadow-md">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Featured
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-3 right-3">
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
              {product.discount}% OFF
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={() => onToggleFavorite?.(product)}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md"
          style={{ display: product.discount > 0 ? 'none' : 'block' }}
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${
              isFavorite ? 'text-red-500 fill-current' : 'text-gray-600 hover:text-red-500'
            }`} 
          />
        </button>

        {/* Stock Status Badge */}
        <div className="absolute bottom-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${stockStatus.color}`}>
            {stockStatus.text}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 h-14">
          {product.name}
        </h3>

        {/* Category */}
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Tag className="h-3 w-3 mr-1" />
          {product.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Fresh Produce'}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">
          {product.description || 'Fresh, high-quality produce from local farms.'}
        </p>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-gray-400 mr-1" />
            <span className="font-bold text-xl text-gray-900">
              LKR {finalPrice.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 ml-1">/{product.unit || 'kg'}</span>
            {product.discount > 0 && (
              <span className="text-sm text-gray-400 line-through ml-2">
                LKR {originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Stock Display - Public View */}
        <div className="mb-4">
          <StockDisplay 
            stock={product.stock} 
            unit={product.unit || 'kg'} 
            showDetailedView={false}
            publicView={true}
          />
        </div>

        {/* Stock Warning for Customers */}
        {stockStatus.status === 'low' && stockStatus.available && (
          <div className="flex items-center text-xs text-yellow-700 bg-yellow-50 p-2 rounded mb-3 border border-yellow-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Limited quantities available - order soon!
          </div>
        )}

        {!stockStatus.available && (
          <div className="flex items-center text-xs text-red-700 bg-red-50 p-2 rounded mb-3 border border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            This product is currently unavailable.
          </div>
        )}

        {/* Quantity Selector and Add to Cart */}
        {stockStatus.available ? (
          <div className="space-y-3">
            {/* Quantity Selector */}
            <div className="flex items-center justify-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Qty:</span>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={decrementQuantity}
                  className="p-1 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4 text-gray-600" />
                </button>
                <span className="px-3 py-1 min-w-[3rem] text-center font-medium">
                  {quantity}
                </span>
                <button
                  onClick={incrementQuantity}
                  className="p-1 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center font-medium"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </button>
          </div>
        ) : (
          <button
            disabled
            className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed font-medium"
          >
            Out of Stock
          </button>
        )}

        {/* Product Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                +{product.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProductCard;
