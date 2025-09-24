import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, Search, Download, Users, UserCheck, Shield, Truck, Package, 
  User, X, Filter, Mail, Phone, Calendar, MapPin, Edit, Trash, Plus, FileText
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminHeader from '../../../components/AdminHeader';

// User Card Component
const UserCard = ({ user, onEdit, onDelete }) => {
  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return <Shield className="w-5 h-5 text-red-500" />;
      case 'Manager': return <UserCheck className="w-5 h-5 text-blue-500" />;
      case 'FarmStaff': return <Package className="w-5 h-5 text-green-500" />;
      case 'DeliveryStaff': return <Truck className="w-5 h-5 text-orange-500" />;
      case 'Customer': return <User className="w-5 h-5 text-purple-500" />;
      default: return <Users className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-red-50 text-red-700 border-red-100 shadow-red-100/40';
      case 'Manager': return 'bg-blue-50 text-blue-700 border-blue-100 shadow-blue-100/40';
      case 'FarmStaff': return 'bg-green-50 text-green-700 border-green-100 shadow-green-100/40';
      case 'DeliveryStaff': return 'bg-orange-50 text-orange-700 border-orange-100 shadow-orange-100/40';
      case 'Customer': return 'bg-purple-50 text-purple-700 border-purple-100 shadow-purple-100/40';
      default: return 'bg-gray-50 text-gray-700 border-gray-100 shadow-gray-100/40';
    }
  };

  const getRoleIconBgColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-red-100';
      case 'Manager': return 'bg-blue-100';
      case 'FarmStaff': return 'bg-green-100';
      case 'DeliveryStaff': return 'bg-orange-100';
      case 'Customer': return 'bg-purple-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden">
      {/* Card Header with Avatar and Role Badge */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
              {user.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{user.fullName}</h3>
              <div className="flex items-center text-gray-500 text-sm mt-0.5">
                <Mail className="w-3.5 h-3.5 mr-1" />
                <span className="truncate max-w-[180px]">{user.email}</span>
              </div>
            </div>
          </div>
          
          <div className={`flex items-center px-3 py-1.5 rounded-full border shadow-sm ${getRoleBadgeColor(user.role)}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-1.5 ${getRoleIconBgColor(user.role)}`}>
              {getRoleIcon(user.role)}
            </div>
            <span className="text-sm font-medium">{user.role}</span>
          </div>
        </div>
      </div>
      
      {/* Card Body with User Details */}
      <div className="p-5 bg-gray-50 space-y-3">
        {/* Username */}
        <div className="flex items-center text-sm">
          <div className="w-8 flex justify-center">
            <User className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-gray-500 w-24">Username:</span>
          <span className="text-gray-800 font-medium flex-1">{user.username}</span>
        </div>
        
        {/* Phone */}
        <div className="flex items-center text-sm">
          <div className="w-8 flex justify-center">
            <Phone className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-gray-500 w-24">Phone:</span>
          <span className="text-gray-800 font-medium flex-1">{user.phone || 'Not provided'}</span>
        </div>
        
        {/* Age */}
        <div className="flex items-center text-sm">
          <div className="w-8 flex justify-center">
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-gray-500 w-24">Age:</span>
          <span className="text-gray-800 font-medium flex-1">{user.age || 'Not provided'}</span>
        </div>
        
        {/* Address */}
        <div className="flex items-center text-sm">
          <div className="w-8 flex justify-center">
            <MapPin className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-gray-500 w-24">Address:</span>
          <span className="text-gray-800 font-medium flex-1 truncate">{user.address || 'Not provided'}</span>
        </div>
        
        {/* Join Date */}
        <div className="flex items-center text-sm">
          <div className="w-8 flex justify-center">
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-gray-500 w-24">Join Date:</span>
          <span className="text-gray-800 font-medium flex-1">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
          </span>
        </div>
      </div>
      
      {/* Card Footer with Action Buttons */}
      <div className="p-4 flex space-x-2 border-t border-gray-100">
        <button
          onClick={onEdit}
          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2.5 px-4 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center"
        >
          <Edit className="w-4 h-4 mr-1.5" />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 px-4 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center"
        >
          <Trash className="w-4 h-4 mr-1.5" />
          Delete
        </button>
      </div>
    </div>
  );
};

