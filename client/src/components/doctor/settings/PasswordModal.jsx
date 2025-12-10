// src/components/admin/doctor/PasswordModal.jsx (hoặc đường dẫn của bạn)
import React from "react";
import Modal from "../../Modal";

// 1. Nhận thêm prop `isGoogleAccount`
export default function PasswordModal({ 
    isOpen, 
    onClose, 
    onSubmit, 
    isLoading, 
    passwordData, 
    handlePasswordChange,
    isGoogleAccount // <--- THÊM PROP NÀY
}) {
    // Thay đổi tiêu đề cho hợp lý
    const modalTitle = isGoogleAccount ? "Tạo Mật Khẩu Mới" : "Đổi Mật Khẩu";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
            <form onSubmit={onSubmit} className="space-y-4">
                
                {/* 2. LOGIC ẨN HIỆN: Nếu KHÔNG PHẢI Google thì mới hiện ô Mật khẩu cũ */}
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
                            className="w-full border border-gray-300 rounded-md p-2"
                            required // Vẫn bắt buộc nếu ô này được hiển thị
                        />
                    </div>
                )}

                {/* Hiển thị thông báo nếu là Google User */}
                {isGoogleAccount && (
                    <div className="bg-blue-50 text-blue-700 p-3 rounded text-sm mb-2">
                        Bạn đang sử dụng tài khoản Google. Hãy tạo mật khẩu mới để có thể đăng nhập bằng Email/Password sau này.
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
                        className="w-full border border-gray-300 rounded-md p-2"
                        required
                        minLength={6}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        name="confirmNewPassword"
                        value={passwordData.confirmNewPassword}
                        onChange={handlePasswordChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}