import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2, ArrowLeft, AlertCircle, Loader2, Calendar } from "lucide-react";
import axios from "axios";
import { useToast } from './ToastProvider.jsx';
import Swal from "sweetalert2";

function DeleteCropPlan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    planName: "",
    cropType: "",
    variety: "",
    plantingDate: "",
    harvestDate: "",
    areaSize: { value: "", unit: "acres" },
    soilType: "",
    irrigationMethod: "",
    fertilizers: [{ day: "", fertilizer: "", quantity: "", duration: "" }],
    status: "Planned",
    Litres_of_water: "",
    Duration: "",
  });

  const { addToast } = useToast();

  const formatFertilizerDay = (day) => {
    if (day === null || day === undefined || day === '') return '-';
    if (typeof day === 'number') return `Day ${day}`;
    if (typeof day === 'string' && /^\d+$/.test(day.trim())) return `Day ${day.trim()}`;
    return day;
  };

  useEffect(() => {
    const fetchCrop = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:3000/api/crop/get/${id}`);
        const crop = response.data.Crop || response.data;

        setFormData({
          planName: crop.planName || "",
          cropType: crop.cropType || "",
          variety: crop.variety || "",
          plantingDate: crop.plantingDate?.split("T")[0] || "",
          harvestDate: crop.harvestDate?.split("T")[0] || "",
          areaSize: {
            value: crop.areaSize?.value || "",
            unit: crop.areaSize?.unit || "acres",
          },
          soilType: crop.soilType || "",
          irrigationMethod: crop.irrigationMethod || "",
          fertilizers: crop.fertilizers?.length
            ? crop.fertilizers.map((fer) => ({
                day: fer.day?.toString() || "",
                fertilizer: fer.fertilizer || "",
                quantity: fer.quantity || "",
                duration: fer.duration || "",
              }))
            : [{ day: "", fertilizer: "", quantity: "", duration: "" }],
          status: crop.status || "Planned",
          Litres_of_water: crop.Litres_of_water || "",
          Duration: crop.Duration?.match(/\d+/)?.[0] || crop.Duration || "",
        });
      } catch (err) {
        console.error("Fetch crop error:", err.response?.data || err.message);
        addToast('Failed to fetch crop plan', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrop();
  }, [id]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this crop plan? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Deleting...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await axios.delete(`http://localhost:3000/api/crop/delete/${id}`);
      
      Swal.fire("Deleted!", "Crop plan has been deleted successfully.", "success");

      navigate("/farmerdashboard?tab=crop");
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      Swal.fire("Error!", "Failed to delete crop plan.", "error");
    }
  };

  const handleCancel = () => {
    navigate("/farmerdashboard?tab=crop");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading crop plan details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Delete Crop Plan</h1>
          <p className="mt-2 text-gray-600">Review the details before confirming deletion</p>
        </div>

        {/* Warning Alert */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-800">Warning</h3>
              <p className="text-sm text-red-700 mt-1">
                This action cannot be undone. All data associated with this crop plan will be permanently removed.
              </p>
            </div>
          </div>
        </div>

        {/* Crop Plan Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Crop Plan Information</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Plan Name</label>
                <p className="text-sm text-gray-900 font-medium">{formData.planName || '-'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Crop Type</label>
                <p className="text-sm text-gray-900 font-medium">{formData.cropType || '-'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Variety</label>
                <p className="text-sm text-gray-900">{formData.variety || '-'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                <div>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      formData.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : formData.status === "In Progress"
                        ? "bg-blue-100 text-blue-800"
                        : formData.status === "Delayed"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {formData.status}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Planting Date</label>
                <p className="text-sm text-gray-900">{formData.plantingDate ? new Date(formData.plantingDate).toLocaleDateString() : '-'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Harvest Date</label>
                <p className="text-sm text-gray-900">{formData.harvestDate ? new Date(formData.harvestDate).toLocaleDateString() : '-'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Area Size</label>
                <p className="text-sm text-gray-900">{formData.areaSize.value ? `${formData.areaSize.value} ${formData.areaSize.unit}` : '-'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Soil Type</label>
                <p className="text-sm text-gray-900">{formData.soilType || '-'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Irrigation Method</label>
                <p className="text-sm text-gray-900">{formData.irrigationMethod || '-'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Water Required</label>
                <p className="text-sm text-gray-900">{formData.Litres_of_water ? `${formData.Litres_of_water} Litres` : '-'}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</label>
                <p className="text-sm text-gray-900">{formData.Duration ? `${formData.Duration} days` : '-'}</p>
              </div>
            </div>

            {/* Fertilizer Schedule Section */}
            {formData.fertilizers && formData.fertilizers.length > 0 && formData.fertilizers[0].fertilizer && (
              <div className="pt-4 border-t border-gray-200">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Fertilizer Schedule
                </label>
                <div className="space-y-2">
                  {formData.fertilizers.filter(f => f && f.fertilizer).map((fer, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-md p-3 border border-gray-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Day:</span>
                          <span className="ml-2 text-gray-900 font-medium">{formatFertilizerDay(fer.day)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <span className="ml-2 text-gray-900 font-medium">{fer.fertilizer || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Quantity:</span>
                          <span className="ml-2 text-gray-900 font-medium">{fer.quantity || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <span className="ml-2 text-gray-900 font-medium">{fer.duration || '-'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={handleCancel}
            className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Crop Plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteCropPlan;