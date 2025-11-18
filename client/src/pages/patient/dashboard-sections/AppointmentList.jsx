// src/pages/public/patient/AppointmentListContent.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { initialMockAppointments, initialMockDoctors } from '../../../mocks/mockdata.js';
import AppointmentCard from '../../../components/patient/appointments/AppointmentCard.jsx'; // Giả định đường dẫn

const currentPatientId = '60c72cc0e7e9b100078f48c1'; // p1

// Tạo map để tra cứu thông tin bác sĩ nhanh hơn
const doctorMap = new Map(initialMockDoctors.map(d => [d.id, d]));

export default function AppointmentListContent() {
  const appointments = initialMockAppointments
    .filter(a => a.patient_id === currentPatientId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // 4.1. Empty State
  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-16 text-center">
        <AlertCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <p className="text-xl text-gray-600 mb-6">Bạn chưa có lịch khám nào</p>
        <Link to="/" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
          Đặt lịch khám ngay
        </Link>
      </div>
    );
  }

  // 4.2. Danh sách Lịch hẹn
  return (
    <div className="space-y-6">
      {appointments.map(apt => {
        const doctor = doctorMap.get(apt.doctor_id);
        
        return (
          <AppointmentCard
            key={apt.id}
            appointment={apt}
            doctor={doctor}
          />
        );
      })}
    </div>
  );
}