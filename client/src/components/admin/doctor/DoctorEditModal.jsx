// src/components/admin/doctor/DoctorEditModal.jsx
import React from 'react';
import Modal from '../Modal'; // sửa đường dẫn nếu cần

const DoctorEditModal = ({
    isOpen,
    onClose,
    formData,
    handleInputChange,
    handleSave,
    editingDoctor,
    specialties = [] // Danh sách chuyên khoa từ API hoặc mock
}) => {
    // Xử lý ngày sinh (chuyển Date → string yyyy-MM-dd)
    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    return (
        <Modal
            title={`Chỉnh sửa thông tin bác sĩ: ${editingDoctor?.fullName || 'Đang tải...'}`}
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="md"
        >
            <form onSubmit={handleSave} className="space-y-6">
                {/* Họ và tên */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="Nguyễn Văn A"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                </div>

                {/* Giới tính & Ngày sinh & Chuyên khoa */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giới tính <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="gender"
                            value={formData.gender || ''}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">-- Chọn --</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày sinh <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="dob"
                            value={formatDateForInput(formData.dob)}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chuyên khoa <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="specialty_id"
                            value={formData.specialty_id || ''}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">-- Chọn chuyên khoa --</option>
                            {specialties.map(spec => (
                                <option key={spec._id || spec.id} value={spec._id || spec.id}>
                                    {spec.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* SĐT, Email, Phí khám */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleInputChange}
                            required
                            placeholder="0901234567"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleInputChange}
                            disabled // Email không cho sửa (đã dùng để đăng nhập)
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phí khám (VNĐ)
                        </label>
                        <input
                            type="number"
                            name="consultation_fee"
                            value={formData.consultation_fee || 0}
                            onChange={handleInputChange}
                            min="0"
                            step="10000"
                            placeholder="200000"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Địa chỉ */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ phòng khám <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="Số 123 Đường ABC, Quận 1, TP.HCM"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* Giới thiệu & Ghi chú */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu ngắn</label>
                        <textarea
                            name="introduction"
                            value={formData.introduction || ''}
                            onChange={handleInputChange}
                            rows="3"
                            placeholder="Bác sĩ có 10 năm kinh nghiệm..."
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú nội bộ</label>
                        <textarea
                            name="note"
                            value={formData.note || ''}
                            onChange={handleInputChange}
                            rows="3"
                            placeholder="Chỉ admin thấy..."
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Trạng thái hoạt động */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trạng thái hoạt động
                    </label>
                    <select
                        name="status"
                        value={formData.status || 'pending_profile'}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="active">Hoạt động (Hiển thị cho bệnh nhân)</option>
                        <option value="inactive">Tạm dừng</option>
                        <option value="pending_profile">Chờ hoàn tất hồ sơ</option>
                    </select>
                </div>

                {/* Nút hành động */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm"
                    >
                        Lưu Thay Đổi
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default DoctorEditModal;