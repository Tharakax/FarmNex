import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {

        if(loading){
          const response = await axios.get('http://localhost:3000/api/product/');
        if (response.status === 200) {
          setProducts(response.data);
          setLoading(false);
          console.log('Products fetched successfully:', response.data);
        } else {
          throw new Error('Failed to fetch products');
        }
        }
        
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [loading]);

  const viewOne = async (productId) => {
    try {
      
      
      // Navigate to product details page with the product data
      navigate("/admin/products/getone",{
        state: { productId }
      });
      
    
    } catch (error) {
      console.error('Error fetching product details:', error);
      // You might want to show an error message to the user
      setError('Failed to load product details');
    }
  };

  async function deleteProduct(id) {
    try{
      const token = localStorage.getItem('token');
      if (!token) {
        return toast.error('You must be logged in to delete a product');
      }
      const response = await axios.delete(import.meta.env.VITE_BACKEND_URL+`/api/product/${id}`,
        {
          headers: {
          Authorization: "Bearer " + token
          }
        }
      );
      if (response.status === 200) {
        toast.success('Product deleted successfully');
        setLoading(true); // Reset loading state to refetch productsW
      } else {
        throw new Error('Failed to delete product');
      }
    }catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product');
    }
  }

  return (
    
    <div className="container mx-auto px-4 py-8">
         <main>
        
      </main>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Products</h1>
    <Link to={"addproducts"} className="text-green-700 text-xl hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800">
          Add Product
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
          <button 
            onClick={() => window.location.reload()} 
            className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 px-10text-left text-l font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 px-4text-left text-l font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 px-4text-left text-l font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 px-4text-left text-l font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 px-4text-left text-l font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="border-b-2  hover:bg-gray-200 hover:text-red-200    " >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.images && product.images.length > 0 && (
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={product.images[0]} 
                              alt={product.name}
                              onError={(e) => {
                                e.target.src = '/placeholder-image.png';
                              }}
                            />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {product.category ? product.category.replace('-', ' ') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${product.price ? product.price.toFixed(2) : '0.00'}/{product.unit || 'unit'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.stock !== undefined ? product.stock : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewOne(product._id)}
                        className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                      >
                        View
                      </button>
                      
                      <button
                      onClick ={() => deleteProduct(product._id)}
                      className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
      )}
      
     
    </div>
    
  );
};

export default ManageProducts;