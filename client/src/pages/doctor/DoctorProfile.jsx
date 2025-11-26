// src/pages/doctor/DoctorProfile.jsx
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import doctorService from '../../services/DoctorService';
import EditDoctorProfileModal from '../../components/doctor/EditDoctorProfileModal';
import ProfileHeaderCard from '../../components/doctor/profile/ProfileHeaderCard';
import ContactInfo from '../../components/doctor/profile/ContactInfo';
import ExpertiseInfo from '../../components/doctor/profile/ExpertiseInfo';

export default function DoctorProfile() {
    const [doctorData, setDoctorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openEdit, setOpenEdit] = useState(false);

    useEffect(() => {
        fetchDoctorProfile();
    }, []);

    const fetchDoctorProfile = async () => {
        try {
            setLoading(true);
            const data = await doctorService.getMe();
            
            const profile = data.profile || data; 
            
            if (!profile) throw new Error("Không tìm thấy profile");

            // --- XỬ LÝ ẢNH (QUAN TRỌNG) ---
            let avatarUrl = 'https://via.placeholder.com/150';
            const rawImage = profile.thumbnail || profile.image;

            if (rawImage) {
                // Nếu là link online hoặc đã có header base64 -> dùng luôn
                if (rawImage.startsWith('http') || rawImage.startsWith('data:')) {
                    avatarUrl = rawImage;
                } 
                // Nếu là chuỗi Base64 thô -> Thêm header vào
                else {
                    avatarUrl = `data:image/jpeg;base64,${rawImage}`;
                }
            }
            // -------------------------------

            setDoctorData({
                ...profile,
                name: profile.fullName, 
                specialtyName: profile.specialty_id?.name || 'Chưa cập nhật',
                // Lưu ảnh đã xử lý vào cả 2 trường để tránh lỗi khi gọi
                image: avatarUrl, 
                thumbnail: avatarUrl 
            });

        } catch (error) {
            console.error("Lỗi tải hồ sơ:", error);
            if (typeof toast !== 'undefined' && toast.error) {
                toast.error("Không thể tải thông tin hồ sơ");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSuccess = (updatedData) => {
        setDoctorData(prev => ({ ...prev, ...updatedData }));
        setOpenEdit(false);
        fetchDoctorProfile(); 
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-blue-600">
                <Loader2 className="w-10 h-10 animate-spin" />
            </div>
        );
    }

    if (!doctorData) {
        return <div className="text-center py-10 text-xl font-medium text-red-500">Không tìm thấy hồ sơ bác sĩ.</div>;
    }

    const experience = doctorData.dob 
        ? new Date().getFullYear() - new Date(doctorData.dob).getFullYear() 
        : 0;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Hồ sơ cá nhân</h1>

            {/* SỬA LỖI Ở ĐÂY: Chỉ dùng doctorData.image (đã được xử lý ở trên) */}
            <ProfileHeaderCard 
                doctor={doctorData}
                avatar={doctorData.thumbnail} 
                specialtyName={doctorData.specialtyName}
                onEditClick={() => setOpenEdit(true)}
            />

            <div className="bg-white rounded-2xl shadow-lg mt-4">
                <div className="pt-2 px-8 pb-8">
                    <div className="grid md:grid-cols-2 gap-8 mt-8">
                        <ContactInfo 
                            phone={doctorData.phone}
                            email={doctorData.email}
                            address={doctorData.address}
                        />
                        
                        <ExpertiseInfo 
                            experience={experience}
                            consultationFee={doctorData.consultation_fee}
                            introduction={doctorData.introduction}
                        />
                    </div>
                </div>
            </div>

            {openEdit && (
                <EditDoctorProfileModal 
                    doctor={doctorData} 
                    onSuccess={handleUpdateSuccess} 
                    onClose={() => setOpenEdit(false)} 
                />
            )}
        </div>
    );
}