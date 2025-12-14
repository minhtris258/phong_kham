import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, 
  Platform, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IP_ADDRESS, PORT } from '../config'; 

// Helper xử lý ảnh
const resolveImage = (img: string) => {
  if (!img || img.includes("via.placeholder.com")) return "https://placehold.co/800x400?text=Service";
  if (img.startsWith("http")) return img;
  return `http://${IP_ADDRESS}:${PORT}/${img}`;
};

// Helper format giá
const formatPrice = (value: any) => {
  if (value === null || value === undefined || value === "") return "Liên hệ";
  const n = Number(value);
  if (isNaN(n)) return value;
  return n.toLocaleString("vi-VN") + "đ";
};

interface ServiceDetailProps {
  service: any;
  onBack: () => void;
  onBook?: (service: any) => void; // Tùy chọn: Nút đặt lịch nếu cần
}

export const ServiceDetail: React.FC<ServiceDetailProps> = ({ service, onBack, onBook }) => {
  if (!service) return null;

  const fee = service.price || service.fee || 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết dịch vụ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. Ảnh dịch vụ */}
        <Image 
            source={{ uri: resolveImage(service.thumbnail || service.image) }} 
            style={styles.heroImage}
            resizeMode="cover"
        />

        {/* 2. Nội dung chính */}
        <View style={styles.contentContainer}>
            
            {/* Tên dịch vụ */}
            <Text style={styles.serviceName}>{service.name}</Text>

            {/* Mã dịch vụ */}
            {service.code && (
                <View style={styles.codeContainer}>
                    <Text style={styles.codeLabel}>Mã dịch vụ: </Text>
                    <Text style={styles.codeValue}>{service.code}</Text>
                </View>
            )}

            <View style={styles.divider} />

            {/* Giá tiền */}
            <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Chi phí:</Text>
                <Text style={styles.priceValue}>{formatPrice(fee)}</Text>
            </View>

            <View style={styles.divider} />

            {/* Mô tả */}
            <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
            <Text style={styles.description}>
                {service.description || "Chưa có mô tả chi tiết cho dịch vụ này."}
            </Text>

        </View>
      </ScrollView>

      {/* Footer Button (Optional) */}
      <View style={styles.footer}>
        <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => onBook && onBook(service)}
        >
            <Text style={styles.bookButtonText}>Liên hệ tư vấn ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    zIndex: 10
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },

  scrollContent: { paddingBottom: 100 },

  heroImage: { width: '100%', height: 220 },

  contentContainer: { padding: 20 },

  serviceName: { fontSize: 22, fontWeight: 'bold', color: '#0a2463', marginBottom: 8, lineHeight: 30 },
  
  codeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  codeLabel: { fontSize: 14, color: '#6B7280' },
  codeValue: { fontSize: 14, fontWeight: '600', color: '#374151' },

  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 16, fontWeight: '600', color: '#374151' },
  priceValue: { fontSize: 20, fontWeight: 'bold', color: '#DC2626' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 8, marginTop: 4 },
  description: { fontSize: 15, color: '#4B5563', lineHeight: 24, textAlign: 'justify' },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F3F4F6',
    paddingBottom: Platform.OS === 'ios' ? 30 : 16
  },
  bookButton: {
    backgroundColor: '#0a2463', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center'
  },
  bookButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});