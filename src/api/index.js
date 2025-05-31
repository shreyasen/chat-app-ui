import axios from "axios";

const API = axios.create({ baseURL: "https://chat-app-ti7n.onrender.com/api" });

// Add Token to Headers
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
