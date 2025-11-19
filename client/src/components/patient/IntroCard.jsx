// src/components/patient/IntroCard.jsx
import React from 'react';

export default function IntroCard({ doctor, specialty, experienceYears }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold mb-6">Giới thiệu</h2>
            <p className="text-gray-700 leading-relaxed text-lg">
                Bác sĩ {doctor.fullName} là chuyên gia đầu ngành về {specialty?.name} với hơn {experienceYears} năm kinh nghiệm tại Bệnh viện Chợ Rẫy. Bác sĩ đã có nhiều đóng góp quan trọng trong các công trình nghiên cứu về {specialty?.name.toLowerCase()} và được bệnh nhân đánh giá cao về sự tận tâm và chuyên môn vững vàng.
            </p>
        </div>
    );
}