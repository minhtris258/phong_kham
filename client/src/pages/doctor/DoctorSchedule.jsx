// src/pages/doctor/DoctorSchedule.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import doctorSchedulesService from '../../services/DoctorScheduleService';
import doctorService from '../../services/DoctorService'; // Import thêm service này

import ScheduleLegend from '../../components/doctor/schedule/ScheduleLegend.jsx';
import ScheduleHeader from '../../components/doctor/schedule/ScheduleHeader.jsx';
import ScheduleBodyRow from '../../components/doctor/schedule/ScheduleBodyRow.jsx';

export default function DoctorSchedule() {
  const [scheduleConfig, setScheduleConfig] = useState(null);
  const [weeklySlots, setWeeklySlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentDoctorId, setCurrentDoctorId] = useState(null);

  // Tính toán tuần hiện tại
  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const dayNames = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

  // 1. Lấy ID bác sĩ trước
  useEffect(() => {
    const fetchDoctorId = async () => {
        try {
            const res = await doctorService.getMe();
            // JSON trả về { profile: { _id: "..." } }
            if (res.profile && res.profile._id) {
                setCurrentDoctorId(res.profile._id);
            }
        } catch (error) {
            console.error("Lỗi lấy thông tin bác sĩ:", error);
            toast.error("Không xác định được danh tính bác sĩ");
            setLoading(false);
        }
    };
    fetchDoctorId();
  }, []);

  // 2. Sau khi có ID, tải lịch
  useEffect(() => {
    const fetchScheduleData = async () => {
      if (!currentDoctorId) return;

      try {
        setLoading(true);

        // a. Lấy cấu hình lịch cá nhân
        const configRes = await doctorSchedulesService.getMySchedule();
        const config = configRes.data || configRes;
        setScheduleConfig(config);

        // b. Lấy dữ liệu Slot thực tế cho 7 ngày
        const slotPromises = weekDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            // Dùng ID vừa lấy được để gọi API slots
            return doctorSchedulesService.getDoctorSlotsByDate(currentDoctorId, dateStr)
                .then(res => {
                    // Xử lý response linh hoạt (data hoặc data.slots)
                    let slots = [];
                    if (Array.isArray(res.data)) slots = res.data;
                    else if (res.data?.slots) slots = res.data.slots;
                    
                    return { date: dateStr, slots };
                })
                .catch(err => ({ date: dateStr, slots: [] }));
        });

        const slotsResults = await Promise.all(slotPromises);
        
        const slotsMap = {};
        slotsResults.forEach(item => {
            slotsMap[item.date] = item.slots;
        });
        setWeeklySlots(slotsMap);

      } catch (error) {
        console.error("Lỗi tải lịch làm việc:", error);
        toast.error("Không thể tải lịch làm việc");
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, [currentDoctorId, weekDays]);

  // Tạo khung giờ hiển thị
  const allTimeSlots = useMemo(() => {
    if (!scheduleConfig) return [];
    
    const slots = [];
    const slotMinutes = scheduleConfig.slot_minutes || 30;
    let current = new Date().setHours(7, 0, 0, 0); 
    const end = new Date().setHours(18, 0, 0, 0);

    while (current <= end) {
      slots.push(format(current, 'HH:mm'));
      current = current + slotMinutes * 60000;
    }
    return slots;
  }, [scheduleConfig]);

  // Hàm render dữ liệu cho từng ô
  const getSlotsForDay = (date) => {
    if (!scheduleConfig) return { isOff: false, slots: [] };

    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check Exception (Ngày nghỉ)
    const exception = scheduleConfig.exceptions?.find(e => e.date === dateStr);
    if (exception?.isDayOff) return { isOff: true, slots: [] };

    // Check Weekly Config
    const dayNameEn = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayConfig = scheduleConfig.weekly_schedule?.find(d => d.dayOfWeek === dayNameEn);
    
    if (!dayConfig) return { isOff: false, slots: [] };

    const apiSlots = weeklySlots[dateStr] || [];
    const displaySlots = [];
    
    dayConfig.timeRanges.forEach(range => {
        let time = new Date(`2000-01-01 ${range.start}`);
        const endTime = new Date(`2000-01-01 ${range.end}`);
        const slotMinutes = scheduleConfig.slot_minutes || 30;

        while (time < endTime) {
             const timeStr = format(time, 'HH:mm');
             const realSlot = apiSlots.find(s => s.start === timeStr);

             displaySlots.push({
                time: timeStr,
                // Ưu tiên hiển thị trạng thái từ API
                patient: realSlot?.isBooked ? 'Đã có hẹn' : null,
                status: realSlot?.isBooked ? 'booked' : 'available',
                _id: realSlot?._id
             });

             time = new Date(time.getTime() + slotMinutes * 60000);
        }
    });

    return { isOff: false, slots: displaySlots };
  };

  if (loading) {
     return (
        <div className="flex justify-center items-center h-screen text-blue-600">
            <Loader2 className="w-10 h-10 animate-spin" />
        </div>
     );
  }

  return (
    <div className="max-w-full mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lịch khám của tôi</h1>
        <button className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition shadow-md">
          Báo bận ngày
        </button>
      </div>

      {/* Bảng lịch */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <ScheduleHeader 
              weekDays={weekDays} 
              dayNames={dayNames} 
              getSlotsForDay={getSlotsForDay} 
            />  
            <tbody className="divide-y divide-gray-200">
              {allTimeSlots.map(time => (
                <ScheduleBodyRow 
                    key={time} 
                    time={time} 
                    weekDays={weekDays} 
                    getSlotsForDay={getSlotsForDay} 
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ScheduleLegend />
    </div>
  );
}