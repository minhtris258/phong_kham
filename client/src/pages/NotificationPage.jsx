import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import notificationService from "../services/notificationService";
import NotificationItem from "../components/notification/NotificationItem"; 
import NotificationDetailModal from "../components/notification/NotificationDetailModal";
import RatingModal from "../components/notification/RatingModal"; 
import { useSocket } from "../context/SocketContext";
import { toastSuccess, toastError } from "../utils/toast";

// 👇 1. IMPORT HOOK CONTEXT
import { useNotification } from "../context/NotificationContext"; 

const NotificationPage = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  
  // 👇 2. LẤY CÁC HÀM TỪ CONTEXT
  const { decreaseUnreadCount, resetUnreadCount } = useNotification();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [ratingNotification, setRatingNotification] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications(1, 50); 
      setNotifications(res.data?.data || []);
    } catch (error) {
      toastError("Lỗi tải thông báo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data) => {
      console.log("🔔 Có thông báo mới:", data);
      const newNotifObject = data.data;
      setNotifications((prev) => [newNotifObject, ...prev]);
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [socket]);

  const handleItemClick = async (notification) => {
    setSelectedNotification(notification);
    
    // Nếu tin chưa đọc -> Đánh dấu đã đọc
    if (notification.status === "unread") {
      try {
        await notificationService.markAsRead(notification._id);
        
        // 1. Cập nhật giao diện list tại chỗ
        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, status: "read" } : n));
        
        // 👇 3. QUAN TRỌNG: BÁO CONTEXT GIẢM SỐ TRÊN HEADER
        decreaseUnreadCount(); 

      } catch (error) { console.error(error); }
    }
  };

  const handleReadAll = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // 1. Cập nhật list tại chỗ
      setNotifications(prev => prev.map(n => ({ ...n, status: "read" })));
      
      // 👇 4. QUAN TRỌNG: RESET SỐ TRÊN HEADER VỀ 0
      resetUnreadCount();

    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn muốn xóa thông báo này?")) return;
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) { toastError("Lỗi xóa thông báo:", error); }
  };

  // ... (Phần logic Rating, ViewResult giữ nguyên)
  const handleOpenRating = (notification) => {
    setSelectedNotification(null); 
    setRatingNotification(notification); 
  };

  const handleViewResult = (notification) => {
    navigate(`/visit-detail/${notification.appointment_id}`);
  };

  const handleRatingSuccess = (notificationId) => {
    handleDelete(notificationId);
  };

  const filteredNotifications = notifications.filter(n => 
    filter === "all" ? true : n.status === "unread"
  );
  
  // Tính số lượng chưa đọc dựa trên state hiện tại của trang này
  const unreadCount = notifications.filter(n => n.status === "unread").length;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 mt-15">
      <div className="max-w-lvh mx-auto">
        
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Thông báo ({unreadCount})</h1>
            </div>
            <button onClick={handleReadAll} disabled={unreadCount === 0} className="text-sm text-[#00B5F1] font-medium hover:underline disabled:text-gray-400 disabled:no-underline">
                Đọc tất cả
            </button>
        </div>

        {/* ... (Phần render UI bên dưới giữ nguyên) ... */}
        
        <div className="flex gap-2 mb-4 border-b">
            <button onClick={() => setFilter("all")} className={`pb-2 px-4 text-sm font-medium ${filter === "all" ? "border-b-2 border-[#00B5F1] text-[#00B5F1]" : "text-gray-500"}`}>Tất cả</button>
            <button onClick={() => setFilter("unread")} className={`pb-2 px-4 text-sm font-medium ${filter === "unread" ? "border-b-2 border-[#00B5F1] text-[#00B5F1]" : "text-gray-500"}`}>Chưa đọc</button>
        </div>

        <div className="space-y-2">
          {loading ? (
             <div className="py-10 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></div>
          ) : filteredNotifications.length === 0 ? (
             <div className="py-10 text-center text-gray-400">Không có thông báo nào.</div>
          ) : (
            filteredNotifications.map(notif => (
              <NotificationItem 
                key={notif._id} 
                notification={notif} 
                onClick={() => handleItemClick(notif)} 
                onDelete={() => handleDelete(notif._id)}
              />
            ))
          )}
        </div>
      </div>

      {selectedNotification && (
        <NotificationDetailModal 
          notification={selectedNotification} 
          onClose={() => setSelectedNotification(null)}
          onRate={handleOpenRating}       
          onViewResult={handleViewResult} 
        />
      )}

      {ratingNotification && (
        <RatingModal
            isOpen={!!ratingNotification}
            notification={ratingNotification}
            onClose={() => setRatingNotification(null)}
            onSuccess={handleRatingSuccess}
        />
      )}
    </div>
  );
};

export default NotificationPage;