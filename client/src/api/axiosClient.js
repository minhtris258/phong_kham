import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER + "/api", // Sử dụng biến môi trường cho URL cơ sở
  headers: {
    "Content-Type": "application/json",
  },
});

// nếu có token thì tự gắn vào header
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
