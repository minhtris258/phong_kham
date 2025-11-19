// src/components/doctor/settings/NotificationToggle.jsx
import React from 'react';

export default function NotificationToggle({ label, isChecked = true }) {
    // Trong ứng dụng thật, isChecked sẽ là giá trị state
    return (
        <label className="flex items-center justify-between cursor-pointer">
            <span className="font-medium">{label}</span>
            <input 
                type="checkbox" 
                defaultChecked={isChecked} 
                className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500" 
            />
        </label>
    );
}