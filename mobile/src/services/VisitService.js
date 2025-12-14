import api from '../api/axiosClient';

const visitService = {
  // --- CÁC HÀM CŨ (GIỮ NGUYÊN) ---
  createVisit: (data) => api.post('/visits', data),
  getVisitById: (id) => api.get(`/visits/${id}`),
  getVisitByAppointment: (appointmentId) => api.get(`/visits/by-appointment/${appointmentId}`),
  myVisits: () => api.get('/visits/me'),
  myDoctorVisits: (params) => api.get('/visits/doctor/me', { params }),
  updateVisit: (id, data) => api.put(`/visits/${id}`, data),

  // 1. ADMIN: Lấy tất cả visits (hỗ trợ phân trang & search)
  // params ví dụ: { page: 1, limit: 10, search: "Sốt xuất huyết" }
  getAllVisitsAdmin: (params) => api.get('/visits/admin/all', { params }),

  // 2. ADMIN: Báo cáo doanh thu
  // params ví dụ: { fromDate: "2023-10-01", toDate: "2023-10-31" }
  getRevenueReportAdmin: (params) => api.get('/visits/admin/revenue', { params }),

  // 3. ADMIN: Xóa hồ sơ khám bệnh
  deleteVisitAdmin: (id) => api.delete(`/visits/admin/${id}`),

  // 4. DOCTOR: Lấy thống kê Dashboard (Số khách hôm nay, doanh thu tháng)
  getDoctorStats: () => api.get('/visits/doctor/stats'),

  // 5. DOCTOR: Tìm kiếm nâng cao (Theo chẩn đoán, ngày tháng)
  // params ví dụ: { diagnosis: "Viêm", fromDate: "...", toDate: "..." }
  searchDoctorVisits: (params) => api.get('/visits/doctor/search', { params }),

  // 6. SHARED: Lấy lịch sử khám của một bệnh nhân cụ thể (Dùng cho Doctor khi xem hồ sơ bệnh nhân)
  getVisitsByPatient: (patientId) => api.get(`/visits/patient/${patientId}`),
};

export default visitService;
