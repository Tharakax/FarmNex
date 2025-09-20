import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash, FaCalendar, FaUser, FaVideo, FaBook, FaFileAlt, FaFilePdf, FaQuestionCircle } from 'react-icons/fa';

const TrainingCard = ({ material, onDelete }) => {
  // Get icon based on material type
  const getTypeIcon = (type) => {
    const icons = {
      'Video': <FaVideo className="text-purple-600" />,
      'Guide': <FaBook className="text-blue-600" />,
      'Article': <FaFileAlt className="text-green-600" />,
      'PDF': <FaFilePdf className="text-red-600" />,
      'FAQ': <FaQuestionCircle className="text-orange-600" />
    };
    return icons[type] || <FaFileAlt className="text-gray-600" />;
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Beginner': 'bg-green-100 text-green-800',
      'Intermediate': 'bg-yellow-100 text-yellow-800',
      'Advanced': 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Crop Management': 'bg-farmer-green-100 text-farmer-green-800',
      'Livestock': 'bg-earth-brown-100 text-earth-brown-800',
      'Equipment': 'bg-blue-100 text-blue-800',
      'Finance': 'bg-purple-100 text-purple-800',
      'Marketing': 'bg-pink-100 text-pink-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden">
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getTypeIcon(material.type)}
            <span className="text-sm font-medium text-gray-600">{material.type}</span>
          </div>
          <div className="flex space-x-2">
            <Link
              to={`/edit/${material._id}`}
              className="text-blue-500 hover:text-blue-700 transition-colors p-1"
              title="Edit"
            >
              <FaEdit className="text-sm" />
            </Link>
            <button
              onClick={() => onDelete(material._id, material.title)}
              className="text-red-500 hover:text-red-700 transition-colors p-1"
              title="Delete"
            >
              <FaTrash className="text-sm" />
            </button>
          </div>
        </div>

        <Link to={`/view/${material._id}`} className="block group">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-farmer-green-600 transition-colors mb-2 line-clamp-2">
            {material.title}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {material.description}
        </p>

        {/* Tags */}
        {material.tags && material.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {material.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
            {material.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{material.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(material.difficulty)}`}>
            {material.difficulty}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(material.category)}`}>
            {material.category}
          </span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <FaEye className="text-xs" />
              <span>{material.views || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FaUser className="text-xs" />
              <span className="truncate max-w-20" title={material.createdBy === 'Admin' ? 'Administrator' : material.createdBy}>
                {material.createdBy === 'Admin' ? 'Administrator' : material.createdBy}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <FaCalendar className="text-xs" />
            <span>{formatDate(material.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* View Button */}
      <div className="px-6 pb-6">
        <Link
          to={`/view/${material._id}`}
          className="block w-full text-center bg-farmer-green-500 hover:bg-farmer-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default TrainingCard;
