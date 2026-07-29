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

// Interceptor to handle 401 Unauthorized / Token Expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or unauthorized. Clearing stored token.");
      localStorage.removeItem("prepace_token");
      localStorage.removeItem("prepace_user");
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
