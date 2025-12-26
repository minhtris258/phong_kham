import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native';
import doctorService from '../services/DoctorService'; 
import { DoctorCard } from './DoctorCard'; 
import { IP_ADDRESS, PORT } from '../config'; 

// Helper xử lý ảnh
const resolveImage = (img: string) => {
  if (!img) return "https://ui-avatars.com/api/?name=Doctor&background=random";
  if (img.startsWith("http")) return img;
  // Xử lý đường dẫn tương đối
  const cleanPath = img.startsWith('/') ? img.substring(1) : img;
  return `http://${IP_ADDRESS}:${PORT}/${cleanPath}`; 
};

// Interface props
interface DoctorListProps {
  onDoctorSelect?: (doctor: any) => void;
  onSeeAll?: () => void; // 👇 Thêm prop này để nút "Xem tất cả" hoạt động
}

export const DoctorList: React.FC<DoctorListProps> = ({ onDoctorSelect, onSeeAll }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        // Lấy 5 bác sĩ mới nhất/nổi bật
        const res = await doctorService.getAllDoctors({ limit: 5 });
        const rawList = res.data?.doctors || res.data || [];
        
        const currentYear = new Date().getFullYear();

        const formattedList = rawList.map((doc: any) => {
            // 1. Tính năm kinh nghiệm động
            let expString = "Mới hành nghề";
            if (doc.career_start_year) {
                const years = currentYear - doc.career_start_year;
                if (years > 0) expString = `${years} năm kinh nghiệm`;
            }

            // 2. Format dữ liệu chuẩn cho DoctorCard
            return {
                _id: doc._id, 
                name: doc.fullName || doc.name, 
                specialty: doc.specialty_id?.name || 'Đa khoa',
                rating: doc.averageRating || 5.0,
                
                // Dùng giá trị đã tính toán
                experience: expString, 
                
                location: doc.address || 'TP. Hồ Chí Minh',
                consultation_fee: doc.consultation_fee, // DoctorCard sẽ tự format tiền
                thumbnail: doc.thumbnail, // DoctorCard sẽ tự resolve ảnh
                
                // Giữ lại toàn bộ data gốc (để dùng khi click vào chi tiết)
                ...doc 
            };
        });

        setDoctors(formattedList);
      } catch (error) {
        console.error("Lỗi tải danh sách bác sĩ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color="#00B5F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Bác sĩ nổi bật</Text>
        <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      
      {/* List */}
      <View style={styles.listContent}>
        {doctors.map((item: any) => (
          <View key={item._id} style={{ marginBottom: 10 }}> 
             <DoctorCard 
                doctor={item} 
                onPress={() => onDoctorSelect && onDoctorSelect(item)} 
             />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', marginTop: 10 },
  center: { height: 100, justifyContent: 'center', alignItems: 'center' },
  
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, marginBottom: 10 
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  seeAll: { fontSize: 14, color: '#00B5F1', fontWeight: '600' },
  
  listContent: { paddingHorizontal: 16, paddingBottom: 10 }
});