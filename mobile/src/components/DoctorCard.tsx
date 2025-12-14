import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { IP_ADDRESS, PORT } from '../config'; 

// 1. Helper xử lý ảnh (Copy từ các file trước để tái sử dụng)
const resolveImage = (img: string | undefined) => {
  if (!img) return "https://ui-avatars.com/api/?name=Doctor&background=random&size=200";
  if (img.includes("via.placeholder.com")) return "https://placehold.co/200x200?text=Doctor";
  if (img.startsWith("http")) return img;
  
  // Xử lý đường dẫn localhost
  const cleanPath = img.startsWith('/') ? img.substring(1) : img;
  return `http://${IP_ADDRESS}:${PORT}/${cleanPath}`;
};

// 2. Helper format tiền
const formatPrice = (amount: number | string | undefined) => {
  if (!amount) return "Liên hệ";
  return Number(amount).toLocaleString('vi-VN') + 'đ';
};

// 3. Interface linh hoạt cho mọi loại dữ liệu bác sĩ
export interface Doctor {
  _id?: string;
  id?: string;
  name?: string;
  fullName?: string; // Backend thường trả về fullName
  specialty?: string | { name: string }; // Có thể là string hoặc object populate
  rating?: number;
  experience?: string; // VD: "10 năm"
  address?: string;
  location?: string;
  consultation_fee?: number; // Backend trả về
  price?: number;
  thumbnail?: string;
  image?: string;
  imageUrl?: string;
}

interface DoctorCardProps {
  doctor: Doctor;
  onPress?: () => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onPress }) => {
  // --- CHUẨN HÓA DỮ LIỆU ---
  const name = doctor.fullName || doctor.name || "Bác sĩ";
  
  // Xử lý chuyên khoa (nếu là object thì lấy .name, nếu string thì lấy trực tiếp)
  const specialtyName = typeof doctor.specialty === 'object' 
    ? doctor.specialty?.name 
    : doctor.specialty || "Đa khoa";

  const imageUri = resolveImage(doctor.thumbnail || doctor.image || doctor.imageUrl);
  const rating = doctor.rating || 5.0;
  const experience = doctor.experience || "5+ năm kinh nghiệm";
  const fee = doctor.consultation_fee || doctor.price;
  const location = doctor.address || doctor.location || "TP.HCM";

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.9} 
      onPress={onPress}
    >
      {/* Ảnh bác sĩ */}
      <Image source={{ uri: imageUri }} style={styles.image} />

      {/* Nội dung bên phải */}
      <View style={styles.content}>
        
        {/* Header: Chuyên khoa & Đánh giá */}
        <View style={styles.headerRow}>
          <View style={styles.specialtyTag}>
            <Text style={styles.specialtyText}>{specialtyName}</Text>
          </View>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={12} color="#FBBF24" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>

        {/* Tên & Kinh nghiệm */}
        <Text style={styles.name} numberOfLines={1}>BS. {name}</Text>
        <Text style={styles.experience}>{experience}</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Footer: Giá & Địa chỉ */}
        <View style={styles.footerRow}>
          <View style={styles.infoItem}>
             <MaterialIcons name="location-on" size={14} color="#9CA3AF" />
             <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
          </View>
          
          <Text style={styles.priceText}>{formatPrice(fee)}</Text>
        </View>

      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    // Shadow đẹp
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3, // Android
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  
  // Header Row
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  specialtyTag: {
    backgroundColor: '#E0F2FE', // Xanh nhạt
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  specialtyText: {
    color: '#00B5F1', // Xanh đậm
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },

  // Main Info
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  experience: {
    fontSize: 12,
    color: '#6B7280',
  },

  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 10,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0069a8', // Xanh dương
  },
});