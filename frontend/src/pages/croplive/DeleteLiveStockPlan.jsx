import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLivestockById, deleteLivestock } from "../../services/livestockService";
import { useToast } from "./ToastProvider.jsx";
import Swal from "sweetalert2";
import { AlertCircle, ArrowLeft, Trash2 } from "lucide-react";

function DeleteLivestockPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [livestock, setLivestock] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const res = await getLivestockById(id);
      setLivestock(res.data);
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this livestock plan? This action cannot be undone.",
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

      await deleteLivestock(id);

      Swal.fire("Deleted!", "Livestock plan has been deleted successfully.", "success");

      navigate("/farmerdashboard?tab=crop");
    } catch (err) {
      console.error(err);
      Swal.fire("Error!", "Failed to delete livestock plan.", "error");
    }
  };

  const handleCancel = () => {
    navigate("/farmerdashboard?tab=crop");
  };

  const formatFrequency = (val) => {
    if (!val && val !== 0) return '-';
    const n = Number(val);
    if (Number.isNaN(n)) return val;
    return `Every ${n} Hour${n === 1 ? '' : 's'}`;
  };

  if (!livestock) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading livestock details...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Delete Livestock</h1>
          <p className="mt-2 text-gray-600">Review the details before confirming deletion</p>
        </div>

        {/* Warning Alert */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-800">Warning</h3>
              <p className="text-sm text-red-700 mt-1">
                This action cannot be undone. All data associated with this livestock will be permanently removed.
              </p>
            </div>
          </div>
        </div>

        {/* Livestock Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Livestock Information</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Livestock ID</label>
                <p className="text-sm text-gray-900 font-medium">{livestock.livestockId || '-'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Animal Type</label>
                <p className="text-sm text-gray-900 font-medium">{livestock.animalType || '-'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Breed</label>
                <p className="text-sm text-gray-900">{livestock.breed || '-'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</label>
                <p className="text-sm text-gray-900">{livestock.gender || '-'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Birth</label>
                <p className="text-sm text-gray-900">{livestock.dob ? new Date(livestock.dob).toLocaleDateString() : '-'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Weight</label>
                <p className="text-sm text-gray-900">{livestock.weight ? `${livestock.weight} kg` : '-'}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Housing</label>
                <p className="text-sm text-gray-900">{livestock.housing || '-'}</p>
              </div>
            </div>

            {/* Feedings Section */}
            <div className="pt-4 border-t border-gray-200">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-3">Feeding Schedule</label>
              {Array.isArray(livestock.feedings) && livestock.feedings.length > 0 ? (
                <div className="space-y-2">
                  {livestock.feedings.map((f, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-md p-3 border border-gray-200">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <span className="ml-2 text-gray-900 font-medium">{f.feedType || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Quantity:</span>
                          <span className="ml-2 text-gray-900 font-medium">{f.quantity || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Frequency:</span>
                          <span className="ml-2 text-gray-900 font-medium">{formatFrequency(f.frequency)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No feeding records available</p>
              )}
            </div>

            {/* Health Records Section */}
            <div className="pt-4 border-t border-gray-200">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-3">Health Records</label>
              {Array.isArray(livestock.healthRecords) && livestock.healthRecords.length > 0 ? (
                <div className="space-y-2">
                  {livestock.healthRecords.map((h, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-md p-3 border border-gray-200">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <span className="ml-2 text-gray-900 font-medium">{h.date ? new Date(h.date).toLocaleDateString() : '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Treatment:</span>
                          <span className="ml-2 text-gray-900 font-medium">{h.treatment || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Veterinarian:</span>
                          <span className="ml-2 text-gray-900 font-medium">{h.vet || '-'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No health records available</p>
              )}
            </div>
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
            Delete Livestock
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteLivestockPlan;