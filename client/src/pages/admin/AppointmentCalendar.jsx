import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { initialMockPatients } from '../../mocks/mockdata';

const AppointmentCalendar = ({ appointments, currentMonth, setCurrentMonth, onSelectDate }) => {
    const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const [selectedDate, setSelectedDate] = useState(null);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Convert JS Sunday (0) to Vietnamese Sunday (6). Monday (1) stays (0).
        const startDayIndex = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); 

        return { startDayIndex, daysInMonth };
    };

    const appointmentsByDate = useMemo(() => {
        const map = {};
        appointments.forEach(app => {
            const date = app.date;
            if (!map[date]) {
                map[date] = [];
            }
            map[date].push(app);
        });
        return map;
    }, [appointments]);

    const { startDayIndex, daysInMonth } = getDaysInMonth(currentMonth);

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
        setSelectedDate(null);
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
        setSelectedDate(null);
    };

    const handleDateClick = (day) => {
        const dateString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateString);
        if (onSelectDate) onSelectDate(dateString, appointmentsByDate[dateString] || []);
    };

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() && 
               currentMonth.getMonth() === today.getMonth() && 
               currentMonth.getFullYear() === today.getFullYear();
    };

    const hasAppointment = (day) => {
        const dateString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return !!appointmentsByDate[dateString];
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 mb-6 lg:mb-0 h-full">
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 transition">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold text-gray-800">
                    Tháng {currentMonth.getMonth() + 1}/{currentMonth.getFullYear()}
                </h3>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 transition">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500">
                {daysOfWeek.map(day => (
                    <div key={day} className="py-2 text-indigo-600 font-bold">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {/* Ô trống đầu tiên (padding) */}
                {Array.from({ length: startDayIndex }).map((_, index) => (
                    <div key={`empty-${index}`} className="p-2 h-10"></div>
                ))}

                {/* Các ngày trong tháng */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const dateString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isBusy = hasAppointment(day);
                    const todayClass = isToday(day) ? 'ring-2 ring-indigo-500 border-2 border-white' : '';
                    const busyClass = isBusy ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-gray-50';
                    const selectedClass = selectedDate === dateString ? 'bg-indigo-500 text-white hover:bg-indigo-500' : '';

                    return (
                        <div
                            key={day}
                            className={`p-2 h-10 flex items-center justify-center rounded-lg cursor-pointer transition duration-150 relative ${busyClass} ${todayClass} ${selectedClass}`}
                            onClick={() => handleDateClick(day)}
                        >
                            {day}
                            {isBusy && selectedDate !== dateString && (
                                <span className="absolute bottom-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedDate && appointmentsByDate[selectedDate] && (
                <div className="mt-4 border-t pt-3">
                    <h4 className="font-bold text-sm text-gray-700 mb-2">Lịch Hẹn Ngày {selectedDate.split('-').reverse().join('/')}:</h4>
                    <ul className="space-y-1 max-h-24 overflow-y-auto">
                        {appointmentsByDate[selectedDate].map(app => (
                            <li key={app.id} className="text-xs text-gray-600 bg-gray-50 p-1 rounded">
                                **{app.start}**: {initialMockPatients.find(p => p.id === app.patient_id)?.fullName || 'Bệnh Nhân [ID:' + app.patient_id.slice(-4) + ']'} ({app.status})
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
export default AppointmentCalendar;