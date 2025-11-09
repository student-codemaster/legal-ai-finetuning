import axios from "axios";

const api = axios.create({
  // Backend runs on 8001 in development (see backend startup). Update here if you run on a different port.
  baseURL: "http://127.0.0.1:8001",
});

export default api;
