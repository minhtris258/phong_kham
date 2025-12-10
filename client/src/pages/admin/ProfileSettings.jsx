import React, { useState, useEffect } from 'react';
import { toastSuccess, toastError, toastWarning } from '../../utils/toast'; 
import authService from '../../services/AuthService'; 

const ProfileSettings = () => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        avatarUrl: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // === 1. LOAD DATA TỪ API ===
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await authService.getProfile();
                // Tùy vào AuthController trả về { user: ... } hay trực tiếp object
                const user = res.data?.user || res.data; 

                if (user) {
                    setProfile(prev => ({
                        ...prev,
                        name: user.name || 'admin', // Backend cần trả về name
                        email: user.email || '',
                        role: user.role || '',
                        // Nếu backend chưa trả về phone, để trống
                        phone: user.phone || '', 
                        avatarUrl: 'https://placehold.co/100x100/indigo/white?text=' + (user.name?.charAt(0) || 'U')
                    }));
                }
            } catch (error) {
                console.error("Lỗi tải profile:", error);
                toastError("Không thể tải thông tin cá nhân.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // === 2. XỬ LÝ NHẬP LIỆU ===
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    // === 3. XỬ LÝ ĐỔI MẬT KHẨU ===
    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (!profile.currentPassword) {
            return toastWarning('Vui lòng nhập mật khẩu hiện tại.');
        }
        if (profile.newPassword.length < 6) {
            return toastWarning('Mật khẩu mới phải có ít nhất 6 ký tự.');
        }
        if (profile.newPassword !== profile.confirmPassword) {
            return toastError('Mật khẩu xác nhận không khớp.');
        }

        setSaving(true);
        try {
            const payload = {
                currentPassword: profile.currentPassword,
                newPassword: profile.newPassword
            };

            await authService.changePassword(payload);
            
            toastSuccess('Đổi mật khẩu thành công!');
            
            // Reset ô mật khẩu
            setProfile(prev => ({ 
                ...prev, 
                currentPassword: '', 
                newPassword: '', 
                confirmPassword: '' 
            }));

        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.error || "Đổi mật khẩu thất bại.";
            toastError(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    // === 4. XỬ LÝ CẬP NHẬT THÔNG TIN (Tạm khóa vì chưa có API) ===
    const handleSaveProfile = (e) => {
        e.preventDefault();
        toastWarning("Chức năng cập nhật thông tin đang được bảo trì.");
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải thông tin...</div>;

    return (
        <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Chỉnh Sửa Hồ Sơ</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM THÔNG TIN (READ ONLY hoặc UPDATE nếu có API) */}
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
                                <p className="text-sm text-gray-500 capitalize">{profile.role}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <label className="block">
                                <span className="text-gray-700 font-medium">Họ Tên:</span>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={profile.name}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 p-2 border outline-none"
                                />
                            </label>
                            <label className="block">
                                <span className="text-gray-700 font-medium">Email (Không thể đổi):</span>
                                <input 
                                    type="email" 
                                    value={profile.email}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                                    disabled
                                />
                            </label>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button 
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md opacity-60 cursor-not-allowed"
                                disabled
                                title="Chức năng tạm khóa"
                            >
                                Lưu Thông Tin
                            </button>
                        </div>
                    </form>
                </div>

                {/* FORM ĐỔI MẬT KHẨU */}
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
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 p-2 border outline-none"
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700 font-medium">Mật khẩu mới:</span>
                            <input 
                                type="password" 
                                name="newPassword"
                                value={profile.newPassword}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 p-2 border outline-none"
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
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 p-2 border outline-none"
                                required
                            />
                        </label>
                        <div className="pt-4 flex justify-end">
                            <button 
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-md disabled:opacity-70 flex items-center gap-2"
                            >
                                {saving ? <span className="animate-spin">⏳</span> : null} Đổi Mật Khẩu
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default ProfileSettings;