// src/services/doctorService.js
import api from '../api/axiosClient';

const doctorService = {
    // LẤY DANH SÁCH BÁC SĨ
    getAllDoctors: async () => {
        const response = await api.get('/doctors');
        return response; // { data: { doctors: [...] } } hoặc { data: [...] }
    },
    // LẤY THÔNG TIN BÁC SĨ THEO ID
    getDoctorById: async (id) => {
        const response = await api.get(`/doctors/${id}`);
        return response.data;
    },
    // LẤY HỒ SƠ BÁC SĨ CỦA CHÍNH MÌNH
    getMe: async () => {
        const response = await api.get('/doctors/me');
        return response.data; // Trả về { profile: { ... } }
    },
    // TẠO MỚI BÁC SĨ (chỉ gửi name, email, password)
    createDoctor: async (doctorData) => {
    // ÉP CHẮC CHẮN CHỈ GỬI 3 TRƯỜNG – LOẠI BỎ TẤT CẢ DỮ LIỆU THỪA
    const payload = {
        name: doctorData.name?.trim(),
        email: doctorData.email?.trim(),
        password: doctorData.password,
    };

    console.log("Frontend gửi đi:", payload); // ← IN RA ĐỂ KIỂM TRA

    const response = await api.post('/doctors', payload);
    return response;
},

    // CẬP NHẬT BÁC SĨ
    updateDoctor: async (id, doctorData) => {
        const response = await api.put(`/doctors/${id}`, doctorData);
        return response;
    },

    // XÓA BÁC SĨ
    deleteDoctor: async (id) => {
        const response = await api.delete(`/doctors/${id}`);
        return response;
    },

    // LẤY DANH SÁCH CHUYÊN KHOA (nếu có API)
    getSpecialties: async () => {
            const response = await api.get('/specialties');
            return response.data || response;
    },
    completeProfile: async (profileData) => {
        // Endpoint khớp với Controller: POST /onboarding/doctor-profile
        const response = await api.post('/onboarding/doctor-profile', profileData);
        return response;
    },
};

export default doctorService;