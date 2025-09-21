import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLivestockById, deleteLivestock } from "../../services/livestockService";
import { useToast } from "./ToastProvider.jsx";


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
    try {
      await deleteLivestock(id);
      addToast('Livestock plan deleted successfully', 'deleted');
      navigate('/livestock');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete livestock plan', 'error');
    }
  };

  const handleCancel = () => {
    navigate("/livestock");
  };

  const formatFrequency = (val) => {
    if (!val && val !== 0) return '-';
    const n = Number(val);
    if (Number.isNaN(n)) return val;
    return `Every ${n} Hour${n === 1 ? '' : 's'}`;
  };

  if (!livestock) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Delete Livestock Plan</h2>
      <p className="mb-4">Are you sure you want to delete the following livestock plan?</p>
      <div className="bg-gray-50 p-4 rounded mb-4">
        <div><strong>Livestock ID:</strong> {livestock.livestockId || '-'}</div>
        <div><strong>Type:</strong> {livestock.animalType || '-'}</div>
        <div><strong>Breed:</strong> {livestock.breed || '-'}</div>
        <div><strong>Gender:</strong> {livestock.gender || '-'}</div>
        <div><strong>DOB:</strong> {livestock.dob ? new Date(livestock.dob).toLocaleDateString() : '-'}</div>
        <div><strong>Weight:</strong> {livestock.weight ? `${livestock.weight} kg` : '-'}</div>
        <div><strong>Housing:</strong> {livestock.housing || '-'}</div>
        <div className="mt-3">
          <strong>Feedings:</strong>
          {Array.isArray(livestock.feedings) && livestock.feedings.length > 0 ? (
            <ul className="list-disc list-inside mt-1">
              {livestock.feedings.map((f, idx) => (
                <li key={idx}>{`${f.feedType || '-'} • ${f.quantity || '-'} • ${formatFrequency(f.frequency)}`}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-600">None</div>
          )}
        </div>
        <div className="mt-3">
          <strong>Health Records:</strong>
          {Array.isArray(livestock.healthRecords) && livestock.healthRecords.length > 0 ? (
            <ul className="list-disc list-inside mt-1">
              {livestock.healthRecords.map((h, idx) => (
                <li key={idx}>{`${h.date ? new Date(h.date).toLocaleDateString() : '-'} • ${h.treatment || '-'} • ${h.vet || '-'}`}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-600">None</div>
          )}
        </div>
      </div>

      <div className="flex space-x-3">
        <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">Yes, Delete</button>
        <button onClick={handleCancel} className="px-4 py-2 border rounded">Cancel</button>
      </div>
    </div>
  );
}

export default DeleteLivestockPlan;
