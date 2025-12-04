// src/services/DashboardService.js
import api from '../api/axiosClient';

const dashboardService = {
    // 1. Lấy tổng quan KPI (Tổng lịch hẹn, Bác sĩ, Doanh thu...)
    getStats: async () => {
        const response = await api.get('/dashboard/stats');
        return response.data; 
        // Kỳ vọng trả về: { totalAppointments, totalDoctors, totalRevenue, newPatients, ... }
    },

    // 2. Lấy dữ liệu biểu đồ xu hướng (Trend)
    getAppointmentTrend: async () => {
        const response = await api.get('/dashboard/trend');
        return response.data; 
        // Kỳ vọng trả về: [{ month: 'Jan', count: 120 }, ...]
    },

    // 3. Lấy dữ liệu phân bổ trạng thái (Status)
    getAppointmentStatus: async () => {
        const response = await api.get('/dashboard/status');
        return response.data;
        // Kỳ vọng trả về: [{ status: 'Completed', percentage: 60, color: 'bg-green-500' }, ...]
    },

    // 4. Lấy danh sách bác sĩ bận rộn nhất (Top Doctors)
    getTopDoctors: async () => {
        const response = await api.get('/dashboard/top-doctors');
        return response.data;
    },

    // 5. Lấy hoạt động gần đây (Recent Activity)
    getRecentActivity: async () => {
        const response = await api.get('/dashboard/activities');
        return response.data;
    }
};

export default dashboardService;