import Notification from "../models/NotificationModel.js";

/**
 * Hàm chung để gửi thông báo
 * @param {Object} params - Các tham số cần thiết
 */
export const sendNotification = async ({
  userId,
  title,
  body,
  type,          // "appointment", "reminder", "general"
  appointmentId = null,
  data = {},     // Dữ liệu kèm theo (tên bác sĩ, ngày giờ...)
  qr = null,     // Chuỗi QR Code (nếu có)
  io = null      // Biến socket.io (truyền từ controller sang)
}) => {
  try {
    // 1. Tạo và lưu vào Database
    const newNotification = await Notification.create({
      user_id: userId,
      title,
      body,
      type,
      appointment_id: appointmentId,
      data,
      qr, // Lưu mã QR nếu có
      channels: ["in-app"],
      status: "unread",
      sent_at: new Date(),
    });

    // 2. Gửi Realtime qua Socket.IO (Nếu có truyền biến io vào)
    if (io) {
      io.to(userId.toString()).emit("new_notification", {
        message: title,
        data: newNotification,
      });
    }

    return newNotification;
  } catch (error) {
    console.error("[NotificationService] Lỗi tạo thông báo:", error);
    // Không throw error để tránh làm lỗi luồng chính (như đặt lịch)
  }
};