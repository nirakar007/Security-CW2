// Centralizes all communication with your backend

// in this file,
// Pre-configured Axios instance
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  withCredentials: true, // This is CRITICAL for sending/receiving HttpOnly cookies
});

export default apiClient;
