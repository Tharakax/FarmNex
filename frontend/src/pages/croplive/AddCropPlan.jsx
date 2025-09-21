import React, { useState } from "react";
import { useToast } from "./ToastProvider.jsx";
import { Calendar, Droplets, Sprout, MapPin, Beaker, Clock, Plus, Trash2, Leaf, ChevronUp, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import BackButton from '../../components/common/BackButton';


function AddCropPlan() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  const [pName, setPName] = useState("");
  const [cropType, setCropType] = useState("");
  const [variety, setVariety] = useState("");
  const [plantingDate, setPlantingDate] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [areaSize, setAreaSize] = useState({
    value: "",
    unit: "acres"
  });
  const AREA_STEP = 0.5;

  const incrementArea = () => {
    const val = parseFloat(areaSize.value) || 0;
    setAreaSize({ ...areaSize, value: (val + AREA_STEP).toString() });
  };

  const decrementArea = () => {
    const val = parseFloat(areaSize.value) || 0;
    const next = Math.max(0, val - AREA_STEP);
    setAreaSize({ ...areaSize, value: next.toString() });
  };
  const [soilType, setSoilType] = useState("");
  const [irrigationMethod, setIrrigationMethod] = useState("");

  const [fertilizers, setFertilizers] = useState([
    { day: "", fertilizer: "", quantity: "", duration: "" }
  ]);
  const [status, setStatus] = useState("");

  const [Litres_of_water, setLitresOfWater] = useState("");
  const [Duration, setDuration] = useState("");

  const handleFertilizerChange = (index, field, value) => {
    const newFertilizers = [...fertilizers];
    newFertilizers[index][field] = value;
    setFertilizers(newFertilizers);
  };

  const addFertilizer = () => {
    setFertilizers([...fertilizers, { day: "", fertilizer: "", quantity: "", duration: "" }]);
  };

  const removeFertilizer = (index) => {
    const updated = [...fertilizers];
    updated.splice(index, 1);
    setFertilizers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validation
    if (!pName || !cropType || !variety || !plantingDate || !harvestDate) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
  
    if (new Date(harvestDate) <= new Date(plantingDate)) {
      addToast('Harvest date must be after planting date', 'error');
      return;
    }
  
    const cycleDuration = Math.ceil(
      (new Date(harvestDate) - new Date(plantingDate)) / (1000 * 60 * 60 * 24)
    );
  
    const hasEmptyFertilizerFields = fertilizers.some(
      (fer) => !fer.day || !fer.fertilizer || !fer.quantity || !fer.duration
    );
  
    if (hasEmptyFertilizerFields) {
      addToast('Please fill all fields in fertilizer schedule', 'error');
      return;
    }
  
    const newCropPlan = {
      planName: pName,
      cropType,
      variety,
      plantingDate,
      harvestDate,
      cycleDuration,
      areaSize: {
        value: parseFloat(areaSize.value) || 0,
        unit: areaSize.unit || "acres",
      },
      soilType,
      irrigationMethod,
      fertilizers: fertilizers.map((fertilizer) => ({
        day: parseInt(fertilizer.day) || 0,
        fertilizer: fertilizer.fertilizer,
        quantity: fertilizer.quantity,
        duration: fertilizer.duration,
      })),
      status,
      Litres_of_water,
      Duration,
    };
  
    try {
  // use 127.0.0.1 to avoid possible localhost resolution issues on some systems
  const response = await axios.post("http://localhost:3000/api/crop/add", newCropPlan);
  
      if (response.status === 201 || response.status === 200) {
        addToast('New Crop Plan Added Successfully!', 'created');
        
        // Reset form
        setPName("");
        setCropType("");
        setVariety("");
        setPlantingDate("");
        setHarvestDate("");
        setAreaSize({ value: "", unit: "acres" });
        setSoilType("");
        setIrrigationMethod("");
        setFertilizers([{ day: "", fertilizer: "", quantity: "", duration: "" }]);
        setStatus("");
        setLitresOfWater("");
        setDuration("");
  
        navigate("/crops"); // Redirect to AllCropPlans page
  }
    } catch (error) {
      console.error("Failed to add crop plan:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        console.error("No response received, request info:", error.request);
      } else {
        console.error("Error preparing request:", error.message);
      }
  addToast('Failed to add crop plan. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 p-6 border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <BackButton label="Back to Crops" className="" />
          </div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-100 p-3 rounded-full">
              <Sprout className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Smart Farm Management</h1>
              <p className="text-gray-600">Create a new crop cultivation plan</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
            <div className="flex items-center space-x-2 mb-6">
              <Leaf className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-semibold text-gray-800">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <span>Plan Name</span>
                  <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={pName} 
                  required 
                  onChange={(e) => setPName(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Enter plan name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <span>Crop Type</span>
                  <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  value={cropType} 
                  onChange={(e) => setCropType(e.target.value)}
                  required
                >
                  <option value="">Select Crop Type</option>
                  <option value="Tomato">🍅 Tomato</option>
                  <option value="Rice">🌾 Rice</option>
                  <option value="Carrot">🥕 Carrot</option>
                  <option value="Potato">🥔 Potato</option>
                  <option value="Other">🌱 Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Variety</label>
                <input 
                  type="text" 
                  value={variety} 
                  onChange={(e) => setVariety(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Enter variety"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Status</span>
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Planned">📋 Planned</option>
                  <option value="In Progress">🚀 In Progress</option>
                  <option value="Completed">✅ Completed</option>
                  <option value="Delayed">⏰ Delayed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dates and Area */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
            <div className="flex items-center space-x-2 mb-6">
              <Calendar className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-semibold text-gray-800">Dates & Area</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <span>Planting Date</span>
                  <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  value={plantingDate} 
                  required 
                  onChange={(e) => setPlantingDate(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Harvest Date</label>
                <input 
                  type="date" 
                  value={harvestDate} 
                  onChange={(e) => setHarvestDate(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Area Size</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={areaSize.value || ''}
                    onChange={(e) => setAreaSize({ ...areaSize, value: e.target.value })}
                    className="w-full pr-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    step="0.5"
                    placeholder="0.0"
                    min="0"
                  />
                  {/* Minimal up/down controls placed to the right, above unit select. Keep layout unchanged. */}
                  <div className="absolute right-36 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1 z-40">
                    <button type="button" onClick={incrementArea} className="p-1 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50">
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button type="button" onClick={decrementArea} className="p-1 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  <select
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-3 border border-gray-300 rounded-md bg-white"
                    value={areaSize.unit || 'acres'}
                    onChange={(e) => setAreaSize({ ...areaSize, unit: e.target.value })}
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Soil and Irrigation */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
            <div className="flex items-center space-x-2 mb-6">
              <Droplets className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-semibold text-gray-800">Soil & Irrigation</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Soil Type</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  value={soilType} 
                  onChange={(e) => setSoilType(e.target.value)}
                >
                  <option value="">Select Soil Type</option>
                  <option value="Sandy">🏖️ Sandy</option>
                  <option value="Loamy">🌱 Loamy</option>
                  <option value="Clay">🧱 Clay</option>
                  <option value="Silt">💧 Silt</option>
                  <option value="Peaty">🌿 Peaty</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Irrigation Method</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  value={irrigationMethod}
                  onChange={(e) => setIrrigationMethod(e.target.value)}
                >
                  <option value="">Select Method</option>
                  <option value="Drip">💧 Drip</option>
                  <option value="Sprinkler">🚿 Sprinkler</option>
                  <option value="Manual">🪣 Manual</option>
                  <option value="Flood">🌊 Flood</option>
                  <option value="None">❌ None</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fertilizer Schedule */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Beaker className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-semibold text-gray-800">Fertilizer Schedule</h2>
              </div>
              <button 
                type="button" 
                onClick={addFertilizer}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Fertilizer</span>
              </button>
            </div>
            
            <div className="space-y-6">
              {fertilizers.map((fer, index) => (
                <div key={index} className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-green-300 transition-all duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Day</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        value={fer.day}
                        onChange={(e) => handleFertilizerChange(index, "day", e.target.value)} 
                        required 
                        placeholder="1"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Fertilizer</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        value={fer.fertilizer}
                        onChange={(e) => handleFertilizerChange(index, "fertilizer", e.target.value)} 
                        required
                        placeholder="NPK 10-10-10"
                      /> 
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Quantity (Kg)</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        value={fer.quantity.replace(' kg', '')}
                        onChange={(e) => handleFertilizerChange(index, "quantity", `${e.target.value} kg`)} 
                        required
                        placeholder="5"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Duration</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        value={fer.duration}
                        onChange={(e) => handleFertilizerChange(index, "duration", e.target.value)} 
                        required
                      >
                        <option value="">Select Duration</option>
                        <option value="every day">Every Day</option>
                        <option value="every 2 days">Every 2 Days</option>
                        <option value="every 3 days">Every 3 Days</option>
                        <option value="every 4 days">Every 4 Days</option>
                        <option value="every 5 days">Every 5 Days</option>
                        <option value="every 6 days">Every 6 Days</option>
                        <option value="every 7 days">Every 7 Days</option>
                        <option value="every 8 days">Every 8 Days</option>
                        <option value="every 9 days">Every 9 Days</option>
                        <option value="every 10 days">Every 10 Days</option>
                        <option value="every 2 weeks">Every 2 Weeks</option>
                        <option value="every 3 weeks">Every 3 Weeks</option>
                        <option value="every 1 month">Every Month</option>
                        <option value="every 2 months">Every 2 Months</option>
                        <option value="every 3 months">Every 3 Months</option>
                        <option value="every 6 months">Every 6 Months</option>
                      </select>
                    </div>
                  </div>

                  {fertilizers.length > 1 && (
                    <div className="mt-4 flex justify-end">
                      <button 
                        type="button" 
                        onClick={() => removeFertilizer(index)}
                        className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Water Supply */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
            <div className="flex items-center space-x-2 mb-6">
              <Droplets className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-800">Water Supply Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">Liters per day</label>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {Litres_of_water || '0 L/day'}
                  </span>
                </div>
                <input
                  type="range"
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  min="100"
                  max="2000"
                  step="50"
                  value={Litres_of_water.replace(' L/day', '') || 100}
                  onChange={(e) => setLitresOfWater(`${e.target.value} L/day`)}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>100L</span>
                  <span>2000L</span>
                </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">Watering Frequency</label>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {Duration ? `${Duration} Days` : '1 Day'}
                    </span>
                  </div>
                  <input
                    type="range"
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    min="1"
                    max="30"
                    step="1"
                    value={Duration || 1}
                    onChange={(e) => setDuration(e.target.value)} 
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>1 Day</span>
                    <span>30 Days</span>
                  </div>
                </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Sprout className="w-6 h-6" />
              <span className="text-lg">Create Crop Plan</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}

export default AddCropPlan;