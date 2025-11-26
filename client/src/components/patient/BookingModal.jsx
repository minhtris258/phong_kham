// src/components/patient/BookingModal.jsx
import React, { useState } from 'react';
import { X, Upload, Calendar, Clock, User, FileText, Loader2 } from 'lucide-react';
import appointmentsService from '../../services/AppointmentsService';

export default function BookingModal({ doctor, selectedDate, selectedSlot, onClose }) {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Format ngày hiển thị (YYYY-MM-DD -> DD/MM/YYYY)
    const displayDate = selectedDate.split('-').reverse().join('/');

    // Xử lý logic đặt lịch
   const handleConfirmBooking = async () => {
    if (!reason.trim()) {
        alert("Vui lòng nhập lý do khám.");
        return;
    }

    // KIỂM TRA QUAN TRỌNG: Slot có ID không?
    // Backend cần "timeslot_id", nên object selectedSlot bắt buộc phải có field _id hoặc id
    const timeslotId = selectedSlot._id || selectedSlot.id || selectedSlot.timeslot_id;

    if (!timeslotId) {
        alert("Lỗi dữ liệu: Không tìm thấy ID của lịch khám này. Vui lòng kiểm tra API slots.");
        console.error("Selected Slot thiếu ID:", selectedSlot);
        return;
    }

    setIsSubmitting(true);
    try {
        // --- SỬA LẠI PAYLOAD ĐÚNG YÊU CẦU ---
        const payload = {
            timeslot_id: timeslotId,
            reason: reason
        };

        console.log("Booking Payload:", payload); // Debug xem có timeslot_id chưa

        await appointmentsService.bookAppointment(payload);
        
        alert("Đặt lịch thành công!");
        onClose();
        // window.location.reload(); // Tùy chọn

    } catch (error) {
        console.error("Booking Error:", error);
        const msg = error.response?.data?.message || "Lỗi khi đặt lịch.";
        alert(msg);
    } finally {
        setIsSubmitting(false);
    }
};

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
                
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10 rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-gray-900">Xác nhận đặt lịch khám</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto flex-1">
                    <div className="grid lg:grid-cols-3 gap-8">
                        
                        {/* Cột Trái: Form nhập liệu */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Thông tin lịch chọn (Read-only) */}
                            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Thời gian khám đã chọn
                                </h3>
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <div className="flex-1 bg-white p-4 rounded-xl border border-blue-200 shadow-sm flex items-center gap-3">
                                        <Calendar className="w-8 h-8 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-500">Ngày khám</p>
                                            <p className="font-bold text-lg text-gray-900">{displayDate}</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-white p-4 rounded-xl border border-blue-200 shadow-sm flex items-center gap-3">
                                        <Clock className="w-8 h-8 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-500">Giờ khám</p>
                                            <p className="font-bold text-lg text-gray-900">{selectedSlot.display}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin bệnh nhân (Giả lập - Sau này cần lấy từ Auth Context) */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Thông tin bệnh nhân
                                </h3>
                                <div className="p-4 border rounded-xl bg-gray-50 text-gray-600">
                                    <p>Đang đặt lịch cho: <span className="font-semibold text-gray-900">Chính bạn (Theo tài khoản đăng nhập)</span></p>
                                    <p className="text-sm mt-1">Hệ thống sẽ sử dụng thông tin hồ sơ cá nhân của bạn để đăng ký.</p>
                                </div>
                            </div>

                            {/* Lý do khám */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Lý do khám / Triệu chứng
                                </h3>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Mô tả chi tiết triệu chứng, thuốc đang dùng hoặc tiền sử bệnh..."
                                    className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    rows="4"
                                />
                            </div>

                            {/* Upload file (UI Only - Cần backend hỗ trợ upload mới dùng được) */}
                            <div className="opacity-60 pointer-events-none grayscale">
                                <label className="block font-semibold mb-3">
                                    Đính kèm hình ảnh (Tính năng đang bảo trì)
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Chức năng upload hồ sơ sẽ sớm quay lại</p>
                                </div>
                            </div>
                        </div>

                        {/* Cột Phải: Tóm tắt & Thanh toán */}
                        <div className="bg-gray-50 rounded-2xl p-6 h-fit border border-gray-200">
                            <h3 className="font-bold text-xl mb-6 text-gray-900">Thông tin bác sĩ</h3>
                            
                            <div className="flex gap-4 mb-6">
                                <img
                                    src={doctor.thumbnail || doctor.image || `https://i.pravatar.cc/200?u=${doctor.email}`}
                                    alt={doctor.fullName}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                                />
                                <div>
                                    <p className="font-bold text-lg text-gray-900">BS. {doctor.fullName}</p>
                                    <p className="text-sm text-gray-600 truncate max-w-[180px]">
                                        {doctor.specialty?.name || "Chuyên khoa"}
                                    </p>
                                    <p className="text-xs text-gray-500">{doctor.workplace || "Bệnh viện Chợ Rẫy"}</p>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-gray-300 my-4"></div>

                            <div className="space-y-3 text-gray-700">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Ngày khám</span>
                                    <span className="font-medium">{displayDate}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Giờ khám</span>
                                    <span className="font-medium">{selectedSlot.display}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="font-bold text-gray-900">Phí khám</span>
                                    <span className="text-xl font-bold text-blue-600">
                                        {doctor.consultation_fee ? doctor.consultation_fee.toLocaleString('vi-VN') : 0}₫
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleConfirmBooking}
                                disabled={isSubmitting}
                                className={`w-full mt-8 font-bold text-lg py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 ${
                                    isSubmitting 
                                    ? 'bg-blue-400 text-white cursor-not-allowed' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl'
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    "Xác nhận đặt lịch"
                                )}
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-4 px-2 leading-relaxed">
                                Bằng việc nhấn nút xác nhận, bạn cam kết tuân thủ quy định khám chữa bệnh của phòng khám.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}