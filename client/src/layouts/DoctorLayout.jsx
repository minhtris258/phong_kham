// src/layouts/DoctorLayout.jsx
import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { User, Calendar, Settings, LogOut, Menu, X, Stethoscope } from 'lucide-react';

// ĐÃ SỬA ĐÚNG ĐƯỜNG DẪN: chỉ ../mocks (không phải ../../)
import { initialMockDoctors, initialMockUsers } from '../mocks/mockdata.js';

const currentUserId = '60c72aa0c5c9b100078f46a2'; // BS Lê Thị Mai
const currentDoctor = initialMockDoctors.find(d => d.user_id === currentUserId);
const currentUser = initialMockUsers.find(u => u.id === currentUserId);

export default function DoctorLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: "Hồ sơ cá nhân", icon: User, path: "/doctor" },
    { name: "Lịch khám", icon: Calendar, path: "/doctor/schedule" },
    { name: "Cài đặt", icon: Settings, path: "/doctor/settings" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-blue-700 to-blue-900 text-white transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between p-6 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-8 h-8" />
            <h1 className="text-xl font-bold">DOCTOR PORTAL</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white text-blue-700 rounded-full flex items-center justify-center text-2xl font-bold shadow-xl">
              {currentDoctor?.fullName.split(' ').slice(-1)[0].charAt(0) || 'B'}
            </div>
            <div>
              <p className="font-bold text-lg">BS. {currentDoctor?.fullName.split(' ').slice(-1).join(' ')}</p>
              <p className="text-blue-200 text-sm">Bác sĩ Nội Tổng Quát</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl mb-2 transition-all ${active ? 'bg-white text-blue-700 shadow-xl font-bold' : 'hover:bg-blue-800 hover:bg-opacity-60'}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-800">
          <button className="flex items-center gap-4 px-5 py-4 rounded-xl hover:bg-blue-800 hover:bg-opacity-60 transition-all w-full">
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-72">
        <header className="lg:hidden bg-white shadow-sm fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-4 border-b">
          <button onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
          <h2 className="font-bold text-blue-700">DOCTOR PORTAL</h2>
          <div className="w-6 h-6" />
        </header>

        <main className="pt-16 lg:pt-8 pb-10 px-4 sm:px-6 lg:px-8 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}