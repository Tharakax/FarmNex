import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useToast } from './ToastProvider.jsx';

import { 
  Sprout, 
  Calendar, 
  MapPin, 
  Droplets, 
  Activity, 
  Edit, 
  Trash2, 
  Plus,
  BarChart3,
  Clock,
  Beaker
} from 'lucide-react';

function AllCropPlans() {
  const navigate = useNavigate();

  const [cropPlans, setCropPlans] = useState([]);

  const getCropEmoji = (cropType) => {
    const emojiMap = {
      'Tomato': '🍅',
      'Rice': '🌾',
      'Carrot': '🥕',
      'Potato': '🥔',
      'Other': '🌱'
    };
    return emojiMap[cropType] || '🌱';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'planned': 'bg-blue-100 text-blue-800 border-blue-200',
      'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'delayed': 'bg-red-100 text-red-800 border-red-200'
    };
    return colorMap[status.toLowerCase().replace(' ', '-')] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      'planned': '📋',
      'in-progress': '🚀',
      'completed': '✅',
      'delayed': '⏰'
    };
    return iconMap[status.toLowerCase().replace(' ', '-')] || '📋';
  };

  const formatWaterDuration = (plan) => {
    if (!plan || !plan.Duration) return '-';
    const s = plan.Duration.toString();
    const m = s.match(/\d+/);
    const n = m ? m[0] : s;
    return ` Every  ${n}  Days`;
  };

  const formatFertilizerDay = (day) => {
    if (day === null || day === undefined || day === '') return '-';
    if (typeof day === 'number') return `Day ${day}`;
    if (typeof day === 'string' && /^\d+$/.test(day.trim())) return `Day ${day.trim()}`;
    return day;
  };

  const { addToast } = useToast();

  useEffect(() => {
    const getCropPlans = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/crop/get'); 
        setCropPlans(response.data); 
      } catch (error) {
        console.error("Failed to fetch crop plans:", error);
        addToast('Failed to load crop plans', 'error');
      }
    };

    getCropPlans();
  }, []);

  const downloadCropPdf = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/crop/report/pdf", {
        method: "GET",
      });
  
      if (!response.ok) throw new Error("Failed to download PDF");
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "crop_report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF download failed:", error);
      addToast("Failed to download Crop PDF report", "error");
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">All Crop Plans</h2>
              <p className="text-gray-600">Manage and monitor your crop cultivation plans</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
              <Activity className="w-4 h-4" />
              <span>{cropPlans.length} Total Plans</span>
            </div>
            <button
          style={{
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "6px",
            fontSize: "14px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        className="add-livestock-btn"
        onClick={() => navigate("/crops/add")}
        >
        + Add New Crop Plan
      </button>
            {/* PDF Download Button */}
            <button
              onClick={downloadCropPdf}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Download Crop PDF</span>
            </button>
          </div>
        </div>

        {/* Crop Plans Grid */}
        {cropPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cropPlans.map((cropPlan) => (
              <div key={cropPlan._id} className="bg-white rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-6xl opacity-10">
                    {getCropEmoji(cropPlan.cropType)}
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-1">{cropPlan.planName}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getCropEmoji(cropPlan.cropType)}</span>
                      <span className="text-green-100">{cropPlan.cropType} • {cropPlan.variety}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Status Badge */}
                  <div className="flex justify-between items-start">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(cropPlan.status)}`}>
                      <span>{getStatusIcon(cropPlan.status)}</span>
                      <span>{cropPlan.status}</span>
                    </span>
                  </div>

                  {/* Key Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-500">Planting</p>
                          <p className="text-sm font-medium text-gray-800">
                            {new Date(cropPlan.plantingDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-500">Area</p>
                          <p className="text-sm font-medium text-gray-800">
                            {cropPlan.areaSize?.value} {cropPlan.areaSize?.unit}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <div>
                          <p className="text-xs text-gray-500">Harvest</p>
                          <p className="text-sm font-medium text-gray-800">
                            {new Date(cropPlan.harvestDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="text-sm font-medium text-gray-800">
                            {cropPlan.cycleDuration}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="bg-white rounded-lg p-4 space-y-3 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 flex items-center space-x-2">
                        <span className="text-green-600">🌱</span>
                        <span className="font-medium">Soil</span>
                      </span>
                      <span className="text-sm font-medium text-gray-800">{cropPlan.soilType || "-"}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 flex items-center space-x-2">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Irrigation</span>
                      </span>
                      <span className="text-sm font-medium text-gray-800">{cropPlan.irrigationMethod || "-"}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 flex items-center space-x-2">
                        <Droplets className="w-4 h-4 text-teal-500" />
                        <span className="font-medium">Water</span>
                      </span>
                      <span className="text-sm font-medium text-gray-800">
                        <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs border border-green-100">{cropPlan.Litres_of_water || "-"}</span>
                        <span className="ml-2 text-xs text-gray-500">{formatWaterDuration(cropPlan)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Fertilizer Schedule */}
                  {cropPlan.fertilizers && cropPlan.fertilizers.length > 0 && (
                    <div className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Beaker className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-800">Fertilizer Schedule</span>
                        </div>
                        <div className="text-xs text-gray-500">{cropPlan.fertilizers.length} items</div>
                      </div>

                      <div className="space-y-3">
                        {cropPlan.fertilizers.filter(f => f).slice(0, 6).map((fertilizer, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <div className="text-sm font-semibold text-green-800">{formatFertilizerDay(fertilizer.day)}</div>
                                  <div className="text-sm text-gray-800 font-medium">{fertilizer.notes || fertilizer.fertilizer || '-'}</div>
                                </div>
                                <div className="mt-3 flex items-center space-x-2">
                                  <div className="inline-flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full text-sm text-emerald-700 border border-emerald-100">Quantity: {fertilizer.quantity || '-'}</div>
                                  <div className="inline-flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full text-sm text-indigo-700 border border-indigo-100">Duration: {fertilizer.duration || '-'} {fertilizer.durationUnit || ''}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {cropPlan.fertilizers.length > 6 && (
                          <div className="text-center">
                            <span className="text-xs text-gray-500">+{cropPlan.fertilizers.length - 6} more schedules</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => navigate(`/crops/update/${cropPlan._id}`)}
                      className="inline-flex items-center space-x-2 bg-white border border-green-200 text-green-700 px-3 py-2 rounded-lg shadow-sm hover:bg-green-50 transition transform hover:-translate-y-0.5"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm font-medium">Update</span>
                    </button>

                    <button
                      onClick={() => navigate(`/crops/delete/${cropPlan._id}`)}
                      className="inline-flex items-center space-x-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg shadow-sm hover:bg-red-100 transition transform hover:-translate-y-0.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto border border-gray-200">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sprout className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Crop Plans Found</h3>
              <p className="text-gray-600 mb-6">Create your first crop plan to get started with smart farming.</p>
              <button onClick={() => navigate('/crops/add')} className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg">
                <Plus className="w-5 h-5" />
                <span>Create First Plan</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllCropPlans;
