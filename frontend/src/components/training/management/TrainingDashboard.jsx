import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  Target, 
  Eye, 
  Plus, 
  List, 
  FileText, 
  TrendingUp,
  Download,
  Search,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { trainingAPIReal } from '../../../services/trainingAPIReal';
import AddEditTrainingForm from '../components/AddEditTrainingForm';
import { showSuccess, showError, showConfirm } from '../../../utils/sweetAlertRobust';

const TrainingDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    categories: 0,
    views: 0
  });
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load statistics
      const statsResponse = await trainingAPIReal.getStatistics();
      if (statsResponse.success) {
        setStats({
          total: statsResponse.statistics.totalMaterials || 0,
          active: statsResponse.statistics.activeMaterials || 0,
          categories: statsResponse.statistics.totalCategories || 0,
          views: statsResponse.statistics.totalViews || 0
        });
      }

      // Load materials for the list
      const materialsResponse = await trainingAPIReal.getTrainingMaterials({
        limit: 10,
        page: 1,
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter
      });
      
      if (materialsResponse.success) {
        setMaterials(materialsResponse.materials || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showError('Failed to load dashboard data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaterial = () => {
    setEditingMaterial(null);
    setShowForm(true);
  };

  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  const handleViewAllMaterials = () => {
    // Navigate to full materials list
    console.log('Navigate to full materials list');
    // You can implement navigation here
  };

  const handleExportToExcel = async () => {
    try {
      setLoading(true);
      await trainingAPIReal.exportToExcel();
      showSuccess('Excel report has been downloaded successfully!');
    } catch (error) {
      console.error('Export error:', error);
      showError('Failed to export to Excel: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMaterial = async (materialData, file) => {
    try {
      setLoading(true);
      
      if (editingMaterial) {
        // Update existing material
        await trainingAPIReal.updateTrainingMaterial(editingMaterial._id, materialData, file);
        showSuccess('Training material updated successfully!');
      } else {
        // Create new material
        await trainingAPIReal.createTrainingMaterial(materialData, file);
        showSuccess('Training material created successfully!');
      }
      
      setShowForm(false);
      setEditingMaterial(null);
      
      // Reload dashboard data
      await loadDashboardData();
    } catch (error) {
      console.error('Save error:', error);
      showError('Failed to save material: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (material) => {
    const result = await showConfirm(
      `Are you sure you want to delete "${material.title}"? This action cannot be undone.`,
      'Delete Training Material'
    );

    if (result.isConfirmed) {
      try {
        await trainingAPIReal.deleteTrainingMaterial(material._id);
        showSuccess('Training material deleted successfully!');
        await loadDashboardData();
      } catch (error) {
        console.error('Delete error:', error);
        showError('Failed to delete material: ' + error.message);
      }
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <div className={`${bgColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-sm font-medium opacity-90 mb-1">{title}</p>
          <p className="text-white text-3xl font-bold">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg bg-white bg-opacity-20`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickActionButton = ({ icon: Icon, label, onClick, color, hoverColor }) => (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${color} ${hoverColor} flex items-center justify-center px-6 py-4 rounded-xl border-2 border-dashed transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-h-[80px] font-semibold text-sm`}
    >
      <div className="flex flex-col items-center space-y-2">
        <Icon className="h-6 w-6" />
        <span>{label}</span>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Training Management</h1>
              <p className="text-gray-600 text-lg">Manage your educational content and track engagement</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  title="Refresh Data"
                >
                  <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  <BookOpen className="h-4 w-4 inline mr-2" />
                  Dashboard
                </button>
                <button 
                  onClick={handleViewAllMaterials}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                >
                  <List className="h-4 w-4 inline mr-2" />
                  Materials
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Materials"
              value={stats.total}
              icon={BookOpen}
              color="text-blue-600"
              bgColor="bg-gradient-to-r from-blue-600 to-blue-700"
            />
            <StatCard
              title="Active Materials"
              value={stats.active}
              icon={CheckCircle}
              color="text-green-600"
              bgColor="bg-gradient-to-r from-green-600 to-green-700"
            />
            <StatCard
              title="Categories"
              value={stats.categories}
              icon={Target}
              color="text-purple-600"
              bgColor="bg-gradient-to-r from-purple-600 to-purple-700"
            />
            <StatCard
              title="Total Views"
              value={stats.views}
              icon={Eye}
              color="text-orange-600"
              bgColor="bg-gradient-to-r from-orange-600 to-orange-700"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <QuickActionButton
                icon={Plus}
                label="Create New Material"
                onClick={handleCreateMaterial}
                color="border-blue-300 bg-blue-50 text-blue-700"
                hoverColor="hover:bg-blue-100 hover:border-blue-400"
              />
              <QuickActionButton
                icon={List}
                label="View All Materials"
                onClick={handleViewAllMaterials}
                color="border-green-300 bg-green-50 text-green-700"
                hoverColor="hover:bg-green-100 hover:border-green-400"
              />
              <QuickActionButton
                icon={FileText}
                label="Export to Excel"
                onClick={handleExportToExcel}
                color="border-purple-300 bg-purple-50 text-purple-700"
                hoverColor="hover:bg-purple-100 hover:border-purple-400"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Loading recent activity...</p>
              </div>
            ) : materials.length > 0 ? (
              <div className="bg-white rounded-lg border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Views</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {materials.slice(0, 5).map((material) => (
                        <tr key={material._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{material.title}</div>
                            <div className="text-sm text-gray-600 truncate max-w-xs">{material.description}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {material.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              material.status === 'published' 
                                ? 'bg-green-100 text-green-800'
                                : material.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {material.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-900 font-semibold">
                            {material.views || 0}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditMaterial(material)}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMaterial(material)}
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No training materials found</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first training material.</p>
                <button
                  onClick={handleCreateMaterial}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Create Your First Material
                </button>
              </div>
            )}

            {materials.length > 0 && (
              <div className="text-center mt-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>System initialized successfully</span>
                  <span className="text-gray-400">•</span>
                  <span>Today</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Modal */}
        <AddEditTrainingForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingMaterial(null);
          }}
          onSave={handleSaveMaterial}
          editingMaterial={editingMaterial}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default TrainingDashboard;