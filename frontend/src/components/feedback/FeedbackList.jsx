import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Download, Plus, Eye, Edit, Trash2, Star } from 'lucide-react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import Modal from 'react-modal';
import { useFeedback, useDeleteFeedback, useExportFeedback } from '../hooks/useFeedback';
import LoadingSpinner from './LoadingSpinner';
import moment from 'moment';
import "react-datepicker/dist/react-datepicker.css";

// Set up modal
Modal.setAppElement('#root');

const FeedbackList = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    category: '',
    rating: '',
    status: '',
    priority: '',
    startDate: null,
    endDate: null,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, feedback: null });

  const { data, isLoading, error } = useFeedback(filters);
  const deleteMutation = useDeleteFeedback();
  const exportMutation = useExportFeedback();

  // Category options
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Product', label: 'Product' },
    { value: 'Service', label: 'Service' },
    { value: 'Support', label: 'Support' },
    { value: 'Website', label: 'Website' },
    { value: 'General', label: 'General' },
    { value: 'Bug Report', label: 'Bug Report' },
    { value: 'Feature Request', label: 'Feature Request' }
  ];

  // Rating options
  const ratingOptions = [
    { value: '', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' }
  ];

  // Status options
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Open', label: 'Open' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Closed', label: 'Closed' }
  ];

  // Priority options
  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'Critical', label: 'Critical' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
  ];

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, page: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Handle delete confirmation
  const handleDeleteClick = (feedback) => {
    setDeleteModal({ isOpen: true, feedback });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.feedback) {
      deleteMutation.mutate(deleteModal.feedback._id);
      setDeleteModal({ isOpen: false, feedback: null });
    }
  };

  // Handle export
  const handleExport = () => {
    const exportFilters = { ...filters };
    delete exportFilters.page;
    delete exportFilters.limit;
    exportMutation.mutate(exportFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      category: '',
      rating: '',
      status: '',
      priority: '',
      startDate: null,
      endDate: null,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
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
        size={16}
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
        <div className="text-red-600 mb-4">Error loading feedback</div>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Feedback Management</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={exportMutation.isLoading}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={16} />
            {exportMutation.isLoading ? 'Exporting...' : 'Export'}
          </button>
          <Link to="/submit" className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Submit Feedback
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search feedback..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center gap-2"
            >
              <Filter size={16} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            {(filters.category || filters.rating || filters.status || filters.priority || filters.startDate || filters.endDate) && (
              <button onClick={clearFilters} className="text-red-600 hover:text-red-800">
                Clear Filters
              </button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="form-label">Category</label>
                <Select
                  value={categoryOptions.find(opt => opt.value === filters.category)}
                  onChange={(option) => handleFilterChange('category', option.value)}
                  options={categoryOptions}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              <div>
                <label className="form-label">Rating</label>
                <Select
                  value={ratingOptions.find(opt => opt.value === filters.rating)}
                  onChange={(option) => handleFilterChange('rating', option.value)}
                  options={ratingOptions}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              <div>
                <label className="form-label">Status</label>
                <Select
                  value={statusOptions.find(opt => opt.value === filters.status)}
                  onChange={(option) => handleFilterChange('status', option.value)}
                  options={statusOptions}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              <div>
                <label className="form-label">Priority</label>
                <Select
                  value={priorityOptions.find(opt => opt.value === filters.priority)}
                  onChange={(option) => handleFilterChange('priority', option.value)}
                  options={priorityOptions}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              <div>
                <label className="form-label">Start Date</label>
                <DatePicker
                  selected={filters.startDate}
                  onChange={(date) => handleFilterChange('startDate', date)}
                  className="input-field"
                  placeholderText="Select start date"
                  dateFormat="yyyy-MM-dd"
                />
              </div>

              <div>
                <label className="form-label">End Date</label>
                <DatePicker
                  selected={filters.endDate}
                  onChange={(date) => handleFilterChange('endDate', date)}
                  className="input-field"
                  placeholderText="Select end date"
                  dateFormat="yyyy-MM-dd"
                  minDate={filters.startDate}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {data?.data?.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">No feedback found</div>
            <Link to="/submit" className="btn-primary">
              Submit First Feedback
            </Link>
          </div>
        ) : (
          data?.data?.map((feedback) => (
            <div key={feedback._id} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {feedback.subject}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(feedback.priority)}`}>
                      {feedback.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                      {feedback.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span>{feedback.customerName}</span>
                    <span>{feedback.email}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {feedback.category}
                    </span>
                    <div className="flex items-center gap-1">
                      {renderStars(feedback.rating)}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-2 line-clamp-2">
                    {feedback.message}
                  </p>

                  <div className="text-xs text-gray-500">
                    Created: {moment(feedback.createdAt).format('MMM DD, YYYY HH:mm')}
                    {feedback.updatedAt !== feedback.createdAt && (
                      <span className="ml-2">
                        Updated: {moment(feedback.updatedAt).format('MMM DD, YYYY HH:mm')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex lg:flex-col gap-2">
                  <Link
                    to={`/feedback/${feedback._id}`}
                    className="btn-secondary flex items-center gap-1 text-sm"
                  >
                    <Eye size={14} />
                    View
                  </Link>

                  {canEditOrDelete(feedback) && (
                    <>
                      <Link
                        to={`/update/${feedback._id}`}
                        className="btn-secondary flex items-center gap-1 text-sm"
                      >
                        <Edit size={14} />
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDeleteClick(feedback)}
                        className="btn-danger flex items-center gap-1 text-sm"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(data.pagination.currentPage - 1)}
            disabled={!data.pagination.hasPrevPage}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-1">
            {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === data.pagination.totalPages || 
                Math.abs(page - data.pagination.currentPage) <= 2
              )
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2 py-1">...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded ${
                      page === data.pagination.currentPage
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
          </div>

          <button
            onClick={() => handlePageChange(data.pagination.currentPage + 1)}
            disabled={!data.pagination.hasNextPage}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onRequestClose={() => setDeleteModal({ isOpen: false, feedback: null })}
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
          {deleteModal.feedback && (
            <div className="bg-gray-50 p-3 rounded mb-6">
              <p className="font-medium">{deleteModal.feedback.subject}</p>
              <p className="text-sm text-gray-600">{deleteModal.feedback.customerName}</p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteModal({ isOpen: false, feedback: null })}
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

export default FeedbackList;
