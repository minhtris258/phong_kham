// src/components/doctor/DoctorSidebar.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Calendar, Settings, LogOut, X, Stethoscope } from 'lucide-react';
import doctorService from '../../services/DoctorService'; // Import service
import { toastSuccess, toastError,toastWarning } from "../../utils/toast";

export default function DoctorSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);

  // Gọi API lấy thông tin bác sĩ
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        const res = await doctorService.getMe();
        // Xử lý dữ liệu trả về tùy cấu trúc API (ví dụ res.data hoặc res.profile)
        const profile = res.profile || res;
        setDoctor(profile);
      } catch (error) {
        toastError("Lỗi lấy thông tin bác sĩ sidebar:" + (error.response?.data?.message || error.message));
      }
    };

    fetchDoctorInfo();
  }, []);

  const handleLogout = () => {
    // Xóa token và chuyển hướng (Ví dụ)
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: "Hồ sơ cá nhân", icon: User, path: "/doctor" },
    { name: "Cuộc hẹn", icon: Calendar, path: "/doctor/appointments" },
    { name: "Lịch làm", icon: Calendar, path: "/doctor/schedule" },
    { name: "Hồ sơ khám", icon: Stethoscope, path: "/doctor/visits" },
    { name: "Cài đặt", icon: Settings, path: "/doctor/settings" },
  ];

  const isActive = (path) => location.pathname === path;

  // Helper lấy tên và chữ cái đầu (Xử lý an toàn khi chưa có dữ liệu)
  const doctorName = doctor?.fullName || doctor?.name || 'Bác sĩ';
  const lastName = doctorName.split(' ').slice(-1).join(' ');
  const firstLetter = lastName.charAt(0).toUpperCase();
  const specialtyName = doctor?.specialty_id?.name || "Chuyên khoa";

  return (
    <>
      {/* Overlay cho Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar chính */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-blue-700 to-blue-900 text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Logo Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-8 h-8" />
            <h1 className="text-xl font-bold">DOCTOR PORTAL</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info Card */}
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center gap-4">
            {/* Avatar: Ưu tiên hiển thị ảnh nếu có, không thì hiển thị chữ cái đầu */}
            <div className="w-16 h-16 bg-white text-blue-700 rounded-full flex items-center justify-center text-2xl font-bold shadow-xl overflow-hidden border-2 border-white">
               {doctor?.thumbnail || doctor?.image ? (
                  <img 
                    src={doctor.thumbnail || doctor.image} 
                    alt={doctorName} 
                    className="w-full h-full object-cover"
                  />
               ) : (
                  firstLetter
               )}
            </div>
            <div>
              <p className="font-bold text-lg truncate max-w-[140px]">BS. {lastName}</p>
              <p className="text-blue-200 text-sm truncate max-w-[140px]">{specialtyName}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all ${
                  active 
                    ? 'bg-white text-blue-700 shadow-xl font-bold' 
                    : 'hover:bg-blue-800 hover:bg-opacity-60 text-blue-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-5 py-4 rounded-xl hover:bg-blue-800 hover:bg-opacity-60 transition-all w-full text-blue-100 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}