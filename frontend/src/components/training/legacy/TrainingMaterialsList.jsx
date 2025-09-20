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
import { trainingAPIReal } from '../../services/trainingAPIReal';

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
                {material.createdBy === 'Admin' ? 'Administrator' : material.createdBy}
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

const TrainingMaterialsList = ({ materials = [], onViewMaterial, onEditMaterial, onDeleteMaterial, loading = false, readOnly = false }) => {
  const [viewType, setViewType] = useState('grid');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Training Materials</h2>
          <p className="text-gray-600 mt-1">
            {materials.length} materials available
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

      {/* Note: Search and filters could be added here in the future */}

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

      {/* Note: Pagination could be added here in the future */}
    </div>
  );
};

export default TrainingMaterialsList;
