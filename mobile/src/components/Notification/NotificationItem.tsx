import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface NotificationItemProps {
  item: any;
  onPress: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ item, onPress }) => {
  const isRead = item.status === 'read';

  // Helper: Chọn màu sắc và Icon dựa trên loại thông báo
  const getTheme = () => {
    switch (item.type) {
      case 'visit': // Kết quả khám
        return {
          icon: <FontAwesome5 name="file-medical-alt" size={20} color="#7C3AED" />, // Tím
          bg: '#F3E8FF',
        };
      case 'appointment': // Lịch hẹn
        const isResult = item.title?.toLowerCase().includes("kết quả");
        return {
          icon: isResult
            ? <FontAwesome5 name="file-medical" size={20} color="#4F46E5" /> // Indigo
            : <Ionicons name="calendar" size={22} color="#00B5F1" />, // Xanh dương
          bg: isResult ? '#EEF2FF' : '#EFF6FF',
        };
      case 'rating_request': // Đánh giá
        return {
          icon: <Ionicons name="star" size={22} color="#D97706" />, // Vàng cam
          bg: '#FFFBEB',
        };
      case 'reminder': // Nhắc nhở
        return {
          icon: <Ionicons name="alarm" size={22} color="#EA580C" />, // Cam đậm
          bg: '#FFF7ED',
        };
      case 'system': 
      case 'general':
        return {
          icon: <Ionicons name="notifications" size={22} color="#059669" />, // Xanh lá
          bg: '#ECFDF5',
        };
      default:
        return {
          icon: <Ionicons name="notifications-outline" size={22} color="#6B7280" />, // Xám
          bg: '#F3F4F6',
        };
    }
  };

  const theme = getTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !isRead && styles.unreadContainer // Style riêng cho tin chưa đọc
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* 1. Icon bên trái */}
      <View style={[styles.iconBox, { backgroundColor: theme.bg }]}>
        {theme.icon}
      </View>

      {/* 2. Nội dung chính */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, !isRead && styles.unreadTitle]} numberOfLines={1}>
            {item.title}
          </Text>
          {/* Thời gian (vd: 5 phút trước) */}
          <Text style={styles.time}>
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi })}
          </Text>
        </View>

        <Text style={[styles.body, !isRead && styles.unreadBody]} numberOfLines={2}>
          {item.body}
        </Text>
      </View>

      {/* 3. Chấm đỏ báo chưa đọc */}
      {!isRead && <View style={styles.dot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    // Đổ bóng nhẹ (Shadow)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2, // Android shadow
    borderWidth: 1,
    borderColor: 'transparent',
  },
  unreadContainer: {
    backgroundColor: '#F0F9FF', // Nền xanh rất nhạt để nổi bật
    borderColor: '#BAE6FD',     // Viền xanh nhạt
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14, // Bo góc mềm mại (squircle)
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151', // Gray 700
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    color: '#111827', // Đen đậm hơn
    fontWeight: '700',
  },
  time: {
    fontSize: 11,
    color: '#9CA3AF', // Gray 400
  },
  body: {
    fontSize: 13,
    color: '#6B7280', // Gray 500
    lineHeight: 18,
  },
  unreadBody: {
    color: '#4B5563', // Đậm hơn chút để dễ đọc trên nền xanh
  },
  dot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444', // Đỏ
  }
});