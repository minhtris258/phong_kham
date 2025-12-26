import React, { useState } from 'react';
import { 
  View, Text, TextInput, ScrollView, TouchableOpacity, 
  StyleSheet, Platform, StatusBar, Image, KeyboardAvoidingView, Alert 
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// Service
import appointmentsService from '../services/AppointmentsService';

// Config
import { IP_ADDRESS, PORT  } from '../config'; 

// 👇 FIX LỖI: encodeURI để tránh lỗi màn hình đỏ nếu tên ảnh có dấu cách
const resolveImage = (img: string) => {
  if (!img) return "https://ui-avatars.com/api/?name=Doctor&background=random";
  if (img.startsWith("http")) return img;
  
  // Xử lý đường dẫn tương đối
  const cleanPath = img.startsWith('/') ? img.substring(1) : img;
  const fullUrl = `http://${IP_ADDRESS}:${PORT}/${cleanPath}`;
  return encodeURI(fullUrl); 
};

interface BookingProps {
  bookingData: any; 
  onBack: () => void;
  onSuccess: () => void;
}

export const Booking: React.FC<BookingProps> = ({ bookingData, onBack, onSuccess }) => {
  const { doctor, date, time, slotId } = bookingData || {};
  
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Format ngày
  const displayDate = date ? date.split('-').reverse().join('/') : '';

  const handleConfirm = async () => {
    if (!reason.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập lý do khám / triệu chứng.");
      return;
    }

    if (!slotId) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin lịch khám.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        timeslot_id: slotId,
        reason: reason
      };

      await appointmentsService.bookAppointment(payload);
      
      // 1. Hiện thông báo thành công
      Toast.show({
        type: 'success',
        text1: 'Đặt lịch thành công!',
        text2: 'Vui lòng kiểm tra lịch hẹn trong hồ sơ.',
        visibilityTime: 3000,
      });
      
      // 2. 👇 QUAN TRỌNG: Chờ 1.5s để user đọc thông báo rồi mới chuyển trang
      setTimeout(() => {
        onSuccess(); 
      }, 1500);

    } catch (error: any) {
      console.error("Booking Error:", error);
      const msg = error.response?.data?.message || "Lỗi khi đặt lịch. Vui lòng thử lại.";
      Alert.alert("Đặt lịch thất bại", msg);
    } finally {
      setLoading(false);
    }
  };

  if (!bookingData) return null;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận đặt lịch</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* 1. THÔNG TIN BÁC SĨ */}
        <View style={styles.doctorCard}>
            <Image source={{ uri: resolveImage(doctor.imageUrl || doctor.thumbnail) }} style={styles.avatar} />
            <View style={{flex: 1}}>
                <Text style={styles.docName}>Bs. {doctor.fullName || doctor.name}</Text>
                <Text style={styles.docSpecialty}>{doctor.specialty?.name || doctor.specialty || "Chuyên khoa"}</Text>
                <Text style={styles.docClinic}>{doctor.workplace || "Phòng khám MedPro Center"}</Text>
            </View>
        </View>

        {/* 2. THỜI GIAN KHÁM */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thời gian khám</Text>
            <View style={styles.timeContainer}>
                <View style={styles.timeBox}>
                    <Ionicons name="calendar" size={20} color="#00B5F1" />
                    <View>
                        <Text style={styles.timeLabel}>Ngày khám</Text>
                        <Text style={styles.timeValue}>{displayDate}</Text>
                    </View>
                </View>
                <View style={styles.dividerVertical} />
                <View style={styles.timeBox}>
                    <Ionicons name="time" size={20} color="#00B5F1" />
                    <View>
                        <Text style={styles.timeLabel}>Giờ khám</Text>
                        <Text style={styles.timeValue}>{time}</Text>
                    </View>
                </View>
            </View>
        </View>

        {/* 3. THÔNG TIN BỆNH NHÂN */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin bệnh nhân</Text>
            <View style={styles.patientInfoBox}>
                <FontAwesome5 name="user-check" size={18} color="#059669" />
                <Text style={styles.patientText}>
                    Đang đặt cho: <Text style={{fontWeight: '700'}}>Chính bạn</Text> (Theo hồ sơ đăng nhập)
                </Text>
            </View>
        </View>

        {/* 4. LÝ DO KHÁM */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lý do khám / Triệu chứng <Text style={{color:'red'}}>*</Text></Text>
            <TextInput 
                style={styles.inputReason}
                placeholder="Mô tả triệu chứng, thuốc đang dùng hoặc tiền sử bệnh..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={reason}
                onChangeText={setReason}
            />
        </View>

        {/* 5. GIÁ TIỀN */}
        <View style={styles.section}>
            <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Phí tư vấn</Text>
                <Text style={styles.priceValue}>
                    {doctor.consultation_fee ? Number(doctor.consultation_fee).toLocaleString('vi-VN') : '300.000'}đ
                </Text>
            </View>
        </View>

        <Text style={styles.noteText}>
            Bằng việc xác nhận, bạn cam kết tuân thủ quy định khám chữa bệnh của phòng khám.
        </Text>

      </ScrollView>

      {/* FOOTER BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity 
            style={[styles.confirmBtn, loading && {backgroundColor: '#93C5FD'}]}
            onPress={handleConfirm}
            disabled={loading}
        >
            <Text style={styles.confirmBtnText}>
                {loading ? "Đang xử lý..." : "XÁC NHẬN ĐẶT LỊCH"}
            </Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 10, height: 60, backgroundColor: '#FFF', elevation: 2, borderBottomWidth: 1, borderBottomColor: '#F3F4F6'
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },

  doctorCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', padding: 16, margin: 16,
    borderRadius: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  docName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  docSpecialty: { fontSize: 13, color: '#00B5F1', marginTop: 2, fontWeight: '500' },
  docClinic: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  section: { marginHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 10 },
  
  timeContainer: {
    flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 15,
    borderWidth: 1, borderColor: '#BFDBFE'
  },
  timeBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerVertical: { width: 1, backgroundColor: '#BFDBFE', marginHorizontal: 10 },
  timeLabel: { fontSize: 12, color: '#6B7280' },
  timeValue: { fontSize: 15, fontWeight: '700', color: '#1F2937' },

  patientInfoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#ECFDF5', padding: 15, borderRadius: 12,
    borderWidth: 1, borderColor: '#A7F3D0'
  },
  patientText: { fontSize: 14, color: '#065F46', flex: 1 },

  inputReason: {
    backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, padding: 15, fontSize: 15, color: '#1F2937',
    height: 120
  },

  priceRow: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF', padding: 15, borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed'
  },
  priceLabel: { fontSize: 15, fontWeight: '600', color: '#374151' },
  priceValue: { fontSize: 18, fontWeight: '700', color: '#00B5F1' },

  noteText: { textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginHorizontal: 20, marginBottom: 20 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF', padding: 16,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 30 : 16
  },
  confirmBtn: {
    backgroundColor: '#00B5F1', borderRadius: 12, paddingVertical: 15,
    alignItems: 'center', shadowColor: '#00B5F1', shadowOpacity: 0.3, shadowRadius: 5, elevation: 5
  },
  confirmBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});