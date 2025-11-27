import api from "../api/axiosClient";

const visitService = {
    createVisit: (data) => api.post("/visits", data),
    getVisitById: (id) => api.get(`/visits/${id}`),
    getVisitByAppointment: (appointmentId) => api.get(`/visits/by-appointment/${appointmentId}`),
    myVisits: () => api.get("/visits/me"),
    myDoctorVisits: () => api.get("/visits/doctor/me"),
    updateVisit: (id, data) => api.put(`/visits/${id}`, data),
};

export default visitService;