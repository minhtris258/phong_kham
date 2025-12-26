// src/context/AppContext.js (React Native)
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from "@/config";

// ----------------------------------------------------
// Cấu hình API Client
// ----------------------------------------------------
// ⚠️ LƯU Ý: Thay đổi IP này theo môi trường của bạn
// 1. Android Emulator: "http://10.0.2.2:3000/api"
// 2. Máy thật/iOS Simulator: "http://IP_LAN_CUA_BAN:3000/api" (Ví dụ: 192.168.1.10)
const API_BASE_URL = API_URL; 

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
  setUser: () => {},
  apiClient: apiClient,
});

// ----------------------------------------------------
// 2. Tạo Provider Component
// ----------------------------------------------------
export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // ❌ KHÔNG ĐƯỢC GỌI useSocket() Ở ĐÂY ❌
  // Vì AppProvider bao bọc SocketProvider, gọi ở đây sẽ bị undefined

  // --- Thiết lập/Xóa Token (AsyncStorage) ---
  const setAuthToken = useCallback(async (t) => {
    try {
      if (t) {
        // LOGIN: Lưu vào AsyncStorage
        await AsyncStorage.setItem("token", t);
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${t}`;
        setToken(t);
        setIsAuthenticated(true);
      } else {
        // LOGOUT: Xóa khỏi AsyncStorage
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user"); 
        await AsyncStorage.removeItem("profileCompleted"); 
        await AsyncStorage.removeItem("role");
        
        delete apiClient.defaults.headers.common["Authorization"];
        
        // Reset State
        setToken(null);
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Lỗi khi thao tác AsyncStorage:", error);
    }
  }, []);

  // --- Tải thông tin người dùng hiện tại ---
  const loadCurrentUser = useCallback(
    async (initialToken) => {
      // Vì AsyncStorage là bất đồng bộ, ta phải await
      const currentToken = initialToken || await AsyncStorage.getItem("token");
      
      if (!currentToken) {
        await setAuthToken(null);
        setIsLoading(false);
        return;
      }
      
      // Set header
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${currentToken}`;

      try {
        // 1. Lấy thông tin cơ bản từ Auth (có authType)
        const authResponse = await apiClient.get("/auth/me");
        const basicUser = authResponse.data.user;

        let fullProfile = null;
        let profileEndpoint = null;

        if (basicUser.role === "patient") {
          profileEndpoint = "/patients/me";
        } else if (basicUser.role === "doctor") {
          profileEndpoint = "/doctors/me";
        }

        if (profileEndpoint) {
          try {
            // 2. Lấy thông tin chi tiết (Patient/Doctor)
            const profileResponse = await apiClient.get(profileEndpoint);
            fullProfile = profileResponse.data.profile || profileResponse.data;
          } catch (err) {
            console.log("Chưa lấy được profile chi tiết:", err);
          }
        }

        // 3. Gộp dữ liệu (Quan trọng: Đảm bảo authType không bị mất)
        const finalUserData = { 
            ...fullProfile, 
            ...basicUser, 
            authType: basicUser.authType // Ghi cứng lấy từ basicUser
        };
        
        // Cập nhật State
        setUser(finalUserData);
        setIsAuthenticated(true);
        setToken(currentToken);

        // Lưu thông tin phụ
        await AsyncStorage.setItem("user", JSON.stringify(finalUserData)); 
        if (finalUserData.role) {
            await AsyncStorage.setItem("role", finalUserData.role); 
        }
        const isCompleted = finalUserData.profile_completed ? "true" : "false";
        await AsyncStorage.setItem("profileCompleted", isCompleted);

      } catch (error) {
        console.error("Lỗi tải thông tin user:", error);
        if (error.response && error.response.status === 401) {
            await setAuthToken(null);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [setAuthToken] 
  );

  // --- Init App: Kiểm tra token khi mở app ---
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          await loadCurrentUser(storedToken);
        } else {
          setIsLoading(false);
        }
      } catch (e) {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, [loadCurrentUser]);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { token } = response.data;
      if (token) {
        await setAuthToken(token); // await việc lưu storage
        await loadCurrentUser(token); 
        return response.data;
      }
    } catch (error) {
      if (error.response) {
        // Lỗi từ Server trả về (VD: 400, 401, 500)
        console.error("❌ Lỗi Server:", error.response.status, error.response.data);
    } else if (error.request) {
        // Lỗi không gọi được Server (Network Error) -> Sai IP hoặc Server chưa bật
        console.error("❌ Lỗi Mạng (Network Error):", error.message);
    } else {
        console.error("❌ Lỗi Code:", error.message);
    }
      throw error;
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    try {
      const response = await apiClient.post("/auth/register", { 
        name, email, password, confirmPassword 
      });
      const { token } = response.data;
      if (token) {
        await setAuthToken(token); 
        await loadCurrentUser(token);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    await setAuthToken(null); 
  };
  
  // ⚠️ ĐÃ XÓA LOGIC SOCKET Ở ĐÂY ĐỂ TRÁNH VÒNG LẶP
  // Logic Socket đã được chuyển sang App.js -> AppContent

  const contextValue = {
    isAuthenticated,
    isLoading,
    user,
    token,
    setAuthToken,
    setUser,
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