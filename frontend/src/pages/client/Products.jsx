import axios from "axios";
import { useEffect, useState } from "react";
import Navigation from "../../components/navigation";
import { FaShoppingCart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { addToCart } from "../../utils/cart.js";
import { productAPI } from "../../services/productAPI";
import toast , { Toaster } from "react-hot-toast";

export default function ProductsPage() {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [showFilters, setShowFilters] = useState(false);
    const Navigate = useNavigate();
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
                    console.log('Products fetched successfully:', result.data);
                } else {
                    throw new Error(result.error || 'Failed to fetch products');
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                toast.error(error.message || 'Failed to load products');
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    useEffect(() => {
        let filtered = products;

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
    }, [products, selectedCategories, priceRange]);

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
    };

    const viewOne = async (productId) => {
        Navigate("/OneProduct", {
            state: { productId }
        });
    };

   

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading products...</p>
                </div>
            </div>
        );
    }

    return (

        
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
                   
            <div>
                    <Navigation></Navigation>
                </div>
            <div className="max-w-7xl pt-30 mx-auto px-4 sm:px-6 lg:px-8 py-12">

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="w-full bg-white rounded-xl shadow-lg px-4 py-3 flex items-center justify-between border border-gray-200 hover:shadow-xl transition-shadow"
                        >
                            <span className="font-semibold text-gray-700">Filters</span>
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

                    {/* Filters Sidebar */}
                    <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                                <button
                                    onClick={clearFilters}
                                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                                >
                                    Clear All
                                </button>
                            </div>

                            {/* Category Filters */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                                <div className="space-y-3">
                                    {categories.map((category) => (
                                        <label key={category.value} className="flex items-center group cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(category.value)}
                                                onChange={() => handleCategoryChange(category.value)}
                                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-3 text-gray-700 group-hover:text-purple-600 transition-colors">
                                                {category.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range Filter */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Min Price (Rs)
                                        </label>
                                        <input
                                            type="number"
                                            value={priceRange.min}
                                            onChange={(e) => handlePriceChange('min', e.target.value)}
                                            placeholder="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Max Price (Rs)
                                        </label>
                                        <input
                                            type="number"
                                            value={priceRange.max}
                                            onChange={(e) => handlePriceChange('max', e.target.value)}
                                            placeholder="No limit"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Stock Summary */}
                            <div className="pt-4 border-t border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Stock Overview</h3>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span>Total Products:</span>
                                        <span className="font-medium">{products.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Showing:</span>
                                        <span className="font-medium">{filteredProducts.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>In Stock:</span>
                                        <span className="font-medium text-green-600">
                                            {filteredProducts.filter(p => p.stock && p.stock.current > 0).length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Low Stock:</span>
                                        <span className="font-medium text-orange-600">
                                            {filteredProducts.filter(p => p.stock && p.stock.current > 0 && p.stock.current <= p.stock.minimum).length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Out of Stock:</span>
                                        <span className="font-medium text-red-600">
                                            {filteredProducts.filter(p => !p.stock || p.stock.current <= 0).length}
                                        </span>
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-gray-100">
                                        <div className="flex justify-between">
                                            <span>Total Stock Value:</span>
                                            <span className="font-medium text-purple-600">
                                                LKR {filteredProducts.reduce((total, p) => 
                                                    total + (p.stock && p.price ? p.stock.current * p.price : 0), 0
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {filteredProducts && filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredProducts.map((product) => (
                                    <div 
                                        key={product._id} 
                                        className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
                                    >
                                        {/* Product Image */}
                                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100 rounded-t-2xl">
                                            {product.images && product.images.length > 0 ? (
                                                <img 
                                                    className="h-56 w-full object-cover group-hover:scale-110 transition-transform duration-300" 
                                                    src={product.images[0]} 
                                                    alt={product.name}
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-image.png';
                                                    }}
                                                />
                                            ) : (
                                                <div className="h-56 w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                                    <div className="text-gray-400 text-center">
                                                        <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <p className="text-sm">No image</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Stock Badge - Customer View */}
                                        {product.stock && (
                                            <div className="absolute top-4 right-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    product.stock.current > 0 
                                                        ? product.stock.current <= product.stock.minimum 
                                                            ? 'bg-orange-100 text-orange-800' 
                                                            : 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {product.stock.current > 0 
                                                        ? product.stock.current <= product.stock.minimum 
                                                            ? 'Limited Stock' 
                                                            : 'Available'
                                                        : 'Out of Stock'
                                                    }
                                                </span>
                                            </div>
                                        )}

                                        {/* Product Info */}
                                        <div className="p-6">
                                            {/* Category */}
                                            {product.category && (
                                                <div className="mb-2">
                                                    <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium capitalize">
                                                        {product.category.replace('-', ' ')}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Product Name */}
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                                {product.name}
                                            </h3>

                                            {/* Price */}
                                            <div className="mb-4">
                                                <div className="flex items-baseline space-x-2">
                                                    <span className="text-2xl font-bold text-gray-900">
                                                        LKR {product.price ? product.price.toFixed(2) : '0.00'}
                                                    </span>
                                                    {product.displayPrice && product.displayPrice !== product.price && (
                                                        <span className="text-sm text-gray-500 line-through">
                                                            LKR {product.displayPrice.toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    per {product.unit || 'unit'}
                                                </p>
                                            </div>

                                            {/* Availability Information - Customer View */}
                                            {product.stock && (
                                                <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-sm font-semibold text-gray-700">Availability</h4>
                                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            product.stock.current <= 0
                                                                ? 'bg-red-100 text-red-700'
                                                                : product.stock.current <= product.stock.minimum
                                                                ? 'bg-orange-100 text-orange-700'
                                                                : 'bg-green-100 text-green-700'
                                                        }`}>
                                                            {
                                                                product.stock.current <= 0 ? 'Out of Stock' :
                                                                product.stock.current <= product.stock.minimum ? 'Limited Stock' : 'Available'
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 text-xs text-gray-600">
                                                        {
                                                            product.stock.current <= 0 ? 'This product is currently unavailable.' :
                                                            product.stock.current <= product.stock.minimum ? 'Limited quantities available - order soon!' :
                                                            'Ready to ship - in stock now!'
                                                        }
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex space-x-2 flex items-center justify-center mb-4">
                                                    <Link to={"/oneProduct/"+product._id} >    

                                                <button
                                                    
                                                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                                >
                                                    View Details
                                                </button>
                                                    </Link> 

                                                 <button
                                                    onClick={() => {
                                                        addToCart(product, 1);
                                                        toast.success(`${product.name} added to cart!`);
                                                    }}
                                                disabled={!product.stock || product.stock.current <= 0}
                                                className={`font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                                    !product.stock || product.stock.current <= 0
                                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                                        : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                                                }`}
                                                >
                                                <FaShoppingCart className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="text-center py-16">
                                <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {products.length === 0 ? 'No products found' : 'No products match your filters'}
                                </h3>
                                <p className="text-gray-500">
                                    {products.length === 0 
                                        ? 'Get started by adding your first product.' 
                                        : 'Try adjusting your filters to see more results.'
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}