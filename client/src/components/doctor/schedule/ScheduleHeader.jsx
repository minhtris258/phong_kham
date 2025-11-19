import React from 'react';
import { format } from 'date-fns';

export default function ScheduleHeader({ weekDays, dayNames, getSlotsForDay }) {
    return (
        <thead className="bg-gray-50 border-b">
            <tr>
                <th className="sticky left-0 z-20 bg-gray-50 px-6 py-4 text-left text-sm font-semibold text-gray-700 w-28">
                    Giờ
                </th>
                {weekDays.map((day, idx) => {
                    const { isOff } = getSlotsForDay(day);
                    return (
                        <th key={day.toISOString()} className="px-4 py-4 text-center min-w-36">
                            <div className="font-semibold text-gray-800">{dayNames[idx]}</div>
                            <div className="text-2xl font-bold text-blue-600 mt-1">
                                {format(day, 'dd')}
                            </div>
                            <div className="text-sm text-gray-500">{format(day, 'MM/yyyy')}</div>
                            {isOff && (
                                <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                    Nghỉ
                                </span>
                            )}
                        </th>
                    );
                })}
            </tr>
        </thead>
    );
}