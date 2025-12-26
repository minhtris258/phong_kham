import api from '../api/axiosClient';

const holidayService = {
  getAllHolidays: () => api.get('/holidays'),
  createHoliday: (data) => api.post('/holidays', data),
  updateHoliday: (id, data) => api.put(`/holidays/${id}`, data),
  deleteHoliday: (id) => api.delete(`/holidays/${id}`),
};

export default holidayService;
