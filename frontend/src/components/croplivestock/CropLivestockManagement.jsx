import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Cow, Plus, List, BarChart3, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Card Component
const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
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
  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105" onClick={onClick}>
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
      // Fetch crops and livestock data
      // For now, using mock data
      setCrops([
        { id: 1, name: 'Tomatoes', status: 'Growing', plantingDate: '2024-03-15', expectedHarvest: '2024-06-15' },
        { id: 2, name: 'Corn', status: 'Harvesting', plantingDate: '2024-02-10', expectedHarvest: '2024-05-20' },
        { id: 3, name: 'Wheat', status: 'Planning', plantingDate: '2024-04-01', expectedHarvest: '2024-07-15' },
      ]);
      setLivestock([
        { id: 1, type: 'Cattle', count: 25, status: 'Healthy' },
        { id: 2, type: 'Chickens', count: 150, status: 'Healthy' },
        { id: 3, type: 'Sheep', count: 40, status: 'Under Care' },
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load crop and livestock data');
    } finally {
      setLoading(false);
    }
  };

  const handleCropAction = (action) => {
    switch (action) {
      case 'add':
        navigate('/crops/add');
        break;
      case 'view':
        navigate('/crops');
        break;
      default:
        break;
    }
  };

  const handleLivestockAction = (action) => {
    switch (action) {
      case 'add':
        navigate('/livestock/add');
        break;
      case 'view':
        navigate('/livestock');
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
      {/* Header */}
      <div className="flex items-center justify-between">
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
          change="+3 this month"
          onClick={() => handleCropAction('view')}
        />
        <StatsCard
          title="Livestock Types"
          value={livestock.length}
          icon={Cow}
          color="bg-blue-500"
          change={`${livestock.reduce((sum, l) => sum + l.count, 0)} total animals`}
          onClick={() => handleLivestockAction('view')}
        />
        <StatsCard
          title="Active Plans"
          value={crops.filter(c => c.status === 'Growing').length + livestock.filter(l => l.status === 'Healthy').length}
          icon={BarChart3}
          color="bg-purple-500"
          change="All systems active"
        />
        <StatsCard
          title="Alerts"
          value={livestock.filter(l => l.status === 'Under Care').length}
          icon={AlertTriangle}
          color="bg-red-500"
          change={livestock.filter(l => l.status === 'Under Care').length > 0 ? "Needs attention" : "All good"}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionButton
            title="Add Crop Plan"
            description="Create a new crop cultivation plan"
            icon={Plus}
            color="bg-green-500"
            onClick={() => handleCropAction('add')}
          />
          <QuickActionButton
            title="Add Livestock"
            description="Register new livestock or update existing"
            icon={Plus}
            color="bg-blue-500"
            onClick={() => handleLivestockAction('add')}
          />
          <QuickActionButton
            title="View All Crops"
            description="Manage and monitor all crop plans"
            icon={List}
            color="bg-emerald-500"
            onClick={() => handleCropAction('view')}
          />
          <QuickActionButton
            title="View All Livestock"
            description="Monitor livestock health and status"
            icon={List}
            color="bg-indigo-500"
            onClick={() => handleLivestockAction('view')}
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
            {crops.slice(0, 3).map((crop) => (
              <div key={crop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{crop.name}</p>
                  <p className="text-sm text-gray-600">Planted: {crop.plantingDate}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    crop.status === 'Growing' ? 'bg-green-100 text-green-800' :
                    crop.status === 'Harvesting' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {crop.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Livestock */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Cow className="h-5 w-5 text-blue-600 mr-2" />
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
            {livestock.map((animal) => (
              <div key={animal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{animal.type}</p>
                  <p className="text-sm text-gray-600">Count: {animal.count}</p>
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
            ))}
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
            <p className="text-2xl font-bold text-green-600">85%</p>
            <p className="text-sm text-gray-600 mt-1">Crop Success Rate</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">92%</p>
            <p className="text-sm text-gray-600 mt-1">Livestock Health Rate</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">78%</p>
            <p className="text-sm text-gray-600 mt-1">Overall Efficiency</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CropLivestockManagement;