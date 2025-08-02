import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import MediaUpload from '../../utils/medialUpload';

const EditProduct = () => {
  const [product, setProduct] = useState(null);
  const [originalProduct, setOriginalProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [img, setImages] = useState([]);
  const [newTag, setNewTag] = useState('');
  const location = useLocation();
  const navigate = useNavigate();


  const productId = location.state?.id;

  const categories = [
    'vegetables',
    'fruits',
    'leafy-greens',
    'root-vegetables',
    'berries',
    'tropical-fruits',
    'organic',
    'exotic'
  ];

  useEffect(() => {
    if (!productId) {
      toast.error('No product selected');
      navigate("/admin");
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3000/api/product/${productId}`, {
          headers: {
            Authorization: "Bearer " + token
          }
        });
        setProduct(response.data);
        setOriginalProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast.error('Failed to load product details');
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  const handleInputChange = (field, value) => {
    setProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  

  const removeImage = (index) => {
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    if (activeImage >= product.images.length - 1) {
      setActiveImage(0);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !product.tags.includes(newTag.trim())) {
      setProduct(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setProduct(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async () => {
  try {
    setSaving(true);
    const token = localStorage.getItem('token');
    
    // Handle new image uploads first
    let uploadedImageUrls = [];
    if (img && img.length > 0) {
      try {
        uploadedImageUrls = await Promise.all(img.map(file => MediaUpload(file)));
        console.log("All images uploaded successfully:", uploadedImageUrls);
      } catch (error) {
        console.error("Error uploading images:", error);
        toast.error("Error uploading images");
        setSaving(false);
        return;
      }
    }

    // Combine existing images with new uploaded images
    const allImages = [
      ...(product.images || []).filter(img => typeof img === 'string'), // Keep existing URLs
      ...uploadedImageUrls.filter(url => url) // Add new URLs
    ];

    // Prepare the request body
    const requestBody = {
      name: product.name,
      description: product.description,
      price: product.price,
      unit: product.unit,
      discount: product.discount,
      displayprice: product.displayprice,
      category: product.category,
      stock: product.stock,
      shelfLife: product.shelfLife,
      storageInstructions: product.storageInstructions,
      tags: product.tags || [],
      isFeatured: product.isFeatured || false,
      images: allImages
    };

    const response = await axios.put(
      import.meta.env.VITE_BACKEND_URL+`/api/product/${productId}`,
      requestBody,
      {
        headers: {
          Authorization: "Bearer " + token,
          'Content-Type': 'application/json'
        }
      }
    );

    toast.success('Product updated successfully!');
    setImages([]); // Clear the new images array
    setSaving(false);
    navigate('/admin/products');
  } catch (err) {
    console.error('Error updating product:', err);
    toast.error('Failed to update product: ' + 
      (err.response?.data?.message || err.message || 'Unknown error'));
    setSaving(false);
  }
};
  const hasChanges = () => {
    return JSON.stringify(product) !== JSON.stringify(originalProduct);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-50 to-amber-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600"></div>
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="text-green-700 hover:text-green-900 font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-green-200 hover:bg-green-50 transition-all duration-200"
          >
            ← Back to Products
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm font-medium"
            >
              Reset Changes
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges()}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md ${
                saving || !hasChanges()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
          {/* Product Header */}
          <div className="px-6 py-6 border-b border-green-100 bg-gradient-to-r from-green-50 to-amber-50">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-green-700 mb-2">Product Name</label>
              <input
                type="text"
                value={product.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full text-3xl font-bold text-green-800 bg-transparent border-2 border-green-200 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 transition-colors duration-200"
                placeholder="Enter product name"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">Price (LKR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={product.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  className="w-full text-lg font-bold text-green-700 bg-white border-2 border-green-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 transition-colors duration-200"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">Unit</label>
                <input
                  type="text"
                  value={product.unit || ''}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className="w-full text-lg font-bold text-green-700 bg-white border-2 border-green-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 transition-colors duration-200"
                  placeholder="kg, piece, bundle"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={product.discount || 0}
                  onChange={(e) => handleInputChange('discount', parseInt(e.target.value))}
                  className="w-full text-lg font-bold text-orange-700 bg-white border-2 border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 transition-colors duration-200"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Product Content */}
          <div className="lg:flex">
            {/* Image Gallery */}
            <div className="lg:w-1/2 p-6 bg-gradient-to-b from-green-25 to-white">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-green-700 mb-2">Product Images</label>
                <div className="mb-4 h-96 flex items-center justify-center bg-gradient-to-br from-green-50 to-amber-50 rounded-2xl overflow-hidden shadow-inner border-2 border-dashed border-green-200">
                  {product.images && product.images.length > 0 ? (
                    <div className="relative w-full h-full">
                      <img
                        src={product.images[activeImage]}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = '/placeholder-image.png';
                        }}
                      />
                      <button
                        onClick={() => removeImage(activeImage)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-green-600 font-medium">
                      <div className="text-4xl mb-2">📸</div>
                      <div>No images available</div>
                      <div className="text-sm text-gray-500">Upload images below</div>
                    </div>
                  )}
                </div>
                
                {product.images && product.images.length > 1 && (
                  <div className="flex space-x-3 overflow-x-auto py-2 mb-4">
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

                <input
                  id="imageUpload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setImages(files);
                  }}
                  className="w-full text-sm text-green-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="lg:w-1/2 p-6 space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">Description</label>
                <textarea
                  value={product.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows="4"
                  className="w-full text-gray-700 bg-green-50 border-2 border-green-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors duration-200 resize-none"
                  placeholder="Describe your organic product..."
                />
              </div>

              {/* Category and Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-2">Category</label>
                  <select
                    value={product.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full text-green-800 bg-green-50 border-2 border-green-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors duration-200"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-700 mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={product.stock || 0}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value))}
                    className="w-full text-orange-800 bg-orange-50 border-2 border-orange-200 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors duration-200"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2">Shelf Life (days)</label>
                  <input
                    type="number"
                    min="0"
                    value={product.shelfLife || ''}
                    onChange={(e) => handleInputChange('shelfLife', parseInt(e.target.value))}
                    className="w-full text-blue-800 bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors duration-200"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-yellow-700 mb-2">Display Price (LKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={product.displayprice || ''}
                    onChange={(e) => handleInputChange('displayprice', parseFloat(e.target.value))}
                    className="w-full text-yellow-800 bg-yellow-50 border-2 border-yellow-200 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Storage Instructions */}
              <div>
                <label className="block text-sm font-semibold text-purple-700 mb-2">Storage Instructions</label>
                <textarea
                  value={product.storageInstructions || ''}
                  onChange={(e) => handleInputChange('storageInstructions', e.target.value)}
                  rows="3"
                  className="w-full text-purple-800 bg-purple-50 border-2 border-purple-200 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors duration-200 resize-none"
                  placeholder="How should this product be stored?"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.tags && product.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full border border-green-200 flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-green-600 hover:text-green-800 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 text-gray-700 bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-gray-500 transition-colors duration-200"
                    placeholder="Add a tag..."
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center gap-3">
                <label className="block text-sm font-semibold text-emerald-700">Featured Product</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={product.isFeatured || false}
                    onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* Created At (Read-only) */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-sm font-semibold text-green-700 mb-1">Created At</h3>
                <p className="text-green-800 font-medium">{new Date(product.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;