// src/pages/doctor/DoctorSettings.jsx
import React from 'react';
import { Bell, Lock, HelpCircle, Phone, Mail } from 'lucide-react';

export default function DoctorSettings() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Cài đặt</h1>

      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Bell className="w-6 h-6 text-blue-600" /> Thông báo
          </h2>
          <div className="space-y-5">
            {['Lịch hẹn mới', 'Nhắc lịch trước 30 phút', 'Tin nhắn từ bệnh nhân'].map(item => (
              <label key={item} className="flex items-center justify-between cursor-pointer">
                <span className="font-medium">{item}</span>
                <input type="checkbox" defaultChecked className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500" />
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Lock className="w-6 h-6 text-red-600" /> Bảo mật
          </h2>
          <button className="w-full text-left px-6 py-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
            <p className="font-medium">Đổi mật khẩu</p>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-green-600" /> Hỗ trợ
          </h2>
          <div className="space-y-4">
            <a href="tel:19002156" className="flex items-center gap-3 text-blue-700 font-medium">
              <Phone className="w-5 h-5" /> 1900 2156
            </a>
            <a href="mailto:support@clinic.com" className="flex items-center gap-3 text-blue-700 font-medium">
              <Mail className="w-5 h-5" /> support@clinic.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}