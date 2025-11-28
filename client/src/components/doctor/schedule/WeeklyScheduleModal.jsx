import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { toastSuccess, toastError,toastWarning,toastInfo } from "../../../utils/toast";
import doctorSchedulesService from '../../../services/DoctorScheduleService';

const DAYS = [
    { key: 'Monday', label: 'Thứ Hai' },
    { key: 'Tuesday', label: 'Thứ Ba' },
    { key: 'Wednesday', label: 'Thứ Tư' },
    { key: 'Thursday', label: 'Thứ Năm' },
    { key: 'Friday', label: 'Thứ Sáu' },
    { key: 'Saturday', label: 'Thứ Bảy' },
    { key: 'Sunday', label: 'Chủ Nhật' },
];

export default function WeeklyScheduleModal({ isOpen, onClose, currentSchedule, onSaveSuccess }) {
    const [schedule, setSchedule] = useState([]);
    const [slotMinutes, setSlotMinutes] = useState(30);

    // Khởi tạo dữ liệu khi mở Modal
    useEffect(() => {
        if (isOpen) {
            setSlotMinutes(currentSchedule?.slot_minutes || 30);
            
            // Map dữ liệu hiện tại vào state, nếu chưa có thì tạo mảng rỗng
            const existing = currentSchedule?.weekly_schedule || [];
            const mapped = DAYS.map(d => {
                const dayData = existing.find(e => e.dayOfWeek === d.key);
                return {
                    day: d.key,
                    active: !!dayData,
                    timeRanges: dayData?.timeRanges?.length > 0 ? dayData.timeRanges : [{ start: '08:00', end: '17:00' }]
                };
            });
            setSchedule(mapped);
        }
    }, [isOpen, currentSchedule]);

    const handleToggleDay = (index) => {
        const newSchedule = [...schedule];
        newSchedule[index].active = !newSchedule[index].active;
        setSchedule(newSchedule);
    };

    const handleTimeChange = (dayIndex, rangeIndex, field, value) => {
        const newSchedule = [...schedule];
        newSchedule[dayIndex].timeRanges[rangeIndex][field] = value;
        setSchedule(newSchedule);
    };

    const addRange = (dayIndex) => {
        const newSchedule = [...schedule];
        newSchedule[dayIndex].timeRanges.push({ start: '18:00', end: '20:00' });
        setSchedule(newSchedule);
    };

    const removeRange = (dayIndex, rangeIndex) => {
        const newSchedule = [...schedule];
        newSchedule[dayIndex].timeRanges.splice(rangeIndex, 1);
        setSchedule(newSchedule);
    };

    const handleSubmit = async () => {
        try {
            // Convert state về format server cần
            const weekly_schedule = schedule
                .filter(s => s.active)
                .map(s => ({
                    dayOfWeek: s.day,
                    timeRanges: s.timeRanges
                }));

            const payload = {
                slot_minutes: parseInt(slotMinutes),
                weekly_schedule,
                // Giữ nguyên exceptions cũ nếu API yêu cầu gửi full, 
                // nhưng API upsertMySchedule của bạn cho phép gửi từng phần (check controller)
                // Tuy nhiên controller dùng $set cho từng field nên gửi thiếu field khác ko sao.
            };

            await doctorSchedulesService.upsertMySchedule(payload);
            toastSuccess("Đã lưu lịch cố định!");
            onSaveSuccess(); // Refresh data ngoài
            onClose();
        } catch (error) {
            console.error(error);
            toastError("Lỗi khi lưu lịch");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Cấu hình lịch mặc định</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Cấu hình Slot */}
                    <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-lg">
                        <label className="font-medium text-blue-800">Thời gian mỗi ca khám (phút):</label>
                        <select 
                            value={slotMinutes} 
                            onChange={(e) => setSlotMinutes(e.target.value)}
                            className="border-blue-200 border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="15">15 phút</option>
                            <option value="20">20 phút</option>
                            <option value="30">30 phút</option>
                            <option value="45">45 phút</option>
                            <option value="60">60 phút</option>
                        </select>
                    </div>

                    {/* Danh sách ngày */}
                    <div className="space-y-4">
                        {schedule.map((item, dIndex) => (
                            <div key={item.day} className={`border rounded-lg p-4 transition-colors ${item.active ? 'border-indigo-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="checkbox" 
                                            checked={item.active} 
                                            onChange={() => handleToggleDay(dIndex)}
                                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                        />
                                        <span className="font-semibold text-gray-700">{DAYS[dIndex].label}</span>
                                    </div>
                                    {item.active && (
                                        <button onClick={() => addRange(dIndex)} className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium">
                                            <Plus size={14} /> Thêm khung giờ
                                        </button>
                                    )}
                                </div>

                                {item.active && (
                                    <div className="space-y-2 pl-8">
                                        {item.timeRanges.map((range, rIndex) => (
                                            <div key={rIndex} className="flex items-center gap-3">
                                                <input 
                                                    type="time" 
                                                    value={range.start}
                                                    onChange={(e) => handleTimeChange(dIndex, rIndex, 'start', e.target.value)}
                                                    className="border rounded px-2 py-1 text-sm"
                                                />
                                                <span className="text-gray-400">-</span>
                                                <input 
                                                    type="time" 
                                                    value={range.end}
                                                    onChange={(e) => handleTimeChange(dIndex, rIndex, 'end', e.target.value)}
                                                    className="border rounded px-2 py-1 text-sm"
                                                />
                                                {item.timeRanges.length > 1 && (
                                                    <button onClick={() => removeRange(dIndex, rIndex)} className="text-red-400 hover:text-red-600">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">Hủy</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                        <Save size={18} /> Lưu cấu hình
                    </button>
                </div>
            </div>
        </div>
    );
}