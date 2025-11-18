// src/components/doctor/settings/SettingsCard.jsx
import React from 'react';

// Nhận icon, title và nội dung con
export default function SettingsCard({ title, icon: Icon, iconColorClass = 'text-blue-600', children }) {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Icon className={`w-6 h-6 ${iconColorClass}`} />
                {title}
            </h2>
            <div className="space-y-5">
                {children}
            </div>
        </div>
    );
}