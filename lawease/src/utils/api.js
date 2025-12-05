// src/utils/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001",
  timeout: 60000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function uploadTrainDataset(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await API.post("/train", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; // expected { status: "started", job_id: n }
}

export async function getTrainStatus(jobId) {
  return (await API.get(`/train-status/${jobId}`)).data;
}

export async function getModels() {
  return (await API.get("/admin/models")).data;
}

export async function activateModel(modelId) {
  return (await API.post(`/admin/models/activate/${modelId}`)).data;
}

export async function getAllQueries() {
  // Get all queries from backend (/queries endpoint)
  return (await API.get("/queries")).data;
}

export default API;
export const api = API;

