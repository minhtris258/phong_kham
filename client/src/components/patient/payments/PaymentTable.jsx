// src/components/patient/payments/PaymentTable.jsx
import React from 'react';
import PaymentRow from './PaymentRow.jsx'; // Giả định đường dẫn

export default function PaymentTable({ payments }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Mã giao dịch</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ngày</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Dịch vụ</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Bác sĩ</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Số tiền</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {payments.map(p => (
                        <PaymentRow key={p.id} payment={p} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}