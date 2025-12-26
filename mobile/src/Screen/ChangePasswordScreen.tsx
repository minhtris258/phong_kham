import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import patientService from '../services/PatientService';
import Toast from 'react-native-toast-message';

export const ChangePasswordScreen = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAppContext();
  
  // Kiểm tra tài khoản Google
  const isGoogleAccount = user?.authType === 'google';

  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  
  // State hiển thị mật khẩu
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = async () => {
    // Validate cơ bản
    if (!isGoogleAccount && !form.oldPassword) {
        return Alert.alert("Lỗi", "Vui lòng nhập mật khẩu hiện tại");
    }
    if (!form.newPassword || !form.confirmPassword) {
        return Alert.alert("Lỗi", "Vui lòng nhập mật khẩu mới");
    }
    if (form.newPassword !== form.confirmPassword) {
        return Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp!");
    }
    if (form.newPassword.length < 6) {
        return Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự");
    }

    setLoading(true);
    try {
        // Gọi API: Nếu là Google thì gửi oldPassword là chuỗi rỗng
        await patientService.changeMyPassword(
            isGoogleAccount ? "" : form.oldPassword,
            form.newPassword,
            form.confirmPassword
        );

        Toast.show({
            type: 'success',
            text1: 'Thành công',
            text2: isGoogleAccount ? 'Tạo mật khẩu thành công!' : 'Đổi mật khẩu thành công!'
        });
        
        // Reset form & Back
        setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        onBack();

    } catch (error: any) {
        const msg = error.response?.data?.message || "Đổi mật khẩu thất bại";
        Alert.alert("Lỗi", msg);
    } finally {
        setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>
            {isGoogleAccount ? "Tạo mật khẩu mới" : "Đổi mật khẩu"}
        </Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Thông báo cho Google Account */}
        {isGoogleAccount && (
            <View style={styles.noticeBox}>
                <Ionicons name="information-circle" size={20} color="#1D4ED8" />
                <Text style={styles.noticeText}>
                    Bạn đang dùng tài khoản Google. Bạn không cần nhập mật khẩu cũ để tạo mật khẩu mới.
                </Text>
            </View>
        )}

        {/* Form Fields */}
        <View style={styles.form}>
            
            {/* 1. Mật khẩu cũ (Ẩn nếu là Google) */}
            {!isGoogleAccount && (
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mật khẩu hiện tại <Text style={styles.required}>*</Text></Text>
                    <View style={styles.inputContainer}>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Nhập mật khẩu cũ"
                            secureTextEntry={!showOld} 
                            value={form.oldPassword} 
                            onChangeText={t => setForm({...form, oldPassword: t})}
                        />
                        <TouchableOpacity onPress={() => setShowOld(!showOld)}>
                            <Ionicons name={showOld ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* 2. Mật khẩu mới */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu mới <Text style={styles.required}>*</Text></Text>
                <View style={styles.inputContainer}>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Nhập mật khẩu mới"
                        secureTextEntry={!showNew} 
                        value={form.newPassword} 
                        onChangeText={t => setForm({...form, newPassword: t})}
                    />
                    <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                        <Ionicons name={showNew ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 3. Xác nhận mật khẩu */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Xác nhận mật khẩu mới <Text style={styles.required}>*</Text></Text>
                <View style={styles.inputContainer}>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Nhập lại mật khẩu mới"
                        secureTextEntry={!showConfirm} 
                        value={form.confirmPassword} 
                        onChangeText={t => setForm({...form, confirmPassword: t})}
                    />
                    <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                        <Ionicons name={showConfirm ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Nút Submit */}
            <TouchableOpacity 
                style={[styles.btn, loading && { opacity: 0.7 }]} 
                onPress={handleChange}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.btnText}>
                        {isGoogleAccount ? "Tạo mật khẩu" : "Lưu thay đổi"}
                    </Text>
                )}
            </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 16, paddingTop: Platform.OS === 'android' ? 40 : 50,
    borderBottomWidth: 1, borderColor: '#F3F4F6', backgroundColor: '#FFF' 
  },
  backBtn: { padding: 8 },
  title: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  content: { padding: 20 },
  
  noticeBox: {
    flexDirection: 'row', backgroundColor: '#EFF6FF', padding: 12, 
    borderRadius: 8, marginBottom: 20, alignItems: 'center', gap: 10
  },
  noticeText: { fontSize: 13, color: '#1E40AF', flex: 1, lineHeight: 18 },

  form: { gap: 20 },
  inputGroup: {},
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  required: { color: '#EF4444' },
  
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, paddingHorizontal: 12, height: 50, backgroundColor: '#F9FAFB'
  },
  input: { flex: 1, fontSize: 16, color: '#1F2937' },

  btn: { 
    backgroundColor: '#00B5F1', height: 50, borderRadius: 12, 
    alignItems: 'center', justifyContent: 'center', marginTop: 10,
    shadowColor: '#00B5F1', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8
  },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});