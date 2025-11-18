// src/pages/public/patient/AppointmentListContent.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Stethoscope, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { initialMockAppointments, initialMockDoctors } from '../../../mocks/mockdata.js';

const currentPatientId = '60c72cc0e7e9b100078f48c1'; // p1

export default function AppointmentListContent() {
  const appointments = initialMockAppointments
    .filter(a => a.patient_id === currentPatientId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-medium"><CheckCircle className="w-4 h-4" /> Đã khám</span>;
      case 'confirmed': return <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-100 px-3 py-1 rounded-full text-sm font-medium"><Calendar className="w-4 h-4" /> Đã xác nhận</span>;
      case 'pending': return <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-100 px-3 py-1 rounded-full text-sm font-medium"><Clock className="w-4 h-4" /> Chờ xác nhận</span>;
      case 'cancelled': return <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm font-medium"><XCircle className="w-4 h-4" /> Đã hủy</span>;
      default: return null;
    }
  };

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

  return (
    <div className="space-y-6">
      {appointments.map(apt => {
        const doctor = initialMockDoctors.find(d => d.id === apt.doctor_id);
        const date = new Date(apt.date);
        const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

        return (
          <div key={apt.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition p-6">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{doctor?.fullName || 'Bác sĩ'}</h3>
                    <p className="text-gray-600">Phòng khám tư nhân</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" />{date.toLocaleDateString('vi-VN')} {isToday && <span className="text-blue-600 font-medium">(Hôm nay)</span>}</div>
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-500" />{apt.start}</div>
                  <div>{getStatusBadge(apt.status)}</div>
                </div>

                {apt.reason && <p className="text-gray-700"><strong>Lý do:</strong> {apt.reason}</p>}
              </div>

              <div className="flex flex-col gap-3">
                {apt.status === 'pending' && <button className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">Hủy lịch</button>}
                {apt.status === 'confirmed' && <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Xem chi tiết</button>}
                {apt.status === 'completed' && <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Xem kết quả</button>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}