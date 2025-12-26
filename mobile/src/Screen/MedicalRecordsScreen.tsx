// src/Screen/MedicalRecordsScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Image, Platform
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import appointmentsService from '../services/AppointmentsService';
import { IP_ADDRESS, PORT } from '../config'; 

const resolveAvatar = (img: string) => {
  if (!img) return "https://ui-avatars.com/api/?name=Doctor&background=random";
  if (img.startsWith("http")) return img;
  return `http://${IP_ADDRESS}:${PORT}/${img}`;
};

interface MedicalRecordsProps {
  onBack: () => void;
  onViewResult: (appointmentId: string) => void; 
}

export const MedicalRecordsScreen: React.FC<MedicalRecordsProps> = ({ onBack, onViewResult }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecords = useCallback(async () => {
    try {
      const res = await appointmentsService.myAppointments();
      const data = res.data?.data || res.data || [];
      
      // CHỈ LẤY CÁC CUỘC HẸN ĐÃ KHÁM (COMPLETED)
      const completedRecords = data
        .filter((item: any) => item.status === 'completed')
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setRecords(completedRecords);
    } catch (error) {
      console.error("Lỗi tải hồ sơ y tế:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  const renderItem = ({ item }: { item: any }) => {
    const doctor = item.doctor_id || {};
    const specialtyName = doctor.specialty_id?.name || doctor.specialty?.name || "Đa khoa";

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => onViewResult(item._id || item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.dateBadge}>
            <Ionicons name="calendar" size={14} color="#4B5563" />
            <Text style={styles.dateText}>
              {new Date(item.date).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>Đã hoàn tất</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Image 
            source={{ uri: resolveAvatar(doctor.thumbnail || doctor.image) }} 
            style={styles.avatar} 
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorName}>Bs. {doctor.fullName || "Bác sĩ"}</Text>
            <Text style={styles.specialty}>{specialtyName}</Text>
            <Text style={styles.recordId}>Mã hồ sơ: #{ (item._id || item.id).slice(-6).toUpperCase() }</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </View>

        <View style={styles.cardFooter}>
            <View style={styles.btnResult}>
                <FontAwesome5 name="file-medical" size={14} color="#2563EB" />
                <Text style={styles.btnResultText}>Xem chi tiết kết quả khám</Text>
            </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ y tế</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            Bạn có <Text style={styles.bold}>{records.length}</Text> hồ sơ khám bệnh
          </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#0095D5" />
      ) : (
        <FlatList
          data={records} 
          keyExtractor={(item: any) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0095D5']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={80} color="#E5E7EB" />
                <Text style={styles.emptyText}>Chưa có hồ sơ y tế nào.</Text>
                <Text style={styles.emptySubText}>Kết quả khám sẽ hiển thị tại đây sau khi bạn hoàn tất ca khám tại bệnh viện.</Text>
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
  
  summaryBox: { padding: 16, backgroundColor: '#EFF6FF' },
  summaryText: { fontSize: 14, color: '#1E40AF' },
  bold: { fontWeight: 'bold' },

  list: { padding: 16, paddingBottom: 100 },
  
  card: {
    backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16, padding: 16,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12
  },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 14, color: '#4B5563', fontWeight: '600' },
  completedBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  completedText: { color: '#059669', fontSize: 11, fontWeight: 'bold' },

  cardBody: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#E5E7EB' },
  doctorName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  specialty: { fontSize: 13, color: '#00B5F1', marginVertical: 2, fontWeight: '500' },
  recordId: { fontSize: 12, color: '#9CA3AF' },

  cardFooter: { 
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6'
  },
  btnResult: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnResultText: { color: '#2563EB', fontSize: 14, fontWeight: '600' },

  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyText: { marginTop: 16, color: '#4B5563', fontSize: 18, fontWeight: 'bold' },
  emptySubText: { marginTop: 8, color: '#9CA3AF', fontSize: 14, textAlign: 'center', lineHeight: 20 }
});