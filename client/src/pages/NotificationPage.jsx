import React, { useState, useEffect } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import notificationService from "../services/notificationService";
import NotificationItem from "../components/notification/NotificationItem"; // Nhớ import đúng đường dẫn
import NotificationDetailModal from "../components/notification/NotificationDetailModal"; // Nhớ import đúng đường dẫn

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  // State quản lý Modal
  const [selectedNotification, setSelectedNotification] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications(1, 50); 
      setNotifications(res.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Xử lý khi Click vào Item
  const handleItemClick = async (notification) => {
    // 1. Mở Modal xem chi tiết
    setSelectedNotification(notification);

    // 2. Nếu chưa đọc -> Đánh dấu đã đọc
    if (notification.status === "unread") {
      try {
        await notificationService.markAsRead(notification._id);
        // Cập nhật UI list bên dưới (bỏ chấm đỏ)
        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, status: "read" } : n));
      } catch (error) { console.error(error); }
    }
  };

  const handleReadAll = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, status: "read" })));
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn muốn xóa thông báo này?")) return;
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) { console.error(error); }
  };

  // Filter
  const filteredNotifications = notifications.filter(n => 
    filter === "all" ? true : n.status === "unread"
  );
  const unreadCount = notifications.filter(n => n.status === "unread").length;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 mt-15">
      <div className="max-w-lvw mx-auto"> {/* Thu hẹp chiều rộng lại cho giống list mobile */}
        
        {/* Header & Tabs (Giữ nguyên như cũ) */}
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Thông báo ({unreadCount})</h1>
            </div>
            <button onClick={handleReadAll} disabled={unreadCount === 0} className="text-sm text-[#00B5F1] font-medium hover:underline disabled:text-gray-400 disabled:no-underline">
                Đọc tất cả
            </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b">
            <button onClick={() => setFilter("all")} className={`pb-2 px-4 text-sm font-medium ${filter === "all" ? "border-b-2 border-[#00B5F1] text-[#00B5F1]" : "text-gray-500"}`}>Tất cả</button>
            <button onClick={() => setFilter("unread")} className={`pb-2 px-4 text-sm font-medium ${filter === "unread" ? "border-b-2 border-[#00B5F1] text-[#00B5F1]" : "text-gray-500"}`}>Chưa đọc</button>
        </div>

        {/* List Items */}
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
                onClick={() => handleItemClick(notif)} // <-- Sự kiện click mở modal
                onDelete={() => handleDelete(notif._id)}
              />
            ))
          )}
        </div>
      </div>

      {/* MODAL CHI TIẾT */}
      {selectedNotification && (
        <NotificationDetailModal 
          notification={selectedNotification} 
          onClose={() => setSelectedNotification(null)} 
        />
      )}
    </div>
  );
};

export default NotificationPage;