// src/components/doctor/DoctorSidebar.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Calendar, Settings, LogOut, X, Stethoscope, Home } from 'lucide-react'; 
import doctorService from '../../services/DoctorService.js';
import { toastSuccess,toastError, toastWarning, toastInfo } from "../../utils/toast";
import { useAppContext } from '../../context/AppContext';

export default function DoctorSidebar({ sidebarOpen, setSidebarOpen }) {

  const location = useLocation();
  const navigate = useNavigate();
  // Lấy hàm logout và setAuthToken từ context
  const { handleLogout: contextLogout } = useAppContext(); 
  const [doctor, setDoctor] = useState(null);

  // Gọi API lấy thông tin bác sĩ
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        const res = await doctorService.getMe();
        const profile = res.profile || res;
        setDoctor(profile);
      } catch (error) {
        toastError("Lỗi lấy thông tin sidebar:", error);
      }
    };

    fetchDoctorInfo();
  }, []);

  // --- HÀM XỬ LÝ LOGOUT AN TOÀN ---
  const onLogoutClick = () => {
      // 1. Gọi hàm logout của Context để xóa state/localStorage
      contextLogout(); 
      
      // 2. Thông báo nhẹ
      toastSuccess("Đăng xuất thành công!");

      // 3. Chuyển hướng ngay lập tức về login
      navigate('/login');
  };
  // ---------------------------------

  const navItems = [
    { name: "Hồ sơ cá nhân", icon: User, path: "/doctor" },
    { name: "Cuộc hẹn", icon: Calendar, path: "/doctor/appointments" },
    { name: "Lịch làm", icon: Calendar, path: "/doctor/schedule" },
    { name: "Hồ sơ khám", icon: Stethoscope, path: "/doctor/visits" },
    { name: "Cài đặt", icon: Settings, path: "/doctor/settings" },
  ];

  const isActive = (path) => location.pathname === path;

  // Helper lấy tên
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
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-[#00B5F1] text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Logo Header & Home Button */}
        <div className="flex items-center justify-between p-6 ">
          <div className="flex items-center gap-3">
            {/* --- NÚT VỀ TRANG CHỦ (Đã OK) --- */}
            <Link 
                to="/" 
                className="p-2 bg-sky-600 rounded-lg hover:bg-sky-700 transition shadow-sm group relative"
                title="Về trang chủ Website"
            >
                <Home className="w-6 h-6 text-white" />
            </Link>
            
            <div className="flex flex-col">
                <h1 className="text-lg font-bold leading-none">DOCTOR</h1>
                <span className="text-xs text-white tracking-wider">PORTAL</span>
            </div>
          </div>

          <button onClick={() => setSidebarOpen(false)} className="lg:hidden hover:text-red-300 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info Card */}
        <div className="p-6 ">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white text-blue-700 rounded-full flex items-center justify-center text-2xl font-bold shadow-xl overflow-hidden border-2 border-white shrink-0">
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
            <div className="overflow-hidden">
              <p className="font-bold text-lg truncate block" title={doctorName}>BS. {lastName}</p>
              <p className="text-white text-sm truncate block" title={specialtyName}>{specialtyName}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
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
                    ? 'bg-white text-sky-600 shadow-xl font-bold transform scale-[1.02]' 
                    : 'hover:bg-sky-600 hover:bg-opacity-60 text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-2' : ''}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button (Sử dụng hàm onLogoutClick mới) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#00B5F1] ">
          <button 
            onClick={onLogoutClick} 
            className="flex items-center gap-4 px-5 py-3 rounded-xl bg-sky-600 hover:bg-red-600 hover:text-white transition-all w-full text-blue-100 group"
          >
            <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}