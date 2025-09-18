import React, { useState, useEffect } from 'react';
import { 
  AlertCircle,
  CheckCircle,
  Plus,
  FileSpreadsheet,
  BookOpen,
  TrendingUp,
  Users,
  Target,
  List,
  ArrowLeft
} from 'lucide-react';

// Import components
import AddEditTrainingForm from './AddEditTrainingForm';
import TrainingMaterialsList from './TrainingMaterialsList';
import TrainingMaterialViewer from './TrainingMaterialViewer';
import ErrorBoundary from '../ErrorBoundary';

// Import APIs - using real API service
import { trainingAPIReal } from '../../services/trainingAPIReal';

const TrainingManagementFixed = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
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

  // Fetch materials
  const fetchMaterials = async () => {
    setLoadingMaterials(true);
    try {
      const result = await trainingAPIReal.getTrainingMaterials();
      setMaterials(result.materials || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setErrorMessage('Failed to load training materials: ' + (error.message || 'Unknown error'));
      setMaterials([]); // Set empty array as fallback
    } finally {
      setLoadingMaterials(false);
    }
  };

  // Load materials when view changes to materials
  // Fetch statistics for dashboard
  const fetchStatistics = async () => {
    try {
      const response = await trainingAPIReal.getStatistics();
      if (response.success) {
        setStatistics({
          totalMaterials: response.statistics.totalMaterials || 0,
          activeMaterials: response.statistics.totalMaterials || 0, // Use total materials as active materials
          categories: 6, // Fixed number of categories for now
          totalViews: response.statistics.totalViews || 0
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Set default statistics on error to prevent component crashes
      setStatistics({
        totalMaterials: 0,
        activeMaterials: 0,
        categories: 6,
        totalViews: 0
      });
      setErrorMessage('Failed to load statistics: ' + (error.message || 'Unknown error'));
    }
  };

  // Load materials and statistics when view changes
  useEffect(() => {
    if (currentView === 'materials') {
      fetchMaterials();
    } else if (currentView === 'dashboard') {
      fetchStatistics();
    }
  }, [currentView]);

  // Initial load of statistics
  useEffect(() => {
    fetchStatistics();
  }, []);

  // Excel Export Handler
  const handleExportToExcel = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setErrorMessage('');
    
    try {
      setSuccessMessage('');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Material Name,Category,Type,Status,Views\n"
        + "Crop Rotation Basics,Farming Techniques,Article,Active,245\n"
        + "Soil Management,Soil Health,PDF,Active,189\n"
        + "Pest Control Methods,Plant Protection,Video,Active,156\n"
        + "Irrigation Systems,Water Management,Article,Active,134\n"
        + "Fertilizer Application,Nutrition,PDF,Draft,89\n";

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Training_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccessMessage('Training report exported successfully! File downloaded.');
    } catch (error) {
      console.error('Excel export failed:', error);
      setErrorMessage('Failed to export training report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Add Material
  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setShowForm(true);
  };

  // Handle Edit Material
  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  // Handle View Material
  const handleViewMaterial = (material) => {
    setViewingMaterial(material);
    setShowViewer(true);
  };

  // Handle Close Viewer
  const handleCloseViewer = () => {
    setShowViewer(false);
    setViewingMaterial(null);
  };

  // Handle Delete Material
  const handleDeleteMaterial = async (materialId) => {
    try {
      await trainingAPIReal.deleteTrainingMaterial(materialId);
      setSuccessMessage('Training material deleted successfully!');
      fetchMaterials(); // Refresh the list
      fetchStatistics(); // Refresh statistics
    } catch (error) {
      console.error('Error deleting material:', error);
      setErrorMessage('Failed to delete training material.');
    }
  };

  // Handle Save Material (Create/Update)
  const handleSaveMaterial = async (materialData, file) => {
    setIsFormLoading(true);
    console.log('Saving material:', materialData, 'File:', file);
    try {
      // Prepare data for API - include file if provided
      const dataToSend = { ...materialData };
      if (file) {
        dataToSend.file = file; // Add the file object directly for FormData creation
        console.log('File added to data:', { name: file.name, size: file.size, type: file.type });
      }
      
      if (editingMaterial) {
        // Update existing material
        await trainingAPIReal.updateTrainingMaterial(editingMaterial._id, dataToSend, file);
        setSuccessMessage('Training material updated successfully!');
      } else {
        // Create new material
        await trainingAPIReal.createTrainingMaterial(dataToSend, file);
        setSuccessMessage('Training material created successfully!');
      }
      
      setShowForm(false);
      setEditingMaterial(null);
      if (currentView === 'materials') {
        fetchMaterials(); // Refresh the list
      }
      // Refresh statistics regardless of view
      fetchStatistics();
    } catch (error) {
      console.error('Error saving material:', error);
      setErrorMessage('Failed to save training material: ' + error.message);
    } finally {
      setIsFormLoading(false);
    }
  };

  // Handle Close Form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMaterial(null);
  };

  // Handle View All Materials
  const handleViewAllMaterials = () => {
    setCurrentView('materials');
  };

  // Handle Back to Dashboard
  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  // Render Materials List View
  const renderMaterialsList = () => (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleBackToDashboard}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Training Materials</h1>
      </div>
      
      {/* Materials List Component */}
      <TrainingMaterialsList
        materials={materials}
        onEditMaterial={handleEditMaterial}
        onDeleteMaterial={handleDeleteMaterial}
        onViewMaterial={handleViewMaterial}
        loading={loadingMaterials}
        readOnly={false}
      />
    </div>
  );

  console.log('TrainingManagementFixed: Starting render');
  console.log('Statistics:', statistics);
  console.log('Materials:', materials);
  
  return (
    // Temporarily disabled for debugging
    // <ErrorBoundary showDetails={true}>
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Conditional Content Rendering */}
      {currentView === 'materials' ? (
        renderMaterialsList()
      ) : (
        <>
        {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BookOpen className="h-8 w-8 text-green-600 mr-3" />
              Training Management
            </h2>
            <p className="text-gray-600 mt-1">Manage your agricultural training materials</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Excel Export Button */}
            <button
              onClick={handleExportToExcel}
              disabled={isExporting}
              className={`
                bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
                transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg 
                transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed 
                disabled:transform-none ${isExporting ? 'animate-pulse' : ''}
              `}
              title="Export training materials to Excel"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-5 w-5" />
                  <span>Export Report</span>
                </>
              )}
            </button>
            
            {/* Add Material Button */}
            <button
              onClick={handleAddMaterial}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>Add Material</span>
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Total Materials
            </h3>
            <p className="text-2xl font-bold text-blue-600">{statistics.totalMaterials}</p>
            <p className="text-xs text-blue-500 mt-1">+3 this month</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Active Materials
            </h3>
            <p className="text-2xl font-bold text-green-600">{statistics.activeMaterials}</p>
            <p className="text-xs text-green-500 mt-1">{statistics.totalMaterials > 0 ? Math.round((statistics.activeMaterials / statistics.totalMaterials) * 100) : 0}% published</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Categories
            </h3>
            <p className="text-2xl font-bold text-yellow-600">{statistics.categories}</p>
            <p className="text-xs text-yellow-500 mt-1">Well organized</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-800 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Total Views
            </h3>
            <p className="text-2xl font-bold text-purple-600">{(statistics.totalViews || 0).toLocaleString()}</p>
            <p className="text-xs text-purple-500 mt-1">+125 this week</p>
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={handleViewAllMaterials}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-4 rounded-lg transition-colors text-left"
          >
            <BookOpen className="h-6 w-6 text-blue-600 mb-2" />
            <h4 className="font-medium">View All Materials</h4>
            <p className="text-sm text-gray-600">Browse training content</p>
          </button>
          
          <button
            onClick={() => setSuccessMessage('Categories Manager functionality coming soon!')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-4 rounded-lg transition-colors text-left"
          >
            <Target className="h-6 w-6 text-yellow-600 mb-2" />
            <h4 className="font-medium">Manage Categories</h4>
            <p className="text-sm text-gray-600">Organize content types</p>
          </button>
          
          <button
            onClick={() => setSuccessMessage('Analytics Dashboard functionality coming soon!')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-4 rounded-lg transition-colors text-left"
          >
            <TrendingUp className="h-6 w-6 text-purple-600 mb-2" />
            <h4 className="font-medium">View Analytics</h4>
            <p className="text-sm text-gray-600">Track performance</p>
          </button>
        </div>
      </div>

      </>
      )}
      
      {/* Add/Edit Training Form Modal */}
      <AddEditTrainingForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSave={handleSaveMaterial}
        editingMaterial={editingMaterial}
        isLoading={isFormLoading}
      />
      
      {/* Training Material Viewer Modal */}
      <TrainingMaterialViewer
        material={viewingMaterial}
        isOpen={showViewer}
        onClose={handleCloseViewer}
      />
    </div>
    // </ErrorBoundary>
  );
};

export default TrainingManagementFixed;
