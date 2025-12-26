// src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { AppState } from 'react-native'; // 👈 Import AppState
import { useAppContext } from './AppContext';
import { BASE_URL } from '../config'; // Nên dùng config để đồng bộ IP

const SocketContext = createContext();

// Sử dụng IP động từ file config thay vì cứng
const SOCKET_SERVER_URL = `${BASE_URL}`;

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { token } = useAppContext();
    
    // Ref để giữ socket instance mà không gây render lại
    const socketRef = useRef(null);
    const appState = useRef(AppState.currentState);

    // 1. Hàm khởi tạo kết nối
    const connectSocket = () => {
        if (!token) return;
        
        // Nếu đã có socket và đang kết nối thì thôi
        if (socketRef.current && socketRef.current.connected) return;

        console.log("🔌 Connecting to Socket at:", SOCKET_SERVER_URL);

        const newSocket = io(SOCKET_SERVER_URL, {
            auth: { token },
            reconnection: true,             // Bật tự động kết nối lại
            reconnectionAttempts: Infinity, // Thử lại vô hạn lần
            reconnectionDelay: 1000,        // Đợi 1s giữa các lần thử
            reconnectionDelayMax: 5000,     // Tối đa 5s
            transports: ['websocket'],
            forceNew: true,
        });

        // --- Event Listeners ---
        newSocket.on('connect', () => {
            console.log('✅ Socket Connected:', newSocket.id);
            setIsConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('❌ Socket Disconnected:', reason);
            setIsConnected(false);
            
            // Nếu bị server đá hoặc transport close, thử kết nối lại thủ công
            if (reason === "io server disconnect") {
                newSocket.connect();
            }
        });

        newSocket.on('connect_error', (err) => {
            console.log("⚠️ Socket Connect Error:", err.message);
            // Có thể thêm logic thông báo lỗi nhẹ ở đây nếu cần
        });

        // Sự kiện nghiệp vụ
        newSocket.on('new_notification', (data) => {
             console.log("🔔 [Socket] New Notification:", data);
        });

        socketRef.current = newSocket;
        setSocket(newSocket);
    };

    // 2. Effect: Kết nối khi có Token
    useEffect(() => {
        if (token) {
            connectSocket();
        } else {
            // Logout -> Ngắt kết nối
            if (socketRef.current) {
                console.log("🔒 Token removed, disconnecting...");
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
            }
        }

        // Cleanup khi unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [token]);

    // 3. Effect: Xử lý khi App xuống Background / lên Foreground
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) && 
                nextAppState === 'active'
            ) {
                console.log('📱 App came to foreground - Checking socket...');
                if (socketRef.current && !socketRef.current.connected) {
                    console.log('🔄 Reconnecting socket...');
                    socketRef.current.connect();
                }
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const value = {
        socket,
        isConnected,
        reconnect: () => socketRef.current?.connect() // Hàm cho phép nút "Thử lại" gọi
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};