import { Server } from "socket.io";
// Import cả hàm handle và biến chatSessions để xóa khi disconnect
import { handleAIChat, chatSessions } from "../services/aiService.js"; 

export const initializeSocketIO = (httpServer, app) => {
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
socket.on("join_room", (userId) => {
        if (userId) {
            socket.join(userId); // Join vào room có tên là User ID
            console.log(`Socket ${socket.id} joined room ${userId}`);
        }
    });
    socket.on("client_chat_ai", async (data) => {
      try {
        socket.emit("ai_typing");
        
        // 👇 QUAN TRỌNG: Truyền socket.id vào đây
        const reply = await handleAIChat(data.message, socket.id);

        socket.emit("server_chat_ai", {
          message: reply,
          sender: "AI_ASSISTANT"
        });
      } catch (error) {
        socket.emit("server_chat_ai", { message: "Lỗi hệ thống." });
      }
    });

    // 👇 Khi khách thoát, xóa bộ nhớ chat của họ đi cho nhẹ server
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      if (chatSessions.has(socket.id)) {
          chatSessions.delete(socket.id);
      }
    });
  });
  
  app.set("io", io);
};