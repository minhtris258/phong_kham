import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
// ĐÃ SỬA: Đường dẫn đúng là '../constants/mockData'
import { NotificationItemType } from '../../constants/mockData'; 

interface NotificationItemProps {
  // SỬ DỤNG NotificationItemType đã import
  item: NotificationItemType; 
  onPress?: () => void;
}

const getIcon = (type: string, color: string) => {
  switch (type) {
    case 'appointment':
      return <Ionicons name="calendar-outline" size={20} color={color} />; // text-blue-600
    case 'promo':
      return <Ionicons name="pricetag-outline" size={20} color={color} />; // text-orange-500
    case 'system':
    default:
      return <Feather name="info" size={20} color={color} />; // text-gray-600
  }
};

const getStyleByType = (type: string) => {
  switch (type) {
    case 'appointment':
      return { 
        bgColor: '#E0F2FF', // bg-blue-100
        iconColor: '#2563EB', // blue-600
        activeBorderColor: '#93C5FD' // blue-300
      };
    case 'promo':
      return { 
        bgColor: '#FFEDD5', // bg-orange-100
        iconColor: '#F97316', // orange-500
        activeBorderColor: '#FDBA74' // orange-300
      };
    case 'system':
    default:
      return { 
        bgColor: '#F3F4F6', // bg-gray-100
        iconColor: '#4B5563', // gray-600
        activeBorderColor: '#E5E7EB' // gray-200
      };
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ item, onPress }) => {
  const stylesBy = getStyleByType(item.type);
  const itemStyle = item.isRead 
    ? styles.itemRead // bg-white border-gray-100
    : [styles.itemUnread, { borderColor: stylesBy.activeBorderColor }]; // bg-blue-50/50 border-blue-100 shadow-sm
  
  const titleColor = item.isRead ? styles.titleRead : styles.titleUnread;
  const messageColor = item.isRead ? styles.messageRead : styles.messageUnread;

  return (
    <TouchableOpacity 
      key={item.id} 
      onPress={onPress}
      style={[styles.itemBase, itemStyle]}
      activeOpacity={0.8}
    >
      <View style={styles.flexRow}>
        
        {/* Icon Circle */}
        <View style={[styles.iconContainer, { backgroundColor: stylesBy.bgColor }]}>
          {getIcon(item.type, stylesBy.iconColor)}
        </View>
        
        {/* Content */}
        <View style={styles.contentContainer}>
          <View style={styles.contentHeader}>
            <Text style={[styles.titleBase, titleColor]}>
              {item.title}
            </Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
          <Text style={[styles.messageBase, messageColor]}>
            {item.message}
          </Text>
        </View>
      </View>
      
      {/* Unread Indicator */}
      {!item.isRead && (
        <View style={styles.unreadIndicatorContainer}>
          <View style={styles.unreadDot}></View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemBase: {
    padding: 16, // p-4
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
  },
  itemRead: {
    backgroundColor: '#fff', 
    borderColor: '#F3F4F6', // border-gray-100
  },
  itemUnread: {
    backgroundColor: '#F5F9FF', // Tương đương blue-50/50
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  flexRow: {
    flexDirection: 'row',
    gap: 16, // gap-4
  },
  iconContainer: {
    width: 40, // w-10
    height: 40, // h-10
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contentContainer: {
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4, // mb-1
  },
  titleBase: {
    fontSize: 14, // text-sm
    fontWeight: '700', // font-bold
    flexShrink: 1,
    marginRight: 8,
  },
  titleRead: {
    color: '#1F2937', // text-gray-900
  },
  titleUnread: {
    color: '#1E40AF', // text-blue-800
  },
  timestamp: {
    fontSize: 10, // text-xs
    color: '#9CA3AF', // text-gray-400
    lineHeight: 18, // Đảm bảo căn giữa với title
  },
  messageBase: {
    fontSize: 14,
    lineHeight: 20, // leading-relaxed
  },
  messageRead: {
    color: '#6B7280', // text-gray-500
  },
  messageUnread: {
    color: '#374151', // text-gray-700
  },
  unreadIndicatorContainer: {
    marginTop: 8, // mt-2
    alignItems: 'flex-end',
  },
  unreadDot: {
    width: 8, // w-2
    height: 8, // h-2
    borderRadius: 4,
    backgroundColor: '#3B82F6', // bg-blue-500
  },
});