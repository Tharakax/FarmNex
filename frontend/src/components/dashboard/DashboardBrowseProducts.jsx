import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Filter, Search, Grid, List, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../../services/productAPI';
import { addToCart, getCart } from '../../utils/cart';
import toast from 'react-hot-toast';

const DashboardBrowseProducts = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  const categories = [
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'leafy-greens', label: 'Leafy Greens' },
    { value: 'root-vegetables', label: 'Root Vegetables' },
    { value: 'berries', label: 'Berries' },
    { value: 'animal-products', label: 'Animal Products' },
    { value: 'dairy-products', label: 'Dairy Products' },
    { value: 'meats', label: 'Meats' }
  ];

  useEffect(() => {
    async function fetchProducts() {
      try {
        const result = await productAPI.getAllProducts();
        if (result.success) {
          setProducts(result.data);
          setFilteredProducts(result.data);
          setLoading(false);
        } else {
          throw new Error(result.error || 'Failed to fetch products');
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error(error.message || 'Failed to load products');
        setLoading(false);
      }
    }

    // Load initial cart count (total quantity, not just unique items)
    const initialCart = getCart();
    const totalQuantity = initialCart.reduce((total, item) => total + item.quantity, 0);
    setCartCount(totalQuantity);

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product =>
        selectedCategories.includes(product.category)
      );
    }

    // Filter by price range
    if (priceRange.min !== '' || priceRange.max !== '') {
      filtered = filtered.filter(product => {
        const price = product.price || 0;
        const min = priceRange.min === '' ? 0 : parseFloat(priceRange.min);
        const max = priceRange.max === '' ? Infinity : parseFloat(priceRange.max);
        return price >= min && price <= max;
      });
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategories, priceRange, searchTerm]);

  const handleCategoryChange = (categoryValue) => {
    setSelectedCategories(prev =>
      prev.includes(categoryValue)
        ? prev.filter(cat => cat !== categoryValue)
        : [...prev, categoryValue]
    );
  };

  const handlePriceChange = (type, value) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    setSearchTerm('');
  };

  const viewProductDetails = (productId) => {
    navigate(`/oneProduct/${productId}`, {
      state: { productId }
    });
  };

  const handleAddToCart = (product) => {
    try {
      addToCart(product, 1);
      // Update cart count by recalculating total quantity from cart
      const updatedCart = getCart();
      const totalQuantity = updatedCart.reduce((total, item) => total + item.quantity, 0);
      setCartCount(totalQuantity);
      toast.success(`${product.name} added to cart!`, {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#10b981',
          color: 'white',
        },
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Browse Products</h2>
            {cartCount > 0 && (
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm font-semibold">{cartCount} {cartCount === 1 ? 'item' : 'items'} in cart</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 mt-1">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-400 w-64 font-medium transition-all"
            />
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded transition-all ${viewMode === 'grid' ? 'bg-green-500 text-white shadow-md' : 'hover:bg-gray-200'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded transition-all ${viewMode === 'list' ? 'bg-green-500 text-white shadow-md' : 'hover:bg-gray-200'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="lg:w-80">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full bg-white rounded-lg shadow-sm px-4 py-3 flex items-center justify-between border border-gray-200 hover:shadow-md transition-shadow"
            >
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:scale-105"
              >
                Clear All
              </button>
            </div>

            {/* Category Filters */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category.value} className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.value)}
                      onChange={() => handleCategoryChange(category.value)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-gray-700 group-hover:text-green-600 transition-colors text-sm">
                      {category.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Min Price (Rs)</label>
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Max Price (Rs)</label>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    placeholder="No limit"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Stock Summary */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Stock Overview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Products:</span>
                  <span className="font-medium">{products.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Showing:</span>
                  <span className="font-medium">{filteredProducts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">In Stock:</span>
                  <span className="font-medium text-green-600">
                    {filteredProducts.filter(p => p.stock && p.stock.current > 0).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
              <div className="text-gray-400 mb-4">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold hover:scale-105 shadow-md hover:shadow-lg"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all group ${
                    viewMode === 'list' ? 'flex items-center gap-4 p-4' : 'overflow-hidden'
                  }`}
                >
                  {/* Product Image */}
                  <div className={`relative ${viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'h-48'} overflow-hidden ${viewMode === 'grid' ? 'rounded-t-xl' : 'rounded-lg'}`}>
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1506617420156-8e4536971650?w=400&h=300&fit=crop'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {product.stock && product.stock.current > 0 ? (
                      <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Available
                      </span>
                    ) : (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className={`${viewMode === 'grid' ? 'p-4' : 'flex-1'}`}>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className={`text-gray-600 text-sm mb-3 ${viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-2'}`}>
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-2xl font-bold text-green-600">
                          Rs. {product.price}
                        </span>
                        <span className="text-gray-500 text-sm">/{product.unit}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">4.8</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                      <button
                        onClick={() => viewProductDetails(product._id)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-all font-medium text-sm hover:scale-105"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.stock || product.stock.current <= 0}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-medium text-sm hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardBrowseProducts;