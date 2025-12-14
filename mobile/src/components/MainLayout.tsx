// src/components/MainLayout.tsx
import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';

interface MainLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean; // Có hiện Navbar hay không?
  backgroundColor?: string; // Màu nền tùy chọn
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  showNavbar = false, 
  backgroundColor = '#F9FAFB' // Mặc định nền xám nhẹ
}) => {
  
  // Tính toán khoảng trống dưới đáy để không bị Navbar che
  // Navbar cao khoảng 60px + padding, ta để 80-90px là đẹp
  const paddingBottom = showNavbar ? (Platform.OS === 'ios' ? 0 : 80) : 0;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Cấu hình Thanh trạng thái chung */}
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent 
      />

      {/* Nội dung chính */}
      <View style={[styles.content, { paddingBottom }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});