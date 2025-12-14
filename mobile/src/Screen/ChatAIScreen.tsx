import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, FlatList, TouchableOpacity, 
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Image 
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useSocket } from '../context/SocketContext';
import { useAppContext } from '../context/AppContext';

// Interface cho tin nhắn
interface IMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  createdAt: Date;
}

interface ChatAIProps {
  onBack: () => void;
}

export const ChatAIScreen: React.FC<ChatAIProps> = ({ onBack }) => {
  const { socket, isConnected } = useSocket(); //
  const { user } = useAppContext(); //
  
  const [messages, setMessages] = useState<IMessage[]>([
    {
      id: '1',
      text: 'Chào bạn! Mình là trợ lý ảo phòng khám. Mình có thể giúp bạn tra cứu và đặt lịch hẹn ngay bây giờ.',
      sender: 'ai',
      createdAt: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // --- 1. LẮNG NGHE SOCKET ---
  useEffect(() => {
    if (!socket) return;

    // Nhận tin nhắn từ AI
    const handleIncomingMessage = (data: any) => {
      setIsTyping(false);
      const newMsg: IMessage = {
        id: Math.random().toString(),
        text: data.message,
        sender: 'ai',
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, newMsg]);
    };

    // Hiệu ứng AI đang gõ
    const handleAiTyping = () => {
      setIsTyping(true);
    };

    socket.on('server_chat_ai', handleIncomingMessage); //
    socket.on('ai_typing', handleAiTyping); //

    return () => {
      socket.off('server_chat_ai', handleIncomingMessage);
      socket.off('ai_typing', handleAiTyping);
    };
  }, [socket]);

  // --- 2. GỬI TIN NHẮN ---
  const handleSend = () => {
    if (!inputText.trim()) return;

    // Thêm tin nhắn của User vào list
    const userMsg: IMessage = {
      id: Math.random().toString(),
      text: inputText.trim(),
      sender: 'user',
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Gửi lên Server qua Socket
    if (socket && isConnected) {
      socket.emit('client_chat_ai', { //
        message: inputText.trim(),
        userId: user?._id || null, // Gửi kèm userId nếu đã đăng nhập
      });
      setIsTyping(true); // Giả lập chờ AI trả lời
    } else {
        // Xử lý offline (tùy chọn)
        const errorMsg: IMessage = {
            id: Math.random().toString(),
            text: "Mất kết nối máy chủ. Vui lòng kiểm tra mạng.",
            sender: 'ai',
            createdAt: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
    }

    setInputText('');
  };

  // Cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  // --- RENDER ITEM ---
  const renderItem = ({ item }: { item: IMessage }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[
        styles.msgRow, 
        isUser ? styles.msgRowRight : styles.msgRowLeft
      ]}>
        {!isUser && (
            <View style={styles.avatarBot}>
                <FontAwesome5 name="robot" size={14} color="#FFF" />
            </View>
        )}
        <View style={[
            styles.msgBubble, 
            isUser ? styles.msgBubbleUser : styles.msgBubbleAi
        ]}>
          <Text style={[
            styles.msgText, 
            isUser ? styles.msgTextUser : styles.msgTextAi
          ]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-down" size={24} color="#FFF" />
        </TouchableOpacity>
        <View>
            <Text style={styles.headerTitle}>Trợ lý ảo AI</Text>
            <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4ADE80' : '#EF4444' }]} />
                <Text style={styles.statusText}>{isConnected ? 'Sẵn sàng' : 'Mất kết nối'}</Text>
            </View>
        </View>
      </View>

      {/* CHAT BODY */}
      <View style={styles.body}>
        <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={
                isTyping ? (
                    <View style={styles.typingContainer}>
                        <ActivityIndicator size="small" color="#6B7280" />
                        <Text style={styles.typingText}>AI đang soạn tin...</Text>
                    </View>
                ) : null
            }
        />
      </View>

      {/* FOOTER INPUT */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder={user ? "Nhập tin nhắn..." : "Đăng nhập để đặt lịch..."}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
            />
            <TouchableOpacity 
                style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
                onPress={handleSend}
                disabled={!inputText.trim()}
            >
                <Ionicons name="send" size={20} color="#FFF" />
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 15, paddingHorizontal: 16,
    backgroundColor: '#00B5F1',
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: {width: 0, height: 2}
  },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, color: 'rgba(255,255,255,0.9)' },

  body: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 20 },

  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  msgRowLeft: { justifyContent: 'flex-start' },
  msgRowRight: { justifyContent: 'flex-end' },

  avatarBot: { 
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#00B5F1', 
    justifyContent: 'center', alignItems: 'center', marginRight: 8 
  },

  msgBubble: { 
    padding: 12, borderRadius: 16, maxWidth: '80%',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: {width: 0, height: 1}, elevation: 1
  },
  msgBubbleUser: { backgroundColor: '#00B5F1', borderBottomRightRadius: 2 },
  msgBubbleAi: { backgroundColor: '#FFF', borderBottomLeftRadius: 2 },

  msgText: { fontSize: 15, lineHeight: 22 },
  msgTextUser: { color: '#FFF' },
  msgTextAi: { color: '#1F2937' },

  typingContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 40, marginBottom: 10 },
  typingText: { fontSize: 12, color: '#6B7280', marginLeft: 6, fontStyle: 'italic' },

  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    padding: 10, paddingHorizontal: 16,
    backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 30 : 10
  },
  input: {
    flex: 1, backgroundColor: '#F9FAFB', borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, color: '#1F2937', borderWidth: 1, borderColor: '#E5E7EB',
    maxHeight: 100
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#00B5F1',
    justifyContent: 'center', alignItems: 'center', marginLeft: 10,
    elevation: 2
  },
  sendBtnDisabled: { backgroundColor: '#9CA3AF' }
});