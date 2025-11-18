// src/components/patient/profile/EditButton.jsx
import React from 'react';
import { Edit3 } from 'lucide-react';

export default function EditButton({ onClick }) {
    return (
        <div className="text-right">
            <button 
                onClick={onClick}
                className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 transition shadow-lg text-lg"
            >
                <Edit3 className="w-5 h-5" />
                Thay đổi thông tin
            </button>
        </div>
    );
}