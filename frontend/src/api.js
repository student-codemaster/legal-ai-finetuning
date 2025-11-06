import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  timeout: 120000,
});

export async function processFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await API.post("/process", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function processText(text) {
  const res = await API.post("/process-text", { text });
  return res.data;
}

export async function uploadTrainJson(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await API.post("/train-json", fd, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 0, // long-running
  });
  return res.data;
}

export async function getQueries() {
  const res = await API.get("/admin/queries");
  return res.data;
}

export async function deleteQuery(id) {
  const res = await API.delete(`/admin/query/${id}`);
  return res.data;
}
