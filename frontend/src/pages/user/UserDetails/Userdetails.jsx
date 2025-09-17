import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Search, Download, Users, UserCheck, Shield, Truck, Package, User, X, Filter } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
      case 'Admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'Manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FarmStaff': return 'bg-green-100 text-green-800 border-green-200';
      case 'DeliveryStaff': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Customer': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 p-6 user-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.fullName}</h3>
            <p className="text-gray-600 text-sm">{user.email}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getRoleBadgeColor(user.role)}`}>
          {getRoleIcon(user.role)}
          <span className="text-sm font-medium">{user.role}</span>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">UserName:</span>
          <span className="text-green-600 font-medium">{user.username}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Email:</span>
          <span className="text-green-600 font-medium">{user.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Phone:</span>
          <span className="text-green-600 font-medium">{user.phone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Age:</span>
          <span className="text-green-600 font-medium">{user.age}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Address:</span>
          <span className="text-green-600 font-medium">{user.address}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Join Date:</span>
          <span className="text-green-600 font-medium">{user.createdAt}</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={onEdit}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium"
        >
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
        const response = await axios.get('http://localhost:3000/users'); 
        console.log("Fetched users:", response.data);
        
        // Match the data structure from your working component
        setAllUsers(response.data.users || []);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setError('Failed to load users. Please try again later.');
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
      await axios.delete(`http://localhost:3000/users/${user._id}`);
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
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToAdmin}
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Admin</span>
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🌱</span>
                </div>
                <span className="text-xl font-bold text-gray-800">Farm Nex</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, Admin</span>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage your smart farming team members and customers</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-md mx-auto relative">
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
        </div>

        {/* Role Filter Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center space-x-2 space-y-2 sm:space-y-0">
            {roles.map(role => (
              <button
                key={role}
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeRole === role
                    ? 'bg-green-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-300'
                }`}
                onClick={() => setActiveRole(role)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {getRoleDisplayName(role)} ({getRoleCount(role)})
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {roles.slice(1).map(role => (
            <div key={role} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{getRoleDisplayName(role)}</p>
                  <p className="text-2xl font-bold text-gray-900">{getRoleCount(role)}</p>
                </div>
                <div className="text-green-500">
                  {role === 'Admin' && <Shield className="w-6 h-6" />}
                  {role === 'Manager' && <UserCheck className="w-6 h-6" />}
                  {role === 'FarmStaff' && <Package className="w-6 h-6" />}
                  {role === 'DeliveryStaff' && <Truck className="w-6 h-6" />}
                  {role === 'Customer' && <User className="w-6 h-6" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Results */}
        {noResult ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            {/* User Grid */}
            <div ref={ComponentsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  onEdit={() => handleEdit(user)}
                  onDelete={() => handleDelete(user)}
                />
              ))}
            </div>

            {/* Download Report Button */}
            <div className="text-center">
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Download className="w-5 h-5 mr-2" />
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