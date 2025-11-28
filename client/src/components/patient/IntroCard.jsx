// src/components/patient/IntroCard.jsx
import React from 'react';

export default function IntroCard({ doctor, specialty, experienceYears }) {
    const expText = experienceYears > 0 
        ? `với hơn ${experienceYears} năm kinh nghiệm`
        : "là bác sĩ chuyên khoa giàu nhiệt huyết";

    return (
        <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-8">
            <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6">Giới thiệu</h2>
            <div className="text-gray-700 leading-relaxed text-base md:text-lg space-y-3 md:space-y-4">
                <p>
                    Bác sĩ <strong>{doctor.fullName}</strong> là chuyên gia {specialty?.name ? `về ${specialty.name}` : ''} {expText}. 
                    Bác sĩ được bệnh nhân đánh giá cao về sự tận tâm, chuyên môn vững vàng và luôn lắng nghe người bệnh.
                </p>
                
                {/* Hiển thị phần giới thiệu riêng nếu bác sĩ có nhập */}
                {doctor.introduction && (
                    <div className="italic border-l-4 border-[#00B5F1] pl-3 md:pl-4 py-2 bg-gray-50 rounded-r text-sm md:text-base text-gray-600">
                        "{doctor.introduction}"
                    </div>
                )}
                
                {/* Hiển thị nơi công tác nếu có */}
                {doctor.address && (
                    <p>
                        Hiện tại, bác sĩ đang công tác và tiếp nhận khám chữa bệnh tại: <strong>{doctor.address}</strong>.
                    </p>
                )}
            </div>
        </div>
    );
}