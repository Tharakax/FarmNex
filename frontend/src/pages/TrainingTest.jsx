import React, { useState } from 'react';
import AddEditTrainingForm from '../components/training/components/AddEditTrainingForm';
import { trainingAPIReal } from '../services/trainingAPIReal';

const TrainingTest = () => {
  const [showForm, setShowForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (materialData, file) => {
    console.log('Test handleSave called with:', materialData, file);
    setIsLoading(true);
    
    try {
      const result = await trainingAPIReal.createTrainingMaterial(materialData, file);
      console.log('API result:', result);
      alert('Material created successfully!');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Training Form Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Fill out the form with valid data</li>
            <li>Check the browser console for debugging messages</li>
            <li>Click "Create Material" to test the submission</li>
            <li>Watch the console for detailed logging</li>
          </ol>
        </div>

        {!showForm && (
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Open Form Again
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

export default TrainingTest;