import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, 
  StyleSheet, ActivityIndicator, Alert, RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Components & Services
import { NotificationItem } from '../components/Notification/NotificationItem';
import notificationService from '../services/notificationService';
import { useSocket } from '../context/SocketContext';
import { useNotification } from '../context/NotificationContext'; // Context đếm số thông báo


interface NotificationsProps {
  onSelectNotification?: (item: any) => void; // 👈 Thêm prop này
}
export const Notifications: React.FC<NotificationsProps> = ({ onSelectNotification }) => {
  const { socket } = useSocket();
  const { decreaseUnreadCount, resetUnreadCount } = useNotification();
  
  // State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all'); // Tab lọc
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // --- API: Lấy danh sách ---
  const fetchNotifications = useCallback(async (isRefresh = false) => {
    try {
      const pageToLoad = isRefresh ? 1 : page;
      const res = await notificationService.getNotifications(pageToLoad, 20);
      const newItems = res.data?.data || [];
      
      if (isRefresh) {
        setNotifications(newItems);
        setPage(2);
      } else {
        setNotifications(prev => [...prev, ...newItems]);
        setPage(prev => prev + 1);
      }

      if (newItems.length < 20) setHasMore(false); // Hết dữ liệu
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  // Gọi lần đầu
  useEffect(() => {
    fetchNotifications(true);
  }, []);

  // --- Socket: Nhận thông báo mới ---
  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (data: any) => {
        console.log("🔔 Có thông báo mới:", data);
        const newNotif = data.data; // Cấu trúc tùy backend trả về
        setNotifications(prev => [newNotif, ...prev]);
    };
    socket.on("new_notification", handleNewNotification);
    return () => { socket.off("new_notification", handleNewNotification); };
  }, [socket]);

  // --- Actions ---
  const handleRefresh = () => {
    setRefreshing(true);
    setHasMore(true);
    fetchNotifications(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) fetchNotifications(false);
  };

  const handleMarkAllRead = async () => {
    try {
        await notificationService.markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
        resetUnreadCount(); // Reset badge ở Navbar
    } catch (error) {
        console.error(error);
    }
  };

  const handlePressItem = async (item: any) => {
    // 1. Đánh dấu đã đọc (giữ nguyên)
    if (item.status === 'unread') {
        try {
            await notificationService.markAsRead(item._id);
            setNotifications(prev => prev.map(n => n._id === item._id ? { ...n, status: 'read' } : n));
            decreaseUnreadCount();
        } catch (e) {}
    }

    // 2. Chuyển màn hình chi tiết
    if (onSelectNotification) {
        onSelectNotification(item); // 👈 Gọi callback về App.tsx
    }
  };

  // Lọc hiển thị
  const displayData = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.status === 'unread');

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.readAllText}>Đọc tất cả</Text>
        </TouchableOpacity>
      </View>

      {/* FILTER TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity 
            style={[styles.tabItem, filter === 'all' && styles.activeTab]}
            onPress={() => setFilter('all')}
        >
            <Text style={[styles.tabText, filter === 'all' && styles.activeTabText]}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.tabItem, filter === 'unread' && styles.activeTab]}
            onPress={() => setFilter('unread')}
        >
            <Text style={[styles.tabText, filter === 'unread' && styles.activeTabText]}>Chưa đọc</Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      {loading && page === 1 ? (
        <ActivityIndicator size="large" color="#00B5F1" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
            data={displayData}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
                <NotificationItem item={item} onPress={() => handlePressItem(item)} />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#00B5F1"]} />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={hasMore && page > 1 ? <ActivityIndicator color="#00B5F1" /> : null}
            ListEmptyComponent={
                <View style={styles.emptyView}>
                    <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
                    <Text style={styles.emptyText}>Không có thông báo nào</Text>
                </View>
            }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15,
    backgroundColor: '#00B5F1', borderBottomWidth: 1, borderBottomColor: '#F3F4F6'
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  readAllText: { fontSize: 14, color: '#fff', fontWeight: '600' },

  tabs: {
    flexDirection: 'row', padding: 15, paddingBottom: 0, 
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#FFF'
  },
  tabItem: {
    marginRight: 25, paddingBottom: 10,
    borderBottomWidth: 2, borderBottomColor: 'transparent'
  },
  activeTab: { borderBottomColor: '#00B5F1' },
  tabText: { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  activeTabText: { color: '#00B5F1', fontWeight: '700' },

  listContent: { padding: 15, paddingBottom: 100 },
  
  emptyView: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, color: '#9CA3AF', fontSize: 16 }
});