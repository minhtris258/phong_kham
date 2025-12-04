// src/services/specialtyService.js (Cần được tạo)
import api from '../api/axiosClient';

const specialtyService = {
    // 1. GET /api/specialties
   getAllSpecialties: (params) => {
        return api.get('/specialties', { params });
    },
    // 2. GET /api/specialties/:id (Đã sửa ở backend để trả về Doctor)
    getSpecialtyWithDoctors: async (id) => {
        return await api.get(`/specialties/${id}`);
    },
    // 3. POST /api/specialties
    createSpecialty: async (data) => {
        return await api.post('/specialties', data);
    },
    // 4. PUT /api/specialties/:id
    updateSpecialty: async (id, data) => {
        return await api.put(`/specialties/${id}`, data);
    },
    // 5. DELETE /api/specialties/:id
    deleteSpecialty: async (id) => {
        return await api.delete(`/specialties/${id}`);
    }
};

export default specialtyService;