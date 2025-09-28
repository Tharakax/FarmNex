import React from 'react';
import BrandLogo from '../../components/BrandLogo.jsx';

const ReportHeader = ({ title, actions = null, className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8 ${className}`}>
      <div className="flex items-center gap-3">
        <BrandLogo size={28} />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">FarmNex</h2>
      </div>
      <div className="flex-1"></div>
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
        {actions}
      </div>
    </div>
  );
};

export default ReportHeader;
