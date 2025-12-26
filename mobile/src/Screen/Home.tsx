import React from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';

// Import components
import { HomeHeader } from '../components/HomeHeader';
import { DoctorList } from '../components/DoctorList';
import { SpecialtyList } from '../components/SpecialtyList';
import { HomePosts } from '../components/HomePosts';

interface HomeScreenProps {
  onNotificationIconPress: () => void;
  onSearchIconPress: () => void;
  onDoctorSelect?: (doctor: any) => void;
  onPostSelect?: (slug: string) => void;
  onSelectSpecialty?: (id: string) => void;
  onSeeAllDoctors?: () => void;
  onSeeAllPosts?: () => void; // 👈 1. THÊM DÒNG NÀY
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNotificationIconPress,
  onSearchIconPress,
  onDoctorSelect,
  onPostSelect,
  onSelectSpecialty,
  onSeeAllDoctors,
  onSeeAllPosts, // 👈 2. NHẬN PROP Ở ĐÂY
}) => {
  const BOTTOM_NAV_PADDING = Platform.OS === 'ios' ? 90 : 80;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <HomeHeader
      
       onSearchPress={onSearchIconPress}
        onNotificationPress={onNotificationIconPress}
      />

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        {/* Danh mục Chuyên khoa */}
        <SpecialtyList onSelectSpecialty={onSelectSpecialty} />
        <HomePosts onPostSelect={onPostSelect} onSeeAll={onSeeAllPosts} />
        {/* Bác sĩ hàng đầu */}
        <View style={styles.sectionContainer}>
          <DoctorList
            onDoctorSelect={onDoctorSelect}
            onSeeAll={onSeeAllDoctors} // 👈 3. TRUYỀN XUỐNG DOCTOR LIST
          />
        </View>

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
    marginTop: 10,
  },
});
