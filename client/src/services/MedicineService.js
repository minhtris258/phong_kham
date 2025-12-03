import api from '../api/axiosClient';

const medicineService = {
    getMedicines: (params) => api.get('/medicines', { params }),
    getAllMedicines: (params) => api.get('/medicines', { params }),
    createMedicine: (data) => api.post('/medicines', data), 
    updateMedicine: (id, data) => api.put(`/medicines/${id}`, data),
    deleteMedicine: (id) => api.delete(`/medicines/${id}`),
};

export default medicineService;