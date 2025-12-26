import api from '../api/axiosClient';

const contactService = {
  // 1. Gửi liên hệ mới (Dành cho Bệnh nhân/Khách vãng lai)
  // data gồm: { name, email, phone, subject, message }
  createContact: (data) => {
    return api.post('/contacts', data);
  },

  // ================= ADMIN =================

  // 2. Lấy danh sách liên hệ (Có phân trang & lọc)
  // params ví dụ: { page: 1, limit: 10, status: 'new' }
  getAllContacts: (params = {}) => {
    return api.get('/contacts', { params });
  },

  // 3. Xem chi tiết một liên hệ
  getContactById: (id) => {
    return api.get(`/contacts/${id}`);
  },

  // 4. Cập nhật trạng thái xử lý
  // status: "new" | "in_progress" | "resolved"
  updateStatus: (id, status) => {
    return api.put(`/contacts/${id}/status`, { status });
  },

  // 5. Gửi email trả lời cho bệnh nhân
  // data gồm: { replyMessage, subject }
  replyContact: (id, data) => {
    return api.post(`/contacts/${id}/reply`, data);
  },

  // 6. Xóa liên hệ
  deleteContact: (id) => {
    return api.delete(`/contacts/${id}`);
  },
};

export default contactService;
