import api from "../api/axiosClient";

const appointmentsService = {
  
    // Đặt cuộc hẹn mới
  bookAppointment: (data) => api.post("/appointments/book", data),
    // Hủy cuộc hẹn theo ID
  cancelAppointment: (id) => api.post(`/appointments/cancel/${id}`),
    // Lấy danh sách cuộc hẹn của bệnh nhân hiện tại
  myAppointments: () => api.get("/appointments/my-appointments"),

  //admin
  // Lấy danh sách cuộc hẹn với các tham số tùy chọn
  getAppointments: (params = {}) => api.get("/appointments", { params }),
    // Xem chi tiết cuộc hẹn theo ID
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
    // Cập nhật cuộc hẹn theo ID
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
    // Xóa cuộc hẹn theo ID
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
};

export default appointmentsService;