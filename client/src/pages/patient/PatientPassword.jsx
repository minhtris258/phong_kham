import React, { useState } from "react";
import patientService from "../../services/PatientService";
// import PatientDashboard from "./PatientDashboard"; // <-- XÓA DÒNG NÀY
import { Lock, Save } from "lucide-react"; 

export const PatientPassword = () => {
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
            await patientService.changeMyPassword(
        passwordData.oldPassword, 
        passwordData.newPassword, 
        passwordData.confirmPassword
    );
            setMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
            // Reset form
            setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Mật khẩu cũ không chính xác hoặc lỗi hệ thống.";
            setMessage({ type: "error", text: errorMsg });
        } finally {
            setIsLoading(false);
        }
    };

    // --- KHÔNG BỌC <PatientDashboard> ---
    return (
        <div className="max-w-xl mx-auto mt-6">
            {/* Tiêu đề */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Lock className="text-indigo-600" /> Đổi mật khẩu
                </h2>
                <p className="text-gray-500 mt-1">Vui lòng nhập mật khẩu hiện tại để thiết lập mật khẩu mới.</p>
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                        <input 
                            type="password" 
                            name="oldPassword"
                            value={passwordData.oldPassword}
                            onChange={handlePasswordChange}
                            required
                            placeholder="Nhập mật khẩu cũ..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                        <input 
                            type="password" 
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                            placeholder="Nhập mật khẩu mới..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                        <input 
                            type="password" 
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            placeholder="Nhập lại mật khẩu mới..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        />
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`w-full flex items-center justify-center gap-2 px-6 py-3 text-white font-bold rounded-lg transition-all ${
                                isLoading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg"
                            }`}
                        >
                            {isLoading ? "Đang xử lý..." : <><Save size={20} /> Lưu mật khẩu mới</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientPassword;