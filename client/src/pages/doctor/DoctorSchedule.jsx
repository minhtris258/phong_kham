// src/pages/doctor/DoctorSchedule.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
    ChevronLeft, ChevronRight, X, Plus, Trash2, 
    Calendar, AlertCircle, Loader2, Settings 
} from 'lucide-react';
import { toast } from 'react-toastify';
import doctorSchedulesService from '../../services/DoctorScheduleService';
import WeeklyScheduleModal from '../../components/doctor/schedule/WeeklyScheduleModal';

export default function DoctorSchedule() {
    const [scheduleData, setScheduleData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

    // Quản lý lịch tháng
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedDateStr, setSelectedDateStr] = useState(null);
    
    // Form dữ liệu ngoại lệ
    const [exceptionFormData, setExceptionFormData] = useState({
        isDayOff: false,
        add: [],
        removeSlot: [],
        reason: "",
    });
    
    const [tempTimeInput, setTempTimeInput] = useState({ start: "", end: "" });

    const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const dayEnMap = {
        "T2": "Monday", "T3": "Tuesday", "T4": "Wednesday", 
        "T5": "Thursday", "T6": "Friday", "T7": "Saturday", "CN": "Sunday"
    };

    // --- FETCH DATA ---
    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const res = await doctorSchedulesService.getMySchedule();
            const data = res.data || res;
            setScheduleData(data.schedule || data); 
        } catch (err) {
            console.error("Lỗi tải lịch:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    // --- LOGIC CALENDAR ---
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const startDayIndex = firstDay === 0 ? 6 : firstDay - 1;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return { startDayIndex, daysInMonth };
    };

    const { startDayIndex, daysInMonth } = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);

    const exceptionsMap = useMemo(() => {
        if (!scheduleData?.exceptions) return {};
        return scheduleData.exceptions.reduce((map, ex) => {
            map[ex.date] = ex;
            return map;
        }, {});
    }, [scheduleData]);

    const getException = (dateStr) => exceptionsMap[dateStr];

    const handleDateClick = (day) => {
        setSelectedDay(day);
        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDateStr(dateStr);

        const ex = getException(dateStr);
        setExceptionFormData({
            isDayOff: ex?.isDayOff || false,
            add: ex?.add || [],
            removeSlot: ex?.removeSlot || [],
            reason: ex?.reason || ""
        });
        setTempTimeInput({ start: "", end: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDateStr) return;

        const payload = {
            date: selectedDateStr,
            isDayOff: exceptionFormData.isDayOff,
            add: exceptionFormData.add,
            removeSlot: exceptionFormData.removeSlot,
            reason: exceptionFormData.reason
        };

        try {
            await doctorSchedulesService.upsertMyException(payload);
            toast.success("Cập nhật lịch ngày thành công!");
            fetchSchedule();
        } catch (err) {
            console.error(err);
            toast.error("Lỗi: " + (err.response?.data?.error || "Không thể lưu thay đổi"));
        }
    };

    if (loading && !scheduleData) {
        return (
            <div className="flex justify-center items-center h-screen text-indigo-600">
                <Loader2 className="w-10 h-10 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý lịch làm việc</h1>
                    <p className="text-gray-500 mt-1">Xem và điều chỉnh lịch khám của bạn</p>
                </div>
                <button 
                    onClick={() => setIsConfigModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition font-medium"
                >
                    <Settings className="w-5 h-5" />
                    Cấu hình lịch mẫu
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* CỘT 1: Lịch tháng + Lịch mẫu (ĐÃ SỬA GIAO DIỆN) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* === PHẦN ĐÃ SỬA: LỊCH CỐ ĐỊNH HÀNG TUẦN === */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-7 divide-x divide-gray-200 min-h-[250px]">
                            {daysOfWeek.map(d => {
                                const sch = scheduleData?.weekly_schedule?.find(s => s.dayOfWeek === dayEnMap[d]);
                                return (
                                    <div key={d} className="flex flex-col items-center py-6 px-2 hover:bg-gray-50 transition-colors">
                                        {/* Header Ngày (T2, T3...) */}
                                        <div className="text-xl font-bold text-indigo-600 mb-6">
                                            {d}
                                        </div>

                                        {/* Danh sách các khung giờ (Bong bóng tròn) */}
                                        {sch && sch.timeRanges.length > 0 ? (
                                            <div className="flex flex-col gap-4 w-full items-center">
                                                {sch.timeRanges.map((r, i) => (
                                                    <div 
                                                        key={i} 
                                                        className="w-20 h-20 rounded-xl bg-green-50 border border-green-100 flex flex-col items-center justify-center text-green-700 shadow-sm transition hover:scale-105"
                                                    >
                                                        <span className="font-semibold text-sm">{r.start}</span>
                                                        <span className="text-xs opacity-60">-</span>
                                                        <span className="font-semibold text-sm">{r.end}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 font-medium mt-2">Nghỉ</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* === HẾT PHẦN ĐÃ SỬA === */}

                    {/* CALENDAR VIEW */}
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <button 
                                onClick={() => {
                                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
                                    setSelectedDateStr(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <ChevronLeft className="w-6 h-6 text-gray-600" />
                            </button>
                            <h3 className="text-xl font-bold text-gray-800 capitalize flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-500 mb-1"/>
                                Tháng {currentMonth.getMonth() + 1} / {currentMonth.getFullYear()}
                            </h3>
                            <button 
                                onClick={() => {
                                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
                                    setSelectedDateStr(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <ChevronRight className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-400 mb-4 text-sm uppercase tracking-wide">
                            {daysOfWeek.map(d => <div key={d}>{d}</div>)}
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: startDayIndex }).map((_, i) => (
                                <div key={`empty-${i}`} className="h-14" />
                            ))}

                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const ex = getException(dateStr);
                                const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                const dayOfWeekEn = dateObj.toLocaleString('en-US', { weekday: 'long' });
                                
                                const hasDefault = scheduleData?.weekly_schedule?.some(s => 
                                    s.dayOfWeek === dayOfWeekEn && s.timeRanges?.length > 0
                                );

                                let bgClass = "hover:bg-gray-50 border-gray-100 text-gray-700";
                                let dotClass = "";
                                
                                if (ex?.isDayOff) {
                                    bgClass = "bg-red-50 border-red-200 text-red-700";
                                    dotClass = "bg-red-500";
                                } else if (ex?.add?.length > 0) {
                                    bgClass = "bg-yellow-50 border-yellow-200 text-yellow-700";
                                    dotClass = "bg-yellow-500";
                                } else if (ex?.removeSlot?.length > 0) {
                                    bgClass = "bg-orange-50 border-orange-200 text-orange-700";
                                    dotClass = "bg-orange-500";
                                } else if (hasDefault) {
                                    bgClass = "bg-green-50 border-green-200 text-green-700";
                                    dotClass = "bg-green-500";
                                }

                                const isSelected = selectedDateStr === dateStr;
                                const isToday = new Date().toISOString().slice(0, 10) === dateStr;

                                return (
                                    <div
                                        key={day}
                                        onClick={() => handleDateClick(day)}
                                        className={`
                                            relative h-14 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-200
                                            ${bgClass}
                                            ${isSelected ? 'ring-2 ring-indigo-600 shadow-md transform scale-105 z-10 bg-white' : ''}
                                            ${isToday && !isSelected ? 'ring-2 ring-indigo-300' : ''}
                                        `}
                                    >
                                        <span className={`font-semibold ${isSelected ? 'text-indigo-600' : ''}`}>{day}</span>
                                        {(hasDefault || ex) && (
                                            <span className={`w-1.5 h-1.5 mt-1 rounded-full ${dotClass || 'bg-gray-300'}`}></span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* CỘT 2: Form chỉnh sửa (Sticky) */}
                <div className="lg:col-span-1">
                    {selectedDateStr ? (
                        <div className="sticky top-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-fade-in-up">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b">
                                <Calendar className="w-5 h-5 text-indigo-600" />
                                {selectedDateStr.split('-').reverse().join('/')}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <span className="font-medium text-gray-700">Nghỉ cả ngày</span>
                                    <button
                                        type="button"
                                        onClick={() => setExceptionFormData(prev => ({ ...prev, isDayOff: !prev.isDayOff }))}
                                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${exceptionFormData.isDayOff ? 'bg-red-500' : 'bg-gray-300'}`}
                                    >
                                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition shadow-sm ${exceptionFormData.isDayOff ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú / Lý do</label>
                                    <textarea
                                        rows={2}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                                        placeholder="Ví dụ: Bác sĩ bận việc riêng..."
                                        value={exceptionFormData.reason}
                                        onChange={(e) => setExceptionFormData(prev => ({ ...prev, reason: e.target.value }))}
                                    />
                                </div>

                                {exceptionFormData.isDayOff ? (
                                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg text-sm flex gap-2">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        Toàn bộ lịch khám trong ngày này sẽ bị hủy bỏ.
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-xs text-gray-500">Bắt đầu</label>
                                                    <input type="time" 
                                                        value={tempTimeInput.start} 
                                                        onChange={e => setTempTimeInput(prev => ({ ...prev, start: e.target.value }))}
                                                        className="w-full p-2 border rounded text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs text-gray-500">Kết thúc</label>
                                                    <input type="time" 
                                                        value={tempTimeInput.end} 
                                                        onChange={e => setTempTimeInput(prev => ({ ...prev, end: e.target.value }))}
                                                        className="w-full p-2 border rounded text-sm"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-2">
                                                <button type="button"
                                                    onClick={() => {
                                                        if (tempTimeInput.start && tempTimeInput.end && tempTimeInput.start < tempTimeInput.end) {
                                                            setExceptionFormData(prev => ({ ...prev, add: [...prev.add, tempTimeInput] }));
                                                            setTempTimeInput({ start: "", end: "" });
                                                        } else {
                                                            toast.warn("Giờ không hợp lệ");
                                                        }
                                                    }}
                                                    className="flex items-center justify-center gap-1 bg-green-100 text-green-700 hover:bg-green-200 py-2 rounded-lg text-sm font-medium transition"
                                                >
                                                    <Plus className="w-4 h-4" /> Thêm ca
                                                </button>
                                                <button type="button"
                                                    onClick={() => {
                                                        if (tempTimeInput.start && tempTimeInput.end && tempTimeInput.start < tempTimeInput.end) {
                                                            setExceptionFormData(prev => ({ ...prev, removeSlot: [...prev.removeSlot, tempTimeInput] }));
                                                            setTempTimeInput({ start: "", end: "" });
                                                        } else {
                                                            toast.warn("Giờ không hợp lệ");
                                                        }
                                                    }}
                                                    className="flex items-center justify-center gap-1 bg-orange-100 text-orange-700 hover:bg-orange-200 py-2 rounded-lg text-sm font-medium transition"
                                                >
                                                    <X className="w-4 h-4" /> Nghỉ giờ
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mt-4 max-h-40 overflow-y-auto">
                                            {exceptionFormData.add.map((t, i) => (
                                                <div key={`add-${i}`} className="flex justify-between items-center bg-green-50 text-green-700 p-2 rounded text-sm border border-green-100">
                                                    <span className="flex items-center gap-2"><Plus className="w-3 h-3"/> {t.start} - {t.end}</span>
                                                    <Trash2 onClick={() => setExceptionFormData(prev => ({ ...prev, add: prev.add.filter((_, idx) => idx !== i) }))} className="w-4 h-4 cursor-pointer hover:text-green-900"/>
                                                </div>
                                            ))}
                                            {exceptionFormData.removeSlot.map((t, i) => (
                                                <div key={`rem-${i}`} className="flex justify-between items-center bg-orange-50 text-orange-700 p-2 rounded text-sm border border-orange-100">
                                                    <span className="flex items-center gap-2"><X className="w-3 h-3"/> {t.start} - {t.end}</span>
                                                    <Trash2 onClick={() => setExceptionFormData(prev => ({ ...prev, removeSlot: prev.removeSlot.filter((_, idx) => idx !== i) }))} className="w-4 h-4 cursor-pointer hover:text-orange-900"/>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-3 pt-4 border-t">
                                    <button 
                                        type="button" 
                                        onClick={() => setSelectedDateStr(null)}
                                        className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                                    >
                                        Đóng
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md font-medium text-sm transition transform active:scale-95"
                                    >
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="sticky top-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center h-64 flex flex-col items-center justify-center text-gray-400">
                            <Calendar className="w-12 h-12 mb-3 opacity-50" />
                            <p className="font-medium">Chọn một ngày trên lịch<br/>để chỉnh sửa thời gian</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL CẤU HÌNH LỊCH MẪU */}
            <WeeklyScheduleModal 
                isOpen={isConfigModalOpen}
                onClose={() => setIsConfigModalOpen(false)}
                currentSchedule={scheduleData}
                onSaveSuccess={fetchSchedule}
            />
        </div>
    );
}