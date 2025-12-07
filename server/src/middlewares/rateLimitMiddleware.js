import rateLimit from "express-rate-limit";

// 1. Bộ lọc chặt (Dùng cho form Liên hệ, Đăng nhập, Đăng ký)
// Cho phép tối đa 5 lần gửi trong vòng 1 giờ
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ (tính bằng mili giây)
  max: 5, // Tối đa 5 request mỗi IP
  message: {
    success: false,
    message: "Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau 1 giờ.",
  },
  standardHeaders: true, // Trả về thông tin RateLimit trong header (Draft-6, 7)
  legacyHeaders: false, // Tắt header X-RateLimit-* cũ
});

// 2. Bộ lọc lỏng hơn (Dùng cho các API xem danh sách, tìm kiếm...)
// Cho phép 100 lần gửi trong 15 phút
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100,
  message: {
    success: false,
    message: "Quá nhiều yêu cầu từ địa chỉ IP này, vui lòng thử lại sau 15 phút.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});