// src/context/AppContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
// Import custom hook Socket (giả định bạn đã tạo file này)
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
  logout: () => {},
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

  // Lấy socket instance từ SocketContext
  const { socket } = useSocket();

  // --- Thiết lập/Xóa Token cho Axios ---
  const setAuthToken = useCallback((t) => {
    if (t) {
      localStorage.setItem("token", t);
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${t}`;
      setToken(t);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("token");
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
        // setAuthToken(null); // Đảm bảo token bị xóa nếu không hợp lệ
        setIsLoading(false);
        return;
      }

      setAuthToken(currentToken); // Cài đặt token vào header

      try {
        // 1. Lấy thông tin cơ bản từ JWT (/api/users/auth/me)
        const authResponse = await apiClient.get("/users/auth/me");
        const basicUser = authResponse.data.user;

        let fullProfile = null;
        let profileEndpoint = null;

        // 2. Định tuyến để lấy hồ sơ chi tiết dựa trên vai trò
        if (basicUser.role === "patient") {
          profileEndpoint = "/patients/me"; // GET /api/patients/me
        } else if (basicUser.role === "doctor") {
          profileEndpoint = "/doctors/me"; // GET /api/doctors/me
        }

        if (profileEndpoint) {
          const profileResponse = await apiClient.get(profileEndpoint);
          fullProfile = profileResponse.data;
        }

        // Kết hợp dữ liệu
        setUser({ ...basicUser, ...fullProfile });
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Lỗi tải thông tin người dùng:", error);
        // setAuthToken(null);
      } finally {
        setIsLoading(false);
      }
    },
    [setAuthToken]
  );

  // --- Đăng nhập ---
  const login = async (email, password) => {
    try {
      // POST /api/users/auth/login
      const response = await apiClient.post("/auth/login", { email, password });

      const { token } = response.data;

      if (token) {
        setAuthToken(token);
        await loadCurrentUser(token);
        return response.data;
      }
    } catch (error) {
      // Xóa token nếu đăng nhập thất bại
      // setAuthToken(null);
      throw error;
    }
  };

  const handleLogout = () => {
    // Xóa token + user khỏi localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Cập nhật state trong Header
    setIsLoggedIn(false);
    setUser(null);

    // Điều hướng về trang login (hoặc /)
    window.location.href = "/login";
  };

  // --- Khởi tạo (Chạy một lần khi app load) ---
  useEffect(() => {
    // Chỉ tải dữ liệu nếu có token trong localStorage
    if (token) {
      loadCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [token, loadCurrentUser]);

  // Giá trị Context được chia sẻ
  const contextValue = {
    isAuthenticated,
    isLoading,
    user,
    token,
    login,
    handleLogout,
    loadCurrentUser,
    apiClient, // Để gọi các API không liên quan đến Auth
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

// 3. Custom Hook (để sử dụng Context dễ dàng)
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    // Bắt lỗi nếu context chưa được bọc
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
