import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MediaUpload from "../../utils/medialUpload.jsx";

import toast from 'react-hot-toast';
const AddProduct = () => {
  
  const navigate = useNavigate();
  
  const [name , setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setcategory] = useState('');
  const [price, setPrice] = useState('');
  const [displayprice, setDisplayPrice] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('kg');
  const [discount, setDiscount] = useState('');
  const [shelfLife, setShelfLife] = useState('');
  const [tags, setTags] = useState([]);
  const [storageInstructions, setStorageInstructions] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [img, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  


  const handleSubmit = async (e) => {
    



    e.preventDefault();

    const promisesArray = []
        for(let i = 0; i < img.length; i++) {
            const promise = MediaUpload(img[i]);
            promisesArray[i] = promise

        }
        const result = await Promise.all(promisesArray);
        console.log("All images uploaded successfully:", result);
        
        MediaUpload(img).then((url) => {

            const imgURL = url;
        }).catch((error) => {
            console.error("Error uploading image:", error);
            toast.error("Error uploading image");
        });


    setLoading(true);
    const productData = {
      name : name,
      description: description,
      category: category,
      price: parseFloat(price),
      displayprice: parseFloat(displayprice),
      stock: parseInt(stock),
      unit: unit,
      discount: discount,
      shelfLife: shelfLife,
      tags: tags.split(',').map(tag => tag.trim()), // Convert comma-separated string to array
      storageInstructions: storageInstructions,
      isFeatured: isFeatured,
      images: result // Assuming handleUpload returns the image URLs

    };

    try {

      
      const token = localStorage.getItem('token');
      const response = await axios.post(import.meta.env.VITE_BACKEND_URL+"/api/product/", productData ,{
        headers:{
          Authorization: "Bearer " + token
        }
      });
      
      if (response.status === 201) {
        navigate('/admin/products', { state: { success: 'Product created successfully!' } });
      } else {
        throw new Error('Failed to create product');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }


  }

const handleUpload = async () => {
    
        

    }

    const categories = [
        'vegetables',
        'fruits',
        'leafy-greens',
        'root-vegetables',
        'berries',
        'animal-products',
        'dairy-products',
        'meats',
  ];
    const units = [
      'kg',
      'g',
      'lb',
     
      'pcs',
      'bunch',
      'dozen'
    ];
    

  return (
      
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Product</h1>
         
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Basic Information</h2>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Product Name*
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  maxLength="100"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  maxLength="2000"
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                  Category*
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={category}
                  onChange={(e) => setcategory(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Pricing & Inventory</h2>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                  Price*
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="displayprice">
                  Display Price (optional)
                </label>
                <input
                  id="displayprice"
                  name="displayprice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={displayprice}
                  onChange={(e) => setDisplayPrice(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stock">
                  Stock*
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="unit">
                  Unit*
                </label>
                <select
                  id="unit"
                  name="unit"
                  required
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Additional Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discount">
                  Discount (%)
                </label>
                <input
                  id="discount"
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shelfLife">
                  Shelf Life (days)
                </label>
                <input
                  id="shelfLife"
                  name="shelfLife"
                  type="number"
                  min="0"
                  value={shelfLife}
                  onChange={(e) => setShelfLife(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tags">
                Tags (comma separated)
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="e.g. organic, fresh, local"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="storageInstructions">
                Storage Instructions
              </label>
              <textarea
                id="storageInstructions"
                name="storageInstructions"
                rows="3"
                value={storageInstructions}
                onChange={(e) => setStorageInstructions(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="flex items-center">
              <input
                id="isFeatured"
                name="isFeatured"
                type="checkbox"
                value={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                Feature this product
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Product Images</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Upload Images
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => {
                const images = e.target.files;
                setImages(images)
            }}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
            </div>

            
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;