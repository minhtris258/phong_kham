import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { useNotification } from '../context/NotificationContext';

type ViewState = 'HOME' | 'POSTS' | 'DOCTORS' | 'NOTIFICATIONS' | 'PROFILE';

interface BottomNavProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void; 
}

export const Navbar: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  // Lấy số lượng từ Context
  const { unreadCount } = useNotification();

  const navItems = [
    { id: 'HOME' as ViewState, label: 'Trang chủ', icon: 'home' },
    { id: 'POSTS' as ViewState, label: 'Bài viết', icon: 'newspaper' },
    { id: 'DOCTORS' as ViewState, label: 'Đặt lịch', icon: 'calendar' },
    { id: 'NOTIFICATIONS' as ViewState, label: 'Thông báo', icon: 'notifications' },
    { id: 'PROFILE' as ViewState, label: 'Hồ sơ', icon: 'person' },
  ];

  const getIconName = (id: ViewState, isActive: boolean) => {
    switch (id) {
      case 'HOME': return isActive ? 'home' : 'home-outline';
      case 'POSTS': return isActive ? 'newspaper' : 'newspaper-outline';
      case 'DOCTORS': return isActive ? 'calendar' : 'calendar-outline';
      case 'NOTIFICATIONS': return isActive ? 'notifications' : 'notifications-outline';
      case 'PROFILE': return isActive ? 'person' : 'person-outline';
      default: return 'help-circle-outline';
    }
  };

  return (
    <View style={styles.bottomNavContainer}>
      <View style={styles.navBar}>
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const iconName = getIconName(item.id, isActive);
          const color = isActive ? '#00B5F1' : '#6B7280';

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onChangeView(item.id)}
              style={styles.navItem}
              activeOpacity={0.7} 
            >
              {/* Container chứa Icon + Badge */}
              <View style={styles.iconContainer}>
                <Ionicons name={iconName} size={24} color={color} />
                
                {/* 👇 Hiển thị Badge cho tab Thông báo */}
                {item.id === 'NOTIFICATIONS' && unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[styles.navLabel, { color: color }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, 
    zIndex: 50,
    elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60, 
  },
  navItem: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    position: 'relative', // Quan trọng để badge absolute theo icon
    width: 30, 
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 10, 
    fontWeight: '500',
    marginTop: 2,
  },
  // Style Badge chuẩn
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
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 12
  }
});