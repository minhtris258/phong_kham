// src/pages/public/DoctorDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Services
import doctorService from "../../services/DoctorService.js";
import doctorSchedulesService from "../../services/DoctorScheduleService.js";

// Components
import DoctorInfoCard from "../../components/patient/DoctorInfoCard.jsx";
import BookingSection from "../../components/patient/BookingSection.jsx";
import IntroCard from "../../components/patient/IntroCard.jsx";

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

        // API trả về: { profile: { ... } }
        if (doctorRes && doctorRes.profile) {
          setDoctor(doctorRes.profile);
        }

        // API Schedule
        setScheduleConfig(scheduleRes ? scheduleRes.data || scheduleRes : null);
      } catch (err) {
        console.error("Error fetching doctor detail:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDoctorData();
  }, [id]);

  if (loading)
    return <div className="text-center py-20 text-xl">Đang tải dữ liệu...</div>;
  if (!doctor)
    return (
      <div className="text-center py-20 text-xl text-red-500">
        Không tìm thấy thông tin bác sĩ
      </div>
    );

  // [MỚI] Tính năm kinh nghiệm từ career_start_year
  const currentYear = new Date().getFullYear();
  const startYear = doctor.career_start_year || currentYear;
  const experienceYears = Math.max(0, currentYear - startYear);

  // Lấy object chuyên khoa
  const specialty = doctor.specialty_id || { name: "Đa khoa" };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-gray-50 mt-15">
      <div className="space-y-8">
        {/* 1. Thông tin bác sĩ */}
        <DoctorInfoCard
          doctor={doctor}
          specialty={specialty}
          experienceYears={experienceYears}
        />
        {/* 2. Giới thiệu ngắn */}
        {/* <IntroCard
          doctor={doctor}
          specialty={specialty}
          experienceYears={experienceYears}
        /> */}
        {/* 3. Đặt khám nhanh */}
        <BookingSection doctor={doctor} scheduleConfig={scheduleConfig} />
      </div>
    </div>
  );
}
