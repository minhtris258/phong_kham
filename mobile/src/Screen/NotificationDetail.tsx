import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Image, Platform, Linking, Alert 
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface NotificationDetailProps {
  notification: any;
  onBack: () => void;
  onRate?: (notification: any) => void;      // Callback khi bấm Đánh giá
  onViewResult?: (notification: any) => void; // Callback khi bấm Xem kết quả
}

export const NotificationDetail: React.FC<NotificationDetailProps> = ({ 
  notification, 
  onBack, 
  onRate, 
  onViewResult 
}) => {
  if (!notification) return null;

  const { title, body, data, qr, createdAt, type } = notification;

  // Kiểm tra loại thông báo để hiện nút bấm
  const isRatingRequest = type === "rating_request";
  // Logic kiểm tra kết quả khám (tùy chỉnh theo logic backend của bạn)
  const isMedicalResult = type === "visit" || (title && title.toLowerCase().includes("kết quả"));

  // Format thời gian
  const timeString = createdAt 
    ? format(new Date(createdAt), "HH:mm - dd 'tháng' MM, yyyy", { locale: vi }) 
    : '';

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết thông báo</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* TIME */}
        <Text style={styles.timeText}>{timeString}</Text>

        {/* TITLE */}
        <Text style={styles.titleText}>{title}</Text>

        {/* BODY */}
        <Text style={styles.bodyText}>{body}</Text>

        {/* --- INFO BOX (Nếu có dữ liệu chi tiết) --- */}
        {data && (data.doctorName || data.time) && (
          <View style={styles.infoBox}>
            {data.doctorName && (
              <View style={styles.infoRow}>
                <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="person" size={16} color="#2563EB" />
                </View>
                <View>
                  <Text style={styles.infoLabel}>Bác sĩ</Text>
                  <Text style={styles.infoValue}>{data.doctorName}</Text>
                </View>
              </View>
            )}

            {/* Đường kẻ phân cách nếu có cả 2 thông tin */}
            {data.doctorName && (data.time || data.date) && <View style={styles.divider} />}

            {(data.time || data.date) && (
              <View style={styles.infoRow}>
                <View style={[styles.iconCircle, { backgroundColor: '#FFEDD5' }]}>
                  <Ionicons name="calendar" size={16} color="#EA580C" />
                </View>
                <View>
                  <Text style={styles.infoLabel}>Thời gian khám</Text>
                  <Text style={styles.infoValue}>
                    {data.time} {data.date ? `- ${data.date}` : ''}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* --- QR CODE (Nếu có) --- */}
        {qr && (
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitle}>MÃ CHECK-IN</Text>
            <View style={styles.qrImageWrapper}>
              {/* Dùng Image để hiển thị Base64 hoặc URL */}
              <Image 
                source={{ uri: qr }} 
                style={styles.qrImage} 
                resizeMode="contain"
              />
            </View>
            <Text style={styles.qrNote}>
              Vui lòng đưa mã này cho lễ tân để xác thực
            </Text>
          </View>
        )}

      </ScrollView>

      {/* --- BOTTOM ACTIONS --- */}
      {(isRatingRequest || isMedicalResult) && (
        <View style={styles.bottomBar}>
          {isRatingRequest && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#FBBF24' }]}
              onPress={() => onRate && onRate(notification)}
            >
              <Ionicons name="star" size={18} color="#FFF" />
              <Text style={styles.btnText}>Đánh giá ngay</Text>
            </TouchableOpacity>
          )}

          {isMedicalResult && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#2563EB' }]}
              onPress={() => onViewResult && onViewResult(notification)}
            >
              <FontAwesome5 name="file-medical-alt" size={18} color="#FFF" />
              <Text style={styles.btnText}>Xem kết quả khám</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  
  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 30,
    height: 90, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },

  content: { padding: 20, paddingBottom: 100 },

  timeText: { fontSize: 12, color: '#9CA3AF', marginBottom: 8 },
  titleText: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  bodyText: { fontSize: 15, color: '#4B5563', lineHeight: 24, marginBottom: 24 },

  // Info Box
  infoBox: {
    backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 24
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  infoLabel: { fontSize: 12, color: '#6B7280' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12, marginLeft: 48 },

  // QR Code
  qrContainer: { alignItems: 'center', marginTop: 10, padding: 20, borderWidth: 2, borderColor: '#E0E7FF', borderStyle: 'dashed', borderRadius: 20, backgroundColor: '#F5F8FF' },
  qrTitle: { fontSize: 14, fontWeight: 'bold', color: '#4F46E5', marginBottom: 12, letterSpacing: 1 },
  qrImageWrapper: { backgroundColor: '#FFF', padding: 10, borderRadius: 10, marginBottom: 12 },
  qrImage: { width: 180, height: 180 },
  qrNote: { fontSize: 12, color: '#6B7280', textAlign: 'center' },

  // Bottom Bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F3F4F6',
    elevation: 20, shadowColor: '#000', shadowOffset: {width: 0, height: -2}, shadowOpacity: 0.1, shadowRadius: 4
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 12, width: '100%'
  },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});