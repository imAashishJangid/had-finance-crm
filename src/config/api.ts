import axios from "axios";

// Backend base URL from Vite ENV
export const API_BASE_URL = import.meta.env.VITE_API_URL;

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // agar cookies / auth use hota hai
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
