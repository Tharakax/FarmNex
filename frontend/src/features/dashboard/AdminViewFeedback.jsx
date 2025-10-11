import React, { useState, useEffect } from 'react';
import { Star, Eye, Trash2, CheckCircle, XCircle, Search, Filter, ArrowLeft } from 'lucide-react';

const AdminViewFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0
  });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchAllFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/feedback?limit=100&sortBy=createdAt&sortOrder=desc');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setFeedbacks(data.data);
        const total = data.data.length;
        const approved = data.data.filter(f => f.isApproved === true).length;
        const pending = data.data.filter(f => f.isApproved !== true).length;
        setStats({ total, approved, pending });
      } else {
        throw new Error(data.message || 'Failed to fetch feedbacks');
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      alert('Failed to load feedbacks: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFeedbacks();
  }, []);

  const handleToggleApproval = async (feedbackId, currentStatus) => {
    try {
      console.log('Toggling approval:', feedbackId, 'Current status:', currentStatus);
      
      const response = await fetch(`http://localhost:3000/api/feedback/${feedbackId}/approve`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ isApproved: !currentStatus })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Toggle approval response:', data);
      
      if (data.success) {
        alert(`Feedback ${!currentStatus ? 'approved' : 'unapproved'} successfully!`);
        
        // Update the specific feedback in state immediately
        setFeedbacks(prevFeedbacks => 
          prevFeedbacks.map(feedback => 
            feedback._id === feedbackId 
              ? { ...feedback, isApproved: !currentStatus }
              : feedback
          )
        );
        
        // Update stats immediately
        setStats(prevStats => {
          const newApproved = !currentStatus ? prevStats.approved + 1 : prevStats.approved - 1;
          const newPending = !currentStatus ? prevStats.pending - 1 : prevStats.pending + 1;
          
          return {
            ...prevStats,
            approved: newApproved,
            pending: newPending
          };
        });
        
      } else {
        alert(data.message || 'Failed to update feedback.');
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
      alert(`Failed to update feedback: ${error.message}`);
    }
  };

  const handleDelete = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        alert('Feedback deleted successfully');
        
        // Remove the deleted feedback from state immediately
        setFeedbacks(prevFeedbacks => 
          prevFeedbacks.filter(feedback => feedback._id !== feedbackId)
        );
        
        // Update stats
        setStats(prevStats => {
          const deletedFeedback = feedbacks.find(f => f._id === feedbackId);
          const wasApproved = deletedFeedback?.isApproved === true;
          
          return {
            total: prevStats.total - 1,
            approved: wasApproved ? prevStats.approved - 1 : prevStats.approved,
            pending: wasApproved ? prevStats.pending : prevStats.pending - 1
          };
        });
        
      } else {
        alert(data.message || 'Failed to delete feedback.');
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert(`Failed to delete feedback: ${error.message}`);
    }
  };

  const handleView = (feedback) => {
    setSelectedFeedback(feedback);
    setViewModalOpen(true);
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesSearch = f.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'approved' && f.isApproved === true) ||
      (filterStatus === 'pending' && f.isApproved !== true);
    
    return matchesSearch && matchesFilter;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto"></div>
          <span className="mt-4 text-gray-700 font-medium block">Loading feedbacks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header with Navigation */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-2xl font-bold text-green-600">F</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">FarmNex</h1>
                  <p className="text-green-100 text-sm">Smart Farm Management System</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/admin'}
              className="flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-all shadow-md hover:shadow-lg font-medium"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Admin
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Page Title */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Customer Feedback Management</h2>
          <p className="text-gray-600">Review, approve, and manage customer testimonials</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Feedback</p>
                <p className="text-5xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                <Star className="h-10 w-10" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Approved</p>
                <p className="text-5xl font-bold">{stats.approved}</p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                <CheckCircle className="h-10 w-10" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium mb-1">Pending Review</p>
                <p className="text-5xl font-bold">{stats.pending}</p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                <XCircle className="h-10 w-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, email, or subject..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 bg-gray-50 px-4 rounded-xl">
              <Filter className="text-gray-500 h-5 w-5" />
              <select
                className="px-4 py-3 bg-transparent border-none focus:ring-0 focus:outline-none font-medium text-gray-700 cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Feedback</option>
                <option value="approved">Approved Only</option>
                <option value="pending">Pending Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedbacks.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-100">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-xl font-medium">No feedbacks found</p>
              <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredFeedbacks.map(f => (
              <div key={f._id} className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden hover:shadow-xl transition-all hover:border-green-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{f.customerName}</h3>
                        {f.isApproved === true ? (
                          <span className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                            <CheckCircle className="h-3.5 w-3.5" />
                            APPROVED
                          </span>
                        ) : (
                          <span className="px-4 py-1.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                            <XCircle className="h-3.5 w-3.5" />
                            PENDING
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{f.email}</p>
                      <div className="flex gap-1">{renderStars(f.rating)}</div>
                    </div>
                  </div>

                  <div className="mb-4 bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-bold text-gray-900 mb-2">{f.subject}</h4>
                    <p className="text-gray-700 line-clamp-2">{f.message}</p>
                  </div>

                  <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
                    <button
                      onClick={() => handleView(f)}
                      className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleToggleApproval(f._id, f.isApproved)}
                      className={`flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg ${
                        f.isApproved === true
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {f.isApproved === true ? (
                        <>
                          <XCircle className="h-4 w-4" />
                          Unapprove
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(f._id)}
                      className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* View Modal */}
      {viewModalOpen && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b-2 border-gray-100 bg-gradient-to-r from-green-500 to-emerald-500">
              <h2 className="text-2xl font-bold text-white">Feedback Details</h2>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Customer Name</label>
                <p className="text-gray-900 mt-2 text-lg font-semibold">{selectedFeedback.customerName}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Email</label>
                <p className="text-gray-900 mt-2">{selectedFeedback.email}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Subject</label>
                <p className="text-gray-900 mt-2 font-semibold">{selectedFeedback.subject}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Message</label>
                <p className="text-gray-900 mt-2 bg-gray-50 p-4 rounded-xl whitespace-pre-wrap leading-relaxed">{selectedFeedback.message}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Rating</label>
                <div className="flex gap-1 mt-2">{renderStars(selectedFeedback.rating)}</div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Status</label>
                <p className="mt-2">
                  {selectedFeedback.isApproved === true ? (
                    <span className="px-4 py-2 bg-green-100 text-green-700 text-sm font-bold rounded-full inline-flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Approved
                    </span>
                  ) : (
                    <span className="px-4 py-2 bg-orange-100 text-orange-700 text-sm font-bold rounded-full inline-flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Pending Approval
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="p-6 border-t-2 border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-8 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-all shadow-md hover:shadow-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminViewFeedback;