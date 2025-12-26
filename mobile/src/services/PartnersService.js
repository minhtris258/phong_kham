import api from '../api/axiosClient';

const partnerService = {
  listPartners: () => api.get('/partners'),
  createPartner: (data) => api.post('/partners', data),
  updatePartner: (id, data) => api.put(`/partners/${id}`, data),
  deletePartner: (id) => api.delete(`/partners/${id}`),
};

export default partnerService;
