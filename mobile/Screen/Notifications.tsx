import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

// ĐÃ SỬA: Đường dẫn đúng là '../constants/mockData'
import { NotificationItemType, MOCK_NOTIFICATIONS } from '../constants/mockData';

// Import components
import { NotificationHeader } from '../components/Notification/NotificationHeader';
import { NotificationItem } from '../components/Notification/NotificationItem';

interface NotificationsViewProps {
  // Đã đánh dấu optional vì sẽ sử dụng mock data nếu không có
  notifications?: NotificationItemType[]; 
  onMarkAllAsRead?: () => void; 
  onNotificationPress?: (id: string) => void;
}

export const Notifications: React.FC<NotificationsViewProps> = ({ 
  notifications, 
  onMarkAllAsRead,
  onNotificationPress 
}) => {
  
  // Chiều cao padding cuối cần thiết để tránh BottomNav che (từ App.tsx)
  const BOTTOM_NAV_PADDING = Platform.OS === 'ios' ? 90 : 80;
  // Chiều cao của header để nội dung cuộn không bị che
  const HEADER_HEIGHT = Platform.OS === 'android' ? 70 : 60; 

  // SỬ DỤNG MOCK DATA NẾU PROPS RỖNG
  const displayNotifications: NotificationItemType[] = notifications || MOCK_NOTIFICATIONS;

  const handleMarkAsRead = () => {
    // Logic đánh dấu đã đọc
    onMarkAllAsRead ? onMarkAllAsRead() : console.log('Mark all as read handler executed.');
  };
  
  const handlePress = (id: string) => {
      onNotificationPress ? onNotificationPress(id) : console.log(`Notification pressed: ${id}`);
  };

  return (
    <View style={styles.fullContainer}>
      
      {/* 1. Sticky Header */}
      <NotificationHeader onMarkAsRead={handleMarkAsRead} />

      {/* 2. Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} 
                  // Thêm padding trên để tránh bị header che khi cuộn
                  style={{ paddingTop: HEADER_HEIGHT }}> 
        
        <View style={styles.listContainer}>
          {displayNotifications.length > 0 ? (
            displayNotifications.map((item) => (
              <NotificationItem 
                key={item.id} 
                item={item} 
                onPress={() => handlePress(item.id)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Feather name="info" size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyText}>Bạn chưa có thông báo nào</Text>
            </View>
          )}
        </View>

        {/* Padding cuối để tránh BottomNav */}
        <View style={{ height: BOTTOM_NAV_PADDING }} />

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB', // bg-gray-50
  },
  scrollContent: {
    paddingBottom: 0,
  },
  listContainer: {
    padding: 16, // p-4
    rowGap: 12, // space-y-3
  },
  
  // --- Empty State ---
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80, // pt-20
  },
  emptyIconCircle: {
    width: 64, // w-16
    height: 64, // h-16
    backgroundColor: '#F3F4F6', // bg-gray-100
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16, // mb-4
  },
  emptyText: {
    color: '#9CA3AF', // text-gray-400
  },
});