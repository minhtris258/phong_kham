import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Platform, StatusBar } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

interface HomeHeaderProps {
  userName: string;
  avatarUrl: string;
  onSearchPress?: () => void;
  // ĐÃ SỬA: Đổi tên prop từ onNotificationPress thành onNotificationIconPress 
  onNotificationPress?: () => void; 
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ userName, avatarUrl, onSearchPress, onNotificationPress }) => {
  return (
    <View style={styles.topContainer}>
      {/* Blue Header Section */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image 
            source={{ uri: avatarUrl }} 
            style={styles.avatar} 
          />
          <View>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Text style={styles.userName}>{userName}</Text>
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
          {/* Using TextInput to mimic the appearance of the search bar */}
          <TextInput
            placeholder="Tìm bác sĩ, chuyên khoa..."
            style={styles.searchInput}
            placeholderTextColor="#6B7280"
            editable={false} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    // Add paddingTop for Android to avoid Status Bar overlap
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: '#2563EB', // blue-600
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20, 
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  greeting: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  notificationButton: {
    padding: 8,
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    marginTop: -35, // Đã điều chỉnh từ -55 thành -35 (kéo xuống 20px)
    zIndex: 1, 
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937', 
  },
});