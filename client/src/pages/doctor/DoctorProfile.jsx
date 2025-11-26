// src/pages/doctor/DoctorProfile.jsx (Đã sửa)

import React, { useState } from 'react';
import { initialMockDoctors, initialMockUsers, mockSpecialties } from '../../mocks/mockdata';
import EditDoctorProfileModal from '../../components/doctor/EditDoctorProfileModal';
import ProfileHeaderCard from '../../components/doctor/profile/ProfileHeaderCard';
import ContactInfo from '../../components/doctor/profile/ContactInfo';
import ExpertiseInfo from '../../components/doctor/profile/ExpertiseInfo';

export default function DoctorProfile() {
    // === LOGIC DỮ LIỆU CHUYỂN VÀO TRONG FUNCTION ===
    const currentUserId = '60c72aa0c5c9b100078f46a2';
    const doctor = initialMockDoctors.find(d => d.user_id === currentUserId);
    const user = initialMockUsers.find(u => u.id === currentUserId);
    const specialty = mockSpecialties.find(s => s.id === doctor?.specialty_id);

    // 1. FALLBACK/KIỂM TRA LỖI PHẢI NẰM SAU DỮ LIỆU
    if (!doctor || !user) {
        return <div className="text-center py-10 text-xl font-medium">Không tìm thấy hồ sơ bác sĩ.</div>;
    }
    // === KẾT THÚC LOGIC DỮ LIỆU ===
    
    // Khởi tạo state và tính toán sau khi xác nhận dữ liệu tồn tại
    const initialData = {
        ...doctor,
        name: user.name,
        email: user.email,
        specialtyName: specialty?.name || 'N/A',
    };

    const [doctorData, setDoctorData] = useState(initialData);
    const [openEdit, setOpenEdit] = useState(false);
    
    // Tính toán kinh nghiệm
    const experience = new Date().getFullYear() - new Date(doctorData.dob).getFullYear();

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 mt-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Hồ sơ cá nhân</h1>

            <ProfileHeaderCard 
                doctor={doctorData}
                specialtyName={doctorData.specialtyName}
                onEditClick={() => setOpenEdit(true)}
            />

            <div className="bg-white rounded-2xl shadow-lg mt-4">
                <div className="pt-2 px-8 pb-8">
                    <div className="grid md:grid-cols-2 gap-8 mt-8">
                        <ContactInfo 
                            phone={doctorData.phone}
                            email={doctorData.email}
                        />
                        
                        <ExpertiseInfo 
                            experience={experience}
                            consultationFee={doctorData.consultation_fee}
                        />
                    </div>
                </div>
            </div>

            {openEdit && (
                <EditDoctorProfileModal 
                    doctor={doctorData} 
                    setDoctor={setDoctorData} 
                    onClose={() => setOpenEdit(false)} 
                />
            )}
        </div>
    );
}