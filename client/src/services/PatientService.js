// src/services/doctorService.js
import api from '../api/axiosClient';

const patientService = {
    // LẤY DANH SÁCH BỆNH NHÂN
    getAllPatients: async () => {
        const response = await api.get('/patients');
        return response; // { data: { doctors: [...] } } hoặc { data: [...] }
    },

    // TẠO MỚI BỆNH NHÂN (chỉ gửi name, email, password)
    createPatient: async (patientData) => {
    // ÉP CHẮC CHẮN CHỈ GỬI 3 TRƯỜNG – LOẠI BỎ TẤT CẢ DỮ LIỆU THỪA
    const payload = {
        name: patientData.name?.trim(),
        email: patientData.email?.trim(),
        password: patientData.password,
    };

    console.log("Frontend gửi đi:", payload); // ← IN RA ĐỂ KIỂM TRA

    const response = await api.post('/patients', payload);
    return response;
},
completePatientProfile: async (profileData) => {
    const response = await api.post('/patients/complete-profile', profileData);
    return response;
},

    // CẬP NHẬT BỆNH NHÂN
    updatePatient: async (id, patientData) => {
        const response = await api.put(`/patients/${id}`, patientData);
        return response;
    },

    // XÓA BỆNH NHÂN
    deletePatient: async (id) => {
        const response = await api.delete(`/patients/${id}`);
        return response;
    },

    // ĐỔI MẬT KHẨU BỆNH NHÂN (DÀNH CHO ADMIN)
    changePatientPassword: async (id, newPassword) => {
        const response = await api.put(`/patients/${id}/password`, { newPassword });
        return response;
    },
getMyProfile: () => {
        return api.get('/patients/me').then(res => res.data);
    },
    
    // Cập nhật hồ sơ
    updateProfile: (data) => {
        return api.put('/patients/me', data).then(res => res.data);
    },
    // ĐỔI MẬT KHẨU BỆNH NHÂN (DÀNH CHO PATIENT)
    changeMyPassword: async (oldPassword, newPassword) => {
        const response = await api.put(`/patients/me/password`, { oldPassword, newPassword });
        return response;
    },
};


export default patientService;