import axios from "axios";

// Backend base URL from Vite ENV
export const API_BASE_URL = import.meta.env.VITE_API_URL;

// Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // https://had-loan-manage.onrender.com
  
  headers: { "Content-Type": "application/json" },
});

export default api;
