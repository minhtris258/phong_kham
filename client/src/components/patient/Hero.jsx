// src/components/patient/Hero.jsx
import React, { useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, Home, LogOut } from "lucide-react";
// Import Context từ Dashboard
import { PatientContext } from "../../pages/patient/Dashboard.jsx"; 

export default function Hero() {
    // Sử dụng Context để lấy dữ liệu
    const patientData = useContext(PatientContext);

    // Fallback nếu Context chưa được cung cấp (chỉ nên xảy ra khi component này được render độc lập)
    if (!patientData) {
        return null;
    }
    
    // Phá vỡ đối tượng dữ liệu Context
    const { patient, patientCode, avatarLetter, menuItems } = patientData;

    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <div className="bg-blue-600 text-white">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-28 h-28 bg-white text-blue-600 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl">
                            {avatarLetter}
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">{patient.fullName}</h1>
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
                                <p className="font-semibold text-lg">{patient.fullName}</p>
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
                                        onClick={() => setDropdownOpen(false)}
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
    );
}