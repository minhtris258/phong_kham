// src/Screen/DoctorDetail.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, Text, Image, ScrollView, TouchableOpacity, 
  StyleSheet, Platform, StatusBar, ActivityIndicator, Alert 
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

// Services
import doctorService from '../services/DoctorService';
import timeslotService from '../services/TimeslotService';
import doctorSchedulesService from '../services/DoctorScheduleService';

// Contexts
import { useSocket } from '../context/SocketContext';

// Config
import { IP_ADDRESS, PORT  } from '../config'; 

// Helper xử lý ảnh
const resolveImage = (img: string) => {
  if (!img) return "https://ui-avatars.com/api/?name=Doctor&background=random";
  if (img.startsWith("http")) return img;
  return `http://${IP_ADDRESS}:${PORT}/${img}`; 
};

interface DoctorDetailProps {
  doctor: any;
  onBack: () => void;
  onBookPress: (bookingData: any) => void;
}

export const DoctorDetail: React.FC<DoctorDetailProps> = ({ doctor: paramDoctor, onBack, onBookPress }) => {
  const doctorId = paramDoctor.id || paramDoctor._id;

  const [doctor, setDoctor] = useState<any>(paramDoctor || null); 
  const [loading, setLoading] = useState(true);
  
  // State Lịch khám
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const { socket } = useSocket();

  // 👇 SỬA LOGIC TẠO NGÀY TẠI ĐÂY
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayNum = String(date.getDate()).padStart(2, '0');
        const fullDate = `${year}-${month}-${dayNum}`;
        const displayDate = `${dayNum}/${month}`;

        // Logic hiển thị tên thứ
        let dayName = "";
        if (i === 0) {
            dayName = "Hôm nay";
        } else {
            const dayOfWeek = date.getDay(); // 0 = CN, 1 = Thứ 2, ...
            if (dayOfWeek === 0) {
                dayName = "Chủ Nhật";
            } else {
                dayName = `Thứ ${dayOfWeek + 1}`;
            }
        }

        days.push({ dayName, displayDate, fullDate, rawDate: date });
    }
    return days;
  }, []);

  const selectedDay = weekDays[selectedDateIndex];

  // Fetch thông tin chi tiết
  useEffect(() => {
    const fetchInfo = async () => {
        if (!doctorId) return;
        try {
            // const res = await doctorService.getDoctorById(doctorId); 
            // setDoctor(res.data || paramDoctor);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchInfo();
  }, [doctorId]);

  // Fetch Time Slots
  useEffect(() => {
    const fetchSlots = async () => {
        if (!doctorId || !selectedDay) return;
        
        setLoadingSlots(true);
        setAvailableSlots([]);
        setSelectedSlot(null); 

        try {
            console.log(`📡 Fetching slots for Doctor: ${doctorId}, Date: ${selectedDay.fullDate}`);
            const res = await timeslotService.getSlotsByDate(doctorId, selectedDay.fullDate);
            
            let slots = [];
            if (Array.isArray(res)) slots = res;
            else if (res.data && Array.isArray(res.data)) slots = res.data;
            else if (res.slots) slots = res.slots;

            const activeSlots = slots.filter((slot: any) => {
                const isFree = slot.status ? slot.status === 'free' : true;
                return isFree && !slot.isBooked;
            });

            setAvailableSlots(activeSlots);
        } catch (error) {
            console.error("❌ Lỗi tải lịch:", error);
        } finally {
            setLoadingSlots(false);
        }
    };

    fetchSlots();
  }, [selectedDay, doctorId]);

  // Socket Realtime
  useEffect(() => {
    if (!socket) return;
    const handleSlotBooked = (data: any) => {
        if (data.doctorId === doctorId) {
            setAvailableSlots(prev => prev.filter(slot => slot._id !== data.timeslotId));
            if (selectedSlot && selectedSlot._id === data.timeslotId) {
                Alert.alert("Thông báo", "Khung giờ này vừa có người đặt.");
                setSelectedSlot(null);
            }
        }
    };
    socket.on('slot_booked', handleSlotBooked);
    return () => { socket.off('slot_booked', handleSlotBooked); };
  }, [socket, doctorId, selectedSlot]);

  if (!doctor) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Bác sĩ chi tiết</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* INFO CARD */}
        <View style={styles.profileContainer}>
          <View style={styles.profileRow}>
             <Image source={{ uri: resolveImage(doctor.imageUrl || doctor.thumbnail) }} style={styles.avatar} />
             <View style={styles.profileText}>
                <Text style={styles.name}>{doctor.name || `Bs. ${doctor.fullName}`}</Text>
                <Text style={styles.specialty}>{doctor.specialty || doctor.specialty_id?.name || "Đa khoa"}</Text>
                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#FBBF24" />
                    <Text style={styles.ratingText}> {doctor.rating || 5.0} (100+ đánh giá)</Text>
                </View>
             </View>
          </View>
        </View>

        {/* BOOKING SECTION */}
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Lịch khám</Text>
            
            {/* Date Scroll */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                {weekDays.map((day, idx) => (
                    <TouchableOpacity 
                        key={idx} 
                        style={[styles.dateItem, selectedDateIndex === idx && styles.dateItemActive]}
                        onPress={() => setSelectedDateIndex(idx)}
                    >
                        <Text style={[styles.dayName, selectedDateIndex === idx && styles.textWhite]}>
                            {/* Hiển thị Thứ (CN, Thứ 2...) */}
                            {day.dayName === 'Hôm nay' ? 'Nay' : day.dayName === 'Chủ Nhật' ? 'CN' : day.dayName}
                        </Text>
                        <Text style={[styles.dayDate, selectedDateIndex === idx && styles.textWhite]}>
                            {day.displayDate}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Time Slots Grid */}
            <View style={styles.slotsContainer}>
                {loadingSlots ? (
                    <ActivityIndicator size="small" color="#00B5F1" style={{margin: 20}} />
                ) : availableSlots.length === 0 ? (
                    <Text style={styles.noSlotText}>Không có lịch khám cho ngày này.</Text>
                ) : (
                    <View style={styles.slotsGrid}>
                        {availableSlots.map((slot) => {
                            const timeDisplay = slot.time || `${slot.start} - ${slot.end}`;
                            const isSelected = selectedSlot?._id === slot._id;
                            return (
                                <TouchableOpacity 
                                    key={slot._id} 
                                    style={[styles.slotItem, isSelected && styles.slotItemActive]}
                                    onPress={() => setSelectedSlot(slot)}
                                >
                                    <Text style={[styles.slotText, isSelected && styles.textWhite]}>
                                        {timeDisplay}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                )}
            </View>
        </View>

        {/* CLINIC INFO */}
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Địa chỉ phòng khám</Text>
            <View style={styles.clinicCard}>
                <MaterialCommunityIcons name="hospital-marker" size={24} color="#EF4444" />
                <View style={{marginLeft: 10, flex: 1}}>
                    <Text style={styles.clinicName}>Phòng khám MedPro Center</Text>
                    <Text style={styles.clinicAddr}>{doctor.location || doctor.address || "TP. Hồ Chí Minh"}</Text>
                </View>
            </View>
        </View>

        {/* INTRODUCTION */}
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Giới thiệu bác sĩ</Text>
            <Text style={styles.description}>
                {doctor.introduction 
                    ? doctor.introduction 
                    : `Bác sĩ ${doctor.name} là một chuyên gia hàng đầu với nhiều năm kinh nghiệm trong lĩnh vực ${doctor.specialty}. Bác sĩ luôn tận tâm và mang lại phương pháp điều trị tốt nhất cho bệnh nhân.`
                }
            </Text>
        </View>

      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        <View>
            <Text style={styles.priceLabel}>Giá khám</Text>
            <Text style={styles.priceValue}>
                {doctor.consultation_fee ? Number(doctor.consultation_fee).toLocaleString('vi-VN') : '300.000'}đ
            </Text>
        </View>
        <TouchableOpacity 
            style={[styles.bookBtn, (!selectedSlot) && {backgroundColor: '#9CA3AF'}]}
            disabled={!selectedSlot}
            onPress={() => {
                if(!selectedSlot) return;
                const bookingData = {
                    doctor: doctor,
                    date: selectedDay.fullDate,
                    time: selectedSlot.time || `${selectedSlot.start} - ${selectedSlot.end}`,
                    slotId: selectedSlot._id,
                    slot: selectedSlot
                };
                onBookPress(bookingData);
            }}
        >
            <Text style={styles.bookBtnText}>
                {selectedSlot ? 'Đặt lịch ngay' : 'Chọn giờ khám'}
            </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 10, height: 60, backgroundColor: '#FFF', elevation: 2
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  profileContainer: { backgroundColor: '#FFF', padding: 20, marginBottom: 10 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: '#E5E7EB' },
  profileText: { marginLeft: 15, flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  specialty: { fontSize: 14, color: '#6B7280', marginVertical: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { fontSize: 13, color: '#4B5563', fontWeight: '600' },
  sectionContainer: { backgroundColor: '#FFF', padding: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 15 },
  dateScroll: { marginBottom: 15 },
  dateItem: { 
    width: 60, height: 70, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', 
    justifyContent: 'center', alignItems: 'center', marginRight: 10, backgroundColor: '#FFF'
  },
  dateItemActive: { backgroundColor: '#00B5F1', borderColor: '#00B5F1' },
  dayName: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  dayDate: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  textWhite: { color: '#FFF' },
  slotsContainer: { minHeight: 50 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotItem: { 
    width: '30%', paddingVertical: 10, borderWidth: 1, borderColor: '#E5E7EB', 
    borderRadius: 8, alignItems: 'center', marginBottom: 8 
  },
  slotItemActive: { backgroundColor: '#00B5F1', borderColor: '#00B5F1' },
  slotText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  noSlotText: { textAlign: 'center', color: '#9CA3AF', marginVertical: 10 },
  clinicCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 15, borderRadius: 12 },
  clinicName: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  clinicAddr: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  description: { fontSize: 14, color: '#4B5563', lineHeight: 22 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF', padding: 16, paddingBottom: Platform.OS === 'ios' ? 30: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#E5E7EB', elevation: 20,
  },
  priceLabel: { fontSize: 12, color: '#6B7280' },
  priceValue: { fontSize: 18, fontWeight: '700', color: '#00B5F1' },
  bookBtn: { 
    backgroundColor: '#00B5F1', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 30 
  },
  bookBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700'  }
});