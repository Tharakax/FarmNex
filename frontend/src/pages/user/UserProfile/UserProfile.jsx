import React, { useEffect, useState } from 'react';
import { ArrowLeft, Edit3, User, Mail, Phone, Calendar, MapPin, Shield, UserCheck, Package, Truck, Save, X, } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  
  const navigate = useNavigate();

  // Get logged in user data (you might get this from context/localStorage/token)
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // Replace with your actual endpoint for getting current user
        // This might come from a token or user context
        const token = localStorage.getItem('authToken'); // or however you store auth
        const userId = localStorage.getItem('userId'); // or from decoded token
        
        const response = await axios.get(`http://localhost:3000/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
       
        
        setUser(response.data.user || response.data);
        setEditForm(response.data.user || response.data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return <Shield className="w-6 h-6 text-red-500" />;
      case 'Manager': return <UserCheck className="w-6 h-6 text-blue-500" />;
      case 'FarmStaff': return <Package className="w-6 h-6 text-green-500" />;
      case 'DeliveryStaff': return <Truck className="w-6 h-6 text-orange-500" />;
      case 'Customer': return <User className="w-6 h-6 text-purple-500" />;
      default: return <User className="w-6 h-6 text-gray-500" />;
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      
      const response = await axios.put(`http://localhost:3000/users/${user._id}`, editForm, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setUser(response.data.user || response.data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(user);
    setIsEditing(false);
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading profile...</p>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading profile</h3>
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700">No user data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
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
              <span className="text-gray-600">My Profile</span>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-green-600">
                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold">{user.fullName}</h2>
                  <p className="text-green-100">{user.email}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 border-white bg-white/20 backdrop-blur-sm`}>
                {getRoleIcon(user.role)}
                <span className="text-white font-medium">{user.role}</span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {!isEditing ? (
              // View Mode
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Username</p>
                        <p className="font-medium text-gray-900">{user.username}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{user.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Age</p>
                        <p className="font-medium text-gray-900">{user.age || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium text-gray-900">{user.address || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Member Since</p>
                        <p className="font-medium text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Edit3 className="w-5 h-5 mr-2" />
                    Edit Profile
                  </button>
                </div>
              </>
            ) : (
              // Edit Mode
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={editForm.fullName || ''}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={editForm.username || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editForm.email || ''}
                        //onChange={handleInputChange}
                        readOnly
                         className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={editForm.phone || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={editForm.age || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <textarea
                        name="address"
                        value={editForm.address || ''}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;