import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
    Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Sử dụng icon (cần cài đặt @expo/vector-icons)


// --- MOCK DATA (Dữ liệu giả) ---
// Dùng MOCK_TOP_DOCTORS và MOCK_CATEGORIES đã có từ HomeScreen
const MOCK_TOP_DOCTORS = [
  { id: 'd1', name: 'Dr. Nguyễn Văn A', specialty: 'Răng Hàm Mặt', rating: 4.9 },
  { id: 'd2', name: 'Dr. Trần Thị B', specialty: 'Nhi Khoa', rating: 4.7 },
  { id: 'd3', name: 'Dr. Lê Hữu C', specialty: 'Da Liễu', rating: 4.8 },
];
const MOCK_CATEGORIES = [
  { id: 'c1', name: 'Răng Hàm Mặt', icon: 'tooth' },
  { id: 'c2', name: 'Nhi Khoa', icon: 'body' },
  { id: 'c3', name: 'Da Liễu', icon: 'body-outline' },
  { id: 'c4', name: 'Tim Mạch', icon: 'heart' },
];

// Component Card đơn giản cho kết quả tìm kiếm (Giả định)
const SearchResultCard = ({ name, description }: { name: string, description: string }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.8}>
    <Text style={styles.cardName}>{name}</Text>
    <Text style={styles.cardDescription}>{description}</Text>
  </TouchableOpacity>
);
// -----------------------------

interface SearchProps {
  title: string;
}

export const Search: React.FC<SearchProps> = ({ title }) => {
  const [searchText, setSearchText] = useState('');

  // Lọc kết quả: Tìm kiếm trong tên bác sĩ HOẶC tên khoa khám
  const filteredResults = MOCK_TOP_DOCTORS
    .filter(doctor => 
      doctor.name.toLowerCase().includes(searchText.toLowerCase()) || 
      doctor.specialty.toLowerCase().includes(searchText.toLowerCase())
    )
    .map(doctor => ({
      id: doctor.id,
      name: doctor.name,
      description: `Bác sĩ ${doctor.specialty} - Xếp hạng ${doctor.rating}`,
      type: 'doctor'
    }));

  const filteredCategories = MOCK_CATEGORIES
    .filter(cat => 
      cat.name.toLowerCase().includes(searchText.toLowerCase())
    )
    .map(cat => ({
      id: cat.id,
      name: cat.name,
      description: `Khoa khám: ${cat.name}`,
      type: 'category'
    }));
    
  // Gộp kết quả của Bác sĩ và Khoa khám
  const combinedResults = [...filteredResults, ...filteredCategories];


  return (
    <View style={styles.container}>
      {/* 1. Thanh Tìm Kiếm (Search Bar) */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm bác sĩ, chuyên khoa..."
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Tiêu đề */}
      <Text style={styles.headerTitle}>{title}</Text>

      {/* 2. Khu vực hiển thị kết quả */}
      <ScrollView contentContainerStyle={styles.resultsScrollView} keyboardShouldPersistTaps="handled">
        
        {/* Trường hợp không tìm thấy */}
        {combinedResults.length === 0 && searchText.length > 0 ? (
          <Text style={styles.noResultsText}>
            Không tìm thấy kết quả cho "{searchText}"
          </Text>
        ) : (
          // Hiển thị kết quả
          combinedResults.map((item) => (
            <SearchResultCard 
              key={item.id + item.type} 
              name={item.name} 
              description={item.description}
            />
          ))
        )}

        {/* Mặc định hiển thị các chuyên khoa phổ biến khi chưa nhập gì */}
        {searchText.length === 0 && (
            <View style={styles.defaultContent}>
                <Text style={styles.defaultTitle}>Các Chuyên Khoa Phổ Biến</Text>
                <View style={styles.defaultTags}>
                    {MOCK_CATEGORIES.map(cat => (
                        <TouchableOpacity 
                            key={cat.id} 
                            style={styles.categoryTag} 
                            onPress={() => setSearchText(cat.name)} // Nhấn vào để tìm kiếm ngay
                        >
                            <Text style={styles.categoryTagText}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        )}

        {/* Đệm cuối để dễ cuộn */}
        <View style={{ height: 100 }} /> 

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Nền màu xám nhẹ
    paddingTop: 50, // Đảm bảo không bị che bởi status bar
    paddingHorizontal: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 5, // Tùy chỉnh padding cho Android/iOS
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  clearButton: {
    paddingLeft: 10,
  },
  resultsScrollView: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  noResultsText: {
    marginTop: 20,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  defaultContent: {
    marginTop: 20,
  },
  defaultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  defaultTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryTagText: {
    color: '#2563EB',
    fontWeight: '500',
    fontSize: 14,
  }
});