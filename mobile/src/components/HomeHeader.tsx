// src/components/HomeHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Platform, StatusBar } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

import { useAppContext } from '../context/AppContext';
// 👇 1. Import useNotification
import { useNotification } from '../context/NotificationContext'; 
import { IP_ADDRESS, PORT } from '../config'; 

interface HomeHeaderProps {
  onSearchPress?: () => void;
  onNotificationPress?: () => void; 
}

const resolveAvatar = (img: string | undefined | null) => {
  if (!img) return "https://play-lh.googleusercontent.com/YDoqkkoVnNFEI2naipMnuVV54lDMojNH_zOFTQzc_xiOqxMG1Wxw1tOT3mQXEVXy0MeI=w600-h300-pc0xffffff-pd";
  if (img.startsWith("http")) return img;
  return `http://${IP_ADDRESS}:${PORT}/${img}`;
};

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

export const HomeHeader: React.FC<HomeHeaderProps> = ({ onSearchPress, onNotificationPress }) => {
  
  const { user, isAuthenticated } = useAppContext();
  // 👇 2. Lấy unreadCount từ Context
  const { unreadCount } = useNotification(); 

  const displayName = isAuthenticated && user ? user.fullName || "Người dùng" : "";
  const displayAvatar = isAuthenticated && user 
    ? resolveAvatar(user.thumbnail || user.avatar)
    : "https://play-lh.googleusercontent.com/YDoqkkoVnNFEI2naipMnuVV54lDMojNH_zOFTQzc_xiOqxMG1Wxw1tOT3mQXEVXy0MeI=w600-h300-pc0xffffff-pd";

  return (
    <View style={styles.topContainer}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: displayAvatar }} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>MedPro
              <Text style={styles.greeting}> Xin chào, </Text>
              <Text style={styles.userName} numberOfLines={isAuthenticated ? 1 : 0}>
                {displayName}
              </Text>
            </Text>
          </View>
        </View>
        
        {/* 👇 3. Cập nhật giao diện nút chuông với Badge */}
        <TouchableOpacity onPress={onNotificationPress} style={styles.notificationButton} activeOpacity={0.7}>
          <View>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            
            {/* Hiển thị số thông báo nếu unreadCount > 0 */}
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

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
  // ... (giữ nguyên các styles cũ của bạn)
  topContainer: { backgroundColor: '#fff', zIndex: 1 },
  header: {
    backgroundColor: '#00B5F1',
    paddingHorizontal: 20,
    paddingTop: STATUSBAR_HEIGHT + 20, 
    paddingBottom: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 0,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 15, borderWidth: 2, borderColor: '#fff', backgroundColor: '#E0E7FF' },
  greeting: { fontSize: 14, color: '#fff', opacity: 0.9 },
  userName: { fontSize: 18, fontWeight: '700', color: '#fff', maxWidth: 200 },
  notificationButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  
  // 👇 4. Thêm style cho Badge (Copy từ Navbar.tsx của bạn)
  badge: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#00B5F1', // Đổi viền thành màu xanh header cho tiệp màu
    zIndex: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 12
  },

  searchBarContainer: { paddingHorizontal: 20, marginTop: -25, zIndex: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 15, paddingVertical: 12, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#1F2937', fontWeight: '500' },
});