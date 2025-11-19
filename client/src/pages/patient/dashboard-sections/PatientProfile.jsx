// src/pages/public/patient/PatientProfileContent.jsx
import React from 'react';
import { User, Edit3, CreditCard } from 'lucide-react'; // Đảm bảo CreditCard được import
import { initialMockPatients } from '../../../mocks/mockdata.js';
import ProfileCard from '../../../components/patient/profile/ProfileCard.jsx';
import EditButton from '../../../components/patient/profile/EditButton.jsx';


export default function PatientProfileContent() {
    // === LOGIC DỮ LIỆU ĐÃ ĐƯỢC CHUYỂN VÀO TRONG FUNCTION ===
    const currentPatient = initialMockPatients.find(p => p.user_id === '60c72aa0c5c9b100078f46a4');

    // Fallback nếu không tìm thấy
    if (!currentPatient) {
        console.error("Patient data not found.");
        // Hiển thị trạng thái lỗi hoặc loading
        return <div className="text-center py-10 text-xl font-medium text-gray-700">Không tìm thấy hồ sơ bệnh nhân hoặc dữ liệu đang tải.</div>;
    }
    // === KẾT THÚC LOGIC DỮ LIỆU ===
    
    // Hàm giả lập mở Modal Edit Profile
    const handleEditClick = () => {
        alert('Mở Modal chỉnh sửa hồ sơ.');
    };
    
    // Hàm chuyển đổi giới tính
    const getGenderVietnamese = (gender) => gender === 'male' ? 'Nam' : 'Nữ';

    // === Phần Hiển thị Thông tin cơ bản ===
    const BasicInfo = (
        <>
            <div>
                <p className="text-gray-500 mb-1">Họ và tên</p>
                <p className="font-semibold text-gray-900">{currentPatient.fullName}</p>
            </div>
            <div>
                <p className="text-gray-500 mb-1">Điện thoại</p>
                <p className="font-semibold text-gray-900">{currentPatient.phone}</p>
            </div>
            <div>
                <p className="text-gray-500 mb-1">Ngày sinh</p>
                <p className="font-semibold text-gray-900">
                    {new Date(currentPatient.dob).toLocaleDateString('vi-VN')}
                </p>
            </div>
            <div>
                <p className="text-gray-500 mb-1">Giới tính</p>
                <p className="font-semibold text-gray-900">
                    {getGenderVietnamese(currentPatient.gender)}
                </p>
            </div>
            <div className="md:col-span-2">
                <p className="text-gray-500 mb-1">Địa chỉ</p>
                <p className="font-semibold text-gray-900">{currentPatient.address}</p>
            </div>
        </>
    );

    // === Phần Hiển thị Thông tin bổ sung ===
    const AdditionalInfo = (
        <>
            <div><p className="text-gray-500 mb-1">Mã BHYT</p><p className="text-gray-600">—</p></div>
            <div><p className="text-gray-500 mb-1">Số CMND/CCCD</p><p className="text-gray-600">—</p></div>
            <div><p className="text-gray-500 mb-1">Dân tộc</p><p className="text-gray-600">—</p></div>
            <div><p className="text-gray-500 mb-1">Nghề nghiệp</p><p className="text-gray-600">—</p></div>
            <div className="md:col-span-2">
                <p className="text-gray-500 mb-1">Email</p>
                <p className="font-semibold text-gray-900">{currentPatient.email}</p>
            </div>
        </>
    );


    return (
        <div className="space-y-8">
            
            {/* 1. Thông tin cơ bản */}
            <ProfileCard title="Thông tin cơ bản" icon={User} isMain>
                {BasicInfo}
            </ProfileCard>

            {/* 2. Thông tin bổ sung */}
            <ProfileCard title="Thông tin bổ sung" icon={CreditCard}> 
                {AdditionalInfo}
            </ProfileCard>

            {/* 3. Nút sửa */}
            <EditButton onClick={handleEditClick} />

        </div>
    );
}