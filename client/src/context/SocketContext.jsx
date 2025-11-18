import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

// Thay thế bằng URL và Port của server Node.js/Express của bạn
const SOCKET_SERVER_URL = "http://localhost:5000"; 

// Custom Hook để dễ dàng sử dụng Socket trong các component
export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    
    // Giả định bạn đã có useAppContext từ AppContext.jsx để lấy token
    // import { useAppContext } from './AppContext'; 
    // const { token } = useAppContext(); 
    const token = localStorage.getItem('token'); // Lấy token từ localStorage hoặc AppContext

    useEffect(() => {
        if (!token) {
            console.log("Chưa có token, không kết nối Socket.");
            return;
        }

        // Khởi tạo kết nối Socket và truyền JWT token
        const newSocket = io(SOCKET_SERVER_URL, {
            auth: {
                token: token // Gửi token lên server để xác thực và tham gia room
            },
            reconnectionAttempts: 5 // Thử kết nối lại 5 lần nếu mất kết nối
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('Đã kết nối Socket thành công!', newSocket.id);
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Mất kết nối Socket.');
        });
        
        // Lắng nghe sự kiện thông báo từ server (từ AppointmentController)
        newSocket.on('new_notification', (data) => {
             console.log("Thông báo Realtime nhận được:", data);
             // TODO: Thêm logic cập nhật state thông báo và hiển thị toast/popup tại đây
        });

        setSocket(newSocket);

        // Cleanup: Đóng kết nối khi component bị unmount hoặc token thay đổi
        return () => {
             newSocket.off('new_notification');
             newSocket.close();
        };
    }, [token]); // Chạy lại khi token thay đổi

    const value = {
        socket,
        isConnected,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};