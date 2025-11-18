// src/socket/index.js

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

export const initializeSocketIO = (httpServer, app) => {
    
    // ... [Phần khởi tạo io và app.set('io', io) KHÔNG ĐỔI] ...
    const io = new Server(httpServer, {
        cors: {
            origin: "*", // Cấu hình CORS
            methods: ["GET", "POST"]
        }
    });

    // Gắn io instance vào Express app (cho phép Controllers truy cập)
    app.set('io', io); 

    // Bắt đầu lắng nghe kết nối
    io.on('connection', (socket) => {
        console.log(`Người dùng đã kết nối: ${socket.id}`);
        
        // Lấy userId để sử dụng trong các sự kiện khác
        let currentUserId = null; 

        // 1. Xác thực Token và tham gia Room 
        const token = socket.handshake.auth.token;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const userId = decoded._id.toString();
                currentUserId = userId; // Lưu lại ID
                
                socket.join(userId);
                console.log(`User ${userId} joined room ${userId}`);
                
                // [Optional: Có thể phát tín hiệu User Online cho Admin/Doctor]
                io.emit('user_online', { userId: userId }); 

            } catch (error) {
                console.error('Socket authentication failed:', error.message);
                socket.disconnect(true);
            }
        }
        
        // 2. Xử lý sự kiện gửi tin nhắn (Ví dụ: Chat giữa Bác sĩ - Bệnh nhân)
        socket.on('send_message', (data) => {
            console.log(`[Message] From ${currentUserId}: ${data.content}`);
            
            const receiverId = data.receiverId;
            
            if (receiverId) {
                // Gửi tin nhắn đến người nhận cụ thể (dùng room ID)
                io.to(receiverId).emit('receive_message', { 
                    senderId: currentUserId,
                    content: data.content,
                    timestamp: new Date()
                });
            } else {
                // Xử lý gửi tin nhắn chung hoặc lỗi
            }
        });

        socket.on('disconnect', () => {
            console.log(`Người dùng ngắt kết nối: ${socket.id}`);
            // [Optional: Phát tín hiệu User Offline]
            if (currentUserId) {
                io.emit('user_offline', { userId: currentUserId });
            }
        });
    });

    return io;
};