// src/pages/public/patient/PatientProfileContent.jsx
import React from 'react';
import { User, Edit3 } from 'lucide-react';
import { initialMockPatients } from '../../../mocks/mockdata.js';

const currentPatient = initialMockPatients.find(p => p.user_id === '60c72aa0c5c9b100078f46a4');

export default function PatientProfileContent() {
  return (
    <div className="space-y-8">
      {/* Thông tin cơ bản */}
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <User className="w-7 h-7 text-blue-600" />
          Thông tin cơ bản
        </h2>
        <div className="grid md:grid-cols-2 gap-8 text-lg">
          <div>
            <p className="text-gray-500 mb-1">Họ và tên</p>
            <p className="font-semibold text-gray-900">{currentPatient.fullName}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Điện thoại</p>
            <p className="font-semibold text-gray-900">{currentPatient.phone}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Ngày sinh</p>
            <p className="font-semibold text-gray-900">
              {new Date(currentPatient.dob).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Giới tính</p>
            <p className="font-semibold text-gray-900">
              {currentPatient.gender === 'male' ? 'Nam' : 'Nữ'}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-500 mb-1">Địa chỉ</p>
            <p className="font-semibold text-gray-900">{currentPatient.address}</p>
          </div>
        </div>
      </div>

      {/* Thông tin bổ sung */}
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Thông tin bổ sung</h2>
        <div className="grid md:grid-cols-2 gap-8 text-lg">
          <div><p className="text-gray-500 mb-1">Mã BHYT</p><p className="text-gray-600">—</p></div>
          <div><p className="text-gray-500 mb-1">Số CMND/CCCD</p><p className="text-gray-600">—</p></div>
          <div><p className="text-gray-500 mb-1">Dân tộc</p><p className="text-gray-600">—</p></div>
          <div><p className="text-gray-500 mb-1">Nghề nghiệp</p><p className="text-gray-600">—</p></div>
          <div className="md:col-span-2">
            <p className="text-gray-500 mb-1">Email</p>
            <p className="font-semibold text-gray-900">{currentPatient.email}</p>
          </div>
        </div>
      </div>

      {/* Nút sửa */}
      <div className="text-right">
        <button className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 transition shadow-lg text-lg">
          <Edit3 className="w-5 h-5" />
          Thay đổi thông tin
        </button>
      </div>
    </div>
  );
}