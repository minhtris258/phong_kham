import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

// Kiểu trạng thái xem
type ViewState = 'HOME' | 'SEARCH' | 'BOOKING' | 'NOTIFICATIONS' | 'PROFILE';

interface BottomNavProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void; 
}

export const Navbar: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { id: 'HOME' as ViewState, label: 'Trang chủ', icon: 'home' },
    { id: 'SEARCH' as ViewState, label: 'Tìm kiếm', icon: 'search' },
    { id: 'BOOKING' as ViewState, label: 'Đặt lịch', icon: 'calendar' },
    { id: 'NOTIFICATIONS' as ViewState, label: 'Thông báo', icon: 'notifications' },
    { id: 'PROFILE' as ViewState, label: 'Hồ sơ', icon: 'person' },
  ];

  // Hàm trợ giúp để chọn Icon
  const getIconName = (id: ViewState, isActive: boolean) => {
    switch (id) {
      case 'HOME':
        return isActive ? 'home' : 'home-outline';
      case 'SEARCH':
        return isActive ? 'search' : 'search-outline';
      case 'BOOKING':
        return isActive ? 'calendar' : 'calendar-outline';
      case 'NOTIFICATIONS':
        return isActive ? 'notifications' : 'notifications-outline';
      case 'PROFILE':
        return isActive ? 'person' : 'person-outline';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <View style={styles.bottomNavContainer}>
      <View style={styles.navBar}>
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const iconName = getIconName(item.id, isActive);
          const color = isActive ? '#2563EB' : '#6B7280'; // Blue or Gray color

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onChangeView(item.id)}
              style={styles.navItem}
              activeOpacity={0.7} 
            >
              <Ionicons 
                name={iconName} 
                size={24} 
                color={color}
              />
              <Text 
                style={[
                  styles.navLabel, 
                  { color: color }
                ]}
              >
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
    // Always positioned at the bottom and on top of other layers
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB', // gray-200
    // Handle Safe Area for iOS
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, 
    zIndex: 50,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
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
  navLabel: {
    fontSize: 10, 
    fontWeight: '500',
    marginTop: 2,
  },
});