// src/components/patient/BookingSection.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // <--- 1. Import useNavigate
import BookingModal from './BookingModal.jsx'; 
import timeslotService from '../../services/TimeslotService.js'; 

export default function BookingSection({ doctor, scheduleConfig }) {
    const navigate = useNavigate(); // <--- 2. Khởi tạo navigate
    const [openBooking, setOpenBooking] = useState(false);
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // ... (Giữ nguyên logic tạo weekDays)
    const weekDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 10; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
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

    // ... (Giữ nguyên logic fetchSlots)
    useEffect(() => {
        const fetchSlots = async () => {
            const doctorId = doctor?._id || doctor?.id || doctor?.doctor_id;
            
            if (!doctorId || !selectedDay?.fullDate) return;

            setLoadingSlots(true);
            setAvailableSlots([]);
            setSelectedSlot(null);

            try {
                const res = await timeslotService.getSlotsByDate(doctorId, selectedDay.fullDate);
                let slotsData = [];
                
                if (Array.isArray(res)) {
                    slotsData = res;
                } else if (res.data && Array.isArray(res.data)) {
                    slotsData = res.data;
                } else if (res.data && Array.isArray(res.data.slots)) {
                    slotsData = res.data.slots;
                } else if (res.slots && Array.isArray(res.slots)) {
                    slotsData = res.slots;
                }

                const activeSlots = slotsData.filter(slot => {
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

    const isDayOffUI = (dateStr) => scheduleConfig?.exceptions?.some(e => e.date === dateStr && e.isDayOff);

    // --- 3. HÀM KIỂM TRA ĐĂNG NHẬP ---
    const checkAuth = () => {
        // Kiểm tra token trong localStorage (hoặc cookie/context tùy dự án của bạn)
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) {
            // Nếu chưa đăng nhập:
            const confirmLogin = window.confirm("Bạn cần đăng nhập để đặt lịch khám. Đi đến trang đăng nhập ngay?");
            if (confirmLogin) {
                // Lưu lại đường dẫn hiện tại để sau khi login thì quay lại (nếu logic login hỗ trợ)
                navigate('/login', { state: { from: window.location.pathname } });
            }
            return false;
        }
        return true;
    };

    // --- 4. CẬP NHẬT HANDLE CLICK SLOT ---
    const handleSlotClick = (slot) => {
        if (slot.isBooked || slot.status === 'booked') return;
        
        // Kiểm tra đăng nhập TRƯỚC khi mở modal
        if (!checkAuth()) return; 

        const displayTime = slot.display || `${slot.start} - ${slot.end}`;
        setSelectedSlot({ ...slot, display: displayTime });
        setOpenBooking(true);
    };

    // --- 5. CẬP NHẬT HANDLE OPEN BOOKING (Nút lớn) ---
    const handleOpenBooking = () => {
        // Kiểm tra đăng nhập
        if (!checkAuth()) return;

        // Logic chọn slot
        if (!selectedSlot && availableSlots.length > 0) {
            // Nếu chưa chọn slot nào thì lấy slot đầu tiên
            const firstAvailable = availableSlots[0];
            const displayTime = firstAvailable.display || `${firstAvailable.start} - ${firstAvailable.end}`;
            setSelectedSlot({ ...firstAvailable, display: displayTime });
            setOpenBooking(true);
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
                 {/* --- 6. CẬP NHẬT NÚT ĐẶT KHÁM --- */}
                 <button
                    onClick={handleOpenBooking}
                    // Disable nếu đang load HOẶC không có slot nào để chọn
                    // Lưu ý: KHÔNG disable nếu chưa đăng nhập, để người dùng bấm vào mới nhắc đăng nhập
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