// src/components/patient/payments/PaymentRow.jsx
import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function PaymentRow({ payment }) {
    const { id, date, amount, doctor, service } = payment;

    return (
        <tr className="hover:bg-gray-50 transition">
            <td className="px-6 py-5 font-medium">#{id}</td>
            <td className="px-6 py-5">{new Date(date).toLocaleDateString('vi-VN')}</td>
            <td className="px-6 py-5">{service}</td>
            <td className="px-6 py-5 text-blue-600 font-medium">{doctor}</td>
            <td className="px-6 py-5 font-semibold text-gray-900">{amount.toLocaleString('vi-VN')}₫</td>
            <td className="px-6 py-5">
                <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
                    <CheckCircle className="w-4 h-4" /> Hoàn tất
                </span>
            </td>
        </tr>
    );
}