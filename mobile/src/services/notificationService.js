import api from '../api/axiosClient';

const notificationService = {
  // Lấy danh sách (có phân trang)
  getNotifications: (page = 1, limit = 20) => {
    return api.get(`/notifications?page=${page}&limit=${limit}`);
  },
  // Đánh dấu 1 cái là đã đọc
  markAsRead: (id) => {
    return api.post(`/notifications/${id}/read`);
  },
  // Đánh dấu tất cả đã đọc
  markAllAsRead: () => {
    return api.post(`/notifications/read-all`);
  },
  // Xóa thông báo
  deleteNotification: (id) => {
    return api.delete(`/notifications/${id}`);
  },
};

export default notificationService;
