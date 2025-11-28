// src/components/doctor/profile/ExpertiseInfo.jsx
import React from 'react';
import { Stethoscope, Briefcase } from 'lucide-react';

export default function ExpertiseInfo({ experience, consultationFee, careerStart }) {
    return (
        <div>
            <h3 className="font-semibold text-gray-700 mb-4">Chuyên môn & Chi phí</h3>
            <div className="space-y-6">
                {/* Kinh nghiệm */}
                <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <Briefcase className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Kinh nghiệm</p>
                        <p className="text-xl font-bold text-gray-900">{experience} năm</p>
                        {careerStart && (
                            <p className="text-sm text-gray-500">Bắt đầu hành nghề từ năm {careerStart}</p>
                        )}
                    </div>
                </div>

                {/* Phí khám */}
                <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                        <Stethoscope className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Phí tư vấn / lượt</p>
                        <p className="text-2xl font-bold text-green-600">
                            {consultationFee?.toLocaleString('vi-VN')} đ
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}