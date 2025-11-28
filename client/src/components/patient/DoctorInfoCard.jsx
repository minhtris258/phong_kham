// src/components/patient/DoctorInfoCard.jsx
import React from 'react';
import { Heart, MapPin, Phone } from 'lucide-react';

export default function DoctorInfoCard({ doctor, specialty, experienceYears }) {
    const [liked, setLiked] = React.useState(false);

    // Xử lý ảnh: dùng field 'thumbnail' từ JSON
    const avatarUrl = doctor.thumbnail || `https://i.pravatar.cc/340?u=${doctor.email}`;

    return (
        <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                
                {/* Avatar Section */}
                <div className="flex-shrink-0">
                    <img
                        src={avatarUrl}
                        alt={doctor.fullName}
                        className="w-32 h-32 md:w-56 md:h-56 rounded-full object-cover border-4 border-gray-200 shadow-xl mx-auto"
                    />
                </div>

                {/* Info Section */}
                <div className="flex-1 text-center md:text-left w-full">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-4 md:mb-4 relative">
                        <div className="w-full">
                            {/* Tên bác sĩ */}
                            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mt-2 md:mt-0">
                                Bác sĩ {doctor.fullName}
                            </h1>
                            
                            {/* Badges: Chuyên khoa & Kinh nghiệm */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 mt-3">
                                <span className="bg-[#E0F2FE] text-[#00B5F1] px-3 py-1 md:px-4 md:py-2 rounded-full font-semibold text-sm md:text-base">
                                    {specialty?.name}
                                </span>
                                <span className="text-sm md:text-lg text-gray-600 font-medium bg-gray-100 px-3 py-1 md:bg-transparent md:p-0 rounded-full">
                                    ~{experienceYears} năm kinh nghiệm
                                </span>
                            </div>
                        </div>

                        {/* Nút yêu thích - Trên mobile đặt góc phải trên hoặc inline */}
                        <button
                            onClick={() => setLiked(!liked)}
                            className="absolute top-0 right-0 md:static p-2 md:p-3 hover:bg-gray-100 rounded-full transition mt-0 md:mt-2"
                        >
                            <Heart className={`w-6 h-6 md:w-8 md:h-8 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                        </button>
                    </div>

                    {/* Chi tiết giới thiệu */}
                    <div className="mt-4 md:mt-8 space-y-2 md:space-y-4 text-gray-700 text-base md:text-lg">
                        <div className="hidden md:block"><strong>Chuyên khoa:</strong> {specialty?.name}</div>
                        <div className="text-sm md:text-lg">
                            <span className="font-semibold md:hidden">Giới thiệu: </span>
                            {doctor.introduction || "Bác sĩ chuyên khoa giàu kinh nghiệm, tận tâm với nghề."}
                        </div>
                    </div>

                    {/* Thông tin liên hệ (Địa chỉ & Phone) */}
                    <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-6 justify-center md:justify-start text-gray-600 text-sm md:text-lg">
                        <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3">
                            <MapPin className="w-5 h-5 md:w-6 md:h-6 text-[#00B5F1] flex-shrink-0" />
                            <span className="text-left">{doctor.address || "Chưa cập nhật"}</span>
                        </div>
                        {/* Ẩn số điện thoại trên mobile nếu quá dài, hoặc giữ nguyên */}
                        <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3">
                            <Phone className="w-5 h-5 md:w-6 md:h-6 text-[#00B5F1] flex-shrink-0" />
                            <span>{doctor.phone || "Liên hệ CSKH"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}