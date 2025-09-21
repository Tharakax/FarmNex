import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2, ArrowLeft, AlertTriangle, Loader2, Calendar } from "lucide-react";
import axios from "axios";
import { useToast } from './ToastProvider.jsx';

function DeleteCropPlan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  // Format fertilizer day: numeric -> 'Day N'
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

  const handleDelete = () => setShowConfirmation(true);
  const cancelDelete = () => setShowConfirmation(false);

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
  const response = await axios.delete(`http://localhost:3000/api/crop/delete/${id}`);
  addToast(response.data.status || 'Crop Plan Deleted Successfully', 'deleted');
  navigate('/crops');
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
  addToast('Failed to delete crop plan', 'error');
    } finally {
      setIsDeleting(false);
      setShowConfirmation(false);
    }
  };

  const goBack = () => navigate("/crops");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading Crop Plan data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6 flex items-center justify-between">
          <button
            onClick={goBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Crop Plans</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <Trash2 className="w-6 h-6 text-red-500" />
            <span>Delete Crop Plan</span>
          </h1>
        </div>

        {/* Warning Alert */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-semibold">
              Warning: This action cannot be undone
            </h3>
            <p className="text-red-700 text-sm mt-1">
              Please review the crop plan details below before confirming deletion.
            </p>
          </div>
        </div>

        {/* Crop Plan Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Crop Plan Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
              <div className="p-3 bg-gray-50 rounded-md border text-gray-800">{formData.planName}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Crop Type</label>
              <div className="p-3 bg-gray-50 rounded-md border text-gray-800">{formData.cropType}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Variety</label>
              <div className="p-3 bg-gray-50 rounded-md border text-gray-800">{formData.variety}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
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
          </div>
          {/* Fertilizer Schedule (read-only) */}
          {formData.fertilizers && formData.fertilizers.length > 0 && (
            <div className="mb-6">
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
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={goBack}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Cancel & Go Back</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Crop Plan</span>
            </button>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>"{formData.planName}"</strong>? This action cannot be undone.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeleteCropPlan;