// Main Component
function SmartFarmingUserDetails() {
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRole, setActiveRole] = useState("All");
  const [noResult, setNoResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const ComponentsRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        console.log('Token found:', token ? 'Yes' : 'No');
        
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }
        
        const response = await axios.get('http://localhost:3000/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }); 
        console.log("Fetched users:", response.data);
        
        // Match the data structure from your working component
        setAllUsers(response.data.users || []);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        
        if (error.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
          // Optionally redirect to login
          // window.location.href = '/login';
        } else if (error.response?.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError(error.message || 'Failed to load users. Please try again later.');
        }
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    navigate(`/userdetails/${user._id}`);
  };

  const handleDelete = async (user) => {
    const confirmDelete = window.confirm(`Delete ${user.fullName}?`);
    if (!confirmDelete) return;

    try {
      // Get JWT token for authentication
      const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.delete(`http://localhost:3000/users/${user._id}`, { headers });
      setAllUsers(allUsers.filter(u => u._id !== user._id));
      //alert("User deleted successfully!");
      toast.success("User deleted successfully!");
    } catch (err) {
     // alert("Delete failed");
      toast.success("Delete failed!");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Farm Nex User Report</title>
          <style>
           body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #10b981;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #10b981;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              margin: 5px 0 0 0;
              color: #666;
            }
            .user-card {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 20px;
              background: #f9fafb;
              page-break-inside: avoid;
            }
            .user-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 10px;
            }
            .user-name {
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
            }
            .user-role {
              background: #10b981;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
            }
            .user-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            .detail-item {
              display: flex;
              justify-content: space-between;
            }
            .detail-label {
              font-weight: bold;
              color: #4b5563;
            }
            .detail-value {
              color: #1f2937;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌱 Smart Farm User Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>Total Users: ${filteredUsers.length}</p>
          </div>
          ${filteredUsers.map(user => `
            <div class="user-card">
              <div class="user-header">
                <div class="user-name">${user.fullName}</div>
                <div class="user-role">${user.role}</div>
              </div>

              <div class="user-details">
                <div class="detail-item">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${user.email}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value">${user.phone}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Username:</span>
                  <span class="detail-value">${user.username}</span>
                </div>
                
                <div class="detail-item">
                  <span class="detail-label">Age:</span>
                  <span class="detail-value">${user.age}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value">${user.status || 'Active'}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Join Date:</span>
                  <span class="detail-value">${user.joinDate || new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Address:</span>
                  <span class="detail-value">${user.address}</span>
                </div>

              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      //alert("User Report Successfully Downloaded!");
      toast.success("User Report Successfully Downloaded!");
    }, 250);
  };

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  const roles = ["All", "Admin", "Manager", "FarmStaff", "DeliveryStaff", "Customer"];

  const getRoleDisplayName = (role) => {
    return role.replace(/([A-Z])/g, ' $1').trim();
  };

  const getRoleCount = (role) => {
    if (role === "All") return allUsers.length;
    return allUsers.filter(user => user.role === role).length;
  };

  // Filtering logic combined: Role + Search
  const filteredUsers = allUsers.filter(user => {
    const matchesRole = activeRole === "All" || user.role === activeRole;
    const matchesSearch = searchQuery.trim() === "" || 
      Object.values(user).some(field =>
        field?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesRole && matchesSearch;
  });

  useEffect(() => {
    setNoResult(filteredUsers.length === 0 && !loading);
  }, [filteredUsers, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ... (keep the rest of your return JSX)
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Clean Header Component */}
      <AdminHeader 
        title="User Management"
        subtitle="Manage your smart farming team members and customers"
        showBackButton={true}
        backButtonText="Back to Admin"
        backButtonPath="/admin"
        showSearch={false}
      />

      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
        {/* Page Stats Summary */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total System Users</p>
                  <p className="text-2xl font-bold text-gray-900">{allUsers.length}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Active Now</p>
                <p className="text-lg font-semibold text-green-600">{allUsers.filter(user => user.status !== 'Inactive').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Action Bar */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users by name, email, role..."
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => navigate('/adduser')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center font-medium"
          >
            <Plus className="w-5 h-5 mr-1.5" />
            Add New User
          </button>
        </div>

        {/* Role Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap justify-center gap-2 mb-1">
            {roles.map(role => {
              const isActive = activeRole === role;
              return (
                <button
                  key={role}
                  className={`inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md transform translate-y-[-2px]'
                      : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-200 hover:border-green-200 shadow-sm'
                  }`}
                  onClick={() => setActiveRole(role)}
                >
                  {isActive ? (
                    <>
                      <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-2">
                        <Filter className="w-3.5 h-3.5 text-white" />
                      </span>
                      {getRoleDisplayName(role)}
                      <span className="ml-1.5 bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {getRoleCount(role)}
                      </span>
                    </>
                  ) : (
                    <>
                      <Filter className="w-4 h-4 mr-2 text-gray-400" />
                      {getRoleDisplayName(role)}
                      <span className="ml-1.5 bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {getRoleCount(role)}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {roles.slice(1).map(role => {
            const roleColors = {
              'Admin': 'from-red-500 to-red-600 shadow-red-200',
              'Manager': 'from-blue-500 to-blue-600 shadow-blue-200',
              'FarmStaff': 'from-green-500 to-green-600 shadow-green-200',
              'DeliveryStaff': 'from-orange-500 to-orange-600 shadow-orange-200',
              'Customer': 'from-purple-500 to-purple-600 shadow-purple-200'
            };
            
            const getRoleIcon = () => {
              switch(role) {
                case 'Admin': return <Shield className="w-6 h-6" />;
                case 'Manager': return <UserCheck className="w-6 h-6" />;
                case 'FarmStaff': return <Package className="w-6 h-6" />;
                case 'DeliveryStaff': return <Truck className="w-6 h-6" />;
                case 'Customer': return <User className="w-6 h-6" />;
                default: return <Users className="w-6 h-6" />;
              }
            };
            
            return (
              <div 
                key={role} 
                className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-shadow duration-200"
                onClick={() => setActiveRole(role)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{getRoleDisplayName(role)}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{getRoleCount(role)}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleColors[role]} flex items-center justify-center text-white shadow-sm`}>
                    {getRoleIcon()}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-50">
                  <div className="text-xs font-medium text-gray-500">
                    {getRoleCount(role) === 0 ? 'No users' : 
                     getRoleCount(role) === 1 ? '1 user' : 
                     `${getRoleCount(role)} users`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Results */}
        {noResult ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No users found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">We couldn't find any users matching your criteria. Try adjusting your search or filter settings.</p>
            <button 
              onClick={() => {
                setSearchQuery("");
                setActiveRole("All");
              }}
              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4 mr-1.5" />
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* User Grid */}
            <div ref={ComponentsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  onEdit={() => handleEdit(user)}
                  onDelete={() => handleDelete(user)}
                />
              ))}
            </div>

            {/* Results Stats and Download Report Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="mb-4 sm:mb-0 text-center sm:text-left">
                <p className="text-gray-500 text-sm">Showing <span className="font-semibold text-gray-800">{filteredUsers.length}</span> users</p>
                <p className="text-gray-500 text-xs mt-1">
                  {activeRole !== "All" ? `Filtered by ${activeRole} role` : "Showing all roles"}
                  {searchQuery ? ` • Search: "${searchQuery}"` : ""}
                </p>
              </div>
              
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg shadow hover:shadow-md transform hover:translate-y-[-1px] transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report ({filteredUsers.length} users)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SmartFarmingUserDetails;