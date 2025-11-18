import React from 'react';

export default function ScheduleLegend() {
    return (
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-400 rounded"></div>
                <span>Trống (Thêm lịch)</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-400 rounded"></div>
                <span>Đã đặt / Đã khám</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-400 rounded"></div>
                <span>Nghỉ / Báo bận</span>
            </div>
        </div>
    );
}