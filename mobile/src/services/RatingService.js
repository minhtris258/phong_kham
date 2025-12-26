import api from '../api/axiosClient';

const ratingService = {
  /**
   * Tạo đánh giá mới
   * Method: POST /api/ratings
   * Body: { appointment_id, star, comment }
   */
  createRating: (data) => {
    return api.post('/ratings', data);
  },

  /**
   * Lấy danh sách đánh giá của một bác sĩ (Public/Protected)
   * Method: GET /api/ratings/doctor/:doctorId
   */
  getRatingsByDoctor: (doctorId) => {
    return api.get(`/ratings/doctor/${doctorId}`);
  },

  /**
   * Lấy lịch sử đánh giá của chính bệnh nhân đang đăng nhập
   * Method: GET /api/ratings/me
   */
  getMyRatings: () => {
    return api.get('/ratings/me');
  },
};

export default ratingService;
