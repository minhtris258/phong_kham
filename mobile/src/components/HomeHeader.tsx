import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Platform, StatusBar } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

// 1. Import Context để lấy dữ liệu User từ Token
import { useAppContext } from '../context/AppContext';
// 2. Import Config để lấy IP xử lý ảnh
import { IP_ADDRESS, PORT } from '../config'; 

interface HomeHeaderProps {
  onSearchPress?: () => void;
  onNotificationPress?: () => void; 
}

// Helper xử lý ảnh avatar
const resolveAvatar = (img: string | undefined | null) => {
  if (!img) return "https://play-lh.googleusercontent.com/YDoqkkoVnNFEI2naipMnuVV54lDMojNH_zOFTQzc_xiOqxMG1Wxw1tOT3mQXEVXy0MeI=w600-h300-pc0xffffff-pd";
  if (img.startsWith("http")) return img;
  return `http://${IP_ADDRESS}:${PORT}/${img}`;
};

// Chiều cao chuẩn của thanh trạng thái
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

export const HomeHeader: React.FC<HomeHeaderProps> = ({ onSearchPress, onNotificationPress }) => {
  
  const { user, isAuthenticated } = useAppContext();

  const displayName = isAuthenticated && user 
    ? user.fullName || "Người dùng" 
    : "";

  const displayAvatar = isAuthenticated && user 
    ? resolveAvatar(user.thumbnail || user.avatar)
    : "https://play-lh.googleusercontent.com/YDoqkkoVnNFEI2naipMnuVV54lDMojNH_zOFTQzc_xiOqxMG1Wxw1tOT3mQXEVXy0MeI=w600-h300-pc0xffffff-pd";

  return (
    <View style={styles.topContainer}>
      {/* Set StatusBar trong suốt để nền xanh tràn lên trên */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Blue Header Section */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image 
            source={{ uri: displayAvatar }} 
            style={styles.avatar} 
          />
          <View>
            <Text style={styles.userName}>MedPro
            <Text style={styles.greeting}> Xin chào,  </Text>
            
            <Text style={styles.userName} numberOfLines={isAuthenticated ? 1 : 0}>
              {displayName}
              </Text>
            </Text>
          </View>
        </View>
        
        <TouchableOpacity onPress={onNotificationPress} style={styles.notificationButton} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Floating Search Bar */}
      <View style={styles.searchBarContainer}>
        <TouchableOpacity onPress={onSearchPress} style={styles.searchBar} activeOpacity={0.9}>
          <Feather name="search" size={20} color="#6B7280" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Tìm bác sĩ, chuyên khoa..."
            style={styles.searchInput}
            placeholderTextColor="#6B7280"
            editable={false} 
            pointerEvents="none" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    backgroundColor: '#fff', // Nền trắng cho phần chứa search bar bên dưới
    zIndex: 1,
  },
  header: {
    backgroundColor: '#00B5F1', // Màu xanh
    paddingHorizontal: 20,
    // 👇 QUAN TRỌNG: Padding Top = Chiều cao Status Bar + Khoảng cách thêm (20)
    // Giúp nội dung không bị tai thỏ/giờ che mất
    paddingTop: STATUSBAR_HEIGHT + 20, 
    paddingBottom: 50, // Khoảng trống bên dưới để Search Bar đè lên
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 0,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#E0E7FF'
  },
  greeting: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    maxWidth: 200,
  },
  notificationButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    marginTop: -25, // Kéo Search Bar lên
    zIndex: 10, 
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937', 
    fontWeight: '500'
  },
});