// src/components/patient/appointments/AppointmentCard.jsx
import React from 'react';
import { Stethoscope, Calendar, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx'; // Giả định đường dẫn
import ActionButtons from './ActionButtons.jsx'; // Giả định đường dẫn

export default function AppointmentCard({ appointment, doctor }) {
    const date = new Date(appointment.date);
    const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

    return (
        <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition p-6">
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                    {/* Thông tin Bác sĩ */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <Stethoscope className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{doctor?.fullName || 'Bác sĩ'}</h3>
                            <p className="text-gray-600">Phòng khám tư nhân</p>
                        </div>
                    </div>

                    {/* Chi tiết Lịch hẹn */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            {date.toLocaleDateString('vi-VN')} {isToday && <span className="text-blue-600 font-medium">(Hôm nay)</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            {appointment.start}
                        </div>
                        <StatusBadge status={appointment.status} />
                    </div>

                    {appointment.reason && <p className="text-gray-700"><strong>Lý do:</strong> {appointment.reason}</p>}
                </div>

                {/* Nút hành động */}
                <ActionButtons status={appointment.status} />
            </div>
        </div>
    );
}