import React, { useState, memo } from 'react';
import { Menu, Users, Settings, Lock } from 'lucide-react';

const Header = ({ toggleSidebar, setView }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const toggleDropdown = () => {
        setIsDropdownOpen(prev => !prev);
    };
    
    const handleAction = (view) => {
        if (view === 'logout') {
            console.log("Đang thực hiện Đăng Xuất...");
            setView('dashboard'); // Chuyển về dashboard sau khi đăng xuất giả lập
        } else if (view && setView) {
            setView(view); 
        }
        setIsDropdownOpen(false);
    };

    return (
        // Header sử dụng sticky top-0, hoạt động tốt trên cả mobile và desktop
        <header className="flex items-center justify-between p-4 bg-white shadow-sm h-16 sticky top-0 z-20 border-b border-gray-200">
            {/* Mobile Menu Button */}
            <button 
                className="lg:hidden text-gray-600 hover:text-indigo-600 focus:outline-none"
                onClick={toggleSidebar}
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Title */}
            <h1 className="text-xl font-semibold text-gray-800 lg:ml-0 ml-4">Quản Lý Phòng Khám</h1>

            {/* User Profile / Search */}
            <div className="flex items-center space-x-4">
                <input 
                    type="text" 
                    placeholder="Tìm kiếm..." 
                    className="hidden sm:block p-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                
                {/* Profile Dropdown Area */}
                <div className="relative">
                    <button 
                        onClick={toggleDropdown}
                        className="flex items-center space-x-2 cursor-pointer p-1 rounded-full hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <img 
                            className="h-8 w-8 rounded-full object-cover" 
                            src="https://placehold.co/32x32/indigo/white?text=A" 
                            alt="Avatar"
                        />
                        <span className="hidden md:block text-sm font-medium text-gray-700">Admin</span>
                    </button>

                    {isDropdownOpen && (
                        <div 
                            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 ring-1 ring-black ring-opacity-5 z-40"
                        >
                            <a 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); handleAction('profile'); }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                                <Users className="w-4 h-4 mr-2 text-indigo-500" /> Chỉnh Profile
                            </a>
                            <a 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); handleAction('settings'); }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                                <Settings className="w-4 h-4 mr-2 text-indigo-500" /> Cài Đặt
                            </a>
                            <div className="border-t border-gray-100 my-1"></div>
                            <a 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); handleAction('logout'); }}
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                            >
                                <Lock className="w-4 h-4 mr-2" /> Đăng Xuất
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
export default memo(Header);