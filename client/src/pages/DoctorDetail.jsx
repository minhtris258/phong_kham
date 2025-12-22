import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import doctorService from "../services/doctorService.js";
import doctorSchedulesService from "../services/DoctorScheduleService.js";
import DoctorInfoCard from "../components/patient/DoctorInfoCard.jsx";
import BookingSection from "../components/patient/BookingSection.jsx";
import DoctorRatings from "../components/patient/DoctorRatings.jsx"; 

export default function DoctorDetailPage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [scheduleConfig, setScheduleConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        const [doctorRes, scheduleRes] = await Promise.all([
          doctorService.getDoctorById(id),
          doctorSchedulesService.getDoctorSchedule(id).catch(() => null),
        ]);

        if (doctorRes && doctorRes.profile) {
          setDoctor(doctorRes.profile);
        }
        setScheduleConfig(scheduleRes ? scheduleRes.data || scheduleRes : null);
      } catch (err) {
        console.error("Error fetching doctor detail:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDoctorData();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-xl">Đang tải dữ liệu...</div>;
  if (!doctor) return <div className="text-center py-20 text-xl text-red-500">Không tìm thấy bác sĩ</div>;

  const experienceYears = doctor.career_start_year 
    ? new Date().getFullYear() - new Date(doctor.career_start_year)
    : "chưa cập nhật";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
        
        {/* 1. CỘT TRÁI (30%) - Ghim khi cuộn */}
        {/* sticky: kích hoạt ghim; top-24: khoảng cách từ mép trên trình duyệt (phụ thuộc vào độ cao Header của bạn) */}
        <div className="lg:col-span-3 lg:sticky lg:top-24">
          <DoctorInfoCard
            doctor={doctor}
            specialty={doctor.specialty_id || { name: "Chuyên khoa" }}
            experienceYears={experienceYears}
          />
          
          {/* Bạn có thể thêm các thông tin phụ khác ở đây để cột trái thêm đầy đủ */}
          <div className="mt-4 p-4 bg-sky-50 rounded-xl text-sm text-sky-800 border border-sky-100">
            <p className="font-bold mb-1">💡 Lưu ý:</p>
            <p>Vui lòng đến trước lịch hẹn 15 phút để làm thủ tục check-in.</p>
          </div>
        </div>

        {/* 2. CỘT PHẢI (70%) - Chứa Booking và Ratings */}
        <div className="lg:col-span-7 space-y-8">
          {/* Phần đặt lịch */}
          <section>
            <BookingSection doctor={doctor} scheduleConfig={scheduleConfig} />
          </section>

          {/* Phần đánh giá nằm ở bên dưới BookingSection trong cột 70% */}
          <section id="ratings">
            <DoctorRatings doctorId={id} />
          </section>
        </div>

      </div>
    </div>
  );
}