// --- TYPES ---
export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string;
  status: 'upcoming' | 'completed';
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
}

export interface NotificationItemType { // <-- Đã thêm kiểu dữ liệu này
    id: string;
    type: 'appointment' | 'promo' | 'system';
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
}

// --- CONSTANTS ---

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Nguyễn Văn Hải',
  avatar: 'https://picsum.photos/seed/profile/100/100',
  email: 'hai.nguyen@example.com',
  phone: '0901 234 567',
};

export const DOCTORS: Doctor[] = [
    { id: 'd1', name: 'Dr. Nguyễn Văn A', specialty: 'Tim mạch' },
    { id: 'd2', name: 'Dr. Trần Thị B', specialty: 'Da liễu' },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
    { id: 'a1', doctorId: 'd1', date: '2024-11-15', time: '10:00', status: 'completed' },
    { id: 'a2', doctorId: 'd2', date: '2025-01-20', time: '14:30', status: 'upcoming' },
    { id: 'a3', doctorId: 'd1', date: '2024-10-01', time: '09:00', status: 'completed' },
];

export const MOCK_CATEGORIES: Category[] = [
    { id: '1', name: 'Đa khoa', icon: 'hospital-box-outline', color: '#B04B76' },
    { id: '2', name: 'Tim mạch', icon: 'heart', color: '#F87171' },
    { id: '3', name: 'Da liễu', icon: 'bottle-tonic', color: '#F7C5D2' },
    { id: '4', name: 'Nhi khoa', icon: 'baby-face-outline', color: '#FBBF24' },
];

export const MOCK_TOP_DOCTORS = [
  {
    id: 'd1',
    name: 'Dr. Nguyễn Văn A',
    specialty: 'Tim mạch',
    rating: 4.8,
    experience: 'Chuyên gia hàng đầu về tim mạch với hơn 15 năm kinh nghiệm tại các bệnh viện lớn.',
    location: 'TP.HCM',
    price: '500.000 đ',
    imageUrl: 'https://picsum.photos/seed/doctor1/200/200',
  },
  {
    id: 'd2',
    name: 'Dr. Trần Thị B',
    specialty: 'Da liễu',
    rating: 4.9,
    experience: 'Bác sĩ chuyên khoa da liễu, chuyên điều trị các vấn đề về da và thẩm mỹ.',
    location: 'Hà Nội',
    price: '450.000 đ',
    imageUrl: 'https://picsum.photos/seed/doctor2/200/200',
  },
];

export const MOCK_NOTIFICATIONS: NotificationItemType[] = [ // <-- Đã thêm hằng số này
    {
        id: 'n1',
        type: 'appointment',
        title: 'Xác nhận lịch hẹn khám',
        message: 'Lịch hẹn khám với Dr. Nguyễn Văn A vào 14:30 ngày 20/01/2025 đã được xác nhận.',
        timestamp: '5 phút trước',
        isRead: false,
    },
    {
        id: 'n2',
        type: 'promo',
        title: 'Giảm giá 15% gói khám tổng quát',
        message: 'Nhận ngay ưu đãi khi đặt lịch khám tổng quát trong tháng 11 này. Chỉ còn 3 ngày!',
        timestamp: '3 giờ trước',
        isRead: false,
    },
    {
        id: 'n3',
        type: 'system',
        title: 'Cập nhật tính năng mới',
        message: 'Ứng dụng đã được cập nhật với tính năng hồ sơ sức khỏe điện tử. Vui lòng kiểm tra.',
        timestamp: 'Hôm qua',
        isRead: true,
    },
    {
        id: 'n4',
        type: 'appointment',
        title: 'Lịch hẹn đã hoàn thành',
        message: 'Hồ sơ khám với Dr. Trần Thị B đã được lưu. Vui lòng kiểm tra kết quả.',
        timestamp: '1 tuần trước',
        isRead: true,
    },
];