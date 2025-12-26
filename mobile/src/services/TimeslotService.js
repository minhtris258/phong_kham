import api from '../api/axiosClient';

const timeslotService = {
  /**
   * Lấy danh sách slot rảnh của bác sĩ trong ngày cụ thể
   * GET /api/timeslots/:doctorId/slots/:date
   * @param {string} doctorId - ID của bác sĩ
   * @param {string} date - Ngày định dạng YYYY-MM-DD
   */
  getSlotsByDate: (doctorId, date) => {
    return api.get(`/timeslots/${doctorId}/slots/${date}`);
  },
};

export default timeslotService;
