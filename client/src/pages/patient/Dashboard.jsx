// src/pages/public/PatientDashboard.jsx
import React, { useState, createContext, useContext } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  Calendar, FileText, User, Settings, LogOut, 
  Home, UserCircle, Receipt, ChevronDown
} from 'lucide-react';
import { initialMockPatients, initialMockUsers } from '../../mocks/mockdata.js';
import Sidebar from '../../components/patient/sidebar.jsx';
import Hero from '../../components/patient/Hero.jsx';

// 1. Định nghĩa PatientContext
export const PatientContext = createContext(null);

const menuItems = [
  { to: "/ho-so", icon: UserCircle, label: "Hồ sơ" },
  { to: "/lich-kham", icon: Calendar, label: "Lịch khám" },
  { to: "/lich-su-thanh-toan", icon: Receipt, label: "Lịch sử thanh toán" },
  { to: "/tai-khoan", icon: Settings, label: "Tài khoản" },
];

export default function PatientDashboard() {
    
    // TẤT CẢ LOGIC PHẢI NẰM TRONG ĐÂY
    
    // Giả lập ID người dùng đang đăng nhập
    const currentUserId = '60c72aa0c5c9b100078f46a4'; 

    // Tìm kiếm dữ liệu mock
    const currentPatientUser = initialMockUsers.find(u => u.id === currentUserId);
    const currentPatient = initialMockPatients.find(p => p.user_id === currentUserId);

    // Xử lý logic tính toán các giá trị phái sinh
    let patientCode = '';
    let avatarLetter = '';

    if (currentPatient) {
        patientCode = `YMP${currentPatient.phone.replace(/\D/g, '').slice(-9)}`;
        avatarLetter = currentPatient.fullName.split(' ').pop()[0].toUpperCase();
    }
    
    // Logic fallback nếu dữ liệu mock không tồn tại
  if (!currentPatient || !currentPatientUser) {
    return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
              <div className="text-center">
                  <p className="text-2xl font-bold text-gray-700">Đang tải thông tin...</p>
                  <p className="text-gray-500 mt-2">Vui lòng chờ</p>
              </div>
              </div>
            );
  }

    // 2. Tạo đối tượng dữ liệu để truyền qua Context
    const patientData = {
        user: currentPatientUser,
        patient: currentPatient,
        patientCode: patientCode,
        avatarLetter: avatarLetter,
        menuItems: menuItems
    };

    return (
        // 3. Sử dụng Context Provider để chia sẻ dữ liệu
        <PatientContext.Provider value={patientData}>
            <div className="min-h-screen bg-gray-50">
                {/* Hero xanh */}
                <Hero />

                {/* Nội dung chính */}
                <div className="max-w-7xl mx-auto px-4 py-10">
                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Sidebar cố định */}
                        <Sidebar />

                        {/* Nội dung động */}
                        <div className="lg:col-span-3">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </PatientContext.Provider>
);
}