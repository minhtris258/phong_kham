import React from 'react';
import Modal from '../Modal'; // Đảm bảo đường dẫn đúng
import StatusBadge from './StatusBadge';

const DoctorViewModal = ({ isOpen, onClose, viewingDoctor, specialtyMap }) => {
    
    // Hàm chuyển đổi giới tính
    const getGenderVietnamese = (gender) => {
        switch (gender) {
            case 'male': return 'Nam';
            case 'female': return 'Nữ';
            default: return 'Khác';
        }
    }

    // Định dạng ngày sinh (nếu có)
    const formatDOB = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

    return (
        <Modal
            title={`Chi Tiết Bác Sĩ: ${viewingDoctor?.fullName || ''}`}
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-xl"
        >
            {viewingDoctor && (
                <div className="space-y-4 text-gray-700">
                    
                    {/* === Hàng 1: Thumbnail & Thông tin tài chính === */}
                    <div className="flex items-start gap-6 border-b pb-4">
                        
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <img
                                src={viewingDoctor.thumbnail || 'URL_ANH_MAC_DINH'} // Cung cấp ảnh mặc định nếu không có
                                alt={`Ảnh ${viewingDoctor.fullName}`}
                                className="w-24 h-24 object-cover rounded-full border-2 border-indigo-400 shadow-md"
                            />
                        </div>

                        {/* Thông tin tài chính & Chuyên khoa */}
                        <div className="flex-1 space-y-2">
                            <div>
                                <p className="text-sm font-semibold">Chuyên Khoa:</p>
                                <p className="text-lg font-bold text-indigo-600">
                                    {specialtyMap.get(viewingDoctor.specialty_id?._id || viewingDoctor.specialty_id) || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Phí Khám:</p>
                                <p className="text-lg font-bold">
                                    {viewingDoctor.consultation_fee?.toLocaleString('vi-VN') || 0} VNĐ
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Trạng Thái:</p>
                                <StatusBadge status={viewingDoctor.status} />
                            </div>
                        </div>
                    </div>

                    {/* === Hàng 2: Thông tin cá nhân (Giới tính, Ngày sinh, SĐT, Email) === */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-semibold">Giới Tính:</p>
                            <p>{getGenderVietnamese(viewingDoctor.gender)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Ngày Sinh:</p>
                            <p>{formatDOB(viewingDoctor.dob)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold">SĐT:</p>
                            <p>{viewingDoctor.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Email:</p>
                            <p>{viewingDoctor.email || 'N/A'}</p> 
                        </div>
                    </div>
                    
                    {/* === Hàng 3: Địa chỉ === */}
                    <div className="border-t pt-3 mt-4">
                        <p className="text-sm font-semibold">Địa Chỉ Phòng Khám:</p>
                        <p>{viewingDoctor.address || 'N/A'}</p>
                    </div>

                    {/* === Hàng 4: Giới thiệu === */}
                    <div className="border-t pt-3 mt-4">
                        <p className="text-sm font-semibold">Giới Thiệu Ngắn (Cho Bệnh Nhân):</p>
                        <p className="italic bg-gray-100 p-3 rounded-md min-h-[50px]">
                            {viewingDoctor.introduction || 'Bác sĩ chưa có phần giới thiệu.'}
                        </p>
                    </div>

                    {/* === Hàng 5: Ghi chú nội bộ (Chỉ Admin/Nội bộ thấy) === */}
                    <div className="border-t pt-3 mt-4">
                        <p className="text-sm font-semibold text-red-700">Ghi Chú Nội Bộ (Admin Only):</p>
                        <p className="bg-yellow-50 text-sm p-3 rounded-md min-h-[50px] border border-yellow-200">
                            {viewingDoctor.note || 'Không có ghi chú nội bộ.'}
                        </p>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default DoctorViewModal;