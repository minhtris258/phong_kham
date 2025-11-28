// src/context/AppContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
// Đảm bảo đường dẫn import SocketContext đúng với dự án của bạn
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

  // Lấy socket từ context
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
      localStorage.removeItem("user"); 
      // === QUAN TRỌNG: Xóa luôn trạng thái profileCompleted để Guard chặn lại ===
      localStorage.removeItem("profileCompleted"); 
      
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

        // <--- QUAN TRỌNG: Lưu User vào LocalStorage ---
        localStorage.setItem("user", JSON.stringify(finalUserData)); 

        // <--- ĐỒNG BỘ PROFILE COMPLETED ---
        const isCompleted = finalUserData.profile_completed ? "true" : "false";
        localStorage.setItem("profileCompleted", isCompleted);
        
        console.log("Updated User Data:", finalUserData); // Log để debug

      } catch (error) {
        console.error("Lỗi tải thông tin người dùng:", error);
        // Nếu token lỗi, tự động logout để tránh kẹt
        if (error.response && error.response.status === 401) {
            setAuthToken(null);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [setAuthToken]
  );

  // --- Đăng nhập ---
  // eslint-disable-next-line no-unused-vars
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  
  const login = async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { token } = response.data;

      if (token) {
        setAuthToken(token);
        // Gọi hàm này sẽ tự động lưu user và profileCompleted vào localStorage
        await loadCurrentUser(token); 
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    setAuthToken(null); // Hàm này đã bao gồm xóa token, user và profileCompleted
    setIsLoggedIn(false);
    window.location.href = "/Login"; // Chuyển hướng về trang login
  };

  // --- Khởi tạo (Chạy một lần khi app load) ---
  useEffect(() => {
    if (token) {
      loadCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [token, loadCurrentUser]);

  // --- SOCKET: Lắng nghe sự kiện Real-time ---
  useEffect(() => {
    if (!socket || !token) return;

    // Hàm xử lý khi nhận sự kiện update từ server
    const handleProfileUpdate = (data) => {
      console.log("🔔 Socket: Nhận tín hiệu profile_updated", data);
      // Tải lại toàn bộ thông tin user mới nhất từ DB
      loadCurrentUser();
    };

    // Lắng nghe sự kiện "profile_updated" (Backend cần emit sự kiện này khi user update hồ sơ)
    socket.on("profile_updated", handleProfileUpdate);
    
    // Lắng nghe sự kiện "user_updated" (Dự phòng)
    socket.on("user_updated", handleProfileUpdate);

    return () => {
      socket.off("profile_updated", handleProfileUpdate);
      socket.off("user_updated", handleProfileUpdate);
    };
  }, [socket, token, loadCurrentUser]);

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