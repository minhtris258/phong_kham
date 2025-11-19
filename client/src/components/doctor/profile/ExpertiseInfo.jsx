// src/components/doctor/profile/ExpertiseInfo.jsx
import React from 'react';
import { Stethoscope } from 'lucide-react';

export default function ExpertiseInfo({ experience, consultationFee }) {
    return (
        <div>
            <h3 className="font-semibold text-gray-700 mb-4">Chuyên môn</h3>
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Stethoscope className="w-6 h-6 text-green-600" />
                    <span className="text-2xl font-bold text-blue-600">{experience} năm kinh nghiệm</span>
                </div>
                <div>
                    <p className="text-lg font-medium text-gray-700">Phí khám</p>
                    <p className="text-3xl font-bold text-green-600">
                        {consultationFee.toLocaleString('vi-VN')}₫
                    </p>
                </div>
            </div>
        </div>
    );
}