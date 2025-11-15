import React, { useState, useEffect, useMemo } from 'react';
import KPICard from '../../components/admin/KPICard';
import AppointmentTrendChart from '../../components/admin/AppointmentTrendChart';
import AppointmentStatusChart from '../../components/admin/AppointmentStatusChart';
import RecentActivity from '../../components/admin/RecentActivity';
import { mockKPIs, mockAppointmentTrend, mockStatusData, mockActivity } from '../../mocks/mockdata.js';



const DashboardContent = () => {
    return (
        <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
             <header className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                    Dashboard Đặt Lịch Khám
                </h1>
                <p className="text-gray-500 mt-1">Tổng quan về lịch hẹn và hiệu suất của phòng khám.</p>
            </header>

            {/* 1. KPI Cards Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {mockKPIs.map((kpi, index) => (
                    <KPICard key={index} {...kpi} />
                ))}
            </section>

            {/* 2. Charts Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                {/* Biểu đồ Xu hướng Lịch Hẹn (Chiếm 2/3 màn hình) */}
                <div className="lg:col-span-2">
                    <AppointmentTrendChart data={mockAppointmentTrend} />
                </div>
                
                {/* Biểu đồ Trạng thái Lịch Hẹn (Chiếm 1/3 màn hình) */}
                <div className="lg:col-span-1">
                    <AppointmentStatusChart data={mockStatusData} />
                </div>
            </section>

            {/* 3. Detailed Data & Activity Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bảng Bác sĩ Bận rộn nhất */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">Top 5 Bác Sĩ Bận Rộn Nhất</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Bác Sĩ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Chuyên khoa
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tổng Lịch Hẹn
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {
                                    [
                                        { name: 'BS. Lê Thị Mai', specialty: 'Nội Tổng Quát', appointments: 55 },
                                        { name: 'BS. Nguyễn Văn Hùng', specialty: 'Răng Hàm Mặt', appointments: 48 },
                                        { name: 'BS. Trần Ngọc Anh', specialty: 'Da Liễu', appointments: 42 },
                                        { name: 'BS. Hoàng Văn Bách', specialty: 'Nhi', appointments: 35 },
                                        { name: 'BS. Đỗ Thị Thu', specialty: 'Mắt', appointments: 30 },
                                    ].map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {item.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.specialty}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                                                {item.appointments}
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Bảng Hoạt động Gần đây (Chiếm 1/3 màn hình) */}
                <div className="lg:col-span-1">
                    <RecentActivity activity={mockActivity} />
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-12 text-center text-sm text-gray-400">
                Bảng điều khiển được cập nhật theo thời gian thực (Mockup).
            </footer>
        </main>
    );
}

// --- COMPONENTS LAYOUT ---








export default DashboardContent;