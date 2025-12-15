import React from "react";
import {
  User,
  Clock,
  Calendar,
  QrCode,
  Star,
  FileText,
  ArrowRight,
} from "lucide-react";
import Modal from "../Modal";

// Nhận thêm props: onRate (xử lý đánh giá), onViewResult (xử lý xem kết quả)
const NotificationDetailModal = ({
  notification,
  onClose,
  onRate,
  onViewResult,
}) => {
  if (!notification) return null;

  const { title, body, data, qr, createdAt, type } = notification;

  // Kiểm tra loại thông báo để hiển thị nút
  const isRatingRequest = type === "rating_request";
  const isMedicalResult =
    title.toLowerCase().includes("kết quả") && notification.appointment_id;

  return (
    <Modal
      isOpen={!!notification}
      onClose={onClose}
      title={title}
      maxWidth="md"
    >
      <div className="space-y-4">
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <Clock size={14} /> {new Date(createdAt).toLocaleString("vi-VN")}
        </p>

        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
          {body}
        </p>

        {/* Thông tin chi tiết */}
        {data && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3 text-sm mt-2">
            {data.doctorName && (
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bác sĩ</p>
                  <p className="font-semibold">{data.doctorName}</p>
                </div>
              </div>
            )}

            {data.time && data.date && (
              <div className="flex items-center gap-3 text-gray-700 border-t border-gray-200 pt-2">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Thời gian khám</p>
                  <p className="font-semibold">
                    {data.time} - {data.date}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* QR Code */}
        {qr && (
          <div className="flex flex-col items-center justify-center pt-4 border-t border-dashed border-gray-200 mt-4">
            <p className="text-xs font-bold text-sky-600 mb-3 uppercase tracking-wider flex items-center gap-1">
              <QrCode size={14} /> Mã Check-in
            </p>
            <div className="p-2 border-2 border-sky-100 rounded-xl bg-white shadow-sm">
              <img
                src={qr}
                alt="QR Check-in"
                className="w-40 h-40 object-contain"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              Đưa mã này cho lễ tân để xác thực
            </p>
          </div>
        )}

        {/* --- KHU VỰC NÚT HÀNH ĐỘNG (ACTION BUTTONS) --- */}
        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
          >
            Đóng
          </button>

          {/* Nút Đánh Giá */}
          {isRatingRequest && (
            <button
              onClick={() => onRate(notification)}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm"
            >
              <Star size={16} className="fill-white" />
              Đánh giá ngay
            </button>
          )}

          {/* Nút Xem Kết Quả */}
          {isMedicalResult && (
            <button
              onClick={() => onViewResult(notification)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm"
            >
              <FileText size={16} />
              Xem bệnh án
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NotificationDetailModal;
