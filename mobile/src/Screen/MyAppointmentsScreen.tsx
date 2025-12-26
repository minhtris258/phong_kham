import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Image, Alert, 
  Platform, ScrollView
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import appointmentsService from '../services/AppointmentsService';
import { useAppContext } from '../context/AppContext';
import { IP_ADDRESS, PORT } from '../config'; 

const resolveAvatar = (img: string) => {
  if (!img) return "https://ui-avatars.com/api/?name=Doctor&background=random";
  if (img.startsWith("http")) return img;
  return `http://${IP_ADDRESS}:${PORT}/${img}`;
};

interface MyAppointmentsProps {
  onBack: () => void;
  onViewResult: (appointmentId: string) => void; 
}

export const MyAppointmentsScreen: React.FC<MyAppointmentsProps> = ({ onBack, onViewResult }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const { user } = useAppContext();

  const filterOptions = [
    { id: 'all', label: 'Tất cả' },
    { id: 'completed', label: 'Đã khám' },
    { id: 'confirmed', label: 'Đã xác nhận' },
    { id: 'pending', label: 'Chờ xác nhận' },
    { id: 'cancelled', label: 'Đã hủy' },
  ];

  const fetchApps = useCallback(async () => {
    try {
      const res = await appointmentsService.myAppointments();
      const data = res.data?.data || res.data || [];
      
      const sortedData = data.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setAppointments(sortedData);
    } catch (error) {
      console.error("Lỗi tải lịch hẹn:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchApps();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchApps();
  };

  const filteredAppointments = useMemo(() => {
    if (filterStatus === 'all') return appointments;
    return appointments.filter((item) => item.status === filterStatus);
  }, [appointments, filterStatus]);

  const handleCancel = (appointmentId: string) => {
    Alert.alert(
      "Xác nhận hủy",
      "Bạn có chắc chắn muốn hủy lịch hẹn này không?",
      [
        { text: "Không", style: "cancel" },
        { 
          text: "Hủy lịch", 
          style: "destructive",
          onPress: async () => {
            try {
              await appointmentsService.cancelAppointment(appointmentId);
              Alert.alert("Thành công", "Đã hủy lịch hẹn.");
              fetchApps();
            } catch (error: any) {
              const msg = error.response?.data?.message || "Hủy thất bại";
              Alert.alert("Lỗi", msg);
            }
          }
        }
      ]
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return { bg: '#ECFDF5', text: '#059669', label: 'Đã xác nhận' };
      case 'pending': return { bg: '#FFFBEB', text: '#D97706', label: 'Chờ xác nhận' };
      case 'cancelled': return { bg: '#FEF2F2', text: '#DC2626', label: 'Đã hủy' };
      case 'completed': return { bg: '#EFF6FF', text: '#2563EB', label: 'Đã khám' };
      default: return { bg: '#F3F4F6', text: '#4B5563', label: status };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const statusStyle = getStatusStyle(item.status);
    const doctor = item.doctor_id || {};
    
    // 👇 CẬP NHẬT LOGIC LẤY TÊN CHUYÊN KHOA
    // Ưu tiên lấy từ specialty_id.name (do backend mới populate)
    const specialtyName = 
        doctor.specialty_id?.name ||    // Ưu tiên 1
        doctor.specialty?.name ||       // Ưu tiên 2
        doctor.specialty ||             // Ưu tiên 3 (nếu backend trả string)
        "Đa khoa";                      // Mặc định

    const isCompleted = item.status === 'completed';
    const canCancel = item.status === 'pending' || item.status === 'confirmed';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(item.date).toLocaleDateString('vi-VN')}
          </Text>
        </View>

        <View style={styles.cardBody}>
          <Image 
            source={{ uri: resolveAvatar(doctor.thumbnail || doctor.image) }} 
            style={styles.avatar} 
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorName}>Bs. {doctor.fullName || "Bác sĩ"}</Text>
            
            {/* Hiển thị chuyên khoa */}
            <Text style={styles.specialty}>{specialtyName}</Text>
            
            <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.timeText}>{item.start}</Text>
            </View>
          </View>
        </View>

        {(isCompleted || canCancel) && (
            <View style={styles.cardFooter}>
                {canCancel && (
                    <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={() => handleCancel(item._id || item.id)}
                    >
                        <Text style={styles.cancelText}>Hủy lịch</Text>
                    </TouchableOpacity>
                )}

                {isCompleted && (
                    <TouchableOpacity 
                        style={styles.resultButton}
                        onPress={() => onViewResult(item._id || item.id)}
                    >
                        <FontAwesome5 name="file-medical-alt" size={14} color="#FFF" />
                        <Text style={styles.resultText}>Xem kết quả</Text>
                    </TouchableOpacity>
                )}
            </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch hẹn của tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
        >
            {filterOptions.map((opt) => (
                <TouchableOpacity
                    key={opt.id}
                    style={[
                        styles.filterChip,
                        filterStatus === opt.id && styles.filterChipActive
                    ]}
                    onPress={() => setFilterStatus(opt.id)}
                >
                    <Text style={[
                        styles.filterText,
                        filterStatus === opt.id && styles.filterTextActive
                    ]}>
                        {opt.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#0095D5" />
      ) : (
        <FlatList
          data={filteredAppointments} 
          keyExtractor={(item: any) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0095D5']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={64} color="#E5E7EB" />
                <Text style={styles.emptyText}>Bạn chưa có lịch hẹn nào.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: Platform.OS === 'android' ? 40 : 50,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6'
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  
  filterContainer: { backgroundColor: '#FFF', height: 60 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F3F4F6', marginRight: 10, height: 36, justifyContent: 'center'
  },
  filterChipActive: { backgroundColor: '#0095D5' },
  filterText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  filterTextActive: { color: '#FFF', fontWeight: '700' },

  list: { padding: 16, paddingBottom: 100 },
  
  card: {
    backgroundColor: '#FFF', borderRadius: 12, marginBottom: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  dateText: { fontSize: 13, color: '#6B7280' },

  cardBody: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E5E7EB' },
  doctorName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  specialty: { fontSize: 13, color: '#6B7280', marginVertical: 2 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 13, color: '#4B5563', fontWeight: '500' },

  cardFooter: { 
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', 
    flexDirection: 'row', justifyContent: 'flex-end', gap: 10 
  },
  
  resultButton: { 
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, 
    backgroundColor: '#2563EB' 
  },
  resultText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

  cancelButton: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA'
  },
  cancelText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },

  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 12, color: '#9CA3AF', fontSize: 16 }
});