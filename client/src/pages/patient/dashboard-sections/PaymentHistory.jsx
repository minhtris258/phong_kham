// src/pages/public/patient/PaymentHistoryContent.jsx
import React from 'react';
import PaymentTable from '../../../components/patient/payments/PaymentTable.jsx'; // Giả định đường dẫn
import EmptyState from '../../../components/patient/payments/EmptyState.jsx'; // Giả định đường dẫn

const mockPayments = [
  { id: 'PAY001', date: '2025-04-15', amount: 250000, doctor: 'BS. Lê Thị Mai', service: 'Khám nội tổng quát' },
  { id: 'PAY002', date: '2025-03-20', amount: 300000, doctor: 'BS. Nguyễn Văn Hùng', service: 'Khám răng hàm mặt' },
];

export default function PaymentHistoryContent() {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {mockPayments.length > 0 ? (
        <PaymentTable payments={mockPayments} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}