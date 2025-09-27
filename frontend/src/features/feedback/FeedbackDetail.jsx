import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Star, Calendar, User, Mail, Tag } from 'lucide-react';
import Modal from 'react-modal';
import { useFeedbackById, useDeleteFeedback } from '../hooks/useFeedback';
import LoadingSpinner from './LoadingSpinner';
import moment from 'moment';

const FeedbackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false });

  const { data, isLoading, error } = useFeedbackById(id);
  const deleteMutation = useDeleteFeedback();

  // Handle delete confirmation
  const handleDeleteClick = () => {
    setDeleteModal({ isOpen: true });
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        navigate('/');
      }
    });
    setDeleteModal({ isOpen: false });
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

  // Render stars
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={20}
        className={index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  // Check if feedback can be edited/deleted
  const canEditOrDelete = (feedback) => {
    const daysDifference = Math.floor((Date.now() - new Date(feedback.createdAt)) / (1000 * 60 * 60 * 24));
    return daysDifference <= 7;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Error loading feedback details</div>
        <Link to="/" className="btn-primary">
          Back to List
        </Link>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 mb-4">Feedback not found</div>
        <Link to="/" className="btn-primary">
          Back to List
        </Link>
      </div>
    );
  }

  const feedback = data.data;
  const editable = canEditOrDelete(feedback);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="btn-secondary flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to List
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Feedback Details</h2>
        </div>

        {editable && (
          <div className="flex gap-2">
            <Link
              to={`/update/${feedback._id}`}
              className="btn-secondary flex items-center gap-2"
            >
              <Edit size={16} />
              Edit
            </Link>
            <button
              onClick={handleDeleteClick}
              className="btn-danger flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Edit/Delete Restriction Notice */}
      {!editable && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="text-gray-700">
            <strong>Note:</strong> This feedback can no longer be edited or deleted as it was submitted more than 7 days ago.
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Main Feedback Card */}
        <div className="card">
          {/* Header with Status and Priority */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(feedback.status)}`}>
              {feedback.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(feedback.priority)}`}>
              {feedback.priority} Priority
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm border border-gray-200">
              {feedback.category}
            </span>
          </div>

          {/* Subject */}
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {feedback.subject}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-medium text-gray-700">Rating:</span>
            <div className="flex items-center gap-1">
              {renderStars(feedback.rating)}
            </div>
            <span className="text-sm text-gray-600">
              ({feedback.rating} out of 5 stars)
            </span>
          </div>

          {/* Message */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Message</h4>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {feedback.message}
              </p>
            </div>
          </div>

          {/* Tags */}
          {feedback.tags && feedback.tags.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag size={18} />
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {feedback.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 border border-primary-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Customer Information */}
        <div className="card">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <User className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-600">Customer Name</p>
                <p className="font-medium text-gray-900">{feedback.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-600">Email Address</p>
                <p className="font-medium text-gray-900">{feedback.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="card">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium text-gray-900">
                  {moment(feedback.createdAt).format('MMMM DD, YYYY at HH:mm')}
                </p>
                <p className="text-xs text-gray-500">
                  ({moment(feedback.createdAt).fromNow()})
                </p>
              </div>
            </div>

            {feedback.updatedAt !== feedback.createdAt && (
              <div className="flex items-center gap-3">
                <Calendar className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium text-gray-900">
                    {moment(feedback.updatedAt).format('MMMM DD, YYYY at HH:mm')}
                  </p>
                  <p className="text-xs text-gray-500">
                    ({moment(feedback.updatedAt).fromNow()})
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Edit/Delete deadline */}
          {editable && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Reminder:</strong> You can edit or delete this feedback until{' '}
                {moment(feedback.createdAt).add(7, 'days').format('MMMM DD, YYYY at HH:mm')}.
              </p>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="card">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Feedback ID:</span>
              <span className="ml-2 font-mono text-gray-900">{feedback._id}</span>
            </div>
            <div>
              <span className="text-gray-600">Can Edit:</span>
              <span className={`ml-2 font-medium ${editable ? 'text-green-600' : 'text-red-600'}`}>
                {editable ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onRequestClose={() => setDeleteModal({ isOpen: false })}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Confirm Delete
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this feedback? This action cannot be undone.
          </p>
          <div className="bg-gray-50 p-3 rounded mb-6">
            <p className="font-medium">{feedback.subject}</p>
            <p className="text-sm text-gray-600">{feedback.customerName}</p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteModal({ isOpen: false })}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isLoading}
              className="btn-danger"
            >
              {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FeedbackDetail;
