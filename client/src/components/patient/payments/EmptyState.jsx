// src/components/patient/payments/EmptyState.jsx
import React from 'react';
import { Receipt } from 'lucide-react';

export default function EmptyState() {
    return (
        <div className="text-center py-16 text-gray-500">
            <Receipt className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <p className="text-xl">Chưa có giao dịch nào</p>
        </div>
    );
}