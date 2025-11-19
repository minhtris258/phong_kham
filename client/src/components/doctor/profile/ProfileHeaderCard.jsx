// src/components/doctor/profile/ProfileHeaderCard.jsx
import React from 'react';
import { MapPin } from 'lucide-react';

export default function ProfileHeaderCard({ doctor, specialtyName, onEditClick }) {
    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 relative">
                {/* Avatar */}
                <div className="absolute -bottom-16 left-8">
                    <div className="w-32 h-32 bg-white rounded-full border-8 border-white shadow-xl flex items-center justify-center text-5xl font-bold text-blue-600">
                        {doctor.fullName.charAt(0)}
                    </div>
                </div>
            </div>

            <div className="pt-20 px-8 pb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">{doctor.fullName}</h2>
                        <p className="text-xl text-blue-600 font-medium mt-1">{specialtyName}</p>
                        <p className="text-gray-600 mt-1 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            {doctor.address}
                        </p>
                    </div>
                    {/* Nút Chỉnh sửa */}
                    <button onClick={onEditClick} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-md">
                        Chỉnh sửa hồ sơ
                    </button>
                </div>
            </div>
        </div>
    );
}