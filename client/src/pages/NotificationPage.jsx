// src/pages/NotificationPage.jsx
import React, { useState, useEffect } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"; // Import thêm icon
import { useNavigate } from "react-router-dom"; 
import notificationService from "../services/notificationService";
import NotificationItem from "../components/notification/NotificationItem"; 
import NotificationDetailModal from "../components/notification/NotificationDetailModal";
import RatingModal from "../components/notification/RatingModal"; 
import { useSocket } from "../context/SocketContext";
import { toastSuccess, toastError } from "../utils/toast";
import { useNotification } from "../context/NotificationContext"; 

const ITEMS_PER_PAGE = 10; // Số thông báo mỗi trang

const NotificationPage = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { decreaseUnreadCount, resetUnreadCount } = useNotification();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1); // State trang
  
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [ratingNotification, setRatingNotification] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Lấy 100 thông báo mới nhất để phân trang client-side
      const res = await notificationService.getNotifications(1, 100); 
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

  // Reset về trang 1 khi đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const handleItemClick = async (notification) => {
    setSelectedNotification(notification);
    if (notification.status === "unread") {
      try {
        await notificationService.markAsRead(notification._id);
        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, status: "read" } : n));
        decreaseUnreadCount(); 
      } catch (error) { console.error(error); }
    }
  };

  const handleReadAll = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, status: "read" })));
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

  // --- LOGIC PHÂN TRANG & LỌC ---
  const filteredNotifications = notifications.filter(n => 
    filter === "all" ? true : n.status === "unread"
  );
  
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
  const paginatedNotifications = filteredNotifications.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  const unreadCount = notifications.filter(n => n.status === "unread").length;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 mt-15">
      <div className="max-w-lvh mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
        
        {/* HEADER */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Thông báo ({unreadCount})</h1>
            </div>
            <button onClick={handleReadAll} disabled={unreadCount === 0} className="text-sm text-[#00B5F1] font-medium hover:underline disabled:text-gray-400 disabled:no-underline">
                Đọc tất cả
            </button>
        </div>

        {/* FILTER TABS */}
        <div className="flex gap-6 px-6 pt-4 border-b border-gray-100 bg-gray-50/50">
            <button 
                onClick={() => setFilter("all")} 
                className={`pb-3 text-sm font-medium transition-colors relative ${filter === "all" ? "text-[#00B5F1]" : "text-gray-500 hover:text-gray-700"}`}
            >
                Tất cả
                {filter === "all" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00B5F1] rounded-t-full"></span>}
            </button>
            <button 
                onClick={() => setFilter("unread")} 
                className={`pb-3 text-sm font-medium transition-colors relative ${filter === "unread" ? "text-[#00B5F1]" : "text-gray-500 hover:text-gray-700"}`}
            >
                Chưa đọc
                {filter === "unread" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00B5F1] rounded-t-full"></span>}
            </button>
        </div>

        {/* LIST */}
        <div className="flex-1 p-4 space-y-3">
          {loading ? (
             <div className="py-20 text-center text-gray-400 flex flex-col items-center">
                 <Loader2 className="w-8 h-8 animate-spin mb-2"/>
                 <span>Đang tải thông báo...</span>
             </div>
          ) : filteredNotifications.length === 0 ? (
             <div className="py-20 text-center text-gray-400">Không có thông báo nào.</div>
          ) : (
            paginatedNotifications.map(notif => (
              <NotificationItem 
                key={notif._id} 
                notification={notif} 
                onClick={() => handleItemClick(notif)} 
                onDelete={() => handleDelete(notif._id)}
              />
            ))
          )}
        </div>

        {/* PAGINATION CONTROL */}
        {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-4 bg-white">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border transition ${currentPage === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-[#00B5F1]'}`}
                >
                    <ChevronLeft size={20} />
                </button>
                
                <span className="text-sm font-medium text-gray-700">
                    Trang <span className="text-[#00B5F1] font-bold">{currentPage}</span> / {totalPages}
                </span>

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border transition ${currentPage === totalPages ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-[#00B5F1]'}`}
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        )}
      </div>

      {/* MODALS */}
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