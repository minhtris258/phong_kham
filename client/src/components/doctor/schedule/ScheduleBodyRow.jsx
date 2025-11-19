import React from 'react';
import { format } from 'date-fns';

// Map trạng thái lịch hẹn sang màu sắc
const getSlotStyle = (status) => {
    switch (status) {
        case 'available': return 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer';
        case 'confirmed': 
        case 'pending': 
        case 'completed': 
            return 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer'; 
        default: return '';
    }
};

export default function ScheduleBodyRow({ time, weekDays, getSlotsForDay }) {
    
    // Giả lập hành động click để xem chi tiết hoặc thêm lịch
    const handleSlotClick = (slot, day) => {
        if (slot.status === 'available') {
             alert(`Thêm lịch hẹn riêng vào lúc ${slot.time} ngày ${format(day, 'dd/MM/yyyy')}`);
        } else {
             alert(`Chi tiết lịch hẹn #${slot.apptId} của: ${slot.patient} vào lúc ${slot.time}`);
        }
    }
    
    return (
        <tr className="hover:bg-gray-50 transition">
            {/* Cột thời gian (Sticky) */}
            <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-700 border-r">
                {time}
            </td>
            {/* Các cột ngày */}
            {weekDays.map(day => {
                const { slots, isOff } = getSlotsForDay(day);
                const slot = slots.find(s => s.time === time);

                // Nội dung hiển thị trong ô
                let content;
                if (isOff) {
                    content = <span className="text-red-600 text-sm font-medium">Nghỉ</span>;
                } else if (slot) {
                    const status = slot.status;
                    const style = getSlotStyle(status);

                    content = (
                        <div 
                            className={`px-2 py-2 rounded-lg text-sm font-medium inline-block min-w-28 shadow-sm ${style}`}
                            onClick={() => handleSlotClick(slot, day)}
                        >
                            {status === 'available' ? 'Trống' : slot.patient}
                            {status !== 'available' && <div className="text-xs mt-1 opacity-80">
                                {status === 'confirmed' ? 'Xác nhận' : 'Đã đặt'}
                            </div>}
                        </div>
                    );
                } else {
                    // Không có slot (ngoài giờ làm việc cố định)
                    content = null; 
                }

                return (
                    <td key={day.toISOString()} className="px-4 py-4 text-center h-full">
                        {content}
                    </td>
                );
            })}
        </tr>
    );
}