import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotificationHeaderProps {
  onMarkAsRead: () => void;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({ onMarkAsRead }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thông báo</Text>
        <TouchableOpacity 
          onPress={onMarkAsRead} 
          style={styles.button}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color="#2563EB" /> 
          <Text style={styles.buttonText}>Đánh dấu đã đọc</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Tương đương sticky top-0 z-10
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    zIndex: 10,
    // Xử lý Safe Area trên đỉnh (để tránh Status Bar)
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 40 : 30, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  header: {
    paddingHorizontal: 16, // px-4
    paddingVertical: 12, // py-3 (Giả định, gốc là py-4)
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20, // text-xl
    fontWeight: '700', // font-bold
    color: '#1F2937', // text-gray-900
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // gap-1
  },
  buttonText: {
    fontSize: 14, // text-sm
    color: '#2563EB', // text-blue-600
    fontWeight: '600', // font-medium
  },
});