import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert, Platform 
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import visitService from '../services/VisitService'; //

interface PatientVisitDetailProps {
  appointmentId: string; // Nhận ID cuộc hẹn từ App.tsx
  onBack: () => void;
}

export const PatientVisitDetail: React.FC<PatientVisitDetailProps> = ({ appointmentId, onBack }) => {
  const [visit, setVisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Helpers ---
  const formatCurrency = (amount: any) => {
    return (Number(amount) || 0).toLocaleString('vi-VN');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch { return "N/A"; }
  };

  // --- Fetch Data ---
  useEffect(() => {
    const fetchVisitDetail = async () => {
        if (!appointmentId) return;
        try {
            setLoading(true);
            setError(null);
            
            // Gọi API (Logic giống hệt bên Web)
            const response = await visitService.getVisitByAppointment(appointmentId);
            
            // Xử lý data an toàn
            const rawData = response && response.data ? response.data : response;
            let visitData = null;
            
            if (Array.isArray(rawData)) {
                visitData = rawData[0];
            } else if (rawData.visit) {
                visitData = rawData.visit;
            } else {
                visitData = rawData;
            }

            if (visitData && visitData._id) {
                setVisit(visitData);
            } else {
                setError("Chưa tìm thấy hồ sơ khám bệnh cho lịch hẹn này.");
            }
        } catch (err: any) {
            console.error("Lỗi tải chi tiết:", err);
            if (err.response && err.response.status === 404) {
                 setError("Bác sĩ chưa cập nhật hồ sơ khám bệnh.");
            } else {
                 setError("Không thể tải dữ liệu.");
            }
        } finally {
            setLoading(false);
        }
    };

    fetchVisitDetail();
  }, [appointmentId]);

  // --- Render Loading / Error ---
  if (loading) {
    return (
        <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#00B5F1" />
            <Text style={{ marginTop: 10, color: '#6B7280' }}>Đang tải kết quả khám...</Text>
        </View>
    );
  }

  if (error || !visit) {
    return (
        <View style={styles.centerContainer}>
            <Ionicons name="document-text-outline" size={64} color="#EF4444" />
            <Text style={styles.errorText}>{error || "Lỗi không xác định"}</Text>
            <TouchableOpacity onPress={onBack} style={styles.backButtonCenter}>
                <Text style={styles.backButtonText}>Quay lại</Text>
            </TouchableOpacity>
        </View>
    );
  }

  // --- Render Main Content ---
  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kết quả khám bệnh</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Thông tin chung */}
        <View style={styles.metaContainer}>
            <Text style={styles.metaText}>
                Mã hồ sơ: <Text style={styles.bold}>#{visit._id.slice(-8).toUpperCase()}</Text>
            </Text>
            <Text style={styles.metaText}>
                Ngày khám: <Text style={styles.bold}>{formatDate(visit.createdAt)}</Text>
            </Text>
        </View>

        {/* 1. CHẨN ĐOÁN (Diagnosis) */}
        <View style={styles.card}>
            <View style={[styles.cardHeader, { backgroundColor: '#EEF2FF' }]}> 
                <FontAwesome5 name="stethoscope" size={18} color="#4F46E5" />
                <Text style={[styles.cardTitle, { color: '#374151' }]}>Chẩn đoán & Triệu chứng</Text>
            </View>
            <View style={styles.cardBody}>
                <View style={styles.rowItem}>
                    <Text style={styles.label}>Triệu chứng:</Text>
                    <Text style={styles.value}>{visit.symptoms || "Không ghi nhận"}</Text>
                </View>
                <View style={[styles.divider, { marginVertical: 10 }]} />
                <View style={styles.rowItem}>
                    <Text style={styles.label}>Kết luận:</Text>
                    <Text style={[styles.value, { color: '#4F46E5', fontWeight: 'bold', fontSize: 16 }]}>
                        {visit.diagnosis || "Chưa có chẩn đoán"}
                    </Text>
                </View>
                
                {visit.advice && (
                    <View style={styles.noteBox}>
                        <Text style={styles.noteLabel}>Lời dặn:</Text>
                        <Text style={styles.noteValue}>{visit.advice}</Text>
                    </View>
                )}
            </View>
        </View>

        {/* 2. ĐƠN THUỐC (Prescription) */}
        <View style={styles.card}>
            <View style={[styles.cardHeader, { backgroundColor: '#ECFDF5' }]}> 
                <MaterialCommunityIcons name="pill" size={20} color="#059669" />
                <Text style={[styles.cardTitle, { color: '#374151' }]}>Đơn thuốc</Text>
            </View>
            <View style={styles.cardBody}>
                {visit.prescriptions && visit.prescriptions.length > 0 ? (
                    visit.prescriptions.map((drug: any, index: number) => (
                        <View key={index} style={[styles.drugRow, index !== 0 && { borderTopWidth: 1, borderTopColor: '#F3F4F6' }]}>
                            <Text style={styles.drugName}>{drug.drug || drug.name}</Text>
                            <View style={styles.drugDetails}>
                                <Text style={styles.drugInfo}>Liều: {drug.dosage}</Text>
                                <Text style={styles.drugInfo}>• {drug.frequency}</Text>
                            </View>
                            <Text style={styles.drugDuration}>Trong: {drug.duration}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={{ fontStyle: 'italic', color: '#9CA3AF', textAlign: 'center' }}>Không có đơn thuốc</Text>
                )}
            </View>
        </View>

        {/* 3. CHI PHÍ (Billing) */}
        <View style={styles.card}>
            <View style={[styles.cardHeader, { backgroundColor: '#FFEDD5' }]}> 
                <Ionicons name="receipt-outline" size={20} color="#EA580C" />
                <Text style={[styles.cardTitle, { color: '#374151' }]}>Chi phí khám</Text>
            </View>
            <View style={styles.cardBody}>
                {/* Phí khám */}
                <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Phí khám bệnh</Text>
                    <Text style={styles.billValue}>{formatCurrency(visit.consultation_fee_snapshot)} đ</Text>
                </View>

                {/* Các mục khác */}
                {visit.bill_items && visit.bill_items.map((item: any, idx: number) => (
                    <View key={idx} style={styles.billRow}>
                        <Text style={styles.billLabel}>
                            {item.name} <Text style={{ fontSize: 12, color: '#9CA3AF' }}>x{item.quantity || 1}</Text>
                        </Text>
                        <Text style={styles.billValue}>{formatCurrency(item.price)} đ</Text>
                    </View>
                ))}

                <View style={styles.divider} />

                {/* Tổng cộng */}
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tổng cộng</Text>
                    <Text style={styles.totalValue}>{formatCurrency(visit.total_amount)} đ</Text>
                </View>
            </View>
        </View>

        {/* Nút tải hóa đơn (Mock) */}
        <TouchableOpacity style={styles.pdfButton} onPress={() => Alert.alert("Thông báo", "Tính năng tải PDF đang được phát triển")}>
            <Ionicons name="download-outline" size={20} color="#374151" />
            <Text style={styles.pdfButtonText}>Tải hóa đơn (PDF)</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  
  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 30,
    height: 90, backgroundColor: '#FFF', elevation: 2, borderBottomWidth: 1, borderBottomColor: '#F3F4F6'
  },
  headerBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },

  content: { padding: 16 },

  // Meta Info
  metaContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  metaText: { fontSize: 13, color: '#6B7280' },
  bold: { fontWeight: '700', color: '#374151' },

  // Card Styles
  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardBody: { padding: 16 },

  // Diagnosis Items
  rowItem: { marginBottom: 8 },
  label: { fontSize: 12, color: '#6B7280', textTransform: 'uppercase', marginBottom: 4, fontWeight: '600' },
  value: { fontSize: 15, color: '#1F2937', lineHeight: 22 },
  noteBox: { marginTop: 10, backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#F3F4F6' },
  noteLabel: { fontSize: 12, fontWeight: 'bold', color: '#4B5563' },
  noteValue: { fontSize: 14, color: '#4B5563', fontStyle: 'italic', marginTop: 2 },

  // Prescription Items
  drugRow: { paddingVertical: 10 },
  drugName: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  drugDetails: { flexDirection: 'row', marginTop: 4, gap: 10 },
  drugInfo: { fontSize: 13, color: '#4B5563' },
  drugDuration: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  // Billing Items
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  billLabel: { fontSize: 14, color: '#4B5563' },
  billValue: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8, borderStyle: 'dashed', borderWidth: 0.5, borderColor: '#D1D5DB' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#4F46E5' },

  // Buttons & Error
  pdfButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, backgroundColor: '#E5E7EB', borderRadius: 8, gap: 8 },
  pdfButtonText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  errorText: { marginTop: 16, fontSize: 16, color: '#374151', textAlign: 'center', marginBottom: 20 },
  backButtonCenter: { paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#F3F4F6', borderRadius: 8 },
  backButtonText: { color: '#374151', fontWeight: '600' }
});