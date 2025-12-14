import api from '../api/axiosClient';

const appointmentsService = {
  // Đặt cuộc hẹn mới
  bookAppointment: (data) => api.post('/appointments/book', data),
  // Hủy cuộc hẹn theo ID
  cancelAppointment: (id) => api.post(`/appointments/cancel/${id}`),
  // Lấy danh sách cuộc hẹn của bệnh nhân hiện tại
  myAppointments: () => api.get('/appointments/my-appointments'),

  //doctor
  // Lấy danh sách cuộc hẹn của bác sĩ hiện tại
  getDoctorAppointments: (params = {}) => api.get('/appointments/doctor-appointments', { params }),
  // Huỷ cuộc hẹn bởi bác sĩ
  cancelAppointmentByDoctor: (id, data) =>
    api.put(`/appointments/doctor-appointments/${id}/cancel`, data),
  // Dời lịch cuộc hẹn bởi bác sĩ
  rescheduleAppointmentByDoctor: (id, data) =>
    api.put(`/appointments/doctor-appointments/${id}/reschedule`, data),

  //admin
  // Lấy danh sách cuộc hẹn với các tham số tùy chọn
  getAppointments: (params = {}) => api.get('/appointments', { params }),
  // Xem chi tiết cuộc hẹn theo ID
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  // Cập nhật cuộc hẹn theo ID
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  // Xóa cuộc hẹn theo ID
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
};

export default appointmentsService;
