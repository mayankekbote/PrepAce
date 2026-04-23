import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8085/api",
});

// Interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("prepace_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
