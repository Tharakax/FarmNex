import React, { useState, useEffect } from 'react';
import { 
  AlertCircle,
  CheckCircle,
  Plus,
  ArrowLeft
} from 'lucide-react';

// Import components with error handling
import TrainingMaterialsList from './TrainingMaterialsList';
import ViewTrainingMaterial from './ViewTrainingMaterial';
import ErrorBoundary from './ErrorBoundary';
import { trainingAPI } from '../../services/api';

// Lazy load the AddEditTraining component
const AddEditTraining = React.lazy(() => import('../../pages/farmer/AddEditTraining'));


const TrainingManagement = () => {
  const [activeView, setActiveView] = useState('all-materials');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);


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

  const handleViewMaterial = (material) => {
    setSelectedMaterial(material);
    setActiveView('view-material');
  };

  const handleEditMaterial = (material) => {
    setSelectedMaterial(material);
    setActiveView('edit-material');
  };

  const handleAddMaterial = () => {
    setSelectedMaterial(null);
    setActiveView('add-material');
  };

  const handleSaveSuccess = (message) => {
    setSuccessMessage(message || 'Training material saved successfully!');
    setRefreshTrigger(prev => prev + 1);
    setActiveView('all-materials');
  };

  const handleDeleteMaterial = async (materialId) => {
    try {
      await trainingAPI.deleteMaterial(materialId);
      setSuccessMessage('Training material deleted successfully!');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting material:', error);
      setErrorMessage('Failed to delete training material. Please try again.');
    }
  };


  // Error Fallback Component
  const ErrorFallback = ({ error, componentName }) => (
    <div className="text-center py-8 bg-white rounded-lg shadow-md p-6">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Component Loading Error</h3>
      <p className="text-gray-500 mb-4">There was an error loading the {componentName} component.</p>
      <button
        onClick={() => setActiveView('all-materials')}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Back to Materials
      </button>
    </div>
  );

  const renderContent = () => {
    try {
      switch (activeView) {
        case 'view-material':
          return (
            <ErrorBoundary onGoBack={() => setActiveView('all-materials')}>
              <ViewTrainingMaterial 
                material={selectedMaterial} 
                onBack={() => setActiveView('all-materials')} 
              />
            </ErrorBoundary>
          );
        case 'add-material':
          return (
            <ErrorBoundary onGoBack={() => setActiveView('all-materials')}>
              <div>
                <div className="mb-6 flex items-center space-x-4">
                  <button
                    onClick={() => setActiveView('all-materials')}
                    className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Materials
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">Add Training Material</h2>
                </div>
                <React.Suspense 
                  fallback={
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  }
                >
                  <AddEditTraining 
                    onSaveSuccess={handleSaveSuccess}
                    onCancel={() => setActiveView('all-materials')}
                  />
                </React.Suspense>
              </div>
            </ErrorBoundary>
          );
        case 'edit-material':
          return (
            <ErrorBoundary onGoBack={() => setActiveView('all-materials')}>
              <div>
                <div className="mb-6 flex items-center space-x-4">
                  <button
                    onClick={() => setActiveView('all-materials')}
                    className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Materials
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">Edit Training Material</h2>
                </div>
                <React.Suspense 
                  fallback={
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  }
                >
                  <AddEditTraining 
                    materialToEdit={selectedMaterial}
                    onSaveSuccess={handleSaveSuccess}
                    onCancel={() => setActiveView('all-materials')}
                  />
                </React.Suspense>
              </div>
            </ErrorBoundary>
          );
        case 'all-materials':
        default:
          return (
            <div>
              {/* Header with Add Button */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Training Materials</h2>
                  <p className="text-gray-600 mt-1">Manage your training content</p>
                </div>
                <button
                  onClick={handleAddMaterial}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Material</span>
                </button>
              </div>
              <ErrorBoundary onGoBack={() => setActiveView('all-materials')}>
                <TrainingMaterialsList 
                  key={refreshTrigger}
                  onViewMaterial={handleViewMaterial}
                  onEditMaterial={handleEditMaterial}
                  onDeleteMaterial={handleDeleteMaterial}
                  readOnly={false}
                />
              </ErrorBoundary>
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering content:', error);
      return <ErrorFallback error={error} componentName="Training Component" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      
      {renderContent()}
    </div>
  );
};

export default TrainingManagement;
