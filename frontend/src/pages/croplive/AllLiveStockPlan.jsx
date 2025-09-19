import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLivestock } from "../../services/livestockService";
import { useToast } from "./ToastProvider.jsx";

import {
  Plus,
  Activity,
  Edit,
  Trash2,
  PawPrint,
  Calendar,
  MapPin,
  Droplets,
  HeartPulse,
  BarChart3
} from "lucide-react";

function AllLiveStockPlans() {
  const navigate = useNavigate();
  const [livestock, setLivestock] = useState([]);
  const [activeTab, setActiveTab] = useState({});
  const { addToast } = useToast();

  const computeAge = (dob) => {
    if (!dob) return "-";
    const birth = new Date(dob);
    const now = new Date();
    const diffMs = now - birth;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    if (years > 0) return `${years} yr${years > 1 ? "s" : ""}`;
    const months = Math.floor(diffDays / 30);
    if (months > 0) return `${months} mo${months > 1 ? "s" : ""}`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  };

  const formatFrequency = (val) => {
    if (val === undefined || val === null || val === "") return "-";
    const n = Number(val);
    if (Number.isNaN(n)) return val;
    return `Every ${n} Hour${n === 1 ? "" : "s"}`;
  };

  useEffect(() => {
    const fetchLivestock = async () => {
      try {
        const response = await getLivestock();
        setLivestock(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to fetch livestock:", error);
        if (error.response) console.error("Status:", error.response.status, "Data:", error.response.data);
        addToast("Failed to load livestock data", "error");
      }
    };
    fetchLivestock();
  }, []);

  const getAnimalEmoji = (animalType) => {
    const emojiMap = {
      Cow: "🐄",
      Goat: "🐐",
      Sheep: "🐑",
      Chicken: "🐓",
      Pig: "🐖",
      Other: "🐾",
    };
    return emojiMap[animalType] || "🐾";
  };

  const formatFeedings = (animal) => {
    if (!animal) return "-";
    if (Array.isArray(animal.feedings) && animal.feedings.length) {
      const meaningful = animal.feedings
        .map((f) => ({
          feedType: f.feedType || f.feed || "",
          quantity: f.quantity || "",
          frequency: f.frequency || "",
        }))
        .filter(
          (f) =>
            (f.feedType && f.feedType.trim()) ||
            (f.quantity && f.quantity.toString().trim()) ||
            (f.frequency && f.frequency.trim())
        );
      if (meaningful.length) {
        return meaningful
          .map(
            (f) =>
              `${f.feedType || "(type)"}${
                f.quantity ? ` (${f.quantity})` : ""
              }${f.frequency ? ` ${formatFrequency(f.frequency)}` : ""}`
          )
          .join(", ");
      }
    }
    if (animal.feed) return animal.feed;
    if (animal.feeding && animal.feeding.feedingPlan)
      return animal.feeding.feedingPlan;
    return "-";
  };

  const getLastHealth = (animal) => {
    if (!animal) return "Healthy";
    if (Array.isArray(animal.healthRecords) && animal.healthRecords.length) {
      const meaningful = animal.healthRecords.filter(
        (r) =>
          (r.treatment && r.treatment.toString().trim()) ||
          (r.vet && r.vet.toString().trim()) ||
          r.date
      );
      const last = meaningful.length
        ? meaningful[meaningful.length - 1]
        : animal.healthRecords[animal.healthRecords.length - 1];
      const date = last.date
        ? ` ${new Date(last.date).toLocaleDateString()} -`
        : "";
      if (last.treatment && last.treatment.toString().trim())
        return `${date} ${last.treatment}`.trim();
      if (last.vet && last.vet.toString().trim()) return `Vet: ${last.vet}`;
      return "Healthy";
    }
    if (animal.health && animal.health.healthStatus)
      return animal.health.healthStatus;
    return "Healthy";
  };

  const downloadPdfReport = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/livestock/report/pdf",
        {
          method: "GET",
        }
      );

      if (!response.ok) throw new Error("Failed to download PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "livestock_report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF download failed:", error);
      addToast("Failed to download PDF report", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-green-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              All Livestock
            </h2>
            <p className="text-gray-600">
              Manage and monitor all your farm livestock
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
            <Activity className="w-4 h-4" />
            <span>{livestock.length} Total Animals</span>
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
        onClick={() => navigate("/livestock/add")}
        >
        + Add New Livestock Plan
      </button>
          <button
            onClick={downloadPdfReport}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Download PDF</span>
          </button>
        </div>

        {/* Livestock Grid */}
        {livestock.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {livestock.map((animal) => (
              <div
                key={animal._id}
                className="bg-white rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white relative">
                  <div className="absolute top-0 right-0 text-6xl opacity-10">
                    {getAnimalEmoji(animal.animalType)}
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-1">
                      {animal.animalType}
                    </h3>
                    <p className="text-green-100">
                      {animal.breed || "Unknown Breed"}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Gender & Age */}
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Gender: {animal.gender || "-"}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      Age: {computeAge(animal.dob)}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-gray-800">
                        {animal.dob
                          ? new Date(animal.dob).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <p className="text-sm text-gray-800">
                        {(animal.rearingDetails &&
                          animal.rearingDetails.purpose) ||
                          animal.purpose ||
                          animal.livestockId ||
                          "-"}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Droplets className="w-4 h-4 text-cyan-600" />
                      <p className="text-sm text-gray-800">
                        {animal.weight
                          ? `${animal.weight} kg`
                          : (animal.rearingDetails &&
                              animal.rearingDetails.weight)
                          ? `${animal.rearingDetails.weight} kg`
                          : "-"}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <HeartPulse className="w-4 h-4 text-red-600" />
                      <p className="text-sm text-gray-800">
                        {getLastHealth(animal)}
                      </p>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="pt-3 text-sm text-gray-700">
                    <div className="mb-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            setActiveTab({ ...activeTab, [animal._id]: "feeding" })
                          }
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                            (activeTab[animal._id] || "feeding") === "feeding"
                              ? "bg-white text-green-700 shadow"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          Feeding
                        </button>
                        <button
                          onClick={() =>
                            setActiveTab({ ...activeTab, [animal._id]: "health" })
                          }
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                            (activeTab[animal._id] || "feeding") === "health"
                              ? "bg-white text-green-700 shadow"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          Health
                        </button>
                      </div>
                    </div>

                    {((activeTab[animal._id] || "feeding") === "feeding") ? (
                      <div className="space-y-3 bg-white rounded-lg p-3 shadow-sm border">
                        <div className="text-sm text-gray-600">
                          <strong>Summary:</strong> {formatFeedings(animal)}
                        </div>
                        {Array.isArray(animal.feedings) && animal.feedings.length ? (
                          <div className="mt-2 space-y-2">
                            {animal.feedings.map((f, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-100"
                              >
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-800">
                                    {f.feedType || f.feed || "-"}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Qty: {f.quantity || "-"}
                                  </div>
                                </div>
                                <div className="ml-4 text-right">
                                  <div className="inline-block bg-white px-3 py-1 rounded-full text-xs font-medium text-green-700 border">
                                    {f.frequency ? formatFrequency(f.frequency) : "-"}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            No feeding plan available.
                          </div>
                        )}
                        <div className="mt-2 text-sm">
                          <strong>Housing:</strong> {animal.housing || "-"}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 bg-white rounded-lg p-3 shadow-sm border">
                        <div className="text-sm text-gray-600">
                          <strong>Latest:</strong> {getLastHealth(animal)}
                        </div>
                        {Array.isArray(animal.healthRecords) && animal.healthRecords.length ? (
                          <div className="mt-2 space-y-2">
                            {animal.healthRecords.map((r, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-100"
                              >
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-800">
                                    {r.treatment || "-"}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {r.date ? new Date(r.date).toLocaleDateString() : "-"}
                                  </div>
                                </div>
                                <div className="ml-4 text-right">
                                  <div className="inline-block bg-white px-3 py-1 rounded-full text-xs font-medium text-red-700 border">
                                    Vet: {r.vet || "-"}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            No health records available.
                          </div>
                        )}
                        <div className="mt-2 text-sm">
                          <strong>Housing:</strong> {animal.housing || "-"}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => navigate(`/livestock/update/${animal._id}`)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Update</span>
                    </button>

                    <button
                      onClick={() => navigate(`/livestock/delete/${animal._id}`)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
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
                <PawPrint className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Livestock Found
              </h3>
              <p className="text-gray-600 mb-6">
                Add your first animal record to start managing livestock.
              </p>
              <button
                onClick={() => navigate("/livestock/add")}
                className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Add Livestock</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllLiveStockPlans;
