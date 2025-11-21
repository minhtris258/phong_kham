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
    specialties = [], // Danh sách chuyên khoa từ API hoặc mock
    handleFileChange, // <-- THÊM PROP: Xử lý thay đổi file
    clearThumbnail,   // <-- THÊM PROP: Xử lý xóa ảnh
    isImagePending,   // <-- THÊM PROP: Trạng thái đang tải ảnh
}) => {
    // Xử lý ngày sinh (chuyển Date → string yyyy-MM-dd)
    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    const currentThumbnail = formData.thumbnail || editingDoctor?.thumbnail;

    return (
        <Modal
            title={`Chỉnh sửa thông tin bác sĩ: ${editingDoctor?.fullName || 'Đang tải...'}`}
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="3xl" // Tăng maxWidth để dễ nhìn
        >
            <form onSubmit={handleSave} className="space-y-6">
                {/* === Hàng 1: Họ tên === */}
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

                {/* === Hàng 2: Giới tính & Ngày sinh & Chuyên khoa === */}
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

                {/* --- Phần Upload Ảnh (Thumbnail) --- */}
                <div className="grid grid-cols-3 gap-4 items-end">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ảnh đại diện (Thumbnail)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange} // Sử dụng prop mới
                            className="w-full border border-gray-300 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            disabled={isImagePending}
                        />
                        {isImagePending && (
                            <p className="text-sm text-indigo-600 mt-1">Đang tải ảnh lên...</p>
                        )}
                        
                    </div>
                    
                    {/* Xem trước ảnh và xóa ảnh */}
                    <div className="col-span-1">
                        {currentThumbnail && (
                            <div className="flex items-center space-x-2">
                                <img
                                    src={currentThumbnail}
                                    alt="Thumbnail"
                                    className="w-12 h-12 object-cover rounded-full border border-gray-300"
                                />
                                <button
                                    type="button"
                                    onClick={clearThumbnail} // Sử dụng prop mới
                                    className="text-sm text-red-600 hover:text-red-800 transition font-medium"
                                >
                                    Xóa ảnh cũ
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {/* ------------------------------------ */}
                
                {/* Hàng 3: SĐT, Email, Phí khám */}
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
                            // Lấy email từ editingDoctor vì trường này bị disable
                            value={editingDoctor?.email || ''} 
                            disabled 
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
                        // Nếu status có trong formData thì dùng, nếu không thì dùng từ editingDoctor, mặc định là pending_profile
                        value={formData.status || editingDoctor?.status || 'pending_profile'}
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
                        disabled={isImagePending} // Disable khi đang tải ảnh
                    >
                        {isImagePending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default DoctorEditModal;