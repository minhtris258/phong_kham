import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Calendar, Receipt, Settings, UserCircle, LogOut 
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext'; // Import Context

const menuItems = [
  // Thêm end: true để link này chỉ active khi đường dẫn là chính xác "/profile"
  { to: "/profile", icon: UserCircle, label: "Hồ sơ cá nhân", end: true },
  { to: "/profile/appointments", icon: Calendar, label: "Lịch khám bệnh" },
  { to: "/payment-history", icon: Receipt, label: "Lịch sử thanh toán" }, 
  // Cập nhật đường dẫn đúng: /profile/password
  { to: "/profile/password", icon: Settings, label: "Đổi mật khẩu" },
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
   <div className="lg:col-span-1">
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden sticky top-24">
        <div className="p-4 space-y-1">
          {menuItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end} // Quan trọng: Truyền thuộc tính end vào đây
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-4 rounded-lg transition font-medium ${
                  isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="border-t pt-2 pb-2 px-4 mt-2">
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