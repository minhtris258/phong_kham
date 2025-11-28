import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSocket } from "./SocketContext"; // Import socket đã kết nối
import notificationService from "../services/notificationService"; // Service gọi API
import { useAppContext } from "./AppContext"; // Hook lấy thông tin user

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAppContext(); // Lấy thông tin user đang đăng nhập
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]); // (Tùy chọn) Lưu list rút gọn

  // 1. Lấy dữ liệu ban đầu khi mới vào web
  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      // Gọi API lấy số lượng chưa đọc (bạn cần viết thêm API này hoặc lấy list rồi count)
      const res = await notificationService.getNotifications(1, 1); 
      // Giả sử API trả về meta.unreadCount hoặc bạn filter client
      // Tốt nhất backend nên có endpoint /notifications/unread-count
      // Ở đây mình ví dụ đếm thủ công nếu API chưa hỗ trợ count riêng
      const resAll = await notificationService.getNotifications(1, 100); 
      const count = resAll.data?.data?.filter(n => n.status === 'unread').length || 0;
      setUnreadCount(count);
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [user]);

  // 2. Lắng nghe Socket toàn cục
  useEffect(() => {
    if (!socket || !user) return;

    // Join room theo User ID của bệnh nhân
    socket.emit("join_room", user._id);

    // Lắng nghe sự kiện
    const handleNewNotification = (data) => {
      console.log("🔔 Có thông báo mới:", data);
      
      // A. Tăng số lượng chưa đọc lên 1
      setUnreadCount((prev) => prev + 1);

      // B. Hiển thị Toast thông báo đẹp mắt góc màn hình
      toast.info(
        <div>
          <p className="font-bold">{data.message || "Thông báo mới"}</p>
          <p className="text-sm truncate">{data.data?.body || "Bạn có tin nhắn mới"}</p>
        </div>, 
        { 
          position: "top-right", 
          autoClose: 5000,
          onClick: () => {
             // Logic khi click vào toast (ví dụ chuyển trang)
             window.location.href = "/notifications"; 
          }
        }
      );
      
      // C. (Tùy chọn) Phát âm thanh "Ting"
      const audio = new Audio('/notification-sound.mp3'); // File âm thanh trong thư mục public
      audio.play().catch(e => console.log("Không thể phát âm thanh"));
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [socket, user]);

  // Hàm để reset count khi user vào trang xem thông báo
  const readAll = () => {
      setUnreadCount(0);
  };
  
  // Hàm giảm count khi user đọc 1 tin
  const decreaseCount = () => {
      setUnreadCount(prev => Math.max(0, prev - 1));
  }

  return (
    <NotificationContext.Provider value={{ unreadCount, fetchUnreadCount, readAll, decreaseCount }}>
      {children}
    </NotificationContext.Provider>
  );
};