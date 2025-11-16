// src/pages/public/PatientDashboard.jsx
import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  Calendar, FileText, User, Settings, LogOut, 
  Home, UserCircle, Receipt, ChevronDown
} from 'lucide-react';
import { initialMockPatients, initialMockUsers } from '../../mocks/mockdata.js';

// Giả lập bệnh nhân đang đăng nhập
const currentUserId = '60c72aa0c5c9b100078f46a4';
const currentPatientUser = initialMockUsers.find(u => u.id === currentUserId);
const currentPatient = initialMockPatients.find(p => p.user_id === currentUserId);

const menuItems = [
  { to: "/ho-so", icon: UserCircle, label: "Hồ sơ" },
  { to: "/lich-kham", icon: Calendar, label: "Lịch khám" },
  { to: "/lich-su-thanh-toan", icon: Receipt, label: "Lịch sử thanh toán" },
  { to: "/tai-khoan", icon: Settings, label: "Tài khoản" },
];

export default function PatientDashboard() {
  // TẤT CẢ LOGIC PHẢI NẰM TRONG ĐÂY
  if (!currentPatient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-700">Đang tải thông tin...</p>
          <p className="text-gray-500 mt-2">Vui lòng chờ</p>
        </div>
      </div>
    );
  }

  const patientCode = `YMP${currentPatient.phone.replace(/\D/g, '').slice(-9)}`;
  const avatarLetter = currentPatient.fullName.split(' ').pop()[0].toUpperCase();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <>
      {/* Hero xanh */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-28 h-28 bg-white text-blue-600 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl">
                {avatarLetter}
              </div>
              <div>
                <h1 className="text-4xl font-bold">{currentPatient.fullName}</h1>
                <p className="text-blue-100 text-lg mt-2">
                  Mã BN: <span className="font-bold text-xl">{patientCode}</span>
                </p>
              </div>
            </div>

            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 bg-blue-700 hover:bg-blue-800 px-6 py-4 rounded-xl transition shadow-lg"
              >
                <div className="text-right">
                  <p className="font-semibold text-lg">{currentPatient.fullName}</p>
                  <p className="text-sm text-blue-200">Tài khoản cá nhân</p>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border overflow-hidden z-50">
                  <NavLink to="/" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 text-gray-800 border-b">
                    <Home className="w-5 h-5" /> Trang chủ
                  </NavLink>
                  {menuItems.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-4 px-6 py-4 border-b ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-800 hover:bg-gray-50'}`
                      }
                    >
                      <item.icon className="w-5 h-5" /> {item.label}
                    </NavLink>
                  ))}
                  <button className="w-full flex items-center gap-4 px-6 py-4 text-red-600 hover:bg-red-50 text-left font-medium">
                    <LogOut className="w-5 h-5" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar cố định */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 space-y-1">
                {menuItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-5 py-4 rounded-lg transition font-medium ${
                        isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
              <div className="border-t pt-4 px-4">
                <button className="w-full flex items-center gap-4 px-5 py-4 text-red-600 hover:bg-red-50 rounded-lg transition font-medium">
                  <LogOut className="w-5 h-5" />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>

          {/* Nội dung động */}
          <div className="lg:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}