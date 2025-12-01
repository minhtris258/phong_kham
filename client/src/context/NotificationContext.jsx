import React, { createContext, useContext, useState, useEffect } from "react";
// 1. Import icon từ lucide-react
import { Bell } from "lucide-react"; 
import { toastSuccess,toastError, toastWarning, toastInfo } from "../utils/toast";
import { useSocket } from "./SocketContext"; 
import notificationService from "../services/notificationService"; 
import { useAppContext } from "./AppContext"; 

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { socket } = useSocket();
  const { isAuthenticated } = useAppContext();
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. Lấy dữ liệu ban đầu
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationService.getNotifications(1, 50); 
      if (res.data?.data) {
          const count = res.data.data.filter(n => n.status === 'unread').length;
          setUnreadCount(count);
      }
    } catch (error) {
      toastError("Lỗi tải số lượng thông báo:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // 2. Lắng nghe Socket (Realtime)
  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const handleNewNotification = (data) => {
      console.log("🔔 [Context] Nhận thông báo socket:", data);
      
      // A. Tăng số lượng
      setUnreadCount((prev) => prev + 1);

      // B. Hiển thị Toast
      const title = data.message || "Thông báo mới";
      const body = data.data?.body || "Bạn có tin nhắn mới.";

      toastInfo(
        <div 
            onClick={() => window.location.href = "/notifications"} 
            className="cursor-pointer select-none"
        >
          <p className="font-bold text-sm mb-1 text-gray-800">{title}</p>
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{body}</p>
        </div>,
        { 
          position: "top-right", 
          autoClose: 5000,
          // 👇 CẬP NHẬT: Dùng icon Lucide thay cho text/emoji
          icon: <Bell size={24} className="text-[#00B5F1]" /> 
        }
      );
      
      // C. Âm thanh
      try {
          const audio = new Audio('/notification-sound.mp3'); 
          audio.play().catch(() => {});
      } catch (e) {}
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [socket, isAuthenticated]);

  // 3. Các hàm hỗ trợ
  const decreaseUnreadCount = () => {
      setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const resetUnreadCount = () => {
      setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider 
        value={{ 
            unreadCount, 
            fetchUnreadCount, 
            decreaseUnreadCount, 
            resetUnreadCount     
        }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);