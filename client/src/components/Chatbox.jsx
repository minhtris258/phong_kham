import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext'; // Đảm bảo đường dẫn đúng
import { MessageCircle, X, Send, Bot, AlertCircle, UserRound } from 'lucide-react';
import { toastSuccess,toastError, toastWarning, toastInfo } from "../utils/toast";
const Chatbox = () => {
  const { socket, isConnected } = useSocket();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Chào bạn! Mình là trợ lý ảo phòng khám. Mình có thể giúp bạn tra cứu và đặt lịch hẹn ngay bây giờ.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // State lưu thông tin user hiện tại
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  // Lấy thông tin User khi component load
  useEffect(() => {
    // 👇 SỬA Ở ĐÂY: Key trong ảnh bạn gửi là "user"
    const userStr = localStorage.getItem('user'); 
    if (userStr) {
        try {
            setCurrentUser(JSON.parse(userStr));
        } catch (e) {
            toastError("Lỗi parse user info", e);
        }
    }
  }, [isOpen]); 

  // Lắng nghe socket
  useEffect(() => {
    if (!socket) return; 

    const handleIncomingMessage = (data) => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { sender: 'ai', text: data.message }]);
    };

    const handleAiTyping = () => {
      setIsTyping(true);
    };

    socket.on('server_chat_ai', handleIncomingMessage);
    socket.on('ai_typing', handleAiTyping);

    return () => {
      socket.off('server_chat_ai', handleIncomingMessage);
      socket.off('ai_typing', handleAiTyping);
    };
  }, [socket]); 

  // 👇 HÀM GỬI TIN NHẮN (QUAN TRỌNG)
  const handleSendMessage = () => {
    if (!input.trim()) return;

    if (!socket || !isConnected) {
        toastError("Mất kết nối với máy chủ!");
        return;
    }

    setMessages((prev) => [...prev, { sender: 'user', text: input }]);
    
    // --- 🛠️ PHẦN SỬA LỖI: Ưu tiên lấy user_id ---
    let userId = null;
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
        try {
            const parsed = JSON.parse(storedUser);
            
            // 🔍 Logic lấy ID mới (Dựa trên dữ liệu thực tế của bạn):
            if (parsed.user_id) {
                userId = parsed.user_id;        // ✅ Ưu tiên 1: Lấy user_id (Account ID chuẩn)
            } else if (parsed._id) {
                userId = parsed._id;            // Ưu tiên 2: Lấy _id (Có thể là User hoặc Patient)
            } else if (parsed.id) {
                userId = parsed.id;
            } else if (parsed.user && parsed.user._id) {
                userId = parsed.user._id;
            }
            
            console.log("👉 [DEBUG] User ID gửi đi:", userId); 
        } catch (error) {
            console.error("Lỗi parse user:", error);
        }
    }

    // Gửi tin nhắn kèm userId chuẩn
    socket.emit('client_chat_ai', { 
        message: input,
        userId: userId 
    });
    
    setInput('');
    setIsTyping(true); 
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const renderMessageText = (text) => {
    return text.split('\n').map((str, i) => <p key={i} className="mb-1">{str}</p>);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {isOpen && (
        <div className="w-[360px] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00B5F1] to-[#0095D5] p-4 flex justify-between items-center text-white shadow-md">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Trợ Lý Phòng Khám</h3>
                <span className="flex items-center gap-1 text-xs opacity-90">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                  {isConnected ? 'Sẵn sàng' : 'Mất kết nối'}
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body Chat */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 scrollbar-thin scrollbar-thumb-gray-300">
            {/* Cảnh báo nếu chưa login (dựa trên state currentUser) */}
            {!currentUser && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>Vui lòng <b>Đăng nhập</b> để đặt lịch hẹn.</span>
                </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] items-end gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-[#00B5F1] text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {msg.sender === 'user' ? <UserRound size={14} /> : <Bot size={14} />}
                  </div>

                  <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                    msg.sender === 'user' 
                      ? 'bg-[#00B5F1] text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}>
                    {renderMessageText(msg.text)}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start w-full">
                 <div className="flex items-end gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center shrink-0"><Bot size={14} /></div>
                    <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
            <input
              type="text"
              className="flex-1 bg-gray-100 text-gray-800 text-sm rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00B5F1]/50 transition-all border border-transparent focus:bg-white disabled:opacity-50"
              placeholder={currentUser ? "Nhập tin nhắn..." : "Đăng nhập để chat..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={!isConnected} 
            />
            <button 
              onClick={handleSendMessage}
              disabled={!input.trim() || !isConnected}
              className="bg-[#00B5F1] text-white p-2.5 rounded-full hover:bg-[#0095D5] disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 shadow-md"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} transition-all duration-300 absolute bottom-0 right-0 w-14 h-14 bg-[#00B5F1] hover:bg-[#0095D5] text-white rounded-full shadow-lg hover:shadow-[#00B5F1]/30 flex items-center justify-center group z-50`}
      >
        <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
        {isConnected && <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>}
      </button>

    </div>
  );
};

export default Chatbox;