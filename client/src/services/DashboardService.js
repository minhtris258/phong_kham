// src/services/DashboardService.js
import api from '../api/axiosClient';

const dashboardService = {
    // 1. Lấy tổng quan KPI
    getStats: async () => {
        const response = await api.get('/dashboard/stats');
        return response.data; 
    },

    // 2. Lấy dữ liệu biểu đồ xu hướng (Trend)
    // --- SỬA ĐOẠN NÀY ---
    getAppointmentTrend: async (params) => {
        const response = await api.get('/dashboard/trend', { params });
        return response.data; // Phải return .data để lấy mảng
    },
    // --------------------

    // 3. Lấy dữ liệu phân bổ trạng thái
    getAppointmentStatus: async () => {
        const response = await api.get('/dashboard/status');
        return response.data;
    },

    // 4. Lấy danh sách bác sĩ bận rộn nhất
    getTopDoctors: async () => {
        const response = await api.get('/dashboard/top-doctors');
        return response.data;
    },

    // 5. Lấy hoạt động gần đây
    getRecentActivity: async () => {
        const response = await api.get('/dashboard/activities');
        return response.data;
    }
};

export default dashboardService;