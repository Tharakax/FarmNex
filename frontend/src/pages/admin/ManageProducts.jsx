import React, { useState, useEffect } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { FileText, FileSpreadsheet, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI } from '../../services/productAPI';
import ExportService from '../../services/exportService';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if(loading){
          const result = await productAPI.getAllProducts();
          if (result.success) {
            setProducts(result.data);
            setLoading(false);
            console.log('Products fetched successfully:', result.data);
          } else {
            throw new Error(result.error || 'Failed to fetch products');
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
      
      const result = await productAPI.deleteProduct(id);
      if (result.success) {
        toast.success('Product deleted successfully');
        setLoading(true); // Reset loading state to refetch products
      } else {
        throw new Error(result.error || 'Failed to delete product');
      }
    }catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
      setError('Failed to delete product');
    }
  }

  // Export handlers
  const handleExportToPDF = () => {
    try {
      const stats = {
        totalProducts: products.length,
        totalValue: products.reduce((sum, product) => {
          const stock = typeof product.stock === 'number' ? product.stock : product.stock?.current || 0;
          return sum + (stock * (product.price || 0));
        }, 0)
      };
      
      ExportService.exportProducts.toPDF(products, stats);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export to PDF');
    }
  };

  const handleExportToExcel = () => {
    try {
      const stats = {
        totalProducts: products.length,
        totalValue: products.reduce((sum, product) => {
          const stock = typeof product.stock === 'number' ? product.stock : product.stock?.current || 0;
          return sum + (stock * (product.price || 0));
        }, 0),
        inStock: products.filter(p => {
          const current = typeof p.stock === 'number' ? p.stock : p.stock?.current || 0;
          const minimum = p.stock?.minimum || 5;
          return current > minimum;
        }).length,
        lowStock: products.filter(p => {
          const current = typeof p.stock === 'number' ? p.stock : p.stock?.current || 0;
          const minimum = p.stock?.minimum || 5;
          return current > 0 && current <= minimum;
        }).length,
        outOfStock: products.filter(p => {
          const current = typeof p.stock === 'number' ? p.stock : p.stock?.current || 0;
          return current === 0;
        }).length
      };
      
      ExportService.exportProducts.toExcel(products, stats);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel');
    }
  };

  return (
    
    <div className="container mx-auto px-4 py-8">
         <main>
        
      </main>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Products</h1>
        <div className="flex items-center space-x-3">
          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleExportToPDF}
              disabled={loading || products.length === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </button>
            <button
              onClick={handleExportToExcel}
              disabled={loading || products.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </button>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={() => setLoading(true)}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          {/* Add Product Button */}
          <Link to={"addproducts"} className="text-green-700 text-xl hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800">
            Add Product
          </Link>
        </div>
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
                      {product.stock && typeof product.stock === 'object' ? product.stock.current : (product.stock !== undefined ? product.stock : 'N/A')}
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