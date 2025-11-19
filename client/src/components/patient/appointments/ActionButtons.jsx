// src/components/patient/appointments/ActionButtons.jsx
import React from 'react';

export default function ActionButtons({ status }) {
    // NOTE: Các hành động onClick sẽ cần được truyền từ component cha trong ứng dụng thực tế
    return (
        <div className="flex flex-col gap-3">
            {status === 'pending' && (
                <button className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                    Hủy lịch
                </button>
            )}
            {status === 'confirmed' && (
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Xem chi tiết
                </button>
            )}
            {status === 'completed' && (
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Xem kết quả
                </button>
            )}
            {/* Bạn có thể thêm nút Đánh giá/Đặt lại nếu cần */}
        </div>
    );
}