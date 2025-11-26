// src/components/patient/BookingSection.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react';
import BookingModal from './BookingModal.jsx'; 
// --- THAY ĐỔI 1: Import TimeslotService mới ---
import timeslotService from '../../services/TimeslotService.js'; 

export default function BookingSection({ doctor, scheduleConfig }) {
    const [openBooking, setOpenBooking] = useState(false);
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // 1. Tạo danh sách 10 ngày (Logic chuẩn YYYY-MM-DD)
    const weekDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 10; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            
            // Format YYYY-MM-DD local thủ công để tránh lỗi múi giờ
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const dayNum = String(date.getDate()).padStart(2, '0');
            const fullDate = `${year}-${month}-${dayNum}`;

            days.push({
                dateStr: date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' }),
                dayName: date.toLocaleDateString('vi-VN', { weekday: 'short' }).replace('.', ''),
                fullDate: fullDate,
                isToday: i === 0
            });
        }
        return days;
    }, []);

    const selectedDay = weekDays[selectedDateIndex];

    // 2. FETCH SLOTS (Đã cập nhật dùng TimeslotService)
    useEffect(() => {
        const fetchSlots = async () => {
            // Lấy ID bác sĩ: Kiểm tra kỹ các trường có thể có
            const doctorId = doctor?._id || doctor?.id || doctor?.doctor_id;
            
            if (!doctorId || !selectedDay?.fullDate) return;

            setLoadingSlots(true);
            setAvailableSlots([]);
            setSelectedSlot(null);

            try {
                console.log(`Calling API: /timeslots/${doctorId}/slots/${selectedDay.fullDate}`);
                
                // --- THAY ĐỔI 2: Gọi hàm từ timeslotService ---
                const res = await timeslotService.getSlotsByDate(doctorId, selectedDay.fullDate);
                
                console.log("API Response:", res); // Debug response

                let slotsData = [];
                
                // Xử lý response linh hoạt (cho cả Axios Response object và Data trực tiếp)
                if (Array.isArray(res)) {
                    slotsData = res;
                } else if (res.data && Array.isArray(res.data)) {
                    slotsData = res.data;
                } else if (res.data && Array.isArray(res.data.slots)) {
                    slotsData = res.data.slots;
                } else if (res.slots && Array.isArray(res.slots)) {
                    slotsData = res.slots;
                }

                // Lọc bỏ các slot đã có người đặt (nếu API trả về mixed status)
                // Giả định API trả về status: "free" hoặc "booked"
                const activeSlots = slotsData.filter(slot => {
                    // Nếu có field status, phải là 'free'. Nếu có isBooked, phải là false.
                    const isFree = slot.status ? slot.status === 'free' : true;
                    const notBooked = !slot.isBooked;
                    return isFree && notBooked;
                });

                setAvailableSlots(activeSlots);

            } catch (error) {
                console.error("Lỗi tải lịch khám:", error);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [doctor, selectedDay]);

    // UI helper
    const isDayOffUI = (dateStr) => scheduleConfig?.exceptions?.some(e => e.date === dateStr && e.isDayOff);

    const handleSlotClick = (slot) => {
        // Double check tránh click slot đã đặt
        if (slot.isBooked || slot.status === 'booked') return;
        
        // Tạo display string nếu chưa có
        const displayTime = slot.display || `${slot.start} - ${slot.end}`;
        
        // Quan trọng: Truyền toàn bộ object slot (chứa _id) vào state
        setSelectedSlot({ ...slot, display: displayTime });
        setOpenBooking(true);
    };

    const handleOpenBooking = () => {
         if (!selectedSlot && availableSlots.length > 0) {
            // Tự động chọn slot đầu tiên nếu user bấm "Đặt khám ngay" mà chưa chọn giờ
            handleSlotClick(availableSlots[0]);
        } else if (selectedSlot) {
             setOpenBooking(true);
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border p-8">
            <div className="text-center mb-8 pb-6 border-b-2 border-gray-100">
                <p className="text-sm text-gray-600 uppercase tracking-wider">Phí khám</p>
                <p className="text-5xl font-bold text-blue-600 mt-3">
                    {doctor.consultation_fee ? doctor.consultation_fee.toLocaleString('vi-VN') : 0}₫
                </p>
            </div>

            <h3 className="text-2xl font-bold mb-6 flex items-center justify-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                Đặt khám nhanh
            </h3>

            {/* List ngày */}
            <div className="flex gap-4 overflow-x-auto pb-4 mb-8 scrollbar-hide">
                {weekDays.map((day, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedDateIndex(idx)}
                        className={`min-w-40 text-center py-6 px-5 rounded-2xl border-2 transition-all font-medium shadow-sm ${
                            selectedDateIndex === idx
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                : isDayOffUI(day.fullDate)
                                ? 'bg-red-50 text-red-600 border-red-200 line-through opacity-70'
                                : 'bg-gray-50 hover:bg-gray-100 border-gray-300'
                        }`}
                    >
                        <div className="text-lg">{day.dayName}</div>
                        <div className="text-4xl font-bold mt-2">{day.dateStr.split('/')[0]}</div>
                        <div className="text-sm opacity-90">Th {day.dateStr.split('/')[1]}</div>
                    </button>
                ))}
            </div>

            {/* Slots Grid */}
            {loadingSlots ? (
                <div className="text-center py-16 text-gray-500">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto mb-2 text-blue-600" />
                    <p>Đang tải lịch...</p>
                </div>
            ) : availableSlots.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-xl">Không có lịch khám trong ngày này</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                    {availableSlots.map((slot, i) => {
                        const display = slot.display || `${slot.start} - ${slot.end}`;
                        // Logic kiểm tra selected
                        // Cần so sánh _id nếu có, hoặc so sánh start time
                        const isSelected = selectedSlot && (
                            (selectedSlot._id && selectedSlot._id === slot._id) || 
                            (selectedSlot.start === slot.start)
                        );
                        
                        return (
                            <button
                                key={i}
                                onClick={() => handleSlotClick({ ...slot, display })}
                                className={`py-5 px-4 rounded-2xl font-bold text-lg transition-all shadow-md ${
                                    isSelected
                                    ? 'bg-green-600 text-white shadow-lg transform scale-105'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-xl border-2 border-blue-200'
                                }`}
                            >
                                {display}
                            </button>
                        );
                    })}
                </div>
            )}
            
             <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8">
                 <div className="text-center">
                    <p className="text-gray-600 text-lg">Hỗ trợ đặt khám</p>
                    <a href="tel:19002805" className="text-3xl font-bold text-blue-600 hover:underline">
                        1900-2805
                    </a>
                </div>
                 <button
                    onClick={handleOpenBooking}
                    disabled={loadingSlots || availableSlots.length === 0}
                    className={`px-20 py-6 rounded-2xl font-bold text-2xl transition-all shadow-xl ${
                         loadingSlots || availableSlots.length === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    ĐẶT KHÁM NGAY
                </button>
             </div>

            {openBooking && selectedSlot && (
                <BookingModal 
                    doctor={doctor} 
                    selectedDate={selectedDay.fullDate}
                    selectedSlot={selectedSlot}
                    onClose={() => {
                        setOpenBooking(false);
                        setSelectedSlot(null);
                    }} 
                />
            )}
        </div>
    );
}