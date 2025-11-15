// src/mocks/mockdata.js
import { Calendar, Heart, Stethoscope, DollarSign } from 'lucide-react';

// --- MOCK IDS GIẢ LẬP (Mongoose ObjectId) ---
export const MOCK_IDS = {
    roles: {
        admin: '60c728f3a3a9b100078f44d1', // Admin
        doctor: '60c728f3a3a9b100078f44d2', // Doctor
        patient: '60c728f3a3a9b100078f44d3', // Patient
    },
    specialties: {
        noi: '60c729a1b4b9b100078f45e1', // Nội Tổng Quát
        rang: '60c729a1b4b9b100078f45e2', // Răng Hàm Mặt
        da: '60c729a1b4b9b100078f45e3',   // Da Liễu
    },
    users: {
        admin: '60c72aa0c5c9b100078f46a1',
        doctor1: '60c72aa0c5c9b100078f46a2',
        doctor2: '60c72aa0c5c9b100078f46a3',
        patient1: '60c72aa0c5c9b100078f46a4',
        patient2: '60c72aa0c5c9b100078f46a5',
        patient3: '60c72aa0c5c9b100078f46a6',
    },
    doctors: {
        d1: '60c72bb0d6d9b100078f47b1',
        d2: '60c72bb0d6d9b100078f47b2',
        d3: '60c72bb0d6d9b100078f47b3',
    },
    patients: {
        p1: '60c72cc0e7e9b100078f48c1',
        p2: '60c72cc0e7e9b100078f48c2',
        p3: '60c72cc0e7e9b100078f48c3',
    },
    appointments: {
        a1: '60c72dd0f8f9b100078f49d1',
        a2: '60c72dd0f8f9b100078f49d2',
        a3: '60c72dd0f8f9b100078f49d3',
        a4: '60c72dd0f8f9b100078f49d4',
    }
};

// --- MOCK DATA DỰA TRÊN MODEL ---

// SpecialtyModel.js
export const mockSpecialties = [
    { id: MOCK_IDS.specialties.noi, name: 'Nội Tổng Quát' },
    { id: MOCK_IDS.specialties.rang, name: 'Răng Hàm Mặt' },
    { id: MOCK_IDS.specialties.da, name: 'Da Liễu' },
    { id: '60c729a1b4b9b100078f45e4', name: 'Nhi' },
    { id: '60c729a1b4b9b100078f45e5', name: 'Mắt' },
];

// RoleModel.js
export const initialMockRoles = [
    { id: MOCK_IDS.roles.admin, name: 'admin' },
    { id: MOCK_IDS.roles.doctor, name: 'doctor' },
    { id: MOCK_IDS.roles.patient, name: 'patient' },
];

// UserModel.js
export const initialMockUsers = [
    { id: MOCK_IDS.users.admin, name: 'Admin Tổng Quát', email: 'admin@clinic.com', role_id: MOCK_IDS.roles.admin, status: 'active', profile_completed: true },
    { id: MOCK_IDS.users.doctor1, name: 'Lê Thị Mai (BS)', email: 'mai.le@clinic.com', role_id: MOCK_IDS.roles.doctor, status: 'active', profile_completed: true },
    { id: MOCK_IDS.users.doctor2, name: 'Nguyễn Văn Hùng (BS)', email: 'hung.nguyen@clinic.com', role_id: MOCK_IDS.roles.doctor, status: 'active', profile_completed: true },
    { id: MOCK_IDS.users.patient1, name: 'Nguyễn Văn A (BN)', email: 'a.nguyen@clinic.com', role_id: MOCK_IDS.roles.patient, status: 'active', profile_completed: true },
];

