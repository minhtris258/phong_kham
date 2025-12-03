// src/context/AppContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { toastSuccess,toastError, toastWarning, toastInfo } from "../utils/toast";
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
  register: () => Promise.reject("Not initialized"),
  handleLogout: () => {},
  loadCurrentUser: () => Promise.resolve(),
  setAuthToken: () => {},
  setUser: () => {}, // <--- Thêm cái này để cập nhật profile thủ công
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

  // --- Thiết lập/Xóa Token (Hàm cốt lõi) ---
  const setAuthToken = useCallback((t) => {
    if (t) {
      // TRƯỜNG HỢP LOGIN
      localStorage.setItem("token", t);
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${t}`;
      setToken(t);
      setIsAuthenticated(true);
    } else {
      // TRƯỜNG HỢP LOGOUT (Xóa sạch sẽ)
      localStorage.removeItem("token");
      localStorage.removeItem("user"); 
      localStorage.removeItem("profileCompleted"); 
      localStorage.removeItem("role");
      
      delete apiClient.defaults.headers.common["Authorization"];
      
      // Reset State về null ngay lập tức
      setToken(null);
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  // --- Tải thông tin người dùng hiện tại ---
  const loadCurrentUser = useCallback(
    async (initialToken) => {
      const currentToken = initialToken || localStorage.getItem("token");
      
      // Nếu không có token thì dừng ngay, đảm bảo user là null
      if (!currentToken) {
        setAuthToken(null); // Đảm bảo dọn dẹp nếu localstorage trống
        setIsLoading(false);
        return;
      }
      
      // Đảm bảo header được set
      if (initialToken) {
         setAuthToken(initialToken);
      } else {
         apiClient.defaults.headers.common["Authorization"] = `Bearer ${currentToken}`;
      }

      try {
        const authResponse = await apiClient.get("/auth/me");
        const basicUser = authResponse.data.user;

        let fullProfile = null;
        let profileEndpoint = null;

        // Xác định endpoint dựa trên role
        if (basicUser.role === "patient") {
          profileEndpoint = "/patients/me";
        } else if (basicUser.role === "doctor") {
          profileEndpoint = "/doctors/me";
        }

        if (profileEndpoint) {
          try {
            const profileResponse = await apiClient.get(profileEndpoint);
            fullProfile = profileResponse.data.profile || profileResponse.data;
          } catch (err) {
            toastError("Chưa lấy được profile chi tiết:", err);
            // Không throw lỗi ở đây để vẫn giữ login thành công
          }
        }

        const finalUserData = { ...basicUser, ...fullProfile };
        
        // Cập nhật State
        setUser(finalUserData);
        setIsAuthenticated(true);

        // Lưu tạm vào LocalStorage (để dự phòng)
        localStorage.setItem("user", JSON.stringify(finalUserData)); 
        if (finalUserData.role) {
            localStorage.setItem("role", finalUserData.role); 
        }
        const isCompleted = finalUserData.profile_completed ? "true" : "false";
        localStorage.setItem("profileCompleted", isCompleted);

      } catch (error) {
        toastError("Lỗi tải thông tin người dùng:", error);
        // Nếu lỗi 401 (Token hết hạn/sai) -> Logout ngay
        if (error.response && error.response.status === 401) {
            setAuthToken(null);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [setAuthToken] 
  );

  const login = async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { token } = response.data;
      if (token) {
        setAuthToken(token);
        await loadCurrentUser(token); 
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    try {
      const response = await apiClient.post("/auth/registerpublic", { 
        name, email, password, confirmPassword 
      });
      const { token } = response.data;
      if (token) {
        setAuthToken(token); 
        await loadCurrentUser(token);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  };

  // --- SỬA LOGIC LOGOUT ---
  const handleLogout = () => {
    // 1. Gọi setAuthToken(null) để xóa LocalStorage và State
    setAuthToken(null); 
    
  };
  
  // XÓA BỎ state `isLoggedIn` gây nhầm lẫn ở đây

  // Tự động load user khi mount nếu có token
  useEffect(() => {
    if (token) {
      loadCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [token, loadCurrentUser]);

  // Socket logic
 useEffect(() => {
    if (!socket || !user) return;

    // Hàm join room
    const handleJoinRoom = () => {
      // 👇 LOGIC QUAN TRỌNG: Ưu tiên lấy user_id (Account ID) nếu có
      // Vì bảng Patient có trường user_id trỏ về Account, còn _id là ID hồ sơ.
      // Notification được gửi về Account ID.
      const roomId = user.user_id || user._id; 
      
      const userName = user.fullName || user.name || "User";

      console.log(`🔌 [Socket] User ${userName} đang xin vào room: ${roomId}`);
      
      // Join vào đúng Room ID của tài khoản
      socket.emit("join_room", roomId);
    };

    // A. Join ngay lập tức
    handleJoinRoom();

    // B. Tự động Join lại khi mất mạng/server restart
    socket.on("connect", () => {
        console.log("🔄 Socket đã kết nối lại -> Join room lại...");
        handleJoinRoom();
    });

    const handleProfileUpdate = (data) => {
      console.log("🔔 Socket: Nhận tín hiệu profile_updated", data);
      loadCurrentUser();
    };

    socket.on("profile_updated", handleProfileUpdate);
    socket.on("user_updated", handleProfileUpdate);

    return () => {
      socket.off("connect"); 
      socket.off("profile_updated", handleProfileUpdate);
      socket.off("user_updated", handleProfileUpdate);
    };
  }, [socket, user, loadCurrentUser]);

  const contextValue = {
    isAuthenticated,
    isLoading,
    user,
    token,
    setAuthToken,
    setUser, // <--- Đã thêm: Giúp cập nhật user state từ component con
    login,
    register,
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