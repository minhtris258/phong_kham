// src/pages/doctor/DoctorSchedule.jsx
import React from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { mockDoctorSchedules, initialMockAppointments, initialMockPatients, MOCK_IDS } from '../../mocks/mockdata.js';
import ScheduleLegend from '../../components/doctor/schedule/ScheduleLegend.jsx';
import ScheduleHeader from '../../components/doctor/schedule/ScheduleHeader.jsx';
import ScheduleBodyRow from '../../components/doctor/schedule/ScheduleBodyRow.jsx';

const currentDoctorId = MOCK_IDS.doctors.d1; // BS Lê Thị Mai
const schedule = mockDoctorSchedules.find(s => s.doctor_id === currentDoctorId);
const appointments = initialMockAppointments.filter(a => a.doctor_id === currentDoctorId);

// Tạo danh sách 7 ngày trong tuần (bắt đầu từ Thứ Hai)
const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

const dayNames = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

// Tạo khung giờ cố định (08:00 → 17:00, mỗi slot 30 phút)
const generateAllTimeSlots = () => {
  const slots = [];
  const start = new Date('2025-01-01 08:00');
  const end = new Date('2025-01-01 17:00');
  while (start <= end) {
    slots.push(format(start, 'HH:mm'));
    start.setMinutes(start.getMinutes() + schedule.slot_minutes);
  }
  return slots;
};
const allTimeSlots = generateAllTimeSlots();

// Hàm tạo slot cho 1 ngày cụ thể
const getSlotsForDay = (date) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const exception = schedule.exceptions?.find(e => e.date === dateStr);
  if (exception?.isDayOff) return { isOff: true, slots: [] };

  const dayNameEn = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dayConfig = schedule.weekly_schedule.find(d => d.dayOfWeek === dayNameEn);
  if (!dayConfig) return { isOff: false, slots: [] };

  const slots = [];
  dayConfig.timeRanges.forEach(range => {
    let time = new Date(`2025-01-01 ${range.start}`);
    const endTime = new Date(`2025-01-01 ${range.end}`);
    while (time <= endTime) {
      const timeStr = format(time, 'HH:mm');
      const appt = appointments.find(a => a.date === dateStr && a.start === timeStr);
      slots.push({
        time: timeStr,
        patient: appt ? initialMockPatients.find(p => p.id === appt.patient_id)?.fullName : null,
        status: appt?.status || 'available',
      });
      time = new Date(time.getTime() + schedule.slot_minutes * 60000);
    }
  });
  return { isOff: false, slots };
};

export default function DoctorSchedule() {
  return (
    <div className="max-w-full mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lịch khám của tôi</h1>
        <button className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition shadow-md">
          Báo bận ngày
        </button>
      </div>

      {/* Bảng lịch - Responsive + Scroll ngang đẹp */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            {/* Header ngày */}
            <ScheduleHeader 
              weekDays={weekDays} 
              dayNames={dayNames} 
              getSlotsForDay={getSlotsForDay} 
                        />  

            {/* Body khung giờ */}
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

      {/* Chú thích */}
    <ScheduleLegend />
    </div>
  );
}