// src/pages/public/DoctorDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Services
import doctorService from "../services/DoctorService.js";
import doctorSchedulesService from "../services/DoctorScheduleService.js";

// Components
import DoctorInfoCard from "../components/patient/DoctorInfoCard.jsx";
import BookingSection from "../components/patient/BookingSection.jsx";
import IntroCard from "../components/patient/IntroCard.jsx"; // Đã import nhưng chưa dùng, có thể để ở cột trái

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

        // LOGIC MỚI DỰA TRÊN JSON:
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

  if (loading)
    return <div className="text-center py-20 text-xl">Đang tải dữ liệu...</div>;
  if (!doctor)
    return (
      <div className="text-center py-20 text-xl text-red-500">
        Không tìm thấy thông tin bác sĩ
      </div>
    );

  // Tính năm kinh nghiệm
  const experienceYears = doctor.dob
    ? new Date().getFullYear() - new Date(doctor.dob).getFullYear()
    : 0;

  // Lấy object chuyên khoa
  const specialty = doctor.specialty_id || { name: "Chuyên khoa" };

  return (
    // Tăng max-w lên 7xl để chia cột rộng rãi hơn
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 mt-15">
      
      {/* LAYOUT GRID:
         - Mobile: 1 cột (grid-cols-1)
         - Desktop (lg): 10 cột (grid-cols-10) để chia tỷ lệ 3/7 dễ dàng
         - items-start: Để 2 cột căn dòng bên trên cùng
      */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
        
        {/* 1. CỘT TRÁI (30%) - Thông tin bác sĩ */}
        <div className="lg:col-span-3 space-y-6">
          <DoctorInfoCard
            doctor={doctor}
            specialty={specialty}
            experienceYears={experienceYears}
          />
          
          {/* Nếu bạn muốn hiện IntroCard, nên để nó ở cột nhỏ này luôn */}
          {/* <IntroCard doctor={doctor} /> */}
        </div>

        {/* 2. CỘT PHẢI (70%) - Đặt khám nhanh */}
        <div className="lg:col-span-7">
          <BookingSection doctor={doctor} scheduleConfig={scheduleConfig} />
        </div>

      </div>
    </div>
  );
}