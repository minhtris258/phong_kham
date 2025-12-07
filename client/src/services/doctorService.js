import api from '../api/axiosClient';

const doctorService = {
    // LẤY DANH SÁCH BÁC SĨ (CÓ PHÂN TRANG)
    getAllDoctors: async (params) => {
        // params: { page, limit, search, specialty }
        const response = await api.get('/doctors', { params });
        return response; 
    },

    // ... Giữ nguyên các hàm khác (create, update, delete...)
    getDoctorById: async (id) => {
        const response = await api.get(`/doctors/${id}`);
        return response.data;
    },
    getMe: async () => {
        const response = await api.get('/doctors/me');
        return response.data;
    },
    updateMyDoctorProfile: async (doctorData) => {
        const response = await api.put('/doctors/me', doctorData);
        return response;
    },
    createDoctor: async (doctorData) => {
        const payload = {
            name: doctorData.name?.trim(),
            email: doctorData.email?.trim(),
            password: doctorData.password,
        };
        const response = await api.post('/doctors', payload);
        return response;
    },
    updateDoctor: async (id, doctorData) => {
        const response = await api.put(`/doctors/${id}`, doctorData);
        return response;
    },
    deleteDoctor: async (id) => {
        const response = await api.delete(`/doctors/${id}`);
        return response;
    },
    getSpecialties: async (params) => {
        // Truyền params (ví dụ: ?limit=100) xuống API
        const response = await api.get('/specialties', { params });
        return response;
    },
    completeProfile: async (profileData) => {
        const response = await api.post('/doctors/onboarding/doctor-profile', profileData);
        return response;
    },
     changeMyPassword: async (oldPassword, newPassword, confirmPassword) => {
    // Gửi đủ cả 3 trường
    const response = await api.put('/doctors/me/password', { 
        oldPassword, 
        newPassword, 
        confirmPassword 
    });
    return response;
},
};

export default doctorService;