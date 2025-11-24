// src/services/doctorService.js (ĐÃ SỬA VỚI LOGS)

import api from '../api/axiosClient';

const doctorSchedulesService = {
    // GET /doctor-schedules/:doctorId (Giữ nguyên)
    getDoctorSchedule: async (doctorId) => {
        const response = await api.get(`/doctor-schedules/${doctorId}`);
        return response; 
    },

    // GET /doctor-schedules/:doctorId/slots?date=... (Giữ nguyên)
    getDoctorSlotsByDate: async (doctorId, date) => {
        const response = await api.get(`/doctor-schedules/${doctorId}/slots`, {
            params: { date },
        });
        return response; 
    },

    // GET /doctor-schedules/me/schedule (LẤY LỊCH CÁ NHÂN)
    getMySchedule: async () => {
        const response = await api.get('/doctor-schedules/me/schedule');
        return response; 
    },

    // POST /doctor-schedules/me/schedule (CẬP NHẬT/TẠO MỚI LỊCH CÁ NHÂN)
    upsertMySchedule: async (scheduleData) => {
        const payload = {
            slot_minutes: scheduleData.slot_minutes,
            weekly_schedule: scheduleData.weekly_schedule,
            exceptions: scheduleData.exceptions,
        };
        
        // === LOG QUAN TRỌNG CHO LỊCH KHÁM ===
        console.log("--- Frontend gửi API: upsertMySchedule ---");
        console.log("Payload:", payload); 
        // ======================================

        const response = await api.post('/doctor-schedules/me/schedule', payload); 
        return response;
    },

    // POST /doctor-schedules/me/schedule/exceptions (CẬP NHẬT NGOẠI LỆ CÁ NHÂN)
    upsertMyException: async (exceptionData) => {
        // === LOG QUAN TRỌNG CHO NGOẠI LỆ CÁ NHÂN ===
        console.log("--- Frontend gửi API: upsertMyException ---");
        console.log("Payload:", exceptionData);
        // ======================================
        
        const response = await api.post(`/doctor-schedules/me/schedule/exceptions`, exceptionData);
        return response;
    },
    
    // POST /doctor-schedules/:doctorId/exceptions (ADMIN CẬP NHẬT NGOẠI LỆ)
    adminUpsertDoctorException: async (doctorId, exceptionData) => {
        // === LOG QUAN TRỌNG CHO NGOẠI LỆ ADMIN ===
        console.log(`--- Frontend gửi API: adminUpsertDoctorException (Doctor ID: ${doctorId}) ---`);
        console.log("Payload:", exceptionData);
        // ======================================
        
        const response = await api.post(`/doctor-schedules/${doctorId}/exceptions`, exceptionData);
        return response;
    }
};

export default doctorSchedulesService;