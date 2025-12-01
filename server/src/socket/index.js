import { Server } from "socket.io";
// Import cả hàm handle và biến chatSessions để xóa khi disconnect
import { handleAIChat, chatSessions } from "../services/aiService.js"; 

export const initializeSocketIO = (httpServer, app) => {
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Sự kiện join room (giữ nguyên để nhận thông báo realtime nếu cần)
    socket.on("join_room", (userId) => {
        if (userId) {
            socket.join(userId); 
            console.log(`Socket ${socket.id} joined room ${userId}`);
        }
    });

    // 👇 SỰ KIỆN CHAT VỚI AI
    socket.on("client_chat_ai", async (data) => {
      try {
        socket.emit("ai_typing");
        
        // 1. Lấy userId từ data client gửi lên
        // Data client gửi phải có dạng: { message: "...", userId: "..." }
        const currentUserId = data.userId || null;

        // 2. Truyền userId vào hàm xử lý AI (tham số thứ 3)
        // handleAIChat cần userId để thực hiện tool book_appointment
       const reply = await handleAIChat(data.message, socket.id, currentUserId, io);

        socket.emit("server_chat_ai", {
          message: reply,
          sender: "AI_ASSISTANT"
        });
      } catch (error) {
        console.error("Socket Error:", error);
        socket.emit("server_chat_ai", { message: "Lỗi hệ thống." });
      }
    });

    // Khi khách thoát, xóa bộ nhớ chat
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      if (chatSessions.has(socket.id)) {
          chatSessions.delete(socket.id);
      }
    });
  });
  
  app.set("io", io);
};