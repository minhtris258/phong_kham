// src/pages/doctor/DoctorSchedule.jsx
import React from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { mockDoctorSchedules, initialMockAppointments, initialMockPatients, MOCK_IDS } from '../../mocks/mockdata.js';

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
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="sticky left-0 z-20 bg-gray-50 px-6 py-4 text-left text-sm font-semibold text-gray-700 w-28">
                  Giờ
                </th>
                {weekDays.map((day, idx) => {
                  const { isOff } = getSlotsForDay(day);
                  return (
                    <th key={day.toISOString()} className="px-4 py-4 text-center min-w-36">
                      <div className="font-semibold text-gray-800">{dayNames[idx]}</div>
                      <div className="text-2xl font-bold text-blue-600 mt-1">
                        {format(day, 'dd')}
                      </div>
                      <div className="text-sm text-gray-500">{format(day, 'MM/yyyy')}</div>
                      {isOff && (
                        <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          Nghỉ
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Body khung giờ */}
            <tbody className="divide-y divide-gray-200">
              {allTimeSlots.map(time => (
                <tr key={time} className="hover:bg-gray-50 transition">
                  <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-700 border-r">
                    {time}
                  </td>
                  {weekDays.map(day => {
                    const { slots, isOff } = getSlotsForDay(day);
                    const slot = slots.find(s => s.time === time);

                    return (
                      <td key={day.toISOString()} className="px-4 py-4 text-center">
                        {isOff ? (
                          <span className="text-red-600 text-sm font-medium">Bận</span>
                        ) : slot?.patient ? (
                          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium inline-block min-w-28">
                            {slot.patient}
                          </div>
                        ) : slot ? (
                          <span className="text-green-600 text-sm font-medium">Trống</span>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chú thích */}
      <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Trống</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Đã đặt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Nghỉ / Báo bận</span>
        </div>
      </div>
    </div>
  );
}