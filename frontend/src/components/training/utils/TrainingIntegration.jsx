import React from 'react';
import TrainingNavSection from './TrainingNavSection';
import TrainingQuickAccess from './TrainingQuickAccess';


const TrainingIntegration = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TrainingNavSection />
      
  
      <div className="p-8 bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Training Quick Access (for Navbar):</h3>
        <TrainingQuickAccess />
      </div>
    </div>
  );
};

export default TrainingIntegration;
