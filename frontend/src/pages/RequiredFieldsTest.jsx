import React, { useState } from 'react';
import AddEditTrainingForm from '../components/training/components/AddEditTrainingForm';

const RequiredFieldsTest = () => {
  const [showForm, setShowForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (materialData, file) => {
    console.log('Test handleSave called with:', materialData, file);
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Simulated API success');
      alert('✅ All validations passed! Material would be created successfully!');
      setShowForm(false);
    } catch (error) {
      console.error('API error:', error);
      alert('Failed to create material: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 Required Fields Validation Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">✅ Test All Required Fields:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Required Fields (with * asterisk):</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• <strong>Title</strong> (5-100 chars)</li>
                <li>• <strong>Description</strong> (20-1000 chars)</li>
                <li>• <strong>Category</strong> (dropdown)</li>
                <li>• <strong>Content Type</strong> (buttons)</li>
                <li>• <strong>Difficulty Level</strong> (buttons)</li>
                <li>• <strong>Tags</strong> (comma-separated, min 1)</li>
                <li>• <strong>Status</strong> (dropdown)</li>
                <li>• <strong>Content</strong> (for Articles, 50+ chars)</li>
                <li>• <strong>File</strong> (REQUIRED for ALL content types)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">SweetAlert Test Instructions:</h3>
              <ol className="space-y-1 text-gray-700 list-decimal list-inside">
                <li>Try to submit without file → See "File Required" SweetAlert</li>
                <li>Try to submit empty form → See comprehensive error SweetAlert</li>
                <li>Upload a file → See success toast with file details</li>
                <li>Change content type with file selected → See compatibility warning</li>
                <li>Try to remove file → See removal confirmation</li>
                <li>Try to close with changes → See unsaved changes warning</li>
                <li>Fill all fields + file → Submit successfully</li>
              </ol>
            </div>
          </div>
        </div>

        {!showForm && (
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              🔄 Open Form Again
            </button>
          </div>
        )}
        
        <AddEditTrainingForm
          isOpen={showForm}
          onClose={handleClose}
          onSave={handleSave}
          editingMaterial={null}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default RequiredFieldsTest;