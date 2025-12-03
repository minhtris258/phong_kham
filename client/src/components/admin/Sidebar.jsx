import React from "react";
import { NavLink } from "react-router-dom";
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
} from "lucide-react";

// Component này không cần các props currentView và setView nữa
const Sidebar = ({ isOpen, toggleSidebar }) => {
  // Lưu ý: Các đường dẫn ở đây là RELATIVE PATH (tương đối) so với /admin
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
    { name: "Đối Tác", icon: Handshake, to: "partners" },
    { name: "Profile", icon: UserRoundPen, to: "profile" },
    { name: "Cài Đặt", icon: Settings, to: "settings" },
  ];
  // logout
  const { handleLogout, setAccountOpen } = useAppContext();
  // Định nghĩa class cho link không active và active
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
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-indigo-700">
        <h2 className="text-xl font-bold tracking-wider">Health Admin</h2>
        <button
          className="lg:hidden text-white focus:outline-none"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6 transform rotate-90" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          // SỬ DỤNG NavLink TỪ REACT ROUTER
          <NavLink
            key={item.name}
            to={item.to} // Sử dụng đường dẫn URL
            // Hàm isActive giúp NavLink tự động xác định khi nào link này active
            className={({ isActive }) =>
              `${linkClasses} ${isActive ? activeClasses : ""}`
            }
            // Khi click trên mobile, đóng Sidebar
            onClick={() => {
              if (window.innerWidth < 1024) toggleSidebar();
            }}
            // thuộc tính 'end' quan trọng để Dashboard (/) chỉ active khi đường dẫn chính xác là /admin
            end={item.to === "/admin" ? true : false}
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer/Logout */}
      <div className="p-4 border-t border-indigo-700">
        <button
          type="button"
          onClick={() => {
            handleLogout();
          }}
          className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
