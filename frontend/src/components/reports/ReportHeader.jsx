import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';

const ReportHeader = ({ title, actions = null, className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <FontAwesomeIcon icon={faLeaf} className="text-green-600 text-xl" />
        </div>
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
