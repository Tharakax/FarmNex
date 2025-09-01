import React from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

const FinancialReport = ({ dateRange }) => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="mb-4 p-6 bg-gray-100 rounded-full inline-block">
          <DollarSign className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Financial Report</h2>
        <p className="text-gray-600">Financial reporting functionality coming soon.</p>
        <p className="text-sm text-gray-500 mt-1">This will include revenue analysis, expense tracking, and profit margins.</p>
      </div>
    </div>
  );
};

export default FinancialReport;
