import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Users, Plus, List, BarChart3, AlertTriangle, TrendingUp, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import BackButton from '../common/BackButton';
import axios from 'axios';

// Card Component
const Card = ({ children, className = "", onClick }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 ${className} ${onClick ? 'cursor-pointer pointer-events-auto' : ''}`}
      onClick={handleClick}
      style={{ pointerEvents: onClick ? 'auto' : 'initial' }}
    >
      {children}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, change, onClick }) => {
  return (
    <Card className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${onClick ? 'hover:scale-105' : ''}`} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && <p className="text-sm text-green-600 mt-1">{change}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );
};

// Quick Action Button
const QuickActionButton = ({ title, description, icon: Icon, color, onClick }) => {
  const handleClick = () => {
    console.log(`QuickActionButton clicked: ${title}`);
    if (onClick) {
      onClick();
    } else {
      console.error('No onClick handler provided for button:', title);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={handleClick}>
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Card>
  );
};

const CropLivestockManagement = () => {
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [livestock, setLivestock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch crops data from API
      const cropsResponse = await axios.get('http://localhost:3000/api/crop/get');
      const cropsData = cropsResponse.data || [];
      
      // Transform crops data to match component expectations
      const transformedCrops = cropsData.map(crop => ({
        id: crop._id,
        name: crop.planName || crop.cropType || 'Unknown Crop',
        status: crop.status || 'Active',
        plantingDate: crop.plantingDate || 'Not set',
        expectedHarvest: crop.harvestDate || 'Not set',
        cropType: crop.cropType,
        variety: crop.variety
      }));
      
      // Fetch livestock data from API
      const livestockResponse = await axios.get('http://localhost:3000/api/livestock/get');
      const livestockData = livestockResponse.data || [];
      
      // Transform livestock data to match component expectations
      const transformedLivestock = livestockData.map(animal => ({
        id: animal._id,
        type: animal.animalType || 'Unknown Animal',
        count: 1, // Since each record is one animal
        status: 'Healthy', // Default status, could be derived from health records
        breed: animal.breed,
        gender: animal.gender,
        weight: animal.weight
      }));
      
      setCrops(transformedCrops);
      setLivestock(transformedLivestock);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load crop and livestock data');
      // Set empty arrays on error
      setCrops([]);
      setLivestock([]);
    } finally {
      setLoading(false);
    }
  };

  // Robust navigation helper with multiple fallback methods
  const navigateToRoute = (route, description) => {
    console.log(`Attempting navigation to: ${route}`);
    toast.success(`${description}`);
    
    // Method 1: Try React Router navigate first
    try {
      navigate(route);
      console.log('React Router navigation successful');
      return;
    } catch (error) {
      console.error('React Router navigation failed:', error);
    }
    
    // Method 2: Try window.location as fallback
    try {
      window.location.href = route;
      console.log('Window location navigation successful');
      return;
    } catch (error) {
      console.error('Window location navigation failed:', error);
    }
    
    // Method 3: Last resort - create a hidden link and click it
    try {
      const link = document.createElement('a');
      link.href = route;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Programmatic link navigation successful');
    } catch (error) {
      console.error('All navigation methods failed:', error);
      toast.error('Navigation failed. Please try manually navigating to the page.');
    }
  };

  const handleCropAction = (action) => {
    console.log('Crop action triggered:', action);
    switch (action) {
      case 'add':
        navigateToRoute('/crops/add', 'Opening Add Crop Plan page...');
        break;
      case 'view':
        navigateToRoute('/crops', 'Opening All Crops page...');
        break;
      default:
        break;
    }
  };

  const handleLivestockAction = (action) => {
    console.log('Livestock action triggered:', action);
    switch (action) {
      case 'add':
        navigateToRoute('/livestock/add', 'Opening Add Livestock page...');
        break;
      case 'view':
        navigateToRoute('/livestock', 'Opening All Livestock page...');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading crop and livestock data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Custom CSS to force white text */}
      <style>{`
        .nav-link-white,
        .nav-link-white:visited,
        .nav-link-white:hover,
        .nav-link-white:focus,
        .nav-link-white:active,
        .nav-link-white span {
          color: #ffffff !important;
          text-decoration: none !important;
        }
      `}</style>
      
      {/* Header */}
      <div className="mb-4">
        <BackButton label="Back to Dashboard" className="mb-4" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crop & Livestock Management</h1>
          <p className="text-gray-600 mt-1">Manage your farm's crops and livestock in one place</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Crops"
          value={crops.length}
          icon={Sprout}
          color="bg-green-500"
          change={crops.length > 0 ? `${crops.length} crop plans` : "No crops yet"}
          onClick={() => handleCropAction('view')}
        />
        <StatsCard
          title="Total Livestock"
          value={livestock.length}
          icon={Users}
          color="bg-blue-500"
          change={livestock.length > 0 ? `${livestock.length} animals` : "No livestock yet"}
          onClick={() => handleLivestockAction('view')}
        />
        <StatsCard
          title="Active Plans"
          value={crops.filter(c => c.status && c.status.toLowerCase() !== 'completed').length}
          icon={BarChart3}
          color="bg-purple-500"
          change={crops.length > 0 ? "Plans in progress" : "No active plans"}
        />
        <StatsCard
          title="Health Status"
          value={livestock.filter(l => l.status === 'Healthy').length}
          icon={AlertTriangle}
          color={livestock.length > 0 ? "bg-green-500" : "bg-gray-500"}
          change={livestock.length > 0 ? "Healthy animals" : "No data"}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        
        {/* Alternative HTML Link-based Navigation */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Direct Links (Alternative Navigation)</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <a 
              href="/crops/add" 
              className="nav-link-white inline-block text-center bg-green-700 text-white font-bold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl hover:bg-green-800 transition-all !text-white"
              style={{ 
                color: '#ffffff', 
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)', 
                textDecoration: 'none',
                '--tw-text-opacity': '1'
              }}
            >
              <span className="text-white font-bold" style={{ color: '#ffffff !important' }}>Add Crop Plan</span>
            </a>
            <a 
              href="/livestock/add" 
              className="nav-link-white inline-block text-center bg-blue-700 text-white font-bold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl hover:bg-blue-800 transition-all !text-white"
              style={{ 
                color: '#ffffff', 
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)', 
                textDecoration: 'none',
                '--tw-text-opacity': '1'
              }}
            >
              <span className="text-white font-bold" style={{ color: '#ffffff !important' }}>Add Livestock</span>
            </a>
            <a 
              href="/crops" 
              className="nav-link-white inline-block text-center bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl hover:bg-emerald-800 transition-all !text-white"
              style={{ 
                color: '#ffffff', 
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)', 
                textDecoration: 'none',
                '--tw-text-opacity': '1'
              }}
            >
              <span className="text-white font-bold" style={{ color: '#ffffff !important' }}>View All Crops</span>
            </a>
            <a 
              href="/livestock" 
              className="nav-link-white inline-block text-center bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl hover:bg-indigo-800 transition-all !text-white"
              style={{ 
                color: '#ffffff', 
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)', 
                textDecoration: 'none',
                '--tw-text-opacity': '1'
              }}
            >
              <span className="text-white font-bold" style={{ color: '#ffffff !important' }}>View All Livestock</span>
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionButton
            title="Add Crop Plan"
            description="Create a new crop cultivation plan"
            icon={Plus}
            color="bg-green-500"
            onClick={() => {
              console.log('Add Crop Plan button clicked');
              handleCropAction('add');
            }}
          />
          <QuickActionButton
            title="Add Livestock"
            description="Register new livestock or update existing"
            icon={Plus}
            color="bg-blue-500"
            onClick={() => {
              console.log('Add Livestock button clicked');
              handleLivestockAction('add');
            }}
          />
          <QuickActionButton
            title="View All Crops"
            description="Manage and monitor all crop plans"
            icon={List}
            color="bg-emerald-500"
            onClick={() => {
              console.log('View All Crops button clicked');
              handleCropAction('view');
            }}
          />
          <QuickActionButton
            title="View All Livestock"
            description="Monitor livestock health and status"
            icon={List}
            color="bg-indigo-500"
            onClick={() => {
              console.log('View All Livestock button clicked');
              handleLivestockAction('view');
            }}
          />
        </div>
      </div>

      {/* Recent Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Crops */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Sprout className="h-5 w-5 text-green-600 mr-2" />
              Recent Crop Plans
            </h3>
            <button 
              onClick={() => handleCropAction('view')}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {crops.length > 0 ? (
              crops.slice(0, 3).map((crop) => (
                <div key={crop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{crop.name}</p>
                    <p className="text-sm text-gray-600">Planted: {new Date(crop.plantingDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      crop.status?.toLowerCase() === 'growing' ? 'bg-green-100 text-green-800' :
                      crop.status?.toLowerCase() === 'harvesting' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {crop.status || 'Active'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Sprout className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No crop plans yet</p>
                <button 
                  onClick={() => handleCropAction('add')}
                  className="mt-2 text-sm text-green-600 hover:text-green-800"
                >
                  Add your first crop plan
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Livestock */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              Livestock Overview
            </h3>
            <button 
              onClick={() => handleLivestockAction('view')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {livestock.length > 0 ? (
              livestock.slice(0, 3).map((animal) => (
                <div key={animal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{animal.type}</p>
                    <p className="text-sm text-gray-600">Breed: {animal.breed || 'Not specified'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      animal.status === 'Healthy' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {animal.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No livestock records yet</p>
                <button 
                  onClick={() => handleLivestockAction('add')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Add your first livestock record
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
            Performance Overview
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {crops.length > 0 ? Math.round((crops.filter(c => c.status && c.status.toLowerCase() !== 'failed').length / crops.length) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Crop Success Rate</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {livestock.length > 0 ? Math.round((livestock.filter(l => l.status === 'Healthy').length / livestock.length) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Livestock Health Rate</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{crops.length + livestock.length}</p>
            <p className="text-sm text-gray-600 mt-1">Total Records</p>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default CropLivestockManagement;
