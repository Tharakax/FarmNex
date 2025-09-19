import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLivestockById, updateLivestock } from "../../services/livestockService";
import { useToast } from "./ToastProvider.jsx";


function UpdateLiveStockPlan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    livestockId: "",
    animalType: "",
    breed: "",
    gender: "",
    dob: "",
    weight: "",
    feedings: [],
    healthRecords: [],
    housing: "",
  });
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getLivestockById(id);
        const data = res.data || res; // tolerate both shapes

        setForm({
          livestockId: data.livestockId || "",
          animalType: data.animalType || "",
          breed: data.breed || "",
          gender: data.gender || "",
          dob: data.dob ? new Date(data.dob).toISOString().split("T")[0] : "",
          weight: data.weight || "",
          feedings: Array.isArray(data.feedings) ? data.feedings : [],
          healthRecords: Array.isArray(data.healthRecords) ? data.healthRecords : [],
          housing: data.housing || "",
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // feeding handlers
  const handleFeedingChange = (index, field, value) => {
    const updated = [...form.feedings];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, feedings: updated });
  };
  const addFeeding = () => setForm({ ...form, feedings: [...form.feedings, { feedType: "", quantity: "", frequency: "" }] });
  const removeFeeding = (i) => {
    const updated = [...form.feedings];
    updated.splice(i, 1);
    setForm({ ...form, feedings: updated });
  };

  // health handlers
  const handleHealthChange = (index, field, value) => {
    const updated = [...form.healthRecords];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, healthRecords: updated });
  };
  const addHealth = () => setForm({ ...form, healthRecords: [...form.healthRecords, { date: "", treatment: "", vet: "" }] });
  const removeHealth = (i) => {
    const updated = [...form.healthRecords];
    updated.splice(i, 1);
    setForm({ ...form, healthRecords: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // convert weight to number when possible
      const payload = { ...form, weight: form.weight ? Number(form.weight) : undefined };
  await updateLivestock(id, payload);
  addToast('Livestock plan updated successfully', 'updated');
  navigate('/livestock');
    } catch (err) {
      console.error(err);
  addToast('Failed to update livestock', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Update Livestock Plan</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Animal Type</label>
        
            <select
            name="animalType"
            value={form.animalType}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
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
            <label className="block text-sm">Breed</label>
            <input name="breed" value={form.breed} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="w-full px-3 py-2 border rounded">
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">DOB</label>
            <input type="date" name="dob" value={form.dob} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Weight (kg)</label>
            <input type="number" name="weight" value={form.weight} onChange={handleChange} className="w-full px-3 py-2 border rounded" min="0" />
          </div>
          <div>
            <label className="block text-sm">Housing</label>
            <input name="housing" value={form.housing} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>
        </div>

        {/* Feedings */}
        <div className="border rounded p-4 bg-gray-50 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Feedings</h3>
            <button type="button" onClick={addFeeding} className="text-sm bg-green-50 text-green-700 px-2 py-1 rounded">Add</button>
          </div>
          <div className="space-y-2">
            {form.feedings.map((f, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                  <select value={f.feedType || ""} onChange={(e) => handleFeedingChange(i, 'feedType', e.target.value)} className="w-full px-2 py-1 border rounded bg-white">
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
                  <input placeholder="Quantity" value={f.quantity || ""} onChange={(e) => handleFeedingChange(i, 'quantity', e.target.value)} className="w-full md:w-40 px-2 py-1 border rounded" min="0" />
                  <select value={f.frequency || ""} onChange={(e) => handleFeedingChange(i, 'frequency', e.target.value)} className="w-full md:w-56 px-2 py-1 border rounded bg-white">
                    <option value="">Select frequency (hrs)</option>
                    <option value="1">Every 1 hour</option>
                    <option value="2">Every 2 hours</option>
                    <option value="4">Every 4 hours</option>
                    <option value="6">Every 6 hours</option>
                    <option value="8">Every 8 hours</option>
                    <option value="12">Every 12 hours</option>
                    <option value="24">Every 24 hours</option>
                  </select>
                <div className="flex justify-end items-center">
                  <button type="button" onClick={() => removeFeeding(i)} className="px-2 py-1 bg-red-50 text-red-600 rounded">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Records */}
        <div className="border rounded p-4 bg-gray-50 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Health Records</h3>
            <button type="button" onClick={addHealth} className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">Add</button>
          </div>
          <div className="space-y-2">
            {form.healthRecords.map((r, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                <input type="date" value={r.date ? new Date(r.date).toISOString().split('T')[0] : ''} onChange={(e) => handleHealthChange(i, 'date', e.target.value)} className="w-full px-2 py-1 border rounded" />
                <input placeholder="Treatment" value={r.treatment || ""} onChange={(e) => handleHealthChange(i, 'treatment', e.target.value)} className="w-full md:w-40 px-2 py-1 border rounded" />
                <input placeholder="Vet" value={r.vet || ""} onChange={(e) => handleHealthChange(i, 'vet', e.target.value)} className="w-full md:w-56 px-2 py-1 border rounded" />
                <div className="flex justify-end items-center">
                  <button type="button" onClick={() => removeHealth(i)} className="px-2 py-1 bg-red-50 text-red-600 rounded">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-3">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
          <button type="button" onClick={() => navigate('/livestock')} className="px-4 py-2 border rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default UpdateLiveStockPlan;
