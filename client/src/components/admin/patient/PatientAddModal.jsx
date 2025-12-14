
import React from 'react';
import Modal from '../Modal'; // Đảm bảo đường dẫn đúng với dự án của bạn

const PatientAddModal = ({ 
    isOpen, 
    onClose, 
    formData, 
    handleInputChange, 
    handleSave,
}) => {
    return (
        <Modal 
            title="Tạo Tài Khoản Bệnh nhân Mới" 
            isOpen={isOpen} 
            onClose={onClose}
            maxWidth="sm" // nếu Modal của bạn hỗ trợ
        >
            <form onSubmit={handleSave} className="space-y-6">
                {/* Tên đăng nhập */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên đăng nhập <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="Ví dụ: dr.nguyenvana"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">Sẽ hiển thị khi bệnh nhân đăng nhập</p>
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="email"  // ← Sửa thành type="email" (rất quan trọng!)
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="user@gmail.com"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">Bệnh nhân sẽ dùng email này để đăng nhập</p>
                </div>
                {/* Mật khẩu */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu tạm <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="password"  // ← Sửa thành type="password" (bảo mật!)
                        name="password"
                        value={formData.password || ''}
                        onChange={handleInputChange}
                        required
                        minLength="6"
                        placeholder="Ít nhất 6 ký tự"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">Bệnh nhân có thể đổi sau khi đăng nhập lần đầu</p>
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
                        className="px-6 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-700 transition font-medium shadow-sm"
                    >
                        Tạo Bệnh nhân
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default PatientAddModal;