import React from 'react';
import { Star, X, Clock, User, Mail, Tag } from 'lucide-react';
import moment from 'moment';

const DashboardFeedbackView = ({ isOpen, onClose, feedback }) => {
  if (!isOpen || !feedback) return null;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Feedback Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Feedback Info */}
          <div className="space-y-6">
            {/* Subject and Badges */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feedback.subject}
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(feedback.priority)}`}>
                  {feedback.priority} Priority
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(feedback.status)}`}>
                  {feedback.status}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  {feedback.category}
                </span>
              </div>
            </div>

            {/* Rating */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Rating:</span>
                <div className="flex items-center gap-1">
                  {renderStars(feedback.rating)}
                  <span className="text-sm font-medium text-gray-900 ml-1">
                    {feedback.rating} out of 5 stars
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Customer Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-blue-600" />
                  <span className="text-sm text-gray-900">{feedback.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-blue-600" />
                  <span className="text-sm text-gray-900">{feedback.email}</span>
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Feedback Message</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {feedback.message}
                </p>
              </div>
            </div>

            {/* Response (if exists) */}
            {feedback.response && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Admin Response</h4>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {feedback.response}
                  </p>
                  {feedback.respondedBy && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-sm text-green-700">
                        Response by: <strong>{feedback.respondedBy}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Submission Details</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>Submitted: {moment(feedback.createdAt).format('MMMM DD, YYYY [at] h:mm A')}</span>
                </div>
                {feedback.updatedAt !== feedback.createdAt && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>Last Updated: {moment(feedback.updatedAt).format('MMMM DD, YYYY [at] h:mm A')}</span>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Feedback ID: {feedback._id}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFeedbackView;
