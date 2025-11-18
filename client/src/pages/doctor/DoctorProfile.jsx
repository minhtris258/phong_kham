// src/pages/doctor/DoctorProfile.jsx
import React, { useState } from 'react';
import { initialMockDoctors, initialMockUsers, mockSpecialties } from '../../mocks/mockdata';
import EditDoctorProfileModal from '../../components/doctor/EditDoctorProfileModal';
import { Phone, Mail, MapPin, Calendar, Stethoscope } from 'lucide-react';

const currentUserId = '60c72aa0c5c9b100078f46a2';
const doctor = initialMockDoctors.find(d => d.user_id === currentUserId);
const user = initialMockUsers.find(u => u.id === currentUserId);
const specialty = mockSpecialties.find(s => s.id === doctor.specialty_id);

export default function DoctorProfile() {
  const [doctorData, setDoctorData] = useState({
    ...doctor,
    name: user.name,
    email: user.email,
    specialtyName: specialty?.name || 'N/A',
  });

  const [openEdit, setOpenEdit] = useState(false);
  const experience = new Date().getFullYear() - new Date(doctor.dob).getFullYear();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Hồ sơ cá nhân</h1>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 relative">
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 bg-white rounded-full border-8 border-white shadow-xl flex items-center justify-center text-5xl font-bold text-blue-600">
              {doctor.fullName.charAt(0)}
            </div>
          </div>
        </div>

        <div className="pt-20 px-8 pb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{doctor.fullName}</h2>
              <p className="text-xl text-blue-600 font-medium mt-1">{specialty?.name}</p>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {doctor.address}
              </p>
            </div>
            <button onClick={() => setOpenEdit(true)} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-md">
              Chỉnh sửa hồ sơ
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div>
              <h3 className="font-semibold text-gray-700 mb-4">Thông tin liên hệ</h3>
              <div className="space-y-4 text-gray-600">
                <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-blue-600" /> {doctor.phone}</div>
                <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-blue-600" /> {doctor.email}</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-4">Chuyên môn</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-6 h-6 text-green-600" />
                  <span className="text-2xl font-bold text-blue-600">{experience} năm kinh nghiệm</span>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700">Phí khám</p>
                  <p className="text-3xl font-bold text-green-600">
                    {doctor.consultation_fee.toLocaleString('vi-VN')}₫
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {openEdit && <EditDoctorProfileModal doctor={doctorData} setDoctor={setDoctorData} onClose={() => setOpenEdit(false)} />}
    </div>
  );
}