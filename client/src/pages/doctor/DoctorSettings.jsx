// src/pages/doctor/DoctorSettings.jsx
import React from 'react';
import { Bell, Lock, HelpCircle, Phone, Mail } from 'lucide-react';
import SettingsCard from '../../components/doctor/settings/SettingsCard'; // Giả định đường dẫn
import NotificationToggle from '../../components/doctor/settings/NotificationToggle'; // Giả định đường dẫn

export default function DoctorSettings() {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Cài đặt</h1>

            <div className="space-y-8">
                {/* 1. KHỐI THÔNG BÁO */}
                <SettingsCard title="Thông báo" icon={Bell} iconColorClass="text-blue-600">
                    {['Lịch hẹn mới', 'Nhắc lịch trước 30 phút', 'Tin nhắn từ bệnh nhân'].map(item => (
                        <NotificationToggle key={item} label={item} />
                    ))}
                </SettingsCard>

                {/* 2. KHỐI BẢO MẬT */}
                <SettingsCard title="Bảo mật" icon={Lock} iconColorClass="text-red-600">
                    <button className="w-full text-left px-6 py-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                        <p className="font-medium">Đổi mật khẩu</p>
                    </button>
                </SettingsCard>

                {/* 3. KHỐI HỖ TRỢ */}
                <SettingsCard title="Hỗ trợ" icon={HelpCircle} iconColorClass="text-green-600">
                    <div className="space-y-4 pt-1"> 
                        <a href="tel:19002156" className="flex items-center gap-3 text-blue-700 font-medium hover:underline">
                            <Phone className="w-5 h-5" /> 1900 2156
                        </a>
                        <a href="mailto:support@clinic.com" className="flex items-center gap-3 text-blue-700 font-medium hover:underline">
                            <Mail className="w-5 h-5" /> support@clinic.com
                        </a>
                    </div>
                </SettingsCard>
            </div>
        </div>
    );
}