import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ViewOneProduct = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const productId = location.state?.productId;

  useEffect(() => {
    if (!productId) {
      toast.error('No product selected');
      navigate("/admin/products");
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(import.meta.env.VITE_BACKEND_URL+`/api/product/${productId}`, {
          headers: {
            Authorization: "Bearer " + token
          }
        });
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast.error('Failed to load product details');
      }
    };
    
    fetchProduct();
    setLoading(false)
  },[loading]);


  async function viewOnetoedit (id){
    try {
      
      
      // Navigate to product details page with the product data
      navigate("/admin/products/edit",{
        state: { id }
      });
      
    
    } catch (error) {
      console.error('Error fetching product details:', error);
      // You might want to show an error message to the user
      setError('Failed to load product details');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-50 to-amber-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 p-4">
        <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl mx-auto max-w-4xl mt-8 shadow-lg">
          <strong>Error:</strong> {error}
          <button 
            onClick={() => navigate(-1)} 
            className="ml-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 shadow-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center">
        <div className="text-center py-8 bg-white rounded-xl shadow-lg p-8 border border-green-100">
          <h2 className="text-xl font-semibold text-green-800">Product not found</h2>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 shadow-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="text-green-700 hover:text-green-900 font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-green-200 hover:bg-green-50 transition-all duration-200"
          >
            &larr; Back to Products
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
          {/* Product Header */}
          <div className="px-6 py-6 border-b border-green-100 bg-gradient-to-r from-green-50 to-amber-50">
            <h1 className="text-3xl font-bold text-green-800 mb-2">{product.name}</h1>
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-2xl font-bold text-green-700 bg-white px-3 py-1 rounded-lg shadow-sm">
                ${product.price.toFixed(2)}/{product.unit}
              </span>
              {product.discount > 0 && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-semibold rounded-full border border-orange-200">
                  {product.discount}% OFF
                </span>
              )}
              {product.displayprice && (
                <span className="text-gray-500 line-through bg-gray-100 px-2 py-1 rounded text-sm">
                  ${product.displayprice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Product Content */}
          <div className="md:flex">
            {/* Image Gallery */}
            <div className="md:w-1/2 p-6 bg-gradient-to-b from-green-25 to-white">
              <div className="mb-4 h-96 flex items-center justify-center bg-gradient-to-br from-green-50 to-amber-50 rounded-2xl overflow-hidden shadow-inner border border-green-100">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[activeImage]}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.png';
                    }}
                  />
                ) : (
                  <div className="text-green-600 font-medium">No image available</div>
                )}
              </div>
              
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto py-2">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`w-16 h-16 flex-shrink-0 border-3 rounded-lg overflow-hidden transition-all duration-200 ${
                        activeImage === index 
                          ? 'border-green-500 shadow-lg ring-2 ring-green-200' 
                          : 'border-green-200 hover:border-green-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-image.png';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="md:w-1/2 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3 text-green-800 border-b border-green-200 pb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed bg-green-50 p-4 rounded-lg border border-green-100">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <h3 className="text-sm font-semibold text-green-700 mb-1">Category</h3>
                  <p className="text-green-800 capitalize font-medium">{product.category.replace('-', ' ')}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <h3 className="text-sm font-semibold text-orange-700 mb-1">Stock</h3>
                  <p className="text-orange-800 font-medium">{product.stock}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-amber-100 p-4 rounded-lg border border-yellow-200">
                  <h3 className="text-sm font-semibold text-yellow-700 mb-1">Ratings</h3>
                  <p className="text-yellow-800 font-medium">{product.ratings || 'Not rated yet'}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-green-100 p-4 rounded-lg border border-emerald-200">
                  <h3 className="text-sm font-semibold text-emerald-700 mb-1">Featured</h3>
                  <p className="text-emerald-800 font-medium">{product.isFeatured ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {product.shelfLife && (
                <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-700 mb-1">Shelf Life</h3>
                  <p className="text-blue-800 font-medium">{product.shelfLife} days</p>
                </div>
              )}

              {product.storageInstructions && (
                <div className="mb-4 bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="text-sm font-semibold text-purple-700 mb-2">Storage Instructions</h3>
                  <p className="text-purple-800 whitespace-pre-line leading-relaxed">{product.storageInstructions}</p>
                </div>
              )}

              {product.tags && product.tags.length > 0 && (
                <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-green-200 pt-4 bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-green-700 mb-1">Created At</h3>
                <p className="text-green-800 font-medium">{new Date(product.createdAt).toLocaleString()}</p>
              </div>

              <div className="mt-6 flex space-x-4">
                <button
                    onClick ={() =>{viewOnetoedit(productId)}}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md font-medium"
                >
                  Edit Product
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 border-2 border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors duration-200 shadow-md font-medium"
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOneProduct;