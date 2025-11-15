import React, { useState } from 'react';
import { initialMockUsers, MOCK_IDS } from '../../mocks/mockdata.js';

const ProfileSettings = () => {
    // Lấy dữ liệu Admin từ mock data
    const adminUser = initialMockUsers.find(u => u.role_id === MOCK_IDS.roles.admin) || {};

    const [profile, setProfile] = useState({
        name: adminUser.name || 'Admin Tổng Quát',
        email: adminUser.email || 'admin@clinic.com',
        phone: '0901 234 567', // Phone không có trong UserModel, dùng mock
        role: 'Quản Trị Viên Hệ Thống',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        avatarUrl: 'https://placehold.co/100x100/indigo/white?text=A'
    });
    const [statusMessage, setStatusMessage] = useState({ type: null, message: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        // Giả lập logic lưu trữ
        setStatusMessage({ type: 'success', message: 'Thông tin hồ sơ đã được cập nhật thành công!' });
        setTimeout(() => setStatusMessage({ type: null, message: '' }), 3000);
        console.log("Saving Profile:", profile);
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        if (profile.newPassword !== profile.confirmPassword) {
            setStatusMessage({ type: 'error', message: 'Mật khẩu mới và xác nhận mật khẩu không khớp.' });
            return;
        }
        if (profile.currentPassword === '') {
            setStatusMessage({ type: 'error', message: 'Vui lòng nhập mật khẩu hiện tại.' });
            return;
        }
        
        // Giả lập logic đổi mật khẩu
        setStatusMessage({ type: 'success', message: 'Mật khẩu đã được thay đổi thành công!' });
        setProfile(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        setTimeout(() => setStatusMessage({ type: null, message: '' }), 3000);
        console.log("Changing Password with new:", profile.newPassword);
    };

    return (
        <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Chỉnh Sửa Hồ Sơ Cá Nhân</h2>
            
            {statusMessage.message && (
                <div className={`p-4 rounded-lg mb-6 text-sm font-semibold ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {statusMessage.message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Thông tin cơ bản */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Thông Tin Cơ Bản</h3>
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div className="flex items-center space-x-4 pb-4 border-b border-gray-100">
                            <img 
                                className="h-20 w-20 rounded-full object-cover shadow-lg border-2 border-indigo-500" 
                                src={profile.avatarUrl} 
                                alt="Avatar"
                            />
                            <div>
                                <p className="font-bold text-lg text-gray-900">{profile.name}</p>
                                <p className="text-sm text-gray-500">{profile.role}</p>
                            </div>
                        </div>

                        <label className="block">
                            <span className="text-gray-700 font-medium">Họ Tên (UserModel: name):</span>
                            <input 
                                type="text" 
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border"
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700 font-medium">Email (UserModel: email):</span>
                            <input 
                                type="email" 
                                name="email"
                                value={profile.email}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-gray-100 cursor-not-allowed"
                                disabled
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700 font-medium">Điện Thoại (Mock):</span>
                            <input 
                                type="text" 
                                name="phone"
                                value={profile.phone}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border"
                            />
                        </label>

                        <div className="pt-4 flex justify-end">
                            <button 
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md"
                            >
                                Lưu Thông Tin
                            </button>
                        </div>
                    </form>
                </div>

                {/* 2. Đổi Mật Khẩu */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border border-gray-100 h-fit">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Đổi Mật Khẩu</h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <label className="block">
                            <span className="text-gray-700 font-medium">Mật khẩu hiện tại:</span>
                            <input 
                                type="password" 
                                name="currentPassword"
                                value={profile.currentPassword}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border"
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700 font-medium">Mật khẩu mới (UserModel: password):</span>
                            <input 
                                type="password" 
                                name="newPassword"
                                value={profile.newPassword}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border"
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700 font-medium">Xác nhận mật khẩu mới:</span>
                            <input 
                                type="password" 
                                name="confirmPassword"
                                value={profile.confirmPassword}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border"
                                required
                            />
                        </label>
                        <div className="pt-4 flex justify-end">
                            <button 
                                type="submit"
                                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-md"
                            >
                                Đổi Mật Khẩu
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};
export default ProfileSettings;