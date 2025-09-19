import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addLivestock } from "../../services/livestockService";   
import { useToast } from "./ToastProvider.jsx";


function AddLivestockPlan() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  // Basic Info
  const [animalType, setAnimalType] = useState("");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [weight, setWeight] = useState("");

  // Feeding Schedule
  const [feedings, setFeedings] = useState([
    { feedType: "", quantity: "", frequency: "" },
  ]);

  // Health Records
  const [healthRecords, setHealthRecords] = useState([
    { date: "", treatment: "", vet: "" },
  ]);

  // Housing
  const [housing, setHousing] = useState("");

  // Validation helpers
  const isNumber = (value) => !isNaN(value) && value !== "";

  // Feeding Handlers
  const handleFeedingChange = (index, field, value) => {
    const updated = [...feedings];
    updated[index][field] = value;
    setFeedings(updated);
  };

  const addFeeding = () => {
    setFeedings([...feedings, { feedType: "", quantity: "", frequency: "" }]);
  };

  const removeFeeding = (index) => {
    const updated = [...feedings];
    updated.splice(index, 1);
    setFeedings(updated);
  };

  // Health Handlers
  const handleHealthChange = (index, field, value) => {
    const updated = [...healthRecords];
    updated[index][field] = value;
    setHealthRecords(updated);
  };

  const addHealthRecord = () => {
    setHealthRecords([...healthRecords, { date: "", treatment: "", vet: "" }]);
  };

  const removeHealthRecord = (index) => {
    const updated = [...healthRecords];
    updated.splice(index, 1);
    setHealthRecords(updated);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic info validation
    if (!animalType || !breed || !gender || !dob || !weight) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    if (!isNumber(weight) || Number(weight) <= 0) {
      addToast("Weight must be a positive number", "error");
      return;
    }

    if (dob > today) {
      addToast("Date of birth cannot be in the future", "error");
      return;
    }

    // Feeding validation
    for (let i = 0; i < feedings.length; i++) {
      const f = feedings[i];
      if (!f.feedType || !f.quantity || !f.frequency) {
        addToast(`Please fill all feeding details for entry ${i + 1}`, "error");
        return;
      }
      if (!isNumber(f.quantity) || Number(f.quantity) <= 0) {
        addToast(`Feeding quantity must be a positive number for entry ${i + 1}`, "error");
        return;
      }
      if (!isNumber(f.frequency) || Number(f.frequency) <= 0) {
        addToast(`Feeding frequency must be a positive number for entry ${i + 1}`, "error");
        return;
      }
    }

    // Health validation
    for (let i = 0; i < healthRecords.length; i++) {
      const h = healthRecords[i];
      if (!h.date || !h.treatment || !h.vet) {
        addToast(`Please fill all health record details for entry ${i + 1}`, "error");
        return;
      }
      if (h.date > today) {
        addToast(`Health record date cannot be in the future for entry ${i + 1}`, "error");
        return;
      }
    }

    // Housing validation
    if (!housing.trim()) {
      addToast("Please provide housing details", "error");
      return;
    }

    const newLivestock = {
      livestockId: `ls_${Date.now()}`,
      animalType,
      breed,
      gender,
      dob,
      weight: Number(weight),
      feedings: feedings.map(f => ({ ...f, quantity: Number(f.quantity), frequency: Number(f.frequency) })),
      healthRecords,
      housing,
    };

    try {
        const response = await addLivestock(newLivestock);


      if (response.status === 201 || response.status === 200) {
        addToast("New Livestock Plan Added Successfully!", "created");

        // Reset form
        setAnimalType("");
        setBreed("");
        setGender("");
        setDob("");
        setWeight("");
        setFeedings([{ feedType: "", quantity: "", frequency: "" }]);
        setHealthRecords([{ date: "", treatment: "", vet: "" }]);
        setHousing("");

        navigate("/livestock");
      }
    } catch (error) {
      console.error("Failed to add livestock:", error);
      addToast("Failed to add livestock. Please try again.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow p-6 border">
          <h1 className="text-3xl font-bold text-gray-800">
            Add Livestock Record
          </h1>
          <p className="text-gray-600">Fill in the details below</p>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow p-6 border space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Animal Type *</label>
              <select
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select Type</option>
                <option value="Cow">Cow</option>
                <option value="Goat">Goat</option>
                <option value="Sheep">Sheep</option>
                <option value="Chicken">Chicken</option>
                <option value="Pig">Pig</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Breed *</label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Enter breed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Date of Birth *</label>
              <input
                type="date"
                value={dob}
                max={today}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Weight (kg) *</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Enter weight"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Feeding Schedule */}
        <div className="bg-white rounded-xl shadow p-6 border space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Feeding Schedule *</h2>
            <button
              type="button"
              onClick={addFeeding}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Add Feeding
            </button>
          </div>

          {feedings.map((feed, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border"
            >
              <select
                value={feed.feedType}
                onChange={(e) => handleFeedingChange(index, "feedType", e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white"
              >
                <option value="">Select Feed Type</option>
                <option value="Hay">Hay</option>
                <option value="Silage">Silage</option>
                <option value="Concentrates">Concentrates</option>
                <option value="Grains">Grains</option>
                <option value="Pasture">Pasture</option>
                <option value="Mineral Supplement">Mineral Supplement</option>
                <option value="Milk Replacer">Milk Replacer</option>
                <option value="Mixed Ration">Mixed Ration</option>
              </select>

              <input
                type="number"
                value={feed.quantity}
                onChange={(e) => handleFeedingChange(index, "quantity", e.target.value)}
                className="px-3 py-2 border rounded-lg"
                placeholder="Quantity"
                min="0"
              />

              <select
                value={feed.frequency}
                onChange={(e) => handleFeedingChange(index, "frequency", e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white"
              >
                <option value="">Frequency (hrs)</option>
                <option value="1">Every 1 hour</option>
                <option value="2">Every 2 hours</option>
                <option value="4">Every 4 hours</option>
                <option value="6">Every 6 hours</option>
                <option value="8">Every 8 hours</option>
                <option value="12">Every 12 hours</option>
                <option value="24">Every 24 hours</option>
              </select>

              {feedings.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFeeding(index)}
                  className="text-red-600 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Health Records */}
        <div className="bg-white rounded-xl shadow p-6 border space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Health Records *</h2>
            <button
              type="button"
              onClick={addHealthRecord}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Add Record
            </button>
          </div>

          {healthRecords.map((rec, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border"
            >
              <input
                type="date"
                value={rec.date}
                max={today}
                onChange={(e) => handleHealthChange(index, "date", e.target.value)}
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                value={rec.treatment}
                onChange={(e) => handleHealthChange(index, "treatment", e.target.value)}
                className="px-3 py-2 border rounded-lg"
                placeholder="Treatment / Vaccine"
              />
              <input
                type="text"
                value={rec.vet}
                onChange={(e) => handleHealthChange(index, "vet", e.target.value)}
                className="px-3 py-2 border rounded-lg"
                placeholder="Vet / Doctor"
              />

              {healthRecords.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeHealthRecord(index)}
                  className="text-red-600 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Housing */}
        <div className="bg-white rounded-xl shadow p-6 border space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Housing Details *</h2>
          <textarea
            value={housing}
            onChange={(e) => setHousing(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Describe housing conditions..."
          />
        </div>

        {/* Submit */}
        <div className="bg-white rounded-xl shadow p-6 border">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg"
          >
            Add Livestock
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddLivestockPlan;
