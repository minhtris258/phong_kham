// src/context/AppContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useSocket } from "./SocketContext";

// ----------------------------------------------------
// Cấu hình API Client
// ----------------------------------------------------
const API_BASE_URL = "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ----------------------------------------------------
// 1. Tạo Context
// ----------------------------------------------------
const AppContext = createContext({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  login: () => Promise.reject("Not initialized"),
  handleLogout: () => {},
  loadCurrentUser: () => Promise.resolve(),
  apiClient: apiClient,
});

// ----------------------------------------------------
// 2. Tạo Provider Component
// ----------------------------------------------------
export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const { socket } = useSocket();

  // --- Thiết lập/Xóa Token cho Axios ---
  const setAuthToken = useCallback((t) => {
    if (t) {
      localStorage.setItem("token", t);
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${t}`;
      setToken(t);
      setIsAuthenticated(true);
    } else {
      // LOGIC ĐĂNG XUẤT / XÓA TOKEN
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // <--- THÊM: Xóa user khỏi storage khi logout
      delete apiClient.defaults.headers.common["Authorization"];
      setToken(null);
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  // --- Tải thông tin người dùng hiện tại (Fetch chi tiết hồ sơ) ---
  const loadCurrentUser = useCallback(
    async (initialToken) => {
      setIsLoading(true);
      const currentToken = initialToken || localStorage.getItem("token");

      if (!currentToken) {
        setIsLoading(false);
        return;
      }

      setAuthToken(currentToken);

      try {
        // 1. Lấy thông tin cơ bản từ JWT (/api/auth/me)
        const authResponse = await apiClient.get("/auth/me");
        const basicUser = authResponse.data.user;

        let fullProfile = null;
        let profileEndpoint = null;

        // 2. Định tuyến để lấy hồ sơ chi tiết dựa trên vai trò
        if (basicUser.role === "patient") {
          profileEndpoint = "/patients/me";
        } else if (basicUser.role === "doctor") {
          profileEndpoint = "/doctors/me";
        }

        if (profileEndpoint) {
          const profileResponse = await apiClient.get(profileEndpoint);
          fullProfile = profileResponse.data;
        }

        // Kết hợp dữ liệu
        const finalUserData = { ...basicUser, ...fullProfile };
        
        // Cập nhật State
        setUser(finalUserData);
        setIsAuthenticated(true);

        // <--- QUAN TRỌNG: Lưu User vào LocalStorage để Header đọc được ngay ---
        localStorage.setItem("user", JSON.stringify(finalUserData)); 

      } catch (error) {
        console.error("Lỗi tải thông tin người dùng:", error);
        // Nếu token hết hạn hoặc lỗi, có thể cân nhắc logout tại đây
        // setAuthToken(null); 
      } finally {
        setIsLoading(false);
      }
    },
    [setAuthToken]
  );

  // --- Đăng nhập ---
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State này có vẻ dư thừa vì đã có isAuthenticated, nhưng giữ lại nếu bạn dùng logic riêng
  
  const login = async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { token } = response.data;

      if (token) {
        setAuthToken(token);
        // Gọi hàm này sẽ tự động lưu user vào localStorage khi xong
        await loadCurrentUser(token); 
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    setAuthToken(null); // Hàm này đã bao gồm xóa token và user trong localStorage
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  // --- Khởi tạo (Chạy một lần khi app load) ---
  useEffect(() => {
    if (token) {
      loadCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [token, loadCurrentUser]);

  const contextValue = {
    isAuthenticated,
    isLoading,
    user,
    token,
    login,
    handleLogout,
    loadCurrentUser,
    apiClient,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};