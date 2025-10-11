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

  const totalUsers = filteredUsers.length;
  const activeUsers = filteredUsers.filter(u => u.status === 'Active').length;
  
  // Calculate new users in last 7 days
  const newUsersLast7Days = filteredUsers.filter(u => {
    const joinDate = new Date(u.joinDate || u.createdAt || Date.now());
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return joinDate >= sevenDaysAgo;
  }).length;

  // Calculate role distribution
  const roleCounts = filteredUsers.reduce((acc, user) => {
    const role = user.role || 'Customer';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  // Calculate average age
  const validAges = filteredUsers.filter(u => u.age && !isNaN(u.age)).map(u => parseInt(u.age));
  const averageAge = validAges.length > 0 
    ? (validAges.reduce((a, b) => a + b, 0) / validAges.length).toFixed(1)
    : 'N/A';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FarmNex User Analytics Report</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <style>
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }
        
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          background: #ffffff; 
          color: #2d3748; 
          line-height: 1.5; 
          font-size: 12px;
        }
        
        :root {
          --primary: #10b981;
          --primary-dark: #059669;
          --success: #16a34a; 
          --warning: #f59e0b;
          --danger: #ef4444;
          --dark: #1f2937; 
          --gray: #6b7280; 
          --gray-light: #9ca3af;
          --border: #e5e7eb; 
          --green-light: #d1fae5;
          --green-lighter: #ecfdf5;
        }

        /* HEADER STYLES */
        .pdf-header { 
          width: 100%; 
          padding: 15px 25px 10px 25px; 
          background: linear-gradient(135deg, var(--green-lighter) 0%, #ffffff 100%);
          border-bottom: 2px solid var(--primary);
          position: fixed; 
          top: 0; 
          left: 0; 
          height: 130px;
          z-index: 1000;
        }
        
        .brand-row { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          margin-bottom: 8px; 
        }
        
        .logo-tile { 
          width: 32px; 
          height: 32px; 
          background: var(--primary); 
          border-radius: 6px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .logo-tile .fa-leaf { 
          color: white; 
          font-size: 18px; 
        }
        
        .brand-name { 
          font-size: 26px; 
          font-weight: 800; 
          color: var(--primary-dark);
          letter-spacing: -0.5px;
        }
        
        .title-section { 
          text-align: center; 
          margin: 8px 0; 
        }
        
        .report-title { 
          font-size: 20px; 
          font-weight: 700; 
          color: var(--dark);
          margin-bottom: 4px;
        }
        
        .report-subtitle { 
          font-size: 12px; 
          color: var(--gray); 
        }
        
        .contact-details { 
          text-align: center; 
          font-size: 10px; 
          color: var(--gray-light);
          margin-top: 6px;
        }
        
        .header-divider { 
          width: 100%; 
          height: 1px; 
          background: linear-gradient(90deg, transparent 0%, var(--border) 50%, transparent 100%);
          margin-top: 10px; 
          border: none; 
        }

        /* METRICS SECTION */
        .metrics-section { 
          margin: 140px 25px 15px 25px; 
        }
        
        .metrics-grid { 
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 15px;
        }
        
        .metric-card { 
          background: white;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 10px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .metric-card.primary { 
          border-top: 3px solid var(--primary);
        }
        
        .metric-card.warning { 
          border-top: 3px solid var(--warning);
        }
        
        .metric-value { 
          color: var(--dark); 
          font-size: 20px; 
          font-weight: 700;
          margin-bottom: 4px;
        }
        
        .metric-label { 
          color: var(--gray); 
          font-size: 11px; 
          font-weight: 500;
        }

        /* SUMMARY SECTION */
        .summary-section {
          background: var(--green-lighter);
          border-radius: 8px;
          padding: 12px 15px;
          margin: 0 25px 15px 25px;
          border: 1px solid var(--border);
        }
        
        .summary-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--dark);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .summary-title i {
          color: var(--primary);
        }
        
        .summary-content {
          font-size: 11px;
          color: var(--gray);
          line-height: 1.5;
        }

        /* TABLE STYLES */
        .content { 
          margin: 0 25px 50px 25px; 
        }
        
        .table-container {
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .user-table { 
          width: 100%; 
          border-collapse: collapse;
          font-size: 10px;
        }
        
        .user-table th, .user-table td { 
          border-bottom: 1px solid var(--border); 
          padding: 8px 10px; 
          text-align: left;
        }
        
        .user-table th { 
          background: var(--green-lighter); 
          color: var(--dark);
          font-weight: 600;
          font-size: 10px;
          padding: 10px;
        }
        
        .user-table tr:nth-child(even) { 
          background: #fcfdfd; 
        }
        
        .user-table tr:hover { 
          background: #f3f4f6; 
        }
        
        .status-active {
          color: var(--success);
          font-weight: 600;
        }
        
        .role-badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 600;
        }
        
        .role-admin {
          background: #fef3c7;
          color: #92400e;
        }
        
        .role-customer {
          background: #d1fae5;
          color: #065f46;
        }
        
        .role-farmstaff {
          background: #dbeafe;
          color: #1e40af;
        }

        /* FOOTER STYLES */
        .pdf-footer { 
          width: 100%; 
          height: 30px; 
          background: var(--green-lighter); 
          border-top: 1px solid var(--border); 
          padding: 0 25px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          position: fixed; 
          bottom: 0;
          font-size: 9px;
          color: var(--gray);
        }

        /* PRINT STYLES */
        @media print {
          .pdf-header, .pdf-footer { 
            position: fixed; 
          }
          
          .metrics-section {
            margin-top: 140px;
          }
          
          .content {
            margin-bottom: 50px;
          }
          
          body {
            font-size: 10px;
          }
        }

        /* UTILITY CLASSES */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: 700; }
        .text-primary { color: var(--primary); }
        .text-gray { color: var(--gray); }
      </style>
    </head>
    <body>
      <!-- HEADER -->
      <header class="pdf-header">
        <div class="brand-row">
          <div class="logo-tile"><i class="fas fa-leaf"></i></div>
          <h2 class="brand-name">FarmNex</h2>
        </div>
        <div class="title-section">
          <h3 class="report-title">User Analytics & Engagement Report</h2>
          <p class="report-subtitle">Comprehensive overview of platform users and activity metrics</p>
        </div>
        <div class="contact-details">
          <p>No 8, Temple Road, Beralapanathra, Sri Lanka | Tel: 0742331740 | Email: farmnex@gmail.com</p>
        </div>
        <hr class="header-divider">
      </header>

      <!-- METRICS -->
      <section class="metrics-section">
        <div class="metrics-grid">
          <div class="metric-card primary">
            <div class="metric-value">${totalUsers}</div>
            <div class="metric-label">Total Users</div>
          </div>
          <div class="metric-card primary">
            <div class="metric-value">${activeUsers}</div>
            <div class="metric-label">Active Users</div>
          </div>
          <div class="metric-card warning">
            <div class="metric-value">${newUsersLast7Days}</div>
            <div class="metric-label">New Users (7 Days)</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${averageAge}</div>
            <div class="metric-label">Average Age</div>
          </div>
        </div>

        <!-- SUMMARY -->
        <div class="summary-section">
          <div class="summary-title">
            <i class="fas fa-chart-line"></i>
            <span>Report Summary</span>
          </div>
          <div class="summary-content">
            The platform currently has ${totalUsers} registered users with ${activeUsers} active accounts. 
            ${newUsersLast7Days > 0 ? `There were ${newUsersLast7Days} new sign-ups in the last 7 days, showing ${newUsersLast7Days > 5 ? 'strong' : 'steady'} growth.` : 'No new users joined in the last 7 days.'}
            User roles are distributed as: ${Object.entries(roleCounts).map(([role, count]) => `${count} ${role}`).join(', ')}.
          </div>
        </div>
      </section>

      <!-- MAIN CONTENT -->
      <main class="content">
        <div class="table-container">
          <table class="user-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Username</th>
                <th>Age</th>
                <th>Role</th>
                <th>Status</th>
                <th>Join Date</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              ${filteredUsers.map((user, index) => `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td class="font-bold">${user.fullName || 'N/A'}</td>
                  <td>${user.email || 'N/A'}</td>
                  <td>${user.phone || 'N/A'}</td>
                  <td>${user.username || 'N/A'}</td>
                  <td class="text-center">${user.age || 'N/A'}</td>
                  <td>
                    <span class="role-badge role-${(user.role || 'customer').toLowerCase()}">
                      ${user.role || 'Customer'}
                    </span>
                  </td>
                  <td class="status-active">${user.status || 'Active'}</td>
                  <td>${user.joinDate || new Date(user.createdAt || Date.now()).toLocaleDateString()}</td>
                  <td>${user.address || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </main>

      <!-- FOOTER -->
      <footer class="pdf-footer">
        <div>FarmNex Farm Management System</div>
        <div>Page 1 of 1</div>
        <div>Generated: ${new Date().toLocaleString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</div>
      </footer>
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
   
  }, 500);
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