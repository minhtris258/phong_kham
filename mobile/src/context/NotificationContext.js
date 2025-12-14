// src/context/NotificationContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { useSocket } from './SocketContext';
import notificationService from '../services/notificationService';
import { useAppContext } from './AppContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { socket } = useSocket();
  const { isAuthenticated } = useAppContext();
  const [unreadCount, setUnreadCount] = useState(0);
  const navigation = useNavigation();

  // 1. Lấy dữ liệu ban đầu
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    try {
      // Lấy 50 thông báo mới nhất để đếm
      const res = await notificationService.getNotifications(1, 50);
      
      // Log để debug (Xem trong Terminal của Metro)
      // console.log("🔔 [NotificationContext] API Response:", res.data?.data?.length);

      const items = res.data?.data || res.data || [];
      if (Array.isArray(items)) {
        const count = items.filter((n) => n.status === 'unread').length;
        console.log("🔔 [NotificationContext] Số tin chưa đọc:", count);
        setUnreadCount(count);
      }
    } catch (error) {
      console.log('❌ Lỗi tải thông báo:', error);
    }
  };

  // Gọi khi đăng nhập thành công
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // 2. Lắng nghe Socket (Realtime)
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data) => {
      console.log('🔔 [Context] Có thông báo mới từ Socket, tăng count +1');
      // Tăng số lượng ngay lập tức
      setUnreadCount((prev) => prev + 1);
      
      // Gọi lại API để đồng bộ chính xác (tùy chọn)
      // fetchUnreadCount(); 
    };

    socket.on('new_notification', handleNewNotification);
    return () => socket.off('new_notification', handleNewNotification);
  }, [socket, isAuthenticated]);

  const decreaseUnreadCount = () => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        fetchUnreadCount,
        decreaseUnreadCount,
        resetUnreadCount,
      }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);