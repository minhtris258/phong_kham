// src/components/patient/profile/ProfileCard.jsx
import React from 'react';
import { User } from 'lucide-react';

export default function ProfileCard({ title, children, icon: Icon, isMain = false }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                {Icon && <Icon className={`w-7 h-7 ${isMain ? 'text-blue-600' : 'text-gray-500'}`} />}
                {title}
            </h2>
            <div className="grid md:grid-cols-2 gap-8 text-lg">
                {children}
            </div>
        </div>
    );
}