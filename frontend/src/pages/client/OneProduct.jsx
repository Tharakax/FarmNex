import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navigation from "../../components/navigation";
import { FaArrowLeft, FaShoppingCart, FaStar, FaStarHalfAlt, FaRegStar, FaTag, FaClock, FaWarehouse } from "react-icons/fa";

export default function OneProduct() {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const params = useParams();
    
    const [showReviewForm, setShowReviewForm] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();

    const  productId  = params.id;
    useEffect(() => {
        if (!productId) {
            setError("Product ID not provided");
            setLoading(false);
            return;
        }

        async function fetchProduct() {
            try {
                setLoading(true);
                const response = await axios.get(import.meta.env.VITE_BACKEND_URL+`/api/product/${productId}`);
                if (response.status === 200) {
                    setProduct(response.data);
                    console.log('Product fetched successfully:', response.data);
                } else {
                    setError("Product not found");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                setError("Failed to load product details");
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [productId]);

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleAddToCart = () => {
        // Implement add to cart functionality
        console.log(`Adding ${quantity} ${product.unit}(s) of ${product.name} to cart`);
        // You can integrate with your cart context/state management here
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        
        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={i} className="text-yellow-400" />);
        }
        
        if (hasHalfStar) {
            stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
        }
        
        const remainingStars = 5 - Math.ceil(rating);
        for (let i = 0; i < remainingStars; i++) {
            stars.push(<FaRegStar key={`empty-${i}`} className="text-gray-300" />);
        }
        
        return stars;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
                <Navigation />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 text-lg">Loading product details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
                <Navigation />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <button
                        onClick={handleGoBack}
                        className="flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Products
                    </button>
                    <div className="text-center py-16">
                        <div className="mx-auto h-24 w-24 text-red-400 mb-4">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.76 0L4.054 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Product Not Found</h3>
                        <p className="text-gray-500">{error || "The product you're looking for doesn't exist."}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
            <Navigation />
            
            <div className="max-w-7xl pt-30 mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Back Button */}
                <button
                    onClick={handleGoBack}
                    className="flex items-center text-purple-600 hover:text-purple-700 mb-8 transition-colors font-medium"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to Products
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 shadow-lg">
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[selectedImage]}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-image.png';
                                    }}
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                    <div className="text-gray-400 text-center">
                                        <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p>No image available</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Images */}
                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                            selectedImage === index 
                                                ? 'border-purple-500 ring-2 ring-purple-500 ring-opacity-50' 
                                                : 'border-gray-200 hover:border-purple-300'
                                        }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${product.name} ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="space-y-6">
                        {/* Category Badge */}
                        {product.category && (
                            <div>
                                <span className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full font-medium capitalize">
                                    {product.category.replace('-', ' ')}
                                </span>
                            </div>
                        )}

                        {/* Product Name */}
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

                        {/* Rating */}
                        {product.ratings > 0 && (
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                    {renderStars(product.ratings)}
                                </div>
                                <span className="text-gray-600">
                                    {product.ratings.toFixed(1)} ({product.numOfReviews} review{product.numOfReviews !== 1 ? 's' : ''})
                                </span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="space-y-2">
                            <div className="flex items-baseline space-x-3">
                                <span className="text-4xl font-bold text-gray-900">
                                    Rs. {product.price.toFixed(2)}
                                </span>
                                {product.displayprice && product.displayprice !== product.price && (
                                    <span className="text-xl text-gray-500 line-through">
                                        Rs.{product.displayprice.toFixed(2)}
                                    </span>
                                )}
                                <span className="text-gray-600">per {product.unit}</span>
                            </div>
                            {product.discount > 0 && (
                                <div className="flex items-center text-green-600">
                                    <FaTag className="mr-2" />
                                    <span className="font-medium">{product.discount}% OFF</span>
                                </div>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center space-x-2">
                            <FaWarehouse className="text-gray-500" />
                            <span className={`font-medium ${
                                product.stock > 0 
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                            }`}>
                                {product.stock > 0 
                                    ? `${product.stock} in stock` 
                                    : 'Out of stock'
                                }
                            </span>
                        </div>

                        {/* Quantity Selector & Add to Cart */}
                        {product.stock > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <label className="text-gray-700 font-medium">Quantity:</label>
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-3 py-2 hover:bg-gray-100 transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 py-2 font-medium">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="px-3 py-2 hover:bg-gray-100 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
                                >
                                    <FaShoppingCart />
                                    <span>Add to Cart</span>
                                </button>
                            </div>
                        )}

                        {/* Product Description */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                            <p className="text-gray-700 leading-relaxed">{product.description}</p>
                        </div>

                        {/* Additional Information */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900">Additional Information</h2>
                            
                            {product.shelfLife && (
                                <div className="flex items-center space-x-3">
                                    <FaClock className="text-gray-500" />
                                    <span className="text-gray-700">
                                        <strong>Shelf Life:</strong> {product.shelfLife} days
                                    </span>
                                </div>
                            )}

                            {product.storageInstructions && (
                                <div className="space-y-2">
                                    <strong className="text-gray-900">Storage Instructions:</strong>
                                    <p className="text-gray-700">{product.storageInstructions}</p>
                                </div>
                            )}

                            {product.tags && product.tags.length > 0 && (
                                <div className="space-y-2">
                                    <strong className="text-gray-900">Tags:</strong>
                                    <div className="flex flex-wrap gap-2">
                                        {product.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
                                <p>Added on {formatDate(product.createdAt)}</p>
                                {product.updatedAt !== product.createdAt && (
                                    <p>Last updated on {formatDate(product.updatedAt)}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                {product.reviews && product.reviews.length > 0 && (
                    <div className="mt-16">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
                            
                            <div className="space-y-6">
                                {product.reviews.map((review, index) => (
                                    <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <span className="text-purple-600 font-medium">
                                                        {review.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h4 className="font-medium text-gray-900">{review.name}</h4>
                                                    <div className="flex items-center space-x-1">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                </div>
                                                <p className="text-gray-700">{review.comment}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}