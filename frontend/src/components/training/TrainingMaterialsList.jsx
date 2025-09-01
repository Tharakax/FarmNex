import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Grid,
  List,
  Video,
  FileText,
  BookOpen,
  Download,
  Eye,
  Calendar,
  Tag,
  Star,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Edit2,
  Trash2,
  MoreVertical,
  AlertCircle,
  Plus
} from 'lucide-react';
import { trainingAPI } from '../../services/api';

// Card component
const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, materialTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Delete Training Material</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{materialTitle}"? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Material Card Component
const MaterialCard = ({ material, onViewMaterial, onEditMaterial, onDeleteMaterial, viewType = 'grid', readOnly = false }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Video className="h-5 w-5 text-red-600" />;
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'guide':
      case 'article':
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowDropdown(false);
    onEditMaterial(material);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowDropdown(false);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDeleteMaterial(material._id);
    setShowDeleteModal(false);
  };

  if (viewType === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {getTypeIcon(material.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-medium text-gray-900 truncate">
              {material.title}
            </h4>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {material.description}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(material.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {material.views} views
              </span>
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {material.createdBy}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(material.difficulty)}`}>
              {material.difficulty}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {material.category}
            </span>
            <button
              onClick={() => onViewMaterial(material)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              View
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow relative group">
        {/* Action Menu Button - only show if not read-only */}
        {!readOnly && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="p-1 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
              >
                <MoreVertical className="h-4 w-4 text-gray-600" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                  <button
                    onClick={handleEdit}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div onClick={() => onViewMaterial(material)} className="cursor-pointer">
          <div className="flex items-start justify-between mb-3 pr-8">
            <div className="flex items-center space-x-2">
              {getTypeIcon(material.type)}
              <span className="text-sm font-medium text-gray-600">{material.type}</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(material.difficulty)}`}>
              {material.difficulty}
            </span>
          </div>
          
          <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 pr-8">
            {material.title}
          </h4>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {material.description}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(material.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {material.views}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {material.category}
            </span>
            <div className="flex space-x-2">
              {material.tags?.slice(0, 2).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
      
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        materialTitle={material.title}
      />
    </>
  );
};

const TrainingMaterialsList = ({ onViewMaterial, onEditMaterial, onDeleteMaterial, readOnly = false }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState('grid');
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
    difficulty: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  // Fetch materials
  useEffect(() => {
    fetchMaterials();
  }, [filters, pagination.page]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 12,
        ...(filters.search && { search: filters.search }),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.difficulty !== 'all' && { difficulty: filters.difficulty })
      };

      const data = await trainingAPI.getAllMaterials(params);
      
      // Backend returns materials directly, not wrapped in success
      setMaterials(data.materials || []);
      setPagination(prev => ({
        ...prev,
        totalPages: data.totalPages || 1,
        total: data.total || 0
      }));
    } catch (error) {
      console.error('Error fetching materials:', error);
      // Fallback to empty state on error
      setMaterials([]);
      setPagination(prev => ({
        ...prev,
        totalPages: 1,
        total: 0
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Training Materials</h2>
          <p className="text-gray-600 mt-1">
            {pagination.total} materials available
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewType('grid')}
            className={`p-2 rounded-lg ${viewType === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewType('list')}
            className={`p-2 rounded-lg ${viewType === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="Video">Video</option>
            <option value="PDF">PDF</option>
            <option value="Article">Article</option>
            <option value="Guide">Guide</option>
            <option value="FAQ">FAQ</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Crop Management">Crop Management</option>
            <option value="Livestock">Livestock</option>
            <option value="Equipment">Equipment</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="General">General</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </Card>

      {/* Materials Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {viewType === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((material) => (
                <MaterialCard
                  key={material._id}
                  material={material}
                  onViewMaterial={onViewMaterial}
                  onEditMaterial={onEditMaterial}
                  onDeleteMaterial={onDeleteMaterial}
                  viewType="grid"
                  readOnly={readOnly}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {materials.map((material) => (
                <MaterialCard
                  key={material._id}
                  material={material}
                  onViewMaterial={onViewMaterial}
                  onEditMaterial={onEditMaterial}
                  onDeleteMaterial={onDeleteMaterial}
                  viewType="list"
                  readOnly={readOnly}
                />
              ))}
            </div>
          )}

          {materials.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            
            {/* Page numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      pageNum === pagination.page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingMaterialsList;
