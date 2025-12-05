import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity,
  Platform
} from 'react-native';

// Import separated components
import { HomeHeader } from '../components/HomeHeader';
import { CategoryItem } from '../components/CategoryItem';
import { DoctorCard } from '../components/DoctorCard';

// Import MOCK DATA
import { MOCK_CATEGORIES, MOCK_TOP_DOCTORS, MOCK_USER } from '../constants/mockData';

// --- MAIN SCREEN COMPONENT ---
// THÊM PROPS MỚI
interface HomeScreenProps {
    onNotificationIconPress: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNotificationIconPress }) => {
  // Mock handler functions
  const handleSeeMore = () => {
    console.log('Navigate to doctor list screen');
  };
  const handleCategoryPress = (name: string) => {
    console.log(`Maps to specialty screen: ${name}`);
  };

  // PADDING FIX: Increased Android padding to 80 for better clearance above the BottomNav
  const BOTTOM_NAV_PADDING = Platform.OS === 'ios' ? 90 : 80;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      
      {/* Header (fixed at the top) */}
      <HomeHeader 
        userName={MOCK_USER.name} // Sử dụng MOCK_USER
        avatarUrl={MOCK_USER.avatar} // Sử dụng MOCK_USER
        onSearchPress={() => console.log('Open search screen')}
        // ĐÃ SỬA: GỌI HÀM ĐƯỢC TRUYỀN TỪ APP.TSX
        onNotificationPress={onNotificationIconPress}
      />

      {/* Scrollable Content (takes the rest of the space) */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        
        {/* Categories Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Chuyên khoa</Text>
          <View style={styles.categoriesRow}>
            {MOCK_CATEGORIES.map((item) => ( // Sử dụng MOCK_CATEGORIES
              <CategoryItem 
                key={item.id} 
                {...item} 
                onPress={() => handleCategoryPress(item.name)} 
              />
            ))}
          </View>
        </View>

        {/* Top Doctors Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bác sĩ hàng đầu</Text>
            <TouchableOpacity onPress={handleSeeMore} activeOpacity={0.7}>
              <Text style={styles.seeMoreText}>Xem thêm</Text>
            </TouchableOpacity>
          </View>
          {MOCK_TOP_DOCTORS.map((doctor) => ( // Sử dụng MOCK_TOP_DOCTORS
            <DoctorCard 
              key={doctor.id} 
              doctor={doctor} 
              onPress={() => console.log(`View doctor details: ${doctor.name}`)}
            />
          ))}
        </View>

        {/* BOTTOM PADDING: Ensures the content scrolls above the BottomNav */}
        <View style={{ height: BOTTOM_NAV_PADDING }} /> 

      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingBottom: 0,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937', 
  },
  seeMoreText: {
    fontSize: 14,
    color: '#2563EB', 
    fontWeight: '600',
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});