import React, { useState, useEffect } from "react";
import { Star, X, Loader2 } from "lucide-react";
import Modal from "../Modal"; // Modal dùng chung của bạn
import ratingService from "../../services/RatingService"; // Import service vừa tạo
import { toastSuccess,toastError, toastWarning, toastInfo } from "../../utils/toast";

const RatingModal = ({ isOpen, onClose, notification, onSuccess }) => {
  const [rating, setRating] = useState(5); // Mặc định 5 sao
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0); // Để làm hiệu ứng hover sao

  // Reset form khi mở modal mới
  useEffect(() => {
    if (isOpen) {
      setRating(5);
      setComment("");
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen || !notification) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toastWarning("Vui lòng chọn số sao để đánh giá!");
      return;
    }

    setLoading(true);
    try {
      // Gọi API qua service
      await ratingService.createRating({
        appointment_id: notification.appointment_id, // Lấy ID lịch hẹn từ thông báo
        star: rating,
        comment: comment.trim()
      });

      toastSuccess("Cảm ơn bạn đã gửi đánh giá thành công!");
      
      // Callback để component cha (NotificationPage) xóa thông báo hoặc cập nhật UI
      if (onSuccess) {
        onSuccess(notification._id); 
      }
      
      onClose(); // Đóng modal
    } catch (error) {
      // Xử lý lỗi từ Backend trả về
      const errorMsg = error.response?.data?.error || error.message || "Có lỗi xảy ra, vui lòng thử lại.";
      toastError("Gửi đánh giá thất bại: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Lấy nhãn hiển thị theo số sao
  const getRatingLabel = (star) => {
    switch(star) {
      case 5: return "Tuyệt vời!";
      case 4: return "Rất tốt";
      case 3: return "Bình thường";
      case 2: return "Tệ";
      case 1: return "Rất tệ";
      default: return "";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đánh giá trải nghiệm khám" maxWidth="sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div className="text-center space-y-2">
          <p className="text-gray-600 text-sm">
            Bạn cảm thấy buổi khám với bác sĩ thế nào?
          </p>
          {/* Tên bác sĩ (nếu có trong data thông báo) */}
          {notification.data?.doctorName && (
             <p className="font-bold text-gray-800 text-lg">{notification.data.doctorName}</p>
          )}
        </div>

        {/* --- KHU VỰC CHỌN SAO --- */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform hover:scale-110 focus:outline-none p-1"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  size={36}
                  // Logic tô màu: Nếu đang hover thì tô theo hover, nếu không thì tô theo rating đã chọn
                  className={`${
                    star <= (hoverRating || rating) 
                      ? "fill-yellow-400 text-yellow-400 drop-shadow-sm" 
                      : "text-gray-200"
                  } transition-colors duration-200`}
                />
              </button>
            ))}
          </div>
          {/* Label cảm xúc (Rất tốt, Tệ...) */}
          <span className="text-sm font-semibold text-yellow-600 h-5 block">
            {getRatingLabel(hoverRating || rating)}
          </span>
        </div>

        {/* --- KHU VỰC NHẬP BÌNH LUẬN --- */}
        <div>
          <textarea
            className="w-full p-3 border border-gray-200 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm resize-none transition-all"
            rows="3"
            placeholder="Hãy chia sẻ thêm chi tiết (bác sĩ nhiệt tình, khám nhanh...)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </div>

        {/* --- FOOTER BUTTONS --- */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            Để sau
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-md disabled:opacity-70 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang gửi...
              </>
            ) : (
              "Gửi đánh giá"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RatingModal;