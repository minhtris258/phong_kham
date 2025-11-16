// src/pages/public/DoctorDetailPage.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, MapPin, Phone, Calendar, Clock, AlertCircle } from 'lucide-react';
import {
  initialMockDoctors,
  mockSpecialties,
  mockDoctorSchedules,
  initialMockAppointments
} from '../../mocks/mockdata.js';
import BookingModal from '../../components/public/BookingModal';

export default function DoctorDetailPage() {
  const { id } = useParams();
  const doctor = initialMockDoctors.find(d => d.id === id);
  if (!doctor) return <div className="text-center py-20 text-2xl">Không tìm thấy bác sĩ</div>;

  const specialty = mockSpecialties.find(s => s.id === doctor.specialty_id);
  const schedule = mockDoctorSchedules.find(s => s.doctor_id === doctor.id);
  const [openBooking, setOpenBooking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  // Tính năm kinh nghiệm
  const experienceYears = new Date().getFullYear() - new Date(doctor.dob).getFullYear();

  // 10 ngày tiếp theo
  const getNext10Days = () => {
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
  };

  const weekDays = getNext10Days();
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
        const endTimeStr = new Date(time.getTime() + schedule.slot_minutes * 60000)
          .toTimeString().slice(0, 5);
        const isBooked = initialMockAppointments.some(a =>
          a.doctor_id === doctor.id && a.date === day.fullDate && a.start === timeStr
        );
        slots.push({ display: `${timeStr} - ${endTimeStr}`, isBooked, start: timeStr });
        time.setMinutes(time.getMinutes() + schedule.slot_minutes);
      }
    });
    return { slots, isOff: false };
  };

  const { slots, isOff } = getTimeSlotsForDate(selectedDay);

  return (
    <>
      {/* ==================== NỘI DUNG CHÍNH ==================== */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Thông báo nghỉ khám */}
        {isDayOff(selectedDay.fullDate) && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-8 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-orange-600 mt-1" />
            <div className="text-orange-800">
              <strong>Lưu ý:</strong> Bác sĩ nghỉ ngày {selectedDay.dateStr}. Vui lòng chọn ngày khác.
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Thông tin bác sĩ */}
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <img
                src={`https://i.pravatar.cc/340?u=${doctor.email}`}
                alt={doctor.fullName}
                className="w-56 h-56 rounded-full object-cover border-4 border-gray-200 shadow-xl mx-auto md:mx-0"
              />
              <div className="flex-1 text-center md:text-left">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Phó giáo sư, Tiến sĩ, Bác sĩ {doctor.fullName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-3 justify-center md:justify-start">
                      <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
                        Bác sĩ
                      </span>
                      <span className="text-xl text-gray-600 font-medium">
                        {experienceYears} năm kinh nghiệm
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setLiked(!liked)}
                    className="p-3 hover:bg-gray-100 rounded-full transition mt-2"
                  >
                    <Heart className={`w-8 h-8 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                </div>

                <div className="mt-8 space-y-4 text-gray-700 text-lg">
                  <div><strong>Chuyên khoa:</strong> {specialty?.name}</div>
                  <div><strong>Chức vụ:</strong> Trưởng khoa {specialty?.name} - Bệnh viện Chợ Rẫy</div>
                  <div><strong>Nơi công tác:</strong> Bệnh viện Chợ Rẫy</div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-6 justify-center md:justify-start text-gray-600">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-blue-600" />
                    <span className="text-lg">{doctor.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-6 h-6 text-blue-600" />
                    <span className="text-lg">{doctor.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Đặt khám nhanh */}
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
                  onClick={() => setSelectedDateIndex(idx)}
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
                      onClick={() => setOpenBooking(true)}
                      disabled={slot.isBooked}
                      className={`py-5 px-4 rounded-2xl font-bold text-lg transition-all shadow-md ${
                        slot.isBooked
                          ? 'bg-gray-100 text-gray-400 line-through cursor-not-allowed'
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
                onClick={() => setOpenBooking(true)}
                disabled={isOff || !slots.some(s => !s.isBooked)}
                className={`px-20 py-6 rounded-2xl font-bold text-2xl transition-all shadow-xl ${
                  isOff || !slots.some(s => !s.isBooked)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                ĐẶT KHÁM NGAY
              </button>
            </div>
          </div>

          {/* Giới thiệu ngắn */}
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold mb-6">Giới thiệu</h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              Bác sĩ {doctor.fullName} là chuyên gia đầu ngành về {specialty?.name} với hơn {experienceYears} năm kinh nghiệm tại Bệnh viện Chợ Rẫy...
            </p>
          </div>
        </div>
      </div>

      {/* Modal đặt lịch */}
      {openBooking && <BookingModal doctor={doctor} onClose={() => setOpenBooking(false)} />}
    </>
  );
}