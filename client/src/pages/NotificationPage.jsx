import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import notificationService from "../services/notificationService";
import NotificationItem from "../components/notification/NotificationItem"; 
import NotificationDetailModal from "../components/notification/NotificationDetailModal";
import RatingModal from "../components/notification/RatingModal"; // Import RatingModal

const NotificationPage = () => {
  const navigate = useNavigate(); // Hook điều hướng
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  // State quản lý Modal Chi tiết
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  // State quản lý Modal Đánh giá
  const [ratingNotification, setRatingNotification] = useState(null);

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

  const handleItemClick = async (notification) => {
    setSelectedNotification(notification);
    if (notification.status === "unread") {
      try {
        await notificationService.markAsRead(notification._id);
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

  // --- HÀM XỬ LÝ HÀNH ĐỘNG MỚI ---

  // 1. Khi nhấn nút "Đánh giá ngay" trong modal chi tiết
  const handleOpenRating = (notification) => {
    setSelectedNotification(null); // Đóng modal chi tiết
    setRatingNotification(notification); // Mở modal đánh giá
  };

  // 2. Khi nhấn nút "Xem bệnh án" trong modal chi tiết
  const handleViewResult = (notification) => {
    // Điều hướng đến trang bệnh án (Giả sử route là /medical-records/:appointmentId)
    // Bạn sửa lại đường dẫn này cho khớp với router của bạn
    navigate(`/visit-detail/${notification.appointment_id}`);
  };

  // 3. Khi đánh giá thành công
  const handleRatingSuccess = (notificationId) => {
    // Tùy chọn: Xóa thông báo đánh giá đi sau khi đã đánh giá xong để tránh spam
    handleDelete(notificationId);
  };

  // Filter Logic
  const filteredNotifications = notifications.filter(n => 
    filter === "all" ? true : n.status === "unread"
  );
  const unreadCount = notifications.filter(n => n.status === "unread").length;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 mt-15">
      <div className="max-w-lvh mx-auto">
        
        {/* Header & Tabs */}
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Thông báo ({unreadCount})</h1>
            </div>
            <button onClick={handleReadAll} disabled={unreadCount === 0} className="text-sm text-[#00B5F1] font-medium hover:underline disabled:text-gray-400 disabled:no-underline">
                Đọc tất cả
            </button>
        </div>

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
                onClick={() => handleItemClick(notif)} 
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
          onRate={handleOpenRating}       // Truyền hàm mở Rating
          onViewResult={handleViewResult} // Truyền hàm xem kết quả
        />
      )}

      {/* MODAL ĐÁNH GIÁ (Mới) */}
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