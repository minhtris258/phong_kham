import React, { useState, useEffect } from "react";
import patientService from "../../services/PatientService";
import { Lock, Save } from "lucide-react"; 
import { useAppContext } from "../../context/AppContext"; // 1. Import Context

export const PatientPassword = () => {
    const { user } = useAppContext(); // 2. Lấy thông tin user
    
    // Kiểm tra xem có phải tài khoản Google không
    const isGoogleAccount = user?.authType === 'google';

    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [message, setMessage] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({ ...passwordData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự." });
            return;
        }

        try {
            setIsLoading(true);
            
            // Nếu là Google Account, oldPassword sẽ là chuỗi rỗng (backend đã xử lý việc này)
            await patientService.changeMyPassword(
                isGoogleAccount ? "" : passwordData.oldPassword, 
                passwordData.newPassword, 
                passwordData.confirmPassword
            );
            
            setMessage({ type: "success", text: isGoogleAccount ? "Tạo mật khẩu thành công!" : "Đổi mật khẩu thành công!" });
            
            // Reset form
            setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Lỗi hệ thống hoặc mật khẩu không đúng.";
            setMessage({ type: "error", text: errorMsg });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-6">
            {/* Tiêu đề */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Lock className="title-color" /> 
                    {isGoogleAccount ? "Tạo mật khẩu mới" : "Đổi mật khẩu"}
                </h2>
                <p className="text-gray-500 mt-1">
                    {isGoogleAccount 
                        ? "Tạo mật khẩu để có thể đăng nhập bằng Email vào lần sau." 
                        : "Vui lòng nhập mật khẩu hiện tại để thiết lập mật khẩu mới."}
                </p>
            </div>

            {/* Thông báo */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-xl border-l-4 shadow-sm bg-white animate-fade-in ${
                    message.type === "success" ? "border-green-500 text-green-700" : "border-red-500 text-red-700"
                }`}>
                    <p className="font-medium">{message.type === "success" ? "Thành công!" : "Lỗi!"}</p>
                    <p>{message.text}</p>
                </div>
            )}

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    
                    {/* 3. CHỈ HIỆN Ô MẬT KHẨU CŨ NẾU KHÔNG PHẢI GOOGLE */}
                    {!isGoogleAccount && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu hiện tại <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="password" 
                                name="oldPassword"
                                value={passwordData.oldPassword}
                                onChange={handlePasswordChange}
                                required
                                placeholder="Nhập mật khẩu cũ..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none transition"
                            />
                        </div>
                    )}

                    {/* Nếu là Google Account thì hiện thông báo nhỏ cho đẹp */}
                    {isGoogleAccount && (
                        <div className="bg-blue-50 title-color px-4 py-3 rounded-lg text-sm">
                            Bạn đang sử dụng tài khoản Google. Bạn không cần nhập mật khẩu cũ.
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="password" 
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                            placeholder="Nhập mật khẩu mới..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="password" 
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            placeholder="Nhập lại mật khẩu mới..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 outline-none transition"
                        />
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`w-full flex items-center justify-center gap-2 px-6 py-3 text-white font-bold rounded-lg transition-all ${
                                isLoading ? "bg-sky-400 cursor-not-allowed" : "bg-[#00B5F1] hover:bg-sky-700 shadow-md hover:shadow-lg"
                            }`}
                        >
                            {isLoading ? "Đang xử lý..." : <><Save size={20} /> {isGoogleAccount ? "Tạo mật khẩu" : "Lưu mật khẩu mới"}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientPassword;