import React, { useState, useEffect } from 'react';
import { Star, Save, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DashboardFeedbackEdit = ({ isOpen, onClose, onUpdateSuccess, feedback, user }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    category: 'General',
    subject: '',
    message: '',
    rating: 0
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const categoryOptions = [
    'Product',
    'Service', 
    'Support',
    'Website',
    'General',
    'Bug Report',
    'Feature Request'
  ];

  // Load feedback data when modal opens
  useEffect(() => {
    if (isOpen && feedback) {
      setFormData({
        customerName: feedback.customerName || '',
        email: feedback.email || '',
        category: feedback.category || 'General',
        subject: feedback.subject || '',
        message: feedback.message || '',
        rating: feedback.rating || 0
      });
    }
  }, [isOpen, feedback]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsUpdating(true);
    
    try {
      const response = await axios.put(`http://localhost:3000/api/feedback/${feedback._id}`, formData);
      
      if (response.data.success) {
        toast.success('Feedback updated successfully!');
        onUpdateSuccess && onUpdateSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update feedback. Please try again.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      return (
        <Star
          key={index}
          size={24}
          className={`cursor-pointer transition-colors duration-200 ${
            starValue <= (hoveredRating || formData.rating)
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300 hover:text-yellow-200'
          }`}
          onClick={() => handleRatingClick(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
        />
      );
    });
  };

  // Check if feedback can be edited (within 7 days)
  const canEdit = feedback ? Math.floor((Date.now() - new Date(feedback.createdAt)) / (1000 * 60 * 60 * 24)) <= 7 : false;

  if (!isOpen || !feedback) return null;

  if (!canEdit) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Cannot Edit Feedback</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-600 mb-6">
            Feedback can only be edited within 7 days of submission. This feedback is too old to edit.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Feedback</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Edit Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="text-yellow-800">
              <strong>Note:</strong> Feedback can only be edited within 7 days of submission.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your email address"
                />
              </div>
            </div>

            {/* Category and Rating */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {categoryOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1">
                  {renderStars()}
                  <span className="ml-2 text-sm text-gray-600">
                    {formData.rating > 0 ? `${formData.rating} out of 5 stars` : 'Select rating'}
                  </span>
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                maxLength="200"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Brief description of your feedback"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                maxLength="2000"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Detailed description of your feedback"
              />
              <div className="text-right mt-1">
                <span className="text-sm text-gray-500">
                  {formData.message.length} / 2000 characters
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating || formData.rating === 0}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={16} />
                {isUpdating ? 'Updating...' : 'Update Feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardFeedbackEdit;
