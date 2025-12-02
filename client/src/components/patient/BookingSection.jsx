// src/components/patient/BookingSection.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { toastSuccess,toastError, toastWarning, toastInfo } from "../../utils/toast";
import { useNavigate } from 'react-router-dom'; 
import BookingModal from './BookingModal.jsx'; 
import timeslotService from '../../services/TimeslotService.js'; 

// Import Contexts
import { useSocket } from '../../context/SocketContext'; 
import { useAppContext } from '../../context/AppContext'; // Import User Context

export default function BookingSection({ doctor, scheduleConfig }) {
    const navigate = useNavigate();
    
    // Lấy socket và user hiện tại
    const { socket } = useSocket();
    const { user } = useAppContext();

    const [openBooking, setOpenBooking] = useState(false);
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // 1. Tạo danh sách 10 ngày tiếp theo
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

    // 2. Fetch Slots khi đổi ngày hoặc đổi bác sĩ
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
                
                // Xử lý response đa dạng
                if (Array.isArray(res)) slotsData = res;
                else if (res.data && Array.isArray(res.data)) slotsData = res.data;
                else if (res.data && Array.isArray(res.data.slots)) slotsData = res.data.slots;
                else if (res.slots && Array.isArray(res.slots)) slotsData = res.slots;

                // Lọc active slots
                const activeSlots = slotsData.filter(slot => {
                    const isFree = slot.status ? slot.status === 'free' : true;
                    const notBooked = !slot.isBooked;
                    return isFree && notBooked;
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

    // ============================================================
    // [REALTIME] 3. CẬP NHẬT SLOT KHI CÓ NGƯỜI ĐẶT
    // ============================================================
   useEffect(() => {
        if (!socket) return;

        const handleSlotBooked = (data) => {
            const currentDoctorId = doctor?._id || doctor?.id;
            
            if (data.doctorId === currentDoctorId) {
                // 1. Cập nhật giao diện (Xóa slot khỏi list)
                setAvailableSlots(prevSlots => prevSlots.filter(slot => slot._id !== data.timeslotId));
                
                // 2. Kiểm tra slot đang mở modal
                if (selectedSlot && selectedSlot._id === data.timeslotId) {
                    
                    // --- 🔥 FIX LOGIC SO SÁNH ID Ở ĐÂY 🔥 ---
                    let myProfileId = null; // ID hồ sơ (_id)
                    let myAccountId = null; // ID tài khoản (user_id)
                    
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        try {
                            const parsed = JSON.parse(storedUser);
                            myProfileId = parsed._id || parsed.id;
                            myAccountId = parsed.user_id; // <-- Lấy thêm cái này
                        } catch (e) { toastError(e); }
                    }

                    const bookerId = String(data.bookedByUserId); // ID server gửi về

                    console.log(`🕵️ CHECK CHỦ SỞ HỮU: 
                    - My Profile ID: ${myProfileId}
                    - My Account ID: ${myAccountId}
                    - Booker ID (Server): ${bookerId}`);

                    // Kiểm tra xem Booker ID có trùng với BẤT KỲ ID nào của mình không
                    const isMe = (myProfileId && String(myProfileId) === bookerId) || 
                                 (myAccountId && String(myAccountId) === bookerId);

                    if (isMe) {
                        console.log("✅ Chính chủ đặt (Khớp ID). Bỏ qua lỗi.");
                        return; // Thoát ngay, không báo lỗi
                    }

                    // Nếu không khớp cái nào -> Người khác đặt
                    toastError("❌ Người khác đã cướp slot này.");
                    setOpenBooking(false);
                    setSelectedSlot(null);
                    toastError("Rất tiếc! Khung giờ này vừa có người khác đặt nhanh hơn bạn. Vui lòng chọn giờ khác.");
                }
            }
        };

        socket.on('slot_booked', handleSlotBooked);

        return () => {
            socket.off('slot_booked', handleSlotBooked);
        };
    }, [socket, doctor, selectedSlot]);
    // ============================================================


    // Helper check ngày nghỉ
    const isDayOffUI = (dateStr) => scheduleConfig?.exceptions?.some(e => e.date === dateStr && e.isDayOff);

    // Check Auth
    const checkAuth = () => {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) {
            const confirmLogin = window.confirm("Bạn cần đăng nhập để đặt lịch khám. Đi đến trang đăng nhập ngay?");
            if (confirmLogin) {
                navigate('/login', { state: { from: window.location.pathname } });
            }
            return false;
        }
        return true;
    };

    // Handle Click Slot
    const handleSlotClick = (slot) => {
        if (slot.isBooked || slot.status === 'booked') return;
        if (!checkAuth()) return; 
        const displayTime = slot.display || `${slot.start} - ${slot.end}`;
        setSelectedSlot({ ...slot, display: displayTime });
        setOpenBooking(true);
    };

    // Handle Open Booking
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

    return (
        <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-8">
            
            <div className="text-center mb-6 md:mb-8 pb-4 md:pb-6 border-b-2 border-gray-100">
                <p className="text-xs md:text-sm text-gray-600 uppercase tracking-wider">Phí khám</p>
                <p className="text-3xl md:text-4xl font-bold text-[#00B5F1] mt-2 md:mt-3">
                    {doctor.consultation_fee ? doctor.consultation_fee.toLocaleString('vi-VN') : 0}₫
                </p>
            </div>

            <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center justify-center gap-2 md:gap-3">
                <Calendar className="w-6 h-6 md:w-8 md:h-8 text-[#00B5F1]" />
                Đặt khám nhanh
            </h3>

            {/* List ngày */}
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 mb-6 md:mb-8 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {weekDays.map((day, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedDateIndex(idx)}
                        className={`
                            min-w-[100px] md:min-w-25 text-center py-3 px-2 md:py-6 md:px-5 
                            rounded-xl md:rounded-2xl border-2 transition-all font-light shadow-sm flex-shrink-0
                            ${
                                selectedDateIndex === idx
                                    ? 'bg-[#00B5F1] text-white border-[#00B5F1] shadow-lg'
                                    : isDayOffUI(day.fullDate)
                                    ? 'bg-red-50 text-red-600 border-red-200 line-through opacity-70'
                                    : 'bg-gray-50 hover:bg-gray-100 border-gray-300'
                            }
                        `}
                    >
                        <div className="text-sm md:text-lg">{day.dayName}</div>
                        <div className="text-2xl md:text-4xl font-bold mt-1 md:mt-2">{day.dateStr.split('/')[0]}</div>
                        <div className="text-xs md:text-sm opacity-90">Th {day.dateStr.split('/')[1]}</div>
                    </button>
                ))}
            </div>

            {/* Slots Grid */}
            {loadingSlots ? (
                <div className="text-center py-10 md:py-16 text-gray-500">
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin mx-auto mb-2 text-blue-600" />
                    <p>Đang tải lịch...</p>
                </div>
            ) : availableSlots.length === 0 ? (
                <div className="text-center py-10 md:py-16 text-gray-500">
                    <AlertCircle className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg md:text-xl">Không có lịch khám trong ngày này</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
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
                                    py-3 md:py-5 px-2 md:px-4 rounded-xl md:rounded-2xl 
                                    text-sm md:text-lg font-bold transition-all shadow-md
                                    ${
                                        isSelected
                                        ? 'bg-[#007ACC] text-white shadow-lg transform scale-105'
                                        : 'bg-gray-50 hover:bg-[#00B5F1] hover:text-white hover:shadow-xl hover:border-[#00B5F1] border-2 border-gray-300 text-gray-700'
                                    }
                                `}
                            >
                                {display}
                            </button>
                        );
                    })}
                </div>
            )}
            
             <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8">
                 <div className="text-center">
                    <p className="text-gray-600 text-base md:text-lg">Hỗ trợ đặt khám</p>
                    <a href="tel:19002805" className="text-2xl md:text-3xl font-bold text-[#00B5F1] hover:underline">
                        1900-2805
                    </a>
                </div>

                 <button
                    onClick={handleOpenBooking}
                    disabled={loadingSlots || availableSlots.length === 0}
                    className={`
                        w-full sm:w-auto px-6 md:px-20 py-4 md:py-6 rounded-xl md:rounded-2xl 
                        font-bold text-lg md:text-2xl transition-all shadow-xl
                        ${
                             loadingSlots || availableSlots.length === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-[#00B5F1] text-white hover:bg-[#007ACC]'
                        }
                    `}
                >
                    ĐẶT KHÁM NGAY
                </button>
             </div>

            {/* --- MODAL ĐẶT LỊCH --- */}
            {openBooking && selectedSlot && (
                <BookingModal 
                    isOpen={openBooking}
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