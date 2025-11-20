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

    return (
        <Modal
            title={`Chi Tiết Bác Sĩ: ${viewingDoctor?.fullName || ''}`}
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-xl"
        >
            {viewingDoctor && (
                <div className="space-y-4 text-gray-700">
                    <div className="grid grid-cols-2 gap-4 border-b pb-3">
                        <div>
                            <p className="text-sm font-semibold">Chuyên Khoa:</p>
                            <p className="text-md font-medium text-indigo-600">
                                {specialtyMap.get(viewingDoctor.specialty_id) || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Phí Khám:</p>
                            <p className="text-md font-medium">
                                {viewingDoctor.consultation_fee.toLocaleString('vi-VN')} VNĐ
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-semibold">Giới Tính:</p>
                            <p>{getGenderVietnamese(viewingDoctor.gender)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Ngày Sinh:</p>
                            <p>{viewingDoctor.dob}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-semibold">SĐT:</p>
                            <p>{viewingDoctor.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Email:</p>
                            <p>{viewingDoctor.email}</p>
                        </div>
                    </div>
                    <div className="border-t pt-3 mt-4">
                        <p className="text-sm font-semibold">Địa Chỉ:</p>
                        <p>{viewingDoctor.address}</p>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-semibold">Trạng Thái:</p>
                        <StatusBadge status={viewingDoctor.status} />
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default DoctorViewModal;