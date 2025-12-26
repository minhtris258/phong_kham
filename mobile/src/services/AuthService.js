import api from '../api/axiosClient';

const authService = {
  // Lấy thông tin user hiện tại (Để hiển thị lên form)
  getProfile() {
    return api.get('/auth/me');
  },

  // Đổi mật khẩu
  // Payload: { currentPassword, newPassword }
  changePassword(data) {
    return api.put('/auth/updatepassword', data);
  },
};

export default authService;
