import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Loader2, Save, Droplets, Calendar, MapPin, Beaker, Clock } from 'lucide-react';

import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useToast } from './ToastProvider.jsx';

function UpdateCropPlan() {

    const navigate = useNavigate();
    const { id } = useParams(); 
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();

    const today = new Date().toISOString().split("T")[0];

    const [formData, setFormData] = useState({
        planName: "",
        cropType: "",
        variety: "",
        plantingDate: "",
        harvestDate: "",
        areaSize: {
            value: "",
            unit: "acres"
        },
        soilType: "",
        irrigationMethod: "",
        fertilizers: [{ 
            day: "", 
            fertilizer: "", 
            quantity: "", 
            duration: "" 
        }],
        status: "Planned",
        Litres_of_water: "500 L/day",
        Duration: "7",
    });

    // Mock data fetch simulation
        useEffect(() => {
                const fetchCropPlan = async () => {
                        setIsLoading(true);
                        try {
                            const response = await axios.get(`http://localhost:3000/api/crop/get/${id}`);
                            // Backend might return either { Crop: {...} } (old routes) or the crop object directly (controller).
                            let cropData = null;
                            if (response && response.data) {
                                if (response.data.Crop) cropData = response.data.Crop;
                                else if (response.data.crop) cropData = response.data.crop;
                                else cropData = response.data;
                            }

                            if (!cropData) throw new Error('Empty crop data');

                            // Ensure date strings are in YYYY-MM-DD format for date inputs
                            const fmtDate = (d) => {
                                if (!d) return "";
                                const dt = new Date(d);
                                if (isNaN(dt)) return String(d).slice(0, 10);
                                return dt.toISOString().split('T')[0];
                            };

                            setFormData({
                                planName: cropData.planName || "",
                                cropType: cropData.cropType || "",
                                variety: cropData.variety || "",
                                plantingDate: fmtDate(cropData.plantingDate),
                                harvestDate: fmtDate(cropData.harvestDate),
                                areaSize: {
                                    value: cropData.areaSize?.value ?? "",
                                    unit: cropData.areaSize?.unit || "acres"
                                },
                                soilType: cropData.soilType || "",
                                irrigationMethod: cropData.irrigationMethod || "",
                                fertilizers: Array.isArray(cropData.fertilizers) && cropData.fertilizers.length > 0
                                    ? cropData.fertilizers
                                    : [{ day: "", fertilizer: "", quantity: "", duration: "" }],
                                status: cropData.status || "Planned",
                                Litres_of_water: cropData.Litres_of_water || cropData.litres_of_water || "500 L/day",
                                Duration: cropData.Duration || "7"
                            });
                        } catch (error) {
                            console.error("Failed to fetch crop plan:", error);
                            addToast('Failed to load crop plan data.', 'error');
                        } finally {
                            setIsLoading(false);
                        }
                    };
      
                fetchCropPlan();
            }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'waterSupply.litersPerDay') {
            setFormData(prev => ({
                ...prev,
                Litres_of_water: `${value} L/day`
            }));
        } 
        else if (name === 'waterSupply.durationDays') {
            setFormData(prev => ({
                ...prev,
                Duration: value
            }));
        }
        else if (name.startsWith('areaSize.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                areaSize: {
                    ...prev.areaSize,
                    [field]: value
                }
            }));
        } 
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFertilizerChange = (index, field, value) => {
        const newFertilizers = formData.fertilizers.map((fertilizer, i) =>
            i === index ? { ...fertilizer, [field]: value } : fertilizer
        );
        setFormData(prev => ({ ...prev, fertilizers: newFertilizers }));
    };

    const addFertilizer = () => {
        setFormData(prev => ({
            ...prev,
            fertilizers: [...prev.fertilizers, { day: "", fertilizer: "", quantity: "", duration: "" }]
        }));
    };

    const removeFertilizer = (index) => {
        setFormData(prev => ({
            ...prev,
            fertilizers: prev.fertilizers.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
                await axios.put(`http://localhost:3000/api/crop/update/${id}`, formData);
                addToast('Crop Plan Updated Successfully', 'updated');
                navigate('/crops');
        } catch (error) {
            console.error("Failed to update crop plan:", error);
                addToast('Failed to update crop plan', 'error');
        }
    };

    const handleGoBack = () => {
        navigate("/crops");
    };

    const getStatusColor = (status) => {
        const colors = {
            'Planned': 'bg-blue-100 text-blue-800',
            'In Progress': 'bg-yellow-100 text-yellow-800',
            'Completed': 'bg-green-100 text-green-800',
            'Delayed': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // Format fertilizer day: numeric -> 'Day N'
    const formatFertilizerDay = (day) => {
        if (day === null || day === undefined || day === '') return '-';
        if (typeof day === 'number') return `Day ${day}`;
        if (typeof day === 'string' && /^\d+$/.test(day.trim())) return `Day ${day.trim()}`;
        return day;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                    <p className="text-gray-600">Loading Crop Plan data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            {/* Navigation Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={handleGoBack}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to Plans</span>
                        </button>
                        <h1 className="text-xl font-semibold text-gray-900">Update Crop Plan</h1>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formData.status)}`}>
                            {formData.status}
                        </div>
                    </div>
                </div>
            </div>

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                                Basic Information
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Plan Name
                                    </label>
                                    <input
                                        type="text"
                                        name="planName"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        value={formData.planName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Crop Type
                                    </label>
                                    <select
                                        name="cropType"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        value={formData.cropType}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Crop Type</option>
                                        <option value="Tomato">Tomato</option>
                                        <option value="Rice">Rice</option>
                                        <option value="Carrot">Carrot</option>
                                        <option value="Potato">Potato</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Variety
                                    </label>
                                    <input
                                        type="text"
                                        name="variety"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        value={formData.variety}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="Planned">Planned</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Delayed">Delayed</option>
                                    </select>
                                </div>
                            </div>

                                                    {/* Read-only Plan Details preview (matches AllCropPlans tabs) */}
                                                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                                                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Beaker className="w-5 h-5 mr-2 text-green-600"/> Plan Details Preview</h2>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                                    <div>
                                                                            <p className="text-xs text-gray-500">Planting</p>
                                                                            <p className="text-sm font-medium text-gray-800">{formData.plantingDate ? new Date(formData.plantingDate).toLocaleDateString() : '-'}</p>
                                                                    </div>
                                                                    <div>
                                                                            <p className="text-xs text-gray-500">Harvest</p>
                                                                            <p className="text-sm font-medium text-gray-800">{formData.harvestDate ? new Date(formData.harvestDate).toLocaleDateString() : '-'}</p>
                                                                    </div>
                                                                    <div>
                                                                            <p className="text-xs text-gray-500">Area</p>
                                                                            <p className="text-sm font-medium text-gray-800">{formData.areaSize?.value || '-'} {formData.areaSize?.unit || ''}</p>
                                                                    </div>
                                                                    <div>
                                                                            <p className="text-xs text-gray-500">Soil</p>
                                                                            <p className="text-sm font-medium text-gray-800">{formData.soilType || '-'}</p>
                                                                    </div>
                                                                    <div>
                                                                            <p className="text-xs text-gray-500">Irrigation</p>
                                                                            <p className="text-sm font-medium text-gray-800">{formData.irrigationMethod || '-'}</p>
                                                                    </div>
                                                                    <div>
                                                                            <p className="text-xs text-gray-500">Water</p>
                                                                            <p className="text-sm font-medium text-gray-800">{formData.Litres_of_water || '-'}</p>
                                                                    </div>
                                                            </div>

                                                            {formData.fertilizers && formData.fertilizers.length > 0 && (
                                                                <div>
                                                                    <h3 className="text-sm font-medium text-gray-800 mb-2 flex items-center"><Calendar className="w-4 h-4 mr-2 text-yellow-600"/> Fertilizer Schedule</h3>
                                                                    <div className="space-y-2">
                                                                        {formData.fertilizers.filter(f => f).slice(0,6).map((fer, i) => (
                                                                            <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-100">
                                                                                <div>
                                                                                    <div className="text-sm font-semibold text-green-800">{formatFertilizerDay(fer.day)}</div>
                                                                                    <div className="text-xs text-gray-700">{fer.fertilizer || '-'}</div>
                                                                                </div>
                                                                                <div className="flex items-center space-x-2">
                                                                                    <div className="inline-block bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm border border-emerald-100">Quantity: {fer.quantity || '-'}</div>
                                                                                    <div className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm border border-indigo-100">Duration: {fer.duration || '-'}</div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Planting Date
                                    </label>
                                    <input
                                        type="date"
                                        name="plantingDate"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        value={formData.plantingDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Harvest Date
                                    </label>
                                    <input
                                        type="date"
                                        name="harvestDate"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        value={formData.harvestDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Area Size
                                    </label>
                                    <div className="flex space-x-3">
                                        <input
                                            type="number"
                                            name="areaSize.value"
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                            value={formData.areaSize.value}
                                            onChange={handleChange}
                                            step="0.1"
                                            placeholder="0.0"
                                            min="0"
                                        />
                                        <select
                                            name="areaSize.unit"
                                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                            value={formData.areaSize.unit}
                                            onChange={handleChange}
                                        >
                                            <option value="acres">Acres</option>
                                            <option value="hectares">Hectares</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Soil Type
                                    </label>
                                    <select
                                        name="soilType"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        value={formData.soilType}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Soil Type</option>
                                        <option value="Sandy">Sandy</option>
                                        <option value="Loamy">Loamy</option>
                                        <option value="Clay">Clay</option>
                                        <option value="Silt">Silt</option>
                                        <option value="Peaty">Peaty</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Irrigation Method
                                </label>
                                <select
                                    name="irrigationMethod"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                    value={formData.irrigationMethod}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Method</option>
                                    <option value="Drip">Drip</option>
                                    <option value="Sprinkler">Sprinkler</option>
                                    <option value="Manual">Manual</option>
                                    <option value="Flood">Flood</option>
                                    <option value="None">None</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Water Supply Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Droplets className="w-5 h-5 mr-2 text-blue-600" />
                                Water Supply Details
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Liters per day: <span className="font-semibold text-blue-600">{formData.Litres_of_water}</span>
                                </label>
                                <input
                                    type="range"
                                    name="waterSupply.litersPerDay"
                                    min="100"
                                    max="2000"
                                    step="50"
                                    value={formData.Litres_of_water.replace(' L/day', '')}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-sm text-gray-500 mt-1">
                                    <span>100L</span>
                                    <span>2000L</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Watering Frequency: <span className="font-semibold text-blue-600">{formData.Duration} days</span>
                                </label>
                                <input
                                    type="range"
                                    name="waterSupply.durationDays"
                                    min="1"
                                    max="30"
                                    step="1"
                                    value={formData.Duration}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-sm text-gray-500 mt-1">
                                    <span>1 day</span>
                                    <span>30 days</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fertilizer Schedule Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-yellow-50 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-yellow-600" />
                                Fertilizer Schedule
                            </h2>
                            <button
                                type="button"
                                onClick={addFertilizer}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Fertilizer</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {formData.fertilizers.map((fer, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-gray-700">
                                            Fertilizer #{index + 1}
                                        </h3>
                                        {formData.fertilizers.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeFertilizer(index)}
                                                className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="text-sm">Remove</span>
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Day
                                            </label>
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                                value={fer.day}
                                                onChange={(e) => handleFertilizerChange(index, "day", e.target.value)}
                                                required
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Fertilizer
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                                value={fer.fertilizer}
                                                onChange={(e) => handleFertilizerChange(index, "fertilizer", e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Quantity (kg)
                                            </label>
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                                value={fer.quantity}
                                                onChange={(e) => handleFertilizerChange(index, "quantity", e.target.value)}
                                                required
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Duration
                                            </label>
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end space-x-4 pt-6 pb-8">
                        <button
                            type="button"
                            onClick={handleGoBack}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit} 
                            className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            <span>Update Crop Plan</span>
                        </button>
                    </div>
                    </form>
            </div>

            <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #059669;
                    cursor: pointer;
                    border: 2px solid #ffffff;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .slider::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #059669;
                    cursor: pointer;
                    border: 2px solid #ffffff;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </div>
    );
}

export default UpdateCropPlan;