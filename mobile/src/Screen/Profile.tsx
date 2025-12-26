import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { IP_ADDRESS, PORT } from '@/config';

// Helper xử lý ảnh avatar
const resolveAvatar = (img: string | undefined | null) => {
  if (!img) return 'https://ui-avatars.com/api/?name=User&background=random';
  if (img.startsWith('http')) return img;
  return `http://${IP_ADDRESS}:${PORT}/${img}`;
};

// Component cho một mục trong danh sách (Menu Item)
interface ProfileOptionProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  isLast?: boolean;
  color?: string;
}
interface ProfileProps {
  onLoginPress?: () => void;
  onNavigate: (screen: string) => void; // Đảm bảo có dòng này
}

const ProfileOption: React.FC<ProfileOptionProps> = ({
  iconName,
  title,
  onPress,
  isLast,
  color = '#4B5563',
}) => (
  <TouchableOpacity
    style={[styles.optionContainer, isLast && styles.lastOption]}
    onPress={onPress}
    activeOpacity={0.7}>
    <Ionicons name={iconName} size={24} color={color} style={styles.optionIcon} />
    <Text style={[styles.optionTitle, { color }]}>{title}</Text>
    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

// --- Props của Profile Screen ---
interface ProfileProps {
  onLoginPress?: () => void; // Hàm gọi khi bấm Đăng nhập
  onRegisterPress?: () => void; // Hàm gọi khi bấm Đăng ký (nếu cần)
}

// --- MAIN COMPONENT ---
export const Profile: React.FC<ProfileProps> = ({ onLoginPress, onRegisterPress, onNavigate }) => {
  // 1. Lấy dữ liệu từ Context
  const { user, isAuthenticated, handleLogout } = useAppContext();

  // 2. Các hàm xử lý
  const handleEditProfile = () => {
    if (!isAuthenticated)
      return Alert.alert('Yêu cầu', 'Vui lòng đăng nhập để thực hiện chức năng này.');
    console.log('Chỉnh sửa hồ sơ');
  };

  const handleLogoutPress = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: handleLogout },
    ]);
  };

  const paddingTop = Platform.OS === 'ios' ? 50 : 20;

  return (
    <View style={[styles.container]}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* --- HEADER --- */}
        <View style={styles.profileHeader}>
          {isAuthenticated && user ? (
            // A. Giao diện ĐÃ ĐĂNG NHẬP
            <>
              <View style={styles.guestAvatar}>
                <Ionicons name="person" size={50} color="#9CA3AF" />
              </View>
              <Text style={styles.userName}>{ user.fullName || 'Người dùng'}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => onNavigate('EDIT_PROFILE')}>
                <Text style={styles.editButtonText}>Chỉnh sửa hồ sơ</Text>
              </TouchableOpacity>
            </>
          ) : (
            // B. Giao diện CHƯA ĐĂNG NHẬP (Guest)
            <>
              <View style={styles.guestAvatar}>
                <Ionicons name="person" size={50} color="#9CA3AF" />
              </View>
              <Text style={styles.userName}>Chưa đăng nhập</Text>
              <Text style={styles.userEmail}>Đăng nhập để sử dụng đầy đủ tính năng</Text>

              <View style={styles.guestActionRow}>
                <TouchableOpacity
                  style={[styles.authButton, styles.loginBtn]}
                  onPress={onLoginPress}>
                  <Text style={styles.loginBtnText}>Đăng nhập</Text>
                </TouchableOpacity>

                {/* Nút Đăng ký (Optional) */}
                <TouchableOpacity
                  style={[styles.authButton, styles.registerBtn]}
                  onPress={onRegisterPress}>
                  <Text style={styles.registerBtnText}>Đăng ký</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* --- MENU OPTIONS --- */}

        {/* Chỉ hiện khi đã đăng nhập */}
        {isAuthenticated && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tài khoản</Text>
              <ProfileOption
                iconName="person-outline"
                title="Thông tin cá nhân"
                onPress={() => onNavigate('EDIT_PROFILE')}
                isLast
              />
              <ProfileOption
                iconName="lock-closed-outline"
                title="Đổi mật khẩu"
                onPress={() => onNavigate('CHANGE_PASSWORD')} // Gọi điều hướng
                isLast
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sức khỏe</Text>
              <ProfileOption
                iconName="calendar-outline"
                title="Lịch hẹn của tôi"
                onPress={() => onNavigate('MY_APPOINTMENTS')}
              />
              <ProfileOption
                iconName="document-text-outline"
                title="Hồ sơ y tế"
                onPress={() => onNavigate('MEDICAL_RECORDS')}
                isLast
              />
            </View>
          </>
        )}

        {/* Luôn hiện (Kể cả Guest) */}
       <View style={styles.section}>
  <Text style={styles.sectionTitle}>Hỗ trợ</Text>
 
  <ProfileOption
    iconName="help-circle-outline"
    title="Trung tâm trợ giúp"
    // THAY ĐỔI: Gọi onNavigate tới màn hình SUPPORT_CENTER
    onPress={() => onNavigate('SUPPORT_CENTER')} 
    isLast
  />
</View>

        {/* Nút Đăng xuất (Chỉ hiện khi đã đăng nhập) */}
        {isAuthenticated && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollViewContent: { paddingBottom: 20 },

  // Header Styles
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#00B5F1',
    marginBottom: 15,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    padding: 16, paddingTop: Platform.OS === 'android' ? 40 : 70,
    // marginHorizontal: 5,
    
    
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#EBF4FF',
    marginBottom: 10,
  },
  guestAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 5 },
  userEmail: { fontSize: 15, color: '#fff', marginBottom: 15 },

  // Buttons
  editButton: {
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: { color: '#00B5F1', fontWeight: '600', fontSize: 14 },

  guestActionRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  authButton: { paddingVertical: 10, paddingHorizontal: 30, borderRadius: 12 },
  loginBtn: { backgroundColor: '#0095D5' },
  loginBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  registerBtn: { backgroundColor: '#F3F4F6' },
  registerBtnText: { color: '#374151', fontWeight: '600', fontSize: 16 },

  // Sections
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
  lastOption: { borderBottomWidth: 0 },
  optionIcon: { marginRight: 15 },
  optionTitle: { flex: 1, fontSize: 16 },

  // Logout
  logoutButton: {
    backgroundColor: '#FEE2E2',
    marginHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: { color: '#DC2626', fontSize: 16, fontWeight: '600' },
});