// DoctorModel.js
export const initialMockDoctors = [
    { 
        id: MOCK_IDS.doctors.d1, 
        user_id: MOCK_IDS.users.doctor1, 
        fullName: 'Lê Thị Mai', 
        gender: 'female', 
        dob: '1985-04-20', 
        phone: '0981234567', 
        email: 'mai.le@clinic.com', 
        address: 'Quận 1, TP.HCM', 
        specialty_id: MOCK_IDS.specialties.noi,
        status: 'active', 
        consultation_fee: 250000,
    },
    { 
        id: MOCK_IDS.doctors.d2, 
        user_id: MOCK_IDS.users.doctor2, 
        fullName: 'Nguyễn Văn Hùng', 
        gender: 'male', 
        dob: '1978-08-10', 
        phone: '0901765432', 
        email: 'hung.nguyen@clinic.com', 
        address: 'Quận 3, TP.HCM', 
        specialty_id: MOCK_IDS.specialties.rang,
        status: 'active', 
        consultation_fee: 300000,
    },
    { 
        id: MOCK_IDS.doctors.d3, 
        user_id: '60c72aa0c5c9b100078f46a7', // User khác
        fullName: 'Trần Ngọc Anh', 
        gender: 'male', 
        dob: '1990-01-01', 
        phone: '0912345678', 
        email: 'anh.tran@clinic.com', 
        address: 'Quận Bình Thạnh, TP.HCM', 
        specialty_id: MOCK_IDS.specialties.da,
        status: 'active', 
        consultation_fee: 200000,
    },
];

// PatientModel.js
export const initialMockPatients = [
    { 
        id: MOCK_IDS.patients.p1, 
        user_id: MOCK_IDS.users.patient1, 
        fullName: 'Nguyễn Văn A', 
        dob: '1990-05-15', 
        gender: 'male', 
        phone: '0345678901', 
        email: 'a.nguyen@clinic.com', 
        address: 'Quận 1, TP.HCM', 
    },
    { 
        id: MOCK_IDS.patients.p2, 
        user_id: MOCK_IDS.users.patient2, 
        fullName: 'Trần Thị B', 
        dob: '1985-11-20', 
        gender: 'female', 
        phone: '0778901234', 
        email: 'b.tran@clinic.com', 
        address: 'Quận 3, TP.HCM', 
    },
    { 
        id: MOCK_IDS.patients.p3, 
        user_id: MOCK_IDS.users.patient3, 
        fullName: 'Phạm Văn C', 
        dob: '2000-01-01', 
        gender: 'male', 
        phone: '0967890123', 
        email: 'c.pham@clinic.com', 
        address: 'Quận Bình Thạnh, TP.HCM', 
    },
];

// DoctorScheduleModel.js (Lịch làm việc cố định)
export const mockDoctorSchedules = [
    {
        doctor_id: MOCK_IDS.doctors.d1, // BS Mai
        slot_minutes: 30,
        weekly_schedule: [
            { dayOfWeek: "Monday", timeRanges: [{ start: "08:00", end: "12:00" }, { start: "14:00", end: "17:00" }] },
            { dayOfWeek: "Wednesday", timeRanges: [{ start: "08:00", end: "12:00" }] },
            { dayOfWeek: "Friday", timeRanges: [{ start: "08:00", end: "12:00" }, { start: "14:00", end: "17:00" }] },
        ],
        exceptions: [{ date: '2025-11-17', isDayOff: true }], // Thứ Hai tuần này nghỉ
    },
];

// AppointmentModel.js & TimeslotModel.js (Tạo ra các lịch hẹn mock data)
export const today = new Date().toISOString().split('T')[0];
export const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
export const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

export const initialMockAppointments = [
    // Lịch hẹn Đã hoàn thành (Hôm qua)
    { 
        id: MOCK_IDS.appointments.a1, 
        patient_id: MOCK_IDS.patients.p1, 
        doctor_id: MOCK_IDS.doctors.d1, 
        timeslot_id: 'slot-1000', 
        date: yesterday, 
        start: '10:00', 
        status: 'completed', 
        reason: 'Kiểm tra tổng quát định kỳ' 
    },
    // Lịch hẹn Đã hủy (Hôm qua)
    { 
        id: MOCK_IDS.appointments.a2, 
        patient_id: MOCK_IDS.patients.p2, 
        doctor_id: MOCK_IDS.doctors.d2, 
        timeslot_id: 'slot-1430', 
        date: yesterday, 
        start: '14:30', 
        status: 'cancelled', 
        reason: 'Đau răng khôn' 
    },
    // Lịch hẹn Đã xác nhận (Hôm nay)
    { 
        id: MOCK_IDS.appointments.a3, 
        patient_id: MOCK_IDS.patients.p3, 
        doctor_id: MOCK_IDS.doctors.d3, 
        timeslot_id: 'slot-0900', 
        date: today, 
        start: '09:00', 
        status: 'confirmed', 
        reason: 'Viêm da cơ địa tái khám' 
    },
    // Lịch hẹn Đang chờ (Ngày mai)
    { 
        id: MOCK_IDS.appointments.a4, 
        patient_id: MOCK_IDS.patients.p1, 
        doctor_id: MOCK_IDS.doctors.d1, 
        timeslot_id: 'slot-1100', 
        date: tomorrow, 
        start: '11:00', 
        status: 'pending', 
        reason: 'Cảm cúm thông thường' 
    },
];

