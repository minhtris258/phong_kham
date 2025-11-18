import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Calendar, Receipt, Settings, UserCircle, LogOut 
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
export default function Sidebar() {
  return (
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
  );
}