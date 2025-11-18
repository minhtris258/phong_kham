// src/components/patient/BookingSection.jsx
import React, { useState, useMemo } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import BookingModal from './BookingModal.jsx'; // Giả định đường dẫn
import { initialMockAppointments } from '../../mocks/mockdata.js'; // Import dữ liệu appointments

export default function BookingSection({ doctor, schedule }) {
    const [openBooking, setOpenBooking] = useState(false);
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [selectedSlot, setSelectedSlot] = useState(null); // State lưu slot được chọn

    // Tính toán 10 ngày tiếp theo (Logic được chuyển từ trang cha)
    const weekDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 10; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            days.push({
                dateStr: date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' }),
                dayName: date.toLocaleDateString('vi-VN', { weekday: 'short' }).replace('.', ''),
                fullDate: date.toISOString().split('T')[0],
                dayEn: date.toLocaleDateString('en-US', { weekday: 'long' }),
                isToday: i === 0
            });
        }
        return days;
    }, []);

    const selectedDay = weekDays[selectedDateIndex];
    
    const isDayOff = (date) => schedule?.exceptions?.some(e => e.date === date && e.isDayOff);

    const getTimeSlotsForDate = (day) => {
        if (isDayOff(day.fullDate)) return { slots: [], isOff: true };

        const dayConfig = schedule?.weekly_schedule.find(d => d.dayOfWeek === day.dayEn);
        if (!dayConfig) return { slots: [], isOff: false };

        const slots = [];
        dayConfig.timeRanges.forEach(range => {
            let time = new Date(`2025-01-01 ${range.start}`);
            const end = new Date(`2025-01-01 ${range.end}`);
            while (time <= end) {
                const timeStr = time.toTimeString().slice(0, 5);
                const endTimeStr = new Date(time.getTime() + schedule.slot_minutes * 60000).toTimeString().slice(0, 5);
                
                // Kiểm tra xem slot đã được đặt chưa
                const isBooked = initialMockAppointments.some(a =>
                    a.doctor_id === doctor.id && a.date === day.fullDate && a.start === timeStr
                );

                // Lọc bỏ slot cuối cùng nếu nó vượt quá thời gian kết thúc của range (Range là 8:00 - 12:00, slot 12:00-12:30 bị loại)
                if (new Date(time.getTime() + schedule.slot_minutes * 60000) > end && range.end !== '23:59') {
                    // Tiếp tục nếu thời gian kết thúc của slot vượt quá thời gian kết thúc của range
                } else {
                     slots.push({ display: `${timeStr} - ${endTimeStr}`, isBooked, start: timeStr });
                }
               
                time.setMinutes(time.getMinutes() + schedule.slot_minutes);
            }
        });
        return { slots, isOff: false };
    };

    const { slots, isOff } = getTimeSlotsForDate(selectedDay);

    // Xử lý khi chọn slot
    const handleSlotClick = (slot) => {
        if (slot.isBooked) return;
        setSelectedSlot(slot);
        setOpenBooking(true);
    };

    const handleOpenBooking = () => {
        // Mở modal nếu có slot trống được chọn, nếu không, chọn slot trống đầu tiên
        if (!selectedSlot && slots.some(s => !s.isBooked)) {
            const firstAvailableSlot = slots.find(s => !s.isBooked);
            setSelectedSlot(firstAvailableSlot);
        }
        if (slots.some(s => !s.isBooked)) {
             setOpenBooking(true);
        }
    }


    return (
        <div className="bg-white rounded-2xl shadow-sm border p-8">
            <div className="text-center mb-8 pb-6 border-b-2 border-gray-100">
                <p className="text-sm text-gray-600 uppercase tracking-wider">Phí khám</p>
                <p className="text-5xl font-bold text-blue-600 mt-3">
                    {doctor.consultation_fee.toLocaleString('vi-VN')}₫
                </p>
            </div>

            <h3 className="text-2xl font-bold mb-6 flex items-center justify-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                Đặt khám nhanh
            </h3>

            {/* Danh sách ngày */}
            <div className="flex gap-4 overflow-x-auto pb-4 mb-8 scrollbar-hide">
                {weekDays.map((day, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setSelectedDateIndex(idx);
                            setSelectedSlot(null); // Reset slot khi đổi ngày
                        }}
                        className={`min-w-40 text-center py-6 px-5 rounded-2xl border-2 transition-all font-medium shadow-sm ${
                            selectedDateIndex === idx
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                : isDayOff(day.fullDate)
                                ? 'bg-red-50 text-red-600 border-red-200 line-through'
                                : 'bg-gray-50 hover:bg-gray-100 border-gray-300'
                        }`}
                    >
                        <div className="text-lg">{day.dayName}</div>
                        <div className="text-4xl font-bold mt-2">{day.dateStr.split('/')[0]}</div>
                        <div className="text-sm opacity-90">Th {day.dateStr.split('/')[1]}</div>
                        <div className="text-sm mt-3">
                            {isDayOff(day.fullDate)
                                ? 'Nghỉ khám'
                                : `${getTimeSlotsForDate(day).slots.filter(s => !s.isBooked).length} chỗ trống`}
                        </div>
                    </button>
                ))}
            </div>

            {/* Khung giờ */}
            {isOff ? (
                <div className="text-center py-16 text-red-600">
                    <AlertCircle className="w-20 h-20 mx-auto mb-4" />
                    <p className="text-2xl font-bold">Bác sĩ nghỉ ngày này</p>
                </div>
            ) : slots.length === 0 ? (
                <p className="text-center py-16 text-gray-500 text-xl">Không có lịch khám trong ngày này</p>
            ) : (
                <div>
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <Clock className="w-7 h-7 text-blue-600" />
                        <span className="text-2xl font-bold">
                            {selectedDay.dayName} {selectedDay.dateStr}
                            {selectedDay.isToday && ' (Hôm nay)'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {slots.map((slot, i) => (
                            <button
                                key={i}
                                onClick={() => handleSlotClick(slot)}
                                disabled={slot.isBooked}
                                className={`py-5 px-4 rounded-2xl font-bold text-lg transition-all shadow-md ${
                                    slot.isBooked
                                        ? 'bg-gray-100 text-gray-400 line-through cursor-not-allowed'
                                        : selectedSlot?.start === slot.start
                                        ? 'bg-green-600 text-white shadow-lg' // Slot đang chọn
                                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-xl border-2 border-blue-200'
                                }`}
                            >
                                {slot.display}
                                {slot.isBooked && <div className="text-sm mt-1">Đã đặt</div>}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Nút đặt khám + Hotline */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8">
                <div className="text-center">
                    <p className="text-gray-600 text-lg">Hỗ trợ đặt khám</p>
                    <a href="tel:19002805" className="text-3xl font-bold text-blue-600 hover:underline">
                        1900-2805
                    </a>
                </div>
                <button
                    onClick={handleOpenBooking}
                    // Chỉ vô hiệu hóa nếu ngày nghỉ hoặc không còn slot trống
                    disabled={isOff || slots.length === 0 || !slots.some(s => !s.isBooked)}
                    className={`px-20 py-6 rounded-2xl font-bold text-2xl transition-all shadow-xl ${
                        isOff || slots.length === 0 || !slots.some(s => !s.isBooked)
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    ĐẶT KHÁM NGAY
                </button>
            </div>
            
            {/* Modal đặt lịch */}
            {openBooking && (
                <BookingModal 
                    doctor={doctor} 
                    selectedDate={selectedDay.fullDate}
                    selectedSlot={selectedSlot}
                    onClose={() => {
                        setOpenBooking(false);
                        setSelectedSlot(null); // Reset slot khi đóng
                    }} 
                />
            )}
        </div>
    );
}