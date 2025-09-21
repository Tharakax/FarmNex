import axios from "axios";

// Base URL
const API_URL = "http://localhost:3000/api/livestock";

// Helper to get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token"); // adjust if your token is stored elsewhere
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ➕ Create new livestock
export const addLivestock = (data) =>
  axios.post(`${API_URL}/add`, data, { headers: getAuthHeader() });

// 📌 Get all livestock
export const getLivestock = () =>
  axios.get(`${API_URL}/get`, { headers: getAuthHeader() });

// 📌 Get livestock by ID
export const getLivestockById = (id) =>
  axios.get(`${API_URL}/get/${id}`, { headers: getAuthHeader() });

// ✏️ Update livestock by ID
export const updateLivestock = (id, data) =>
  axios.put(`${API_URL}/update/${id}`, data, { headers: getAuthHeader() });

// ❌ Delete livestock by ID
export const deleteLivestock = (id) =>
  axios.delete(`${API_URL}/delete/${id}`, { headers: getAuthHeader() });
