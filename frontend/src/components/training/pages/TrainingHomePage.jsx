import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaPlus, FaChartBar } from 'react-icons/fa';
import Header from '../../../components/Header.jsx';
import TrainingCard from '../components/TrainingCard.jsx';
import { trainingAPIReal } from '../../../services/trainingAPIReal';
import { showSuccess, showError, showConfirm } from '../../../utils/sweetAlert';

const TrainingHomePage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    total: 0
  });
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetchMaterials();
    fetchStatistics();
  }, [filters]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await trainingAPIReal.getTrainingMaterials(filters);
      setMaterials(response.materials);
      setPagination({
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        total: response.total
      });
    } catch (err) {
      setError('Failed to fetch training materials');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await trainingAPIReal.getStatistics();
      setStatistics(response.statistics);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handleDelete = async (id, title) => {
    const result = await showConfirm(
      `Are you sure you want to delete "${title}"?`,
      'Delete Training Material',
      {
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        icon: 'warning'
      }
    );
    
    if (result.isConfirmed) {
      try {
        await trainingAPIReal.deleteTrainingMaterial(id);
        fetchMaterials();
        fetchStatistics();
        await showSuccess('Training material deleted successfully!');
      } catch (err) {
        await showError('Failed to delete training material');
        console.error('Error:', err);
      }
    }
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  if (loading && materials.length === 0) {
    return (
      <div>
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farmer-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      
      {/* Statistics Dashboard */}
      {statistics && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-farmer-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Materials</p>
                  <p className="text-3xl font-bold text-gray-900">{statistics.totalMaterials}</p>
                </div>
                <FaChartBar className="text-farmer-green-500 text-2xl" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-3xl font-bold text-gray-900">{statistics.totalViews}</p>
                </div>
                <FaChartBar className="text-blue-500 text-2xl" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Videos</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statistics.materialsByType.find(item => item._id === 'Video')?.count || 0}
                  </p>
                </div>
                <FaChartBar className="text-purple-500 text-2xl" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Guides</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statistics.materialsByType.find(item => item._id === 'Guide')?.count || 0}
                  </p>
                </div>
                <FaChartBar className="text-orange-500 text-2xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Training Materials</h2>
            <p className="text-gray-600">Manage and explore all training content</p>
          </div>
          <Link
            to="/add"
            className="btn-primary mt-4 lg:mt-0 w-full lg:w-auto text-center"
          >
            <FaPlus className="inline mr-2" />
            Add New Training
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search training materials..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmer-green-500 focus:border-transparent text-base"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="form-input min-w-[140px]"
              >
                <option value="all">All Types</option>
                <option value="Video">Video</option>
                <option value="Guide">Guide</option>
                <option value="Article">Article</option>
                <option value="PDF">PDF</option>
                <option value="FAQ">FAQ</option>
              </select>
              
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="form-input min-w-[160px]"
              >
                <option value="all">All Categories</option>
                <option value="Crop Management">Crop Management</option>
                <option value="Livestock">Livestock</option>
                <option value="Equipment">Equipment</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="General">General</option>
              </select>
              
              <button type="submit" className="btn-primary px-6">
                <FaFilter className="inline mr-2" />
                Filter
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {materials.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No training materials found</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first training material.</p>
            <Link to="/add" className="btn-primary">
              <FaPlus className="inline mr-2" />
              Add Training Material
            </Link>
          </div>
        ) : (
          <>
            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {materials.map((material) => (
                <TrainingCard
                  key={material._id}
                  material={material}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <nav className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${
                          page === pagination.currentPage
                            ? 'bg-farmer-green-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TrainingHomePage;
