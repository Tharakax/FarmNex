import axios from "axios";
import { useEffect, useState } from "react";
import Navigation from "../../components/navigation";
import { FaShoppingCart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { addToCart } from "../../utils/cart.js";
import toast from "react-hot-toast";

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
                console.log(import.meta.env) 
                const response = await axios.get(import.meta.env.VITE_BACKEND_URL+"/api/product/");
                if (response.status === 200) {
                    setProducts(response.data);
                    setFilteredProducts(response.data);
                    setLoading(false);
                    console.log('Products fetched successfully:', response.data);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    // Filter products based on selected filters
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
                {/* Header */}
                

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

                            {/* Results Count */}
                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                    Showing {filteredProducts.length} of {products.length} products
                                </p>
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

                                        {/* Stock Badge */}
                                        {product.stock !== undefined && (
                                            <div className="absolute top-4 right-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    product.stock > 0 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
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
                                                        Rs. {product.price ? product.price.toFixed(2) : '0.00'}
                                                    </span>
                                                    {product.displayPrice && product.displayPrice !== product.price && (
                                                        <span className="text-sm text-gray-500 line-through">
                                                            Rs. {product.displayPrice.toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    per {product.unit || 'unit'}
                                                </p>
                                            </div>

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
                                                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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