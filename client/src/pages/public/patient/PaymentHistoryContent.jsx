// src/pages/public/patient/PaymentHistoryContent.jsx
import React from 'react';
import { Receipt, CheckCircle } from 'lucide-react';

const mockPayments = [
  { id: 'PAY001', date: '2025-04-15', amount: 250000, doctor: 'BS. Lê Thị Mai', service: 'Khám nội tổng quát' },
  { id: 'PAY002', date: '2025-03-20', amount: 300000, doctor: 'BS. Nguyễn Văn Hùng', service: 'Khám răng hàm mặt' },
];

export default function PaymentHistoryContent() {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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
            {mockPayments.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-5 font-medium">#{p.id}</td>
                <td className="px-6 py-5">{new Date(p.date).toLocaleDateString('vi-VN')}</td>
                <td className="px-6 py-5">{p.service}</td>
                <td className="px-6 py-5 text-blue-600 font-medium">{p.doctor}</td>
                <td className="px-6 py-5 font-semibold text-gray-900">{p.amount.toLocaleString('vi-VN')}₫</td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
                    <CheckCircle className="w-4 h-4" /> Hoàn tất
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mockPayments.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Receipt className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <p className="text-xl">Chưa có giao dịch nào</p>
        </div>
      )}
    </div>
  );
}