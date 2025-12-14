// src/components/patient/BookingSection.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, AlertCircle, Loader2, PhoneCall } from 'lucide-react'; // Thêm icon PhoneCall
import { toastSuccess, toastError, toastWarning, toastInfo } from "../../utils/toast";
import { useNavigate } from 'react-router-dom';
import BookingModal from './BookingModal.jsx';
import timeslotService from '../../services/TimeslotService.js';

// Import Contexts
import { useSocket } from '../../context/SocketContext';
import { useAppContext } from '../../context/AppContext';

export default function BookingSection({ doctor, scheduleConfig }) {
    const navigate = useNavigate();
    const { socket } = useSocket();
    const { user } = useAppContext();

    const [openBooking, setOpenBooking] = useState(false);
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // 1. Logic tạo 10 ngày (Giữ nguyên)
    const weekDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 7; i++) { // Tăng lên 14 ngày cho thoải mái
            const date = new Date();
            date.setDate(date.getDate() + i);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const dayNum = String(date.getDate()).padStart(2, '0');
            const fullDate = `${year}-${month}-${dayNum}`;

            days.push({
                dateStr: date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' }),
                dayName: i === 0 ? "Hôm nay" : date.toLocaleDateString('vi-VN', { weekday: 'short' }).replace('.', ''),
                fullDate: fullDate,
                isToday: i === 0
            });
        }
        return days;
    }, []);

    const selectedDay = weekDays[selectedDateIndex];

    // 2. Fetch Slots (Giữ nguyên)
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
                if (Array.isArray(res)) slotsData = res;
                else if (res.data && Array.isArray(res.data)) slotsData = res.data;
                else if (res.data && Array.isArray(res.data.slots)) slotsData = res.data.slots;
                else if (res.slots && Array.isArray(res.slots)) slotsData = res.slots;

                const activeSlots = slotsData.filter(slot => {
                    const isFree = slot.status ? slot.status === 'free' : true;
                    return isFree && !slot.isBooked;
                });

                setAvailableSlots(activeSlots);
            } catch (error) {
                toastError("Lỗi tải lịch khám:", error);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [doctor, selectedDay]);

    // 3. Socket Realtime (Giữ nguyên logic)
    useEffect(() => {
        if (!socket) return;
        const handleSlotBooked = (data) => {
            const currentDoctorId = doctor?._id || doctor?.id;
            if (data.doctorId === currentDoctorId) {
                setAvailableSlots(prevSlots => prevSlots.filter(slot => slot._id !== data.timeslotId));

                if (selectedSlot && selectedSlot._id === data.timeslotId) {
                    let myProfileId = null;
                    let myAccountId = null;
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        try {
                            const parsed = JSON.parse(storedUser);
                            myProfileId = parsed._id || parsed.id;
                            myAccountId = parsed.user_id;
                        } catch (e) { }
                    }
                    const bookerId = String(data.bookedByUserId);
                    const isMe = (myProfileId && String(myProfileId) === bookerId) ||
                        (myAccountId && String(myAccountId) === bookerId);

                    if (isMe) return;

                    toastError("❌ Người khác đã cướp slot này.");
                    setOpenBooking(false);
                    setSelectedSlot(null);
                }
            }
        };
        socket.on('slot_booked', handleSlotBooked);
        return () => socket.off('slot_booked', handleSlotBooked);
    }, [socket, doctor, selectedSlot]);

    // Helper Functions
    const isDayOffUI = (dateStr) => scheduleConfig?.exceptions?.some(e => e.date === dateStr && e.isDayOff);
    
    const checkAuth = () => {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) {
            if (window.confirm("Bạn cần đăng nhập để đặt lịch khám. Đi đến trang đăng nhập ngay?")) {
                navigate('/login', { state: { from: window.location.pathname } });
            }
            return false;
        }
        return true;
    };

    const handleSlotClick = (slot) => {
        if (!checkAuth()) return;
        const displayTime = slot.display || `${slot.start} - ${slot.end}`;
        setSelectedSlot({ ...slot, display: displayTime });
        setOpenBooking(true);
    };

    const handleOpenBooking = () => {
        if (!checkAuth()) return;
        if (!selectedSlot && availableSlots.length > 0) {
            const firstAvailable = availableSlots[0];
            const displayTime = firstAvailable.display || `${firstAvailable.start} - ${firstAvailable.end}`;
            setSelectedSlot({ ...firstAvailable, display: displayTime });
            setOpenBooking(true);
        } else if (selectedSlot) {
            setOpenBooking(true);
        }
    }

    // --- RENDER ---
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 h-full flex flex-col">
            
            {/* 1. HEADER: Flex layout thay vì Center */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-100 pb-6">
                
                {/* Title Section */}
                <div className="flex items-center gap-3 mb-4 md:mb-0">
                    <div className="p-3 bg-blue-50 rounded-xl text-[#00B5F1]">
                        <Calendar className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900">Lịch Khám</h3>
                        <p className="text-gray-500 text-sm">Chọn ngày và giờ phù hợp</p>
                    </div>
                </div>

                {/* Price Section */}
                <div className="text-left md:text-right bg-gray-50 px-4 py-2 rounded-xl">
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Phí tư vấn</p>
                    <p className="text-2xl md:text-3xl font-bold text-[#00B5F1]">
                        {doctor.consultation_fee ? doctor.consultation_fee.toLocaleString('vi-VN') : 0}₫
                    </p>
                </div>
            </div>

            {/* 2. DATE SELECTOR: Scroll ngang nhưng to rõ hơn */}
            <div className="mb-8">
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
                    {weekDays.map((day, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedDateIndex(idx)}
                            className={`
                                snap-start flex-shrink-0 min-w-[90px] md:min-w-[110px] py-3 px-2 rounded-xl border transition-all duration-200
                                flex flex-col items-center justify-center gap-1 group
                                ${selectedDateIndex === idx
                                    ? 'bg-[#00B5F1] text-white border-[#00B5F1] shadow-md scale-105'
                                    : isDayOffUI(day.fullDate)
                                        ? 'bg-red-50 text-red-400 border-red-100 opacity-60 cursor-not-allowed'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#00B5F1] hover:bg-blue-50'
                                }
                            `}
                        >
                            <span className={`text-xs md:text-sm font-medium ${selectedDateIndex === idx ? 'text-blue-100' : 'text-gray-400 group-hover:text-[#00B5F1]'}`}>
                                {day.dayName}
                            </span>
                            <span className="text-xl md:text-2xl font-bold">
                                {day.dateStr.split('/')[0]}
                            </span>
                             <span className="text-[10px] opacity-80">
                                {day.dateStr}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. SLOTS GRID: Tăng lên 5 cột (grid-cols-5) vì layout rộng */}
            <div className="flex-1 min-h-[200px]">
                {loadingSlots ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-3 text-[#00B5F1]" />
                        <p>Đang cập nhật lịch trống...</p>
                    </div>
                ) : availableSlots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">Bác sĩ không có lịch khám vào ngày này.</p>
                        <p className="text-sm text-gray-400 mt-1">Vui lòng chọn ngày khác.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Có <strong className="text-gray-900">{availableSlots.length}</strong> khung giờ trống:</span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                            {availableSlots.map((slot, i) => {
                                const display = slot.display || `${slot.start} - ${slot.end}`;
                                const isSelected = selectedSlot && (
                                    (selectedSlot._id && selectedSlot._id === slot._id) ||
                                    (selectedSlot.start === slot.start)
                                );

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleSlotClick({ ...slot, display })}
                                        className={`
                                            relative py-3 px-2 rounded-lg text-sm md:text-base font-semibold transition-all duration-200 border
                                            ${isSelected
                                                ? 'bg-[#007ACC] text-white border-[#007ACC] shadow-lg ring-2 ring-offset-2 ring-[#007ACC]'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#00B5F1] hover:text-[#00B5F1] hover:shadow-md'
                                            }
                                        `}
                                    >
                                        {display}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* 4. FOOTER ACTIONS: Chia đôi không gian */}
            <div className="mt-10 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                
                {/* Hotline Support */}
                <div className="flex items-center justify-center md:justify-start gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-orange-500">
                        <PhoneCall className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Hỗ trợ đặt khám</p>
                        <a href="tel:19002805" className="text-lg font-bold text-gray-800 hover:text-orange-600 transition">
                            1900-2805
                        </a>
                    </div>
                </div>

                {/* Book Button */}
                <button
                    onClick={handleOpenBooking}
                    // 👇 SỬA LẠI ĐIỀU KIỆN DISABLED TẠI ĐÂY
                    disabled={loadingSlots || availableSlots.length === 0 || !selectedSlot} 
                    className={`
                        w-full h-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2
                        ${loadingSlots || availableSlots.length === 0 || !selectedSlot // 👈 CẬP NHẬT CẢ CLASS STYLE
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-[#00B5F1] to-[#0099CC] text-white hover:shadow-2xl hover:-translate-y-1'
                        }
                    `}
                >
                    {selectedSlot ? 'XÁC NHẬN ĐẶT LỊCH' : 'VUI LÒNG CHỌN GIỜ'} 
                </button>
            </div>

            {/* Modal */}
            {openBooking && selectedSlot && (
                <BookingModal
                    isOpen={openBooking}
                    doctor={doctor}
                    selectedDate={selectedDay.fullDate}
                    selectedSlot={selectedSlot}
                    onClose={() => {
                        setOpenBooking(false);
                        // setSelectedSlot(null);
                    }}
                />
            )}
        </div>
    );
}