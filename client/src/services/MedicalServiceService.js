import api from '../api/axiosClient';

const medicalServiceService = {
    getServices: (params) => api.get('/services', { params }),
    getAllServices: (params) => api.get('/services', { params }),
    createService: (data) => api.post('/services', data), 
    updateService: (id, data) => api.put(`/services/${id}`, data),
    deleteService: (id) => api.delete(`/services/${id}`),
};

export default medicalServiceService;