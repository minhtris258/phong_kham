// src/screens/SupportCenter.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import contactService from '../services/ContactService';

interface SupportCenterProps {
  onBack: () => void;
}

export const SupportCenter: React.FC<SupportCenterProps> = ({ onBack }) => {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    subject: '', // Đã thêm trường tiêu đề
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate các trường bắt buộc (fullName, phone, email, subject, message)
    if (!form.fullName || !form.phone || !form.email || !form.subject || !form.message) {
      return Alert.alert('Thông báo', 'Vui lòng điền đầy đủ các trường có dấu (*)');
    }

    setLoading(true);
    try {
      const payload = {
        name: form.fullName,
        email: form.email,
        phone: form.phone,
        subject: form.subject, // Gửi tiêu đề lên Backend
        message: form.message,
      };

      await contactService.createContact(payload);

      Alert.alert('Thành công', 'Yêu cầu của bạn đã được gửi đi. Chúng tôi sẽ phản hồi sớm nhất.', [
        { text: 'OK', onPress: onBack }
      ]);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Không thể gửi yêu cầu lúc này.';
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = (icon: any, title: string, content: string, action?: () => void) => (
    <TouchableOpacity 
      style={styles.infoRow} 
      onPress={action} 
      disabled={!action}
    >
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={20} color="#00B5F1" />
      </View>
      <View>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoContent}>{content}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trung tâm trợ giúp</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
       
        {/* Form Section */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Gửi yêu cầu hỗ trợ</Text>
          
          <Text style={styles.label}>Họ và tên *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nguyễn Văn A"
            value={form.fullName}
            onChangeText={(txt) => setForm({...form, fullName: txt})}
          />

          <Text style={styles.label}>Số điện thoại *</Text>
          <TextInput
            style={styles.input}
            placeholder="0909000000"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(txt) => setForm({...form, phone: txt})}
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(txt) => setForm({...form, email: txt})}
          />

          {/* TRƯỜNG TIÊU ĐỀ MỚI THÊM */}
          <Text style={styles.label}>Tiêu đề *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Hỏi về kết quả khám..."
            value={form.subject}
            onChangeText={(txt) => setForm({...form, subject: txt})}
          />

          <Text style={styles.label}>Nội dung *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả vấn đề bạn cần hỗ trợ..."
            multiline
            numberOfLines={4}
            value={form.message}
            onChangeText={(txt) => setForm({...form, message: txt})}
          />

          <TouchableOpacity 
            style={[styles.submitBtn, loading && { backgroundColor: '#9CA3AF' }]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Gửi yêu cầu</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16, 
    paddingTop: 50, 
    paddingBottom: 16, 
    backgroundColor: '#FFF',
    elevation: 2
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  scrollContent: { padding: 16 },
  infoSection: { marginBottom: 20 },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  iconCircle: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#EBF4FF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  infoTitle: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  infoContent: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  formCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, elevation: 2 },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '600', color: '#4B5563', marginBottom: 6 },
  input: { 
    backgroundColor: '#F9FAFB', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 8, 
    padding: 10, 
    marginBottom: 15,
    fontSize: 14
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitBtn: { 
    backgroundColor: '#0095D5', 
    paddingVertical: 14, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 5 
  },
  submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});