// src/components/doctor/EditDoctorProfileModal.jsx
import React from 'react';
import { X, Save, Camera } from 'lucide-react';

export default function EditDoctorProfileModal({ doctor, setDoctor, onClose }) {
  const handleChange = (field, value) => {
    setDoctor(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Chỉnh sửa hồ sơ</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex justify-center">
            <div className="relative group">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center text-5xl font-bold text-blue-600">
                {doctor.fullName.charAt(0)}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer">
                <Camera className="w-8 h-8 text-white" />
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <input type="text" value={doctor.fullName} onChange={e => handleChange('fullName', e.target.value)} className="w-full px-4 py-3 border rounded-xl" placeholder="Họ tên" />
            <input type="text" value={doctor.phone} onChange={e => handleChange('phone', e.target.value)} className="w-full px-4 py-3 border rounded-xl" placeholder="Số điện thoại" />
            <input type="email" value={doctor.email} onChange={e => handleChange('email', e.target.value)} className="w-full px-4 py-3 border rounded-xl" placeholder="Email" />
            <input type="text" value={doctor.address} onChange={e => handleChange('address', e.target.value)} className="w-full px-4 py-3 border rounded-xl" placeholder="Địa chỉ" />
          </div>
        </div>

        <div className="flex justify-end gap-4 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="px-6 py-3 border rounded-xl hover:bg-gray-100">Hủy</button>
          <button onClick={onClose} className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2">
            <Save className="w-5 h-5" /> Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}