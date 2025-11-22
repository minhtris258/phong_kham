// src/components/admin/patient/PatientPasswordModal.jsx (ĐÃ SỬA)

import React, { useState } from 'react';
import Modal from '../Modal'; 

const PatientPasswordModal = ({ 
    isOpen, 
    onClose, 
    patientToChangePassword, // ← THAY THẾ CHO formData
    handlePasswordChange,    // ← THAY THẾ CHO handleSave
}) => {
    // State cục bộ cho form mật khẩu
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmNewPassword: '',
    });
    
    // Xử lý thay đổi input
    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    // Xử lý SUBMIT
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            alert('Lỗi: Mật khẩu xác nhận không khớp!');
            return;
        }
        if (passwordData.newPassword.length < 6) { // Dùng 6 thay vì 10 cho tính tương thích
             alert('Lỗi: Mật khẩu phải có ít nhất 6 ký tự.');
             return;
        }
        
        // Gọi hàm xử lý API từ component cha
        handlePasswordChange({
            patientId: patientToChangePassword._id || patientToChangePassword.id,
            newPassword: passwordData.newPassword,
        });
    };
    
    const patientName = patientToChangePassword?.fullName || 'Bệnh nhân';

    return (
        <Modal 
            title={`Đổi Mật Khẩu cho: ${patientName}`} 
            isOpen={isOpen} 
            onClose={onClose}
            maxWidth="sm"
        >
            <form onSubmit={handleSubmit} className="space-y-6"> {/* ← Dùng handleSubmit mới */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu mới <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordInputChange}
                        required
                        placeholder="Ít nhất 6 ký tự"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                </div>
                {/* Nhập lại mật khẩu mới */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Xác nhận mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="password"
                        name="confirmNewPassword"
                        value={passwordData.confirmNewPassword}
                        onChange={handlePasswordInputChange}
                        required
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                </div>
                {/* Nút hành động */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        type="submit"
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm"
                    >
                        Thay Đổi Mật Khẩu
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default PatientPasswordModal;