// RatingModel.js (Rating cho lịch hẹn đã hoàn thành)
export const mockRatings = [
    {
        patient_id: MOCK_IDS.patients.p1,
        doctor_id: MOCK_IDS.doctors.d1,
        appointment_id: MOCK_IDS.appointments.a1,
        star: 5,
        comment: 'Bác sĩ Mai rất tận tâm và giải thích kỹ lưỡng.',
    }
];

// VisitModel.js (Hồ sơ khám bệnh cho lịch hẹn đã hoàn thành)
export const mockVisits = [
    {
        patient_id: MOCK_IDS.patients.p1,
        doctor_id: MOCK_IDS.doctors.d1,
        appointment_id: MOCK_IDS.appointments.a1,
        symptoms: 'Mệt mỏi, ho khan nhẹ, đau họng',
        diagnosis: 'Viêm họng cấp',
        notes: 'Chỉ định nghỉ ngơi 3 ngày.',
        consultation_fee_snapshot: 250000,
        prescriptions: [
            { drug: 'Paracetamol 500mg', dosage: '1 viên', frequency: '3 lần/ngày', duration: '5 ngày' },
            { drug: 'Siro ho thảo dược', dosage: '10ml', frequency: '2 lần/ngày', duration: '5 ngày' },
        ],
        bill_items: [{ name: 'Test COVID nhanh', quantity: 1, price: 150000 }],
        total_amount: 400000, // 250k phí khám + 150k test
    }
];


// --- CÁC MOCK KHÁC (Duy trì và Fix Reference Error) ---

export const mockAppointmentTrend = [
  { month: 'T1', count: 1200 },
  { month: 'T2', count: 1500 },
  { month: 'T3', count: 900 },
  { month: 'T4', count: 1800 },
  { month: 'T5', count: 2100 },
  { month: 'T6', count: 1600 },
  { month: 'T7', count: 2500 },
  { month: 'T8', count: 2000 },
];

export const mockStatusData = [
  { status: 'Hoàn thành', percentage: 70, color: 'bg-green-500' },
  { status: 'Chưa đến', percentage: 15, color: 'bg-red-500' },
  { status: 'Đã hủy', percentage: 10, color: 'bg-yellow-500' },
  { status: 'Đang chờ', percentage: 5, color: 'bg-indigo-500' },
];

export const mockActivity = [
  { time: '14:30', user: initialMockPatients[1].fullName, action: 'vừa đặt lịch (MOCK) với BS. Hùng.', type: 'sale' },
  { time: '12:00', user: initialMockDoctors[0].fullName, action: 'đã hoàn thành lịch hẹn #A1.', type: 'inventory' },
  { time: '09:00', user: 'Admin', action: 'đã thêm BS. Trần Ngọc Anh.', type: 'user' },
  { time: '08:30', user: 'Hệ thống', action: 'Gửi email nhắc nhở lịch hẹn trong ngày.', type: 'system' },
];

export const mockKPIs = [
  // Cập nhật lại logic dựa trên MOCK data mới nếu cần, nhưng giữ cấu trúc hiển thị
  {
    title: 'Lịch Hẹn Hôm Nay',
    value: '1/100 (Confirmed)', // Chỉ có 1 lịch hẹn hôm nay là Confirmed
    change: '+5.5%',
    period: 'Hôm qua',
    isPositive: true,
    icon: Calendar,
    color: 'indigo'
  },
  {
    title: 'Bệnh Nhân Mới (Tuần)',
    value: '3', // Dựa trên mockPatients
    change: '+0.8%',
    period: 'Tuần trước',
    isPositive: true,
    icon: Heart,
    color: 'green'
  },
  {
    title: 'Bác Sĩ Đang Hoạt Động',
    value: initialMockDoctors.length.toString(),
    change: '+1',
    period: 'Tháng này',
    isPositive: true,
    icon: Stethoscope,
    color: 'blue'
  },
  {
    title: 'Phí Khám TB',
    value: '250K', // Lấy trung bình (250+300+200)/3
    change: '-1.2%',
    period: 'Tuần trước',
    isPositive: false,
    icon: DollarSign,
    color: 'yellow'
  },
];