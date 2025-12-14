// src/services/patientService.js
import api from '../api/axiosClient';

const patientService = {
  // === LẤY DANH SÁCH BỆNH NHÂN (CÓ PHÂN TRANG & TÌM KIẾM) ===
  // params: { page, limit, search, status }
  getAllPatients: async (params) => {
    // Axios sẽ tự động chuyển object params thành query string
    // Ví dụ: /patients?page=1&limit=10&search=abc&status=active
    const response = await api.get('/patients', { params });
    return response;
  },

  // TẠO MỚI BỆNH NHÂN (chỉ gửi name, email, password)
  createPatient: async (patientData) => {
    const payload = {
      name: patientData.name?.trim(),
      email: patientData.email?.trim(),
      password: patientData.password,
    };
    console.log('Frontend gửi đi:', payload);
    const response = await api.post('/patients', payload);
    return response;
  },

  // Hoàn tất hồ sơ (Onboarding)
  completePatientProfile: async (profileData) => {
    const response = await api.post('/patients/complete-profile', profileData);
    return response;
  },

  // CẬP NHẬT BỆNH NHÂN (Admin/Doctor sửa thông tin bệnh nhân)
  updatePatient: async (id, patientData) => {
    const response = await api.put(`/patients/${id}`, patientData);
    return response;
  },

  // XÓA BỆNH NHÂN
  deletePatient: async (id) => {
    const response = await api.delete(`/patients/${id}`);
    return response;
  },

  // ĐỔI MẬT KHẨU BỆNH NHÂN (DÀNH CHO ADMIN)
  changePatientPassword: async (id, newPassword) => {
    const response = await api.put(`/patients/${id}/password`, { newPassword });
    return response;
  },

  // === CÁC HÀM DÀNH CHO BỆNH NHÂN (ME) ===
  getMyProfile: () => {
    return api.get('/patients/me').then((res) => res.data);
  },

  updateProfile: (data) => {
    return api.put('/patients/me', data).then((res) => res.data);
  },

  changeMyPassword: async (oldPassword, newPassword, confirmPassword) => {
    // Gửi đủ cả 3 trường
    const response = await api.put('/patients/me/password', {
      oldPassword,
      newPassword,
      confirmPassword,
    });
    return response;
  },
};

export default patientService;
