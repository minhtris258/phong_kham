import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext.jsx";
import {
  Menu,
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Stethoscope,
  Users,
  BarChart,
  Settings,
  Lock,
  UserRoundPen,
  Handshake,
  FileText,
  Home,
  LogOut,
  ChevronLeft, // Thêm icon này để kết hợp nếu thích
} from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, to: "/admin" },
    { name: "Quản lý Bài Viết", icon: FileText, to: "posts" },
    { name: "Quản lý Lịch Hẹn", icon: Calendar, to: "appointments" },
    { name: "Quản lý Bác Sĩ", icon: Stethoscope, to: "doctors" },
    { name: "Quản lý Bệnh Nhân", icon: Users, to: "patients" },
    { name: "Quản Lý Khoa", icon: BarChart, to: "specialty" },
    { name: "Lịch Nghỉ", icon: CalendarDays, to: "holidays" },
    { name: "Quản Lý Dịch Vụ", icon: Stethoscope, to: "services" },
    { name: "Quản Lý Thuốc", icon: Stethoscope, to: "medicines" },
    { name: "Hồ Sơ Khám Bệnh", icon: FileText, to: "visits" },
    { name: "Đối Tác", icon: Handshake, to: "partners" },
    { name: "Quản Lý Liên Hệ", icon: Lock, to: "contacts" },
    { name: "Profile", icon: UserRoundPen, to: "profile" },
  ];

  const { handleLogout } = useAppContext();
  
  const linkClasses =
    "flex items-center px-4 py-2 rounded-lg transition duration-150 text-indigo-200 hover:bg-indigo-700 hover:text-white";
  const activeClasses = "bg-indigo-900 text-white shadow-md";

  return (
    <aside
      className={`fixed inset-y-0 left-0 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:relative lg:translate-x-0 transition duration-300 ease-in-out 
                      w-64 bg-indigo-800 text-white flex flex-col z-30 shadow-2xl lg:shadow-none lg:flex-shrink-0`}
    >
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-indigo-700 bg-indigo-900">
        
        {/* Left Side: Home Button & Title */}
        <div className="flex items-center gap-3">
            
            {/* 1. NÚT HOME (Góc trái ngoài cùng) */}
            <Link 
                to="/" 
                title="Về trang chủ Website"
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-700/50 hover:bg-indigo-600 text-indigo-100 transition-all hover:scale-105 border border-transparent hover:border-indigo-400"
            >
                <Home size={18} />
            </Link>

            {/* Đường kẻ dọc ngăn cách */}
            <div className="h-5 w-[1px] bg-indigo-600/60"></div>

            {/* 2. Logo & Tên Brand */}
            <div className="flex items-center gap-2 select-none">
               <Stethoscope className="h-5 w-5 text-indigo-300" />
               <h2 className="text-lg font-bold tracking-wide text-white">Admin</h2>
            </div>
        </div>
        
        {/* Mobile Toggle Button */}
        <button
            className="lg:hidden text-indigo-200 hover:text-white focus:outline-none p-1 rounded-md hover:bg-indigo-700"
            onClick={toggleSidebar}
        >
            <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `${linkClasses} ${isActive ? activeClasses : ""}`
            }
            onClick={() => {
              if (window.innerWidth < 1024) toggleSidebar();
            }}
            end={item.to === "/admin"}
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* --- FOOTER / LOGOUT --- */}
      <div className="p-4 border-t border-indigo-700 bg-indigo-900/30">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-red-300 bg-red-900/20 hover:bg-red-900/40 rounded-lg transition-colors border border-transparent hover:border-red-800 group"
        >
          <LogOut className="h-4 w-4 mr-3 group-hover:text-red-200" />
          <span className="font-medium group-hover:text-red-100">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;