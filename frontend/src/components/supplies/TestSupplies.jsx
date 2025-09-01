import React from 'react';

const TestSupplies = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Test Supplies Component
      </h1>
      <p className="text-gray-600 mb-4">
        This is a simple test to verify the supplies menu is working.
      </p>
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Supplies Management
        </h2>
        <p className="text-gray-600">
          If you can see this, the supplies menu navigation is working correctly.
        </p>
      </div>
    </div>
  );
};

export default TestSupplies;
