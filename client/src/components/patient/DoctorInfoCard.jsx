// src/components/patient/DoctorInfoCard.jsx
import React from 'react';
import { Heart, MapPin, Phone, Award, Stethoscope } from 'lucide-react';

export default function DoctorInfoCard({ doctor, specialty, experienceYears }) {
    const [liked, setLiked] = React.useState(false);

    // Xử lý ảnh đại diện
    const avatarUrl = doctor.thumbnail || `https://i.pravatar.cc/340?u=${doctor.email}`;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
            
            {/* Nút yêu thích (Tuyệt đối góc phải) */}
            <button
                onClick={() => setLiked(!liked)}
                className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition z-10"
                title="Lưu bác sĩ"
            >
                <Heart 
                    className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                />
            </button>

            {/* 1. HEADER: Avatar & Tên (Căn giữa vì cột hẹp) */}
            <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                    <img
                        src={avatarUrl}
                        alt={doctor.fullName}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    {/* Badge trạng thái (Optional) */}
                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>

                <h1 className="text-xl font-bold text-gray-900 mb-1">
                    Bs. {doctor.fullName}
                </h1>
                
                <div className="text-[#00B5F1] font-medium bg-blue-50 px-3 py-1 rounded-full text-sm inline-block mb-4">
                    {specialty?.name}
                </div>
            </div>

            {/* Đường kẻ chia cách */}
            <hr className="border-gray-100 my-4" />

            {/* 2. BODY: Thông tin chi tiết (Căn trái để dễ đọc) */}
            <div className="space-y-4">
                
                {/* Kinh nghiệm */}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg shrink-0">
                        <Award className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Kinh nghiệm</p>
                        <p className="font-medium text-gray-900">{experienceYears} năm làm việc</p>
                    </div>
                </div>

                {/* Giới thiệu ngắn */}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                        <Stethoscope className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Giới thiệu</p>
                        <p className="text-sm text-gray-700 line-clamp-3">
                            {doctor.introduction || "Bác sĩ chuyên khoa giàu kinh nghiệm, tận tâm với nghề, luôn đặt sức khỏe bệnh nhân lên hàng đầu."}
                        </p>
                    </div>
                </div>

                {/* Địa chỉ */}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                        <MapPin className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Địa chỉ phòng khám</p>
                        <p className="text-sm text-gray-700 font-medium">
                            {doctor.address || "Chưa cập nhật"}
                        </p>
                    </div>
                </div>

                {/* Số điện thoại */}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 rounded-lg shrink-0">
                        <Phone className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Liên hệ</p>
                        <p className="text-sm text-gray-700 font-medium">
                            {doctor.phone || "Liên hệ CSKH"}
                        </p>
                    </div>
                </div>
            </div>

            {/* 3. FOOTER: Nút hành động phụ (Optional)
            <div className="mt-6 pt-4 border-t border-gray-100">
                <button className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition text-sm">
                    Xem hồ sơ chi tiết
                </button>
            </div> */}
        </div>
    );
}