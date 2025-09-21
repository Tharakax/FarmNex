import React, { useState, useEffect } from 'react';
import { 
  AlertCircle,
  CheckCircle,
  Plus,
  FileSpreadsheet,
  FileText,
  BookOpen,
  TrendingUp,
  Users,
  Target,
  List,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Video,
  Image,
  Upload,
  X,
  Save,
  Loader,
  BarChart3,
  Calendar,
  Download
} from 'lucide-react';
import Swal from 'sweetalert2';
import { parseAndCleanTags } from '../../../utils/tagUtils';
import TrainingViewer from '../components/TrainingViewer';
import AddEditTrainingForm from '../components/AddEditTrainingForm';
import { getFileUrl } from '../../../config/env';

/**
 * Training Management Component
 * Provides comprehensive admin interface for training content management
 */
const TrainingManagement = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  // State for different views and operations
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, materials, form
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    totalMaterials: 0,
    activeMaterials: 0,
    categories: 0,
    totalViews: 0
  });
  const [viewingMaterial, setViewingMaterial] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Article',
    content: '',
    tags: [],
    difficulty: 'Beginner',
    category: 'General',
    status: 'published'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [tagInput, setTagInput] = useState('');

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredMaterials, setFilteredMaterials] = useState([]);

  // Success/Error message auto-hide
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  // Filter materials based on search and filters
  useEffect(() => {
    let filtered = materials;

    if (searchQuery) {
      filtered = filtered.filter(material =>
        material.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(material => material.type === selectedType);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(material => material.category === selectedCategory);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(material => material.status === statusFilter);
    }

    setFilteredMaterials(filtered);
  }, [materials, searchQuery, selectedType, selectedCategory, statusFilter]);

  // API Functions
  const fetchMaterials = async () => {
    setLoadingMaterials(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/training?limit=50', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load materials: ${response.status}`);
      }
      
      const data = await response.json();
      setMaterials(data.materials || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setErrorMessage('Failed to load training materials: ' + error.message);
      setMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/training/statistics', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      
      let statsData = { totalMaterials: 0, totalViews: 0 };
      if (response.ok) {
        statsData = await response.json();
      }
      
      setStatistics({
        totalMaterials: statsData.totalMaterials || 0,
        activeMaterials: statsData.totalMaterials || 0,
        categories: 6,
        totalViews: statsData.totalViews || 0
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStatistics({
        totalMaterials: 0,
        activeMaterials: 0,
        categories: 6,
        totalViews: 0
      });
    }
  };

  const deleteMaterial = async (id) => {
    try {
      const result = await Swal.fire({
        title: '🗑️ Delete Training Material?',
        text: 'This action cannot be undone. Are you sure you want to delete this training material?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '🗑️ Yes, Delete it!',
        cancelButtonText: '❌ Cancel',
        reverseButtons: true,
        background: '#ffffff',
        customClass: {
          popup: 'rounded-lg shadow-xl',
          title: 'text-xl font-bold text-gray-900',
          content: 'text-gray-700',
          confirmButton: 'rounded-lg px-6 py-2 font-semibold transition-all duration-200 hover:shadow-lg',
          cancelButton: 'rounded-lg px-6 py-2 font-semibold transition-all duration-200 hover:shadow-lg'
        },
        showClass: {
          popup: 'animate__animated animate__fadeIn animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOut animate__faster'
        }
      });

      if (!result.isConfirmed) {
        return;
      }

      // Show loading alert
      Swal.fire({
        title: '🔄 Deleting...',
        text: 'Please wait while we delete the training material.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/training/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (response.ok) {
        // Show success alert
        await Swal.fire({
          title: '✅ Deleted Successfully!',
          text: 'The training material has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#059669',
          confirmButtonText: '👍 Great!',
          background: '#ffffff',
          customClass: {
            popup: 'rounded-lg shadow-xl',
            title: 'text-xl font-bold text-green-700',
            content: 'text-gray-700',
            confirmButton: 'rounded-lg px-6 py-2 font-semibold transition-all duration-200 hover:shadow-lg'
          },
          timer: 3000,
          timerProgressBar: true
        });
        
        setSuccessMessage('Training material deleted successfully');
        fetchMaterials();
        fetchStatistics();
      } else {
        throw new Error('Failed to delete training material');
      }
    } catch (error) {
      console.error('Delete error:', error);
      
      // Show error alert
      await Swal.fire({
        title: '❌ Delete Failed!',
        text: `Error: ${error.message || 'Failed to delete training material'}`,
        icon: 'error',
        confirmButtonColor: '#dc2626',
        confirmButtonText: '🔄 Try Again',
        background: '#ffffff',
        customClass: {
          popup: 'rounded-lg shadow-xl',
          title: 'text-xl font-bold text-red-700',
          content: 'text-gray-700',
          confirmButton: 'rounded-lg px-6 py-2 font-semibold transition-all duration-200 hover:shadow-lg'
        }
      });
      
      setErrorMessage('Error deleting training material: ' + error.message);
    }
  };

  // Load data when view changes
  useEffect(() => {
    if (currentView === 'materials') {
      fetchMaterials();
    } else if (currentView === 'dashboard') {
      fetchStatistics();
    }
  }, [currentView]);

  // Initial load
  useEffect(() => {
    fetchStatistics();
  }, []);

  // Excel Export Handler
  const handleExportToExcel = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/training', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      
      let exportMaterials = [];
      if (response.ok) {
        const data = await response.json();
        exportMaterials = data.materials || [];
      }

      const csvRows = [
        ['Training Materials Export', `Generated on: ${new Date().toLocaleDateString()}`],
        [],
        ['Title', 'Description', 'Category', 'Type', 'Difficulty', 'Status', 'Views', 'Created Date', 'Created By'],
        ...exportMaterials.map(material => [
          `"${(material.title || '').replace(/"/g, '""')}"`,
          `"${(material.description || '').replace(/"/g, '""')}"`,
          material.category || 'Uncategorized',
          material.type || 'Unknown',
          material.difficulty || 'Unknown', 
          material.status || 'Unknown',
          material.views || 0,
          material.createdAt ? new Date(material.createdAt).toLocaleDateString() : 'Unknown',
          `"${(material.createdBy || '').replace(/"/g, '""')}"`
        ]),
        [],
        ['Summary Statistics'],
        ['Total Materials', exportMaterials.length],
        ['Total Views', exportMaterials.reduce((sum, m) => sum + (m.views || 0), 0)]
      ];

      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Training_Materials_Export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);

      setSuccessMessage('Training materials exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      setErrorMessage('Failed to export training materials: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  // View handlers
  const handleViewMaterial = (material) => {
    setViewingMaterial(material);
    setShowViewer(true);
  };

  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title || '',
      description: material.description || '',
      type: material.type || 'Article',
      content: material.content || '',
      tags: material.tags || [],
      difficulty: material.difficulty || 'Beginner',
      category: material.category || 'General',
      status: material.status || 'published'
    });
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setEditingMaterial(null);
    setFormData({
      title: '',
      description: '',
      type: 'Article',
      content: '',
      tags: [],
      difficulty: 'Beginner',
      category: 'General',
      status: 'published'
    });
    setSelectedFile(null);
    setShowForm(true);
  };

  const handleSaveMaterial = async (materialData, file) => {
    setIsFormLoading(true);
    try {
      const formData = new FormData();
      
      // Append all text fields
      Object.keys(materialData).forEach(key => {
        if (materialData[key] !== undefined && materialData[key] !== null) {
          // Handle arrays (like tags) properly
          if (Array.isArray(materialData[key])) {
            formData.append(key, materialData[key].join(','));
          } else {
            formData.append(key, materialData[key]);
          }
        }
      });

      // Append file if provided
      if (file) {
        formData.append('file', file);
      }

      const token = localStorage.getItem('token');
      const url = editingMaterial 
        ? `http://localhost:3000/api/training/${editingMaterial._id}`
        : 'http://localhost:3000/api/training';
      const method = editingMaterial ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save material');
      }

      const result = await response.json();
      
      setSuccessMessage(
        editingMaterial 
          ? 'Training material updated successfully!' 
          : 'Training material created successfully!'
      );
      
      setShowForm(false);
      setEditingMaterial(null);
      
      // Reload data
      if (currentView === 'materials') {
        fetchMaterials();
      }
      fetchStatistics();
      
    } catch (error) {
      console.error('Save error:', error);
      setErrorMessage('Failed to save material: ' + error.message);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMaterial(null);
    setSelectedFile(null);
  };

  // Render functions
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Materials</p>
              <p className="text-3xl font-bold">{statistics.totalMaterials}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Materials</p>
              <p className="text-3xl font-bold">{statistics.activeMaterials}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Categories</p>
              <p className="text-3xl font-bold">{statistics.categories}</p>
            </div>
            <Target className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Total Views</p>
              <p className="text-3xl font-bold">{statistics.totalViews}</p>
            </div>
            <Eye className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleCreateNew}
            className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-dashed border-blue-300 transition-colors"
          >
            <Plus className="h-6 w-6 text-blue-600 mr-2" />
            <span className="font-medium text-blue-600">Create New Material</span>
          </button>

          <button
            onClick={() => setCurrentView('materials')}
            className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg border-2 border-dashed border-green-300 transition-colors"
          >
            <List className="h-6 w-6 text-green-600 mr-2" />
            <span className="font-medium text-green-600">View All Materials</span>
          </button>

          <button
            onClick={handleExportToExcel}
            disabled={isExporting}
            className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border-2 border-dashed border-purple-300 transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <Loader className="h-6 w-6 text-purple-600 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-6 w-6 text-purple-600 mr-2" />
            )}
            <span className="font-medium text-purple-600">Export to Excel</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8">
          <div className="text-gray-500">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recent activity to display</p>
            <p className="text-sm text-gray-500 mt-2">Activity will appear here as you create and manage training materials</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMaterialsList = () => (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Training Materials</h2>
          <button
            onClick={handleCreateNew}
            className="mt-4 lg:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Material
          </button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="Article">Articles</option>
            <option value="Video">Videos</option>
            <option value="PDF">PDFs</option>
            <option value="Guide">Guides</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="General">General</option>
            <option value="Crop Management">Crop Management</option>
            <option value="Livestock">Livestock</option>
            <option value="Equipment">Equipment</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="published">✅ Published</option>
            <option value="draft">📝 Draft</option>
            <option value="archived">📋 Archived</option>
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingMaterials ? (
          <div className="col-span-full text-center py-12">
            <Loader className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading training materials...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No training materials found</p>
          </div>
        ) : (
          filteredMaterials.map((material) => (
            <div key={material._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {material.type === 'Video' && <Video className="h-5 w-5 text-red-600 mr-2" />}
                    {material.type === 'PDF' && <FileText className="h-5 w-5 text-red-600 mr-2" />}
                    {material.type === 'Article' && <BookOpen className="h-5 w-5 text-blue-600 mr-2" />}
                    {material.type === 'Guide' && <BookOpen className="h-5 w-5 text-green-600 mr-2" />}
                    <span className="text-sm font-medium text-gray-600">{material.type}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {material.views || 0} views
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {material.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {material.description}
                </p>

                <div className="flex items-center justify-between text-xs mb-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{material.category}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{material.difficulty}</span>
                </div>
                
                {/* File and Status Info */}
                <div className="flex items-center justify-between text-xs mb-4">
                  <div className="flex items-center text-gray-500">
                    {material.uploadLink || material.fileName ? (
                      <>
                        <Upload className="h-3 w-3 mr-1" />
                        <span>
                          File: {material.fileName || material.uploadLink?.split('/').pop() || 'Uploaded'}
                          {material.fileSize > 0 && (
                            <span className="ml-1 text-gray-400">({(material.fileSize / 1024 / 1024).toFixed(1)}MB)</span>
                          )}
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        <span>No file</span>
                      </>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    material.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : material.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {material.status === 'published' ? '✅ Published' : material.status === 'draft' ? '📝 Draft' : material.status || 'Unknown'}
                  </span>
                </div>

                <div className="space-y-2">
                  {/* First row - View File button (if file exists) */}
                  {(material.uploadLink || material.fileName) && (
                    <a
                      href={getFileUrl(material.uploadLink, material.fileName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-purple-50 text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium flex items-center justify-center"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      View File
                    </a>
                  )}
                  
                  {/* Second row - Action buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewMaterial(material)}
                      className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4 inline mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleEditMaterial(material)}
                      className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                    >
                      <Edit className="h-4 w-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMaterial(material._id)}
                      className="bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Training Management</h1>
              <nav className="hidden md:flex space-x-1">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 inline mr-1" />
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('materials')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'materials'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BookOpen className="h-4 w-4 inline mr-1" />
                  Materials
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800">{successMessage}</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'materials' && renderMaterialsList()}
      </div>

      {/* Material Viewer Modal */}
      {showViewer && viewingMaterial && (
        <TrainingViewer
          material={viewingMaterial}
          isOpen={showViewer}
          onClose={() => {
            setShowViewer(false);
            setViewingMaterial(null);
          }}
        />
      )}

      {/* Add/Edit Training Form Modal */}
      <AddEditTrainingForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSave={handleSaveMaterial}
        editingMaterial={editingMaterial}
        isLoading={isFormLoading}
      />
    </div>
  );
};

export default TrainingManagement;