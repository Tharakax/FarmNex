import React, { useState, useEffect } from 'react';
import { Star, Plus, Eye, Edit, Trash2, Clock, MessageCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import moment from 'moment';
import DashboardFeedbackEdit from './DashboardFeedbackEdit';
import DashboardFeedbackView from './DashboardFeedbackView';

const DashboardFeedbackList = ({ user, onNewFeedback }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    pending: 0,
    resolved: 0
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Fetch user's feedback
  const fetchUserFeedback = async () => {
    try {
      setLoading(true);
      // Filter by user email since we don't have user ID yet
      const response = await axios.get('http://localhost:3000/api/feedback', {
        params: {
          search: user?.email || '',
          limit: 20,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });

      if (response.data.success) {
        // Filter to only show feedback from this user
        const userFeedback = response.data.data.filter(
          feedback => feedback.email === user?.email
        );
        setFeedbacks(userFeedback);
        
        // Calculate stats
        const total = userFeedback.length;
        const averageRating = total > 0 
          ? userFeedback.reduce((sum, f) => sum + f.rating, 0) / total
          : 0;
        const pending = userFeedback.filter(f => f.status === 'Open' || f.status === 'In Progress').length;
        const resolved = userFeedback.filter(f => f.status === 'Resolved' || f.status === 'Closed').length;
        
        setStats({ total, averageRating, pending, resolved });
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchUserFeedback();
    }
  }, [user?.email]);

  // Handle delete feedback
  const handleDelete = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:3000/api/feedback/${feedbackId}`);
      if (response.data.success) {
        toast.success('Feedback deleted successfully');
        fetchUserFeedback(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback. It may be too old to delete.');
    }
  };

  // Handle edit feedback
  const handleEdit = (feedback) => {
    setSelectedFeedback(feedback);
    setEditModalOpen(true);
  };

  // Handle edit modal close
  const handleEditClose = () => {
    setEditModalOpen(false);
    setSelectedFeedback(null);
  };

  // Handle edit success
  const handleEditSuccess = () => {
    fetchUserFeedback(); // Refresh the list
  };

  // Handle view feedback
  const handleView = (feedback) => {
    setSelectedFeedback(feedback);
    setViewModalOpen(true);
  };

  // Handle view modal close
  const handleViewClose = () => {
    setViewModalOpen(false);
    setSelectedFeedback(null);
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Render stars
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={14}
        className={index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  // Check if feedback can be edited/deleted (within 7 days)
  const canEditOrDelete = (feedback) => {
    const daysDifference = Math.floor((Date.now() - new Date(feedback.createdAt)) / (1000 * 60 * 60 * 24));
    return daysDifference <= 7;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Loading your feedback...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Feedback</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Average Rating</p>
              <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Resolved</p>
              <p className="text-2xl font-bold">{stats.resolved}</p>
            </div>
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header with New Feedback Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Your Feedback History</h3>
        <button
          onClick={onNewFeedback}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          New Feedback
        </button>
      </div>

      {/* Feedback List */}
      {feedbacks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
          <p className="text-gray-600 mb-4">Share your experience with us!</p>
          <button
            onClick={onNewFeedback}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
          >
            <Plus size={16} />
            Submit Your First Feedback
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <div key={feedback._id} className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {feedback.subject}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(feedback.priority)}`}>
                      {feedback.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                      {feedback.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {feedback.category}
                    </span>
                    <div className="flex items-center gap-1">
                      {renderStars(feedback.rating)}
                      <span className="ml-1">({feedback.rating}/5)</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3 line-clamp-2">
                    {feedback.message}
                  </p>

                  <div className="text-xs text-gray-500">
                    Submitted: {moment(feedback.createdAt).format('MMM DD, YYYY HH:mm')}
                    {feedback.updatedAt !== feedback.createdAt && (
                      <span className="ml-3">
                        Updated: {moment(feedback.updatedAt).format('MMM DD, YYYY HH:mm')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex lg:flex-col gap-2 lg:min-w-[100px]">
                  <button 
                    onClick={() => handleView(feedback)}
                    className="btn-secondary flex items-center gap-1 text-sm justify-center"
                  >
                    <Eye size={14} />
                    View
                  </button>

                  {canEditOrDelete(feedback) && (
                    <>
                      <button 
                        onClick={() => handleEdit(feedback)}
                        className="btn-secondary flex items-center gap-1 text-sm justify-center"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      
                      <button
                        onClick={() => handleDelete(feedback._id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg flex items-center gap-1 text-sm justify-center transition-colors"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {feedbacks.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          <p>Showing {feedbacks.length} feedback item{feedbacks.length !== 1 ? 's' : ''}</p>
          <p className="mt-1">
            💡 Tip: You can edit or delete feedback within 7 days of submission
          </p>
        </div>
      )}

      {/* View Feedback Modal */}
      <DashboardFeedbackView
        isOpen={viewModalOpen}
        onClose={handleViewClose}
        feedback={selectedFeedback}
      />

      {/* Edit Feedback Modal */}
      <DashboardFeedbackEdit
        isOpen={editModalOpen}
        onClose={handleEditClose}
        onUpdateSuccess={handleEditSuccess}
        feedback={selectedFeedback}
        user={user}
      />
    </div>
  );
};

export default DashboardFeedbackList;
