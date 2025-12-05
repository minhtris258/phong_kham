import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Platform // Để xử lý padding cho iOS/Android
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Icon đẹp hơn

// --- Dữ liệu giả (Mock Data) ---
const MOCK_USER = {
  name: "Phạm Minh Tâm",
  email: "phamminhtam@example.com",
  avatar: "https://randomuser.me/api/portraits/women/68.jpg", // Ảnh đại diện ngẫu nhiên
  phone: "0912 345 678",
  dob: "01/01/1990",
};

// Component cho một mục trong danh sách cài đặt/tùy chọn
interface ProfileOptionProps {
  iconName: keyof typeof Ionicons.glyphMap; // Tên icon từ Ionicons
  title: string;
  onPress: () => void;
  isLast?: boolean; // Để xóa border dưới cùng cho mục cuối
}

const ProfileOption: React.FC<ProfileOptionProps> = ({ iconName, title, onPress, isLast }) => (
  <TouchableOpacity 
    style={[styles.optionContainer, isLast && styles.lastOption]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons name={iconName} size={24} color="#4B5563" style={styles.optionIcon} />
    <Text style={styles.optionTitle}>{title}</Text>
    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

// --- MAIN PROFILE SCREEN COMPONENT ---
export const Profile: React.FC = () => {

  const handleEditProfile = () => console.log('Chỉnh sửa hồ sơ');
  const handleChangePassword = () => console.log('Đổi mật khẩu');
  const handleAppointments = () => console.log('Lịch hẹn của tôi');
  const handleMedicalRecords = () => console.log('Hồ sơ y tế');
  const handleSettings = () => console.log('Cài đặt ứng dụng');
  const handleHelp = () => console.log('Trung tâm trợ giúp');
  const handleLogout = () => console.log('Đăng xuất');

  // Tính toán padding top để tránh status bar
  const paddingTop = Platform.OS === 'ios' ? 50 : 20; 

  return (
    <View style={[styles.container, { paddingTop: paddingTop }]}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>

        {/* Header - Ảnh đại diện và Thông tin cơ bản */}
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: MOCK_USER.avatar }} 
            style={styles.avatar} 
          />
          <Text style={styles.userName}>{MOCK_USER.name}</Text>
          <Text style={styles.userEmail}>{MOCK_USER.email}</Text>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={handleEditProfile}
            activeOpacity={0.7}
          >
            <Text style={styles.editButtonText}>Chỉnh sửa hồ sơ</Text>
          </TouchableOpacity>
        </View>

        {/* Phần Tùy chọn Chung */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chung</Text>
          <ProfileOption 
            iconName="person-outline" 
            title="Chỉnh sửa thông tin" 
            onPress={handleEditProfile} 
          />
          <ProfileOption 
            iconName="lock-closed-outline" 
            title="Đổi mật khẩu" 
            onPress={handleChangePassword} 
            isLast // Đây là mục cuối của phần này
          />
        </View>

        {/* Phần Dịch vụ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dịch vụ</Text>
          <ProfileOption 
            iconName="calendar-outline" 
            title="Lịch hẹn của tôi" 
            onPress={handleAppointments} 
          />
          <ProfileOption 
            iconName="document-text-outline" 
            title="Hồ sơ y tế" 
            onPress={handleMedicalRecords} 
            isLast
          />
        </View>

        {/* Phần Khác */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khác</Text>
          <ProfileOption 
            iconName="settings-outline" 
            title="Cài đặt ứng dụng" 
            onPress={handleSettings} 
          />
          <ProfileOption 
            iconName="help-circle-outline" 
            title="Trung tâm trợ giúp" 
            onPress={handleHelp} 
            isLast
          />
        </View>

        {/* Nút Đăng xuất */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* Đệm cuối để Navbar không che */}
        <View style={{ height: 100 }} /> 

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Nền màu xám nhẹ
  },
  scrollViewContent: {
    paddingBottom: 20, // Đảm bảo có khoảng trống ở dưới cùng
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#EBF4FF',
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 15,
  },
  editButton: {
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastOption: {
    borderBottomWidth: 0, // Xóa border cho mục cuối
  },
  optionIcon: {
    marginRight: 15,
  },
  optionTitle: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2', // Nền đỏ nhạt
    marginHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#DC2626', // Text màu đỏ
    fontSize: 16,
    fontWeight: '600',
  },
});