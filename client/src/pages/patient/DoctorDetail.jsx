// src/pages/public/DoctorDetailPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import {
  initialMockDoctors,
  mockSpecialties,
  mockDoctorSchedules,
} from '../../mocks/mockdata.js';
import DoctorInfoCard from '../../components/patient/DoctorInfoCard.jsx';
import BookingSection from '../../components/patient/BookingSection.jsx';
import IntroCard from '../../components/patient/IntroCard.jsx';

export default function DoctorDetailPage() {
  const { id } = useParams();
  const doctor = initialMockDoctors.find(d => d.id === id);
  
  if (!doctor) return <div className="text-center py-20 text-2xl">Không tìm thấy bác sĩ</div>;

  const specialty = mockSpecialties.find(s => s.id === doctor.specialty_id);
  const schedule = mockDoctorSchedules.find(s => s.doctor_id === doctor.id);
  
  // Tính năm kinh nghiệm
  const experienceYears = new Date().getFullYear() - new Date(doctor.dob).getFullYear();

  const isDayOff = (date) => schedule?.exceptions?.some(e => e.date === date && e.isDayOff);
 
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-gray-50">
        
        <div className="space-y-8">
          {/* 1. Thông tin bác sĩ */}
          <DoctorInfoCard 
                doctor={doctor} 
                specialty={specialty} 
                experienceYears={experienceYears} 
            />

          {/* 2. Đặt khám nhanh */}
          <BookingSection 
                doctor={doctor} 
                schedule={schedule} 
            />

          {/* 3. Giới thiệu ngắn */}
          <IntroCard 
                doctor={doctor} 
                specialty={specialty} 
                experienceYears={experienceYears} 
            />
        </div>
    </div>
  );
}