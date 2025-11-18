// src/components/patient/appointments/StatusBadge.jsx
import React from 'react';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
    switch (status) {
        case 'completed': return <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-medium"><CheckCircle className="w-4 h-4" /> Đã khám</span>;
        case 'confirmed': return <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-100 px-3 py-1 rounded-full text-sm font-medium"><Calendar className="w-4 h-4" /> Đã xác nhận</span>;
        case 'pending': return <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-100 px-3 py-1 rounded-full text-sm font-medium"><Clock className="w-4 h-4" /> Chờ xác nhận</span>;
        case 'cancelled': return <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm font-medium"><XCircle className="w-4 h-4" /> Đã hủy</span>;
        default: return null;
    }
}