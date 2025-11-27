import React, { useState, useEffect, useRef } from 'react';
// 👇 IMPORT HOOK TỪ FILE CONTEXT CỦA BẠN
import { useSocket } from '../context/SocketContext'; // Sửa đường dẫn này nếu cần
import { MessageCircle, X, Send, Bot, User, AlertCircle } from 'lucide-react';

const Chatbox = () => {
  // 1. Lấy socket từ Context thay vì tự tạo mới
  const { socket, isConnected } = useSocket();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Chào bạn! Mình là trợ lý ảo phòng khám. Mình có thể giúp bạn đặt lịch hẹn ngay bây giờ.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll xuống cuối
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  // 2. LẮNG NGHE SỰ KIỆN TỪ SOCKET CONTEXT
  useEffect(() => {
    if (!socket) return; // Nếu chưa có socket (chưa login), không làm gì cả

    // Hàm xử lý tin nhắn đến
    const handleIncomingMessage = (data) => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { sender: 'ai', text: data.message }]);
    };

    // Hàm xử lý hiệu ứng typing
    const handleAiTyping = () => {
      setIsTyping(true);
    };

    // Đăng ký sự kiện
    socket.on('server_chat_ai', handleIncomingMessage);
    socket.on('ai_typing', handleAiTyping);

    // Cleanup: Gỡ sự kiện khi component unmount hoặc socket thay đổi
    return () => {
      socket.off('server_chat_ai', handleIncomingMessage);
      socket.off('ai_typing', handleAiTyping);
    };
  }, [socket]); // Chạy lại khi đối tượng socket thay đổi

  const handleSendMessage = () => {
    if (!input.trim()) return;

    if (!socket || !isConnected) {
        alert("Vui lòng đăng nhập để chat với trợ lý ảo!");
        return;
    }

    // Hiển thị tin nhắn user
    setMessages((prev) => [...prev, { sender: 'user', text: input }]);
    
    // 3. GỬI TIN NHẮN DÙNG SOCKET CỦA CONTEXT
    socket.emit('client_chat_ai', { message: input });
    
    setInput('');
    setIsTyping(true); 
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  // Hàm render link đặt lịch
  const renderMessageText = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="underline font-bold text-blue-200 hover:text-white transition-colors break-all">
            Bấm vào đây để đặt lịch
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {isOpen && (
        <div className="w-[360px] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 flex justify-between items-center text-white shadow-md">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Trợ Lý Phòng Khám</h3>
                <span className="flex items-center gap-1 text-xs opacity-90">
                  {/* Hiển thị trạng thái kết nối dựa trên Context */}
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                  {isConnected ? 'Online' : 'Mất kết nối'}
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body Chat */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {/* Cảnh báo nếu chưa login */}
            {!isConnected && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>Bạn cần đăng nhập để đặt lịch hẹn.</span>
                </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] items-end gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                    {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
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
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Bot size={14} /></div>
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
              className="flex-1 bg-gray-100 text-gray-800 text-sm rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-transparent focus:bg-white disabled:opacity-50"
              placeholder={isConnected ? "Nhập câu hỏi..." : "Vui lòng đăng nhập..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={!isConnected} // Khóa input nếu chưa kết nối
            />
            <button 
              onClick={handleSendMessage}
              disabled={!input.trim() || !isConnected}
              className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 shadow-md"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} transition-all duration-300 absolute bottom-0 right-0 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-blue-500/30 flex items-center justify-center group z-50`}
      >
        <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
        {/* Chỉ hiện chấm đỏ khi đã kết nối */}
        {isConnected && <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>}
      </button>

    </div>
  );
};

export default Chatbox;