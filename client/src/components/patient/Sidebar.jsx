import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Calendar, Settings, UserCircle, LogOut 
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const menuItems = [
  { to: "/profile", icon: UserCircle, label: "Hồ sơ", end: true },
  { to: "/profile/appointments", icon: Calendar, label: "Lịch khám" },
  { to: "/profile/password", icon: Settings, label: "Mật khẩu" },
];

export default function Sidebar() {
  const { handleLogout } = useAppContext();
  const navigate = useNavigate();

  const onLogout = () => {
    if(window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        handleLogout();
        navigate('/');
    }
  }

  return (
   <div className="lg:col-span-1 pt-0 lg:pt-4 mb-6 lg:mb-0 sticky top-[70px] z-20 lg:static">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:sticky lg:top-24">
        {/* Container menu: Mobile là Flex Row (ngang), Desktop là Flex Col (dọc) */}
        <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible p-2 lg:p-4 space-x-2 lg:space-x-0 lg:space-y-1 no-scrollbar">
          {menuItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 lg:gap-4 px-3 py-2 lg:px-5 lg:py-4 rounded-lg transition font-medium whitespace-nowrap flex-shrink-0 text-sm lg:text-base ${
                  isActive 
                  ? 'bg-indigo-50 title-color shadow-sm border border-indigo-100 lg:border-none' 
                  : 'text-gray-700 hover:bg-gray-150 hover:text-sky-500 border border-transparent hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="w-4 h-4 lg:w-5 lg:h-5" />
              {item.label}
            </NavLink>
          ))}

          {/* Nút đăng xuất trên Mobile (dạng icon nhỏ) */}
          <button 
            onClick={onLogout}
            className="lg:hidden flex items-center gap-2 px-3 py-2 text-red-600 bg-red-50 rounded-lg whitespace-nowrap flex-shrink-0 text-sm font-medium border border-red-100"
          >
            <LogOut className="w-4 h-4" />
            Thoát
          </button>
        </div>

        {/* Nút đăng xuất trên Desktop (Full width) */}
        <div className="hidden lg:block border-t pt-2 pb-2 px-4 mt-2">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-5 py-4 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}