import React from 'react';
import TrainingNavSection from './TrainingNavSection';
import TrainingQuickAccess from './TrainingQuickAccess';

/**
 * TrainingIntegration - Example component showing how to integrate training components
 * 
 * This file demonstrates how to use the newly created training components:
 * 
 * 1. TrainingNavSection - A full section component for homepage integration
 * 2. TrainingQuickAccess - A dropdown navigation component for navbar
 * 3. TrainingShowcase - A dedicated page component (available at /training-showcase)
 * 
 * INTEGRATION INSTRUCTIONS:
 * 
 * For Homepage Integration:
 * - Import TrainingNavSection and place it between any existing sections
 * - Example: <TrainingNavSection />
 * 
 * For Navbar Enhancement:
 * - Replace the existing Training link in navigation.jsx with TrainingQuickAccess
 * - Example: <TrainingQuickAccess />
 * 
 * For Dedicated Training Page:
 * - Add route in App.jsx: <Route path="/training-showcase" element={<TrainingShowcase />} />
 * - Import: const TrainingShowcase = React.lazy(() => import('./pages/TrainingShowcase.jsx'))
 */

const TrainingIntegration = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Example: How to use TrainingNavSection in any page */}
      <TrainingNavSection />
      
      {/* Example: How to use TrainingQuickAccess (typically in navbar) */}
      <div className="p-8 bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Training Quick Access (for Navbar):</h3>
        <TrainingQuickAccess />
      </div>
    </div>
  );
};

export default TrainingIntegration;
