// src/pages/public/patient/AccountSettingsContent.jsx
import React from 'react';
import { Mail, Phone, Lock } from 'lucide-react';

export default function AccountSettingsContent() {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-8 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin đăng nhập</h2>

      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="flex items-center gap-3 text-gray-700 font-medium mb-2">
            <Mail className="w-5 h-5" /> Email đăng nhập
          </label>
          <input type="email" defaultValue="a.nguyen@clinic.com" disabled className="w-full px-4 py-3 border rounded-lg bg-gray-50" />
          <p className="text-sm text-gray-500 mt-2">Email không thể thay đổi</p>
        </div>

        <div>
          <label className="flex items-center gap-3 text-gray-700 font-medium mb-2">
            <Phone className="w-5 h-5" /> Số điện thoại
          </label>
          <input type="tel" defaultValue="0345678901" className="w-full px-4 py-3 border rounded-lg" />
        </div>

        <div>
          <label className="flex items-center gap-3 text-gray-700 font-medium mb-2">
            <Lock className="w-5 h-5" /> Mật khẩu
          </label>
          <button className="text-blue-600 hover:underline font-medium">Đổi mật khẩu</button>
        </div>

        <div className="pt-6 border-t">
          <button className="bg-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 transition">
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}