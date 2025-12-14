import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, 
  ScrollView, Dimensions, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../context/AppContext';

const { height } = Dimensions.get('window');

interface RegisterScreenProps {
  onLoginPress: () => void;
  onBack?: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onLoginPress, onBack }) => {
  const { register } = useAppContext();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Thông báo", "Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, confirmPassword);
      Alert.alert("Thành công", "Đăng ký tài khoản thành công!", [
        { text: "OK" }
      ]);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Đăng ký thất bại.";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#00B5F1', '#0095D5']}
        style={styles.background}
      >
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Nút Quay Lại */}
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
               <Ionicons name="person-add" size={36} color="#00B5F1" />
            </View>
            <Text style={styles.welcomeText}>Tạo tài khoản</Text>
            <Text style={styles.subText}>Đăng ký để trải nghiệm dịch vụ</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            
            {/* Họ tên */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Họ và tên</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập họ tên của bạn"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Mật khẩu */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Tạo mật khẩu"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Xác nhận mật khẩu */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Xác nhận mật khẩu</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.registerButtonText}>ĐĂNG KÝ NGAY</Text>
              )}
            </TouchableOpacity>

          </View>

          {/* Footer Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={onLoginPress}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  background: {
    position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.45,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  circle1: {
    position: 'absolute', top: -50, left: -50, width: 200, height: 200,
    borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.1)'
  },
  circle2: {
    position: 'absolute', top: 50, right: -30, width: 150, height: 150,
    borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.1)'
  },

  keyboardView: { flex: 1 },
  backButton: {
    position: 'absolute', top: Platform.OS === 'ios' ? 50 : 40, left: 20, zIndex: 10,
    padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12
  },
  
  scrollContent: { 
    flexGrow: 1, paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 100 : 90 
  },

  header: { marginBottom: 25, alignItems: 'center' },
  logoBox: {
    width: 70, height: 70, backgroundColor: '#FFF', borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
    shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity:0.1, shadowRadius:4, elevation:5
  },
  welcomeText: { fontSize: 26, fontWeight: 'bold', color: '#FFF' },
  subText: { fontSize: 15, color: 'rgba(255,255,255,0.9)', marginTop: 5 },

  card: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
    marginBottom: 20
  },
  
  inputWrapper: { marginBottom: 16 },
  label: { fontSize: 14, color: '#374151', fontWeight: '600', marginBottom: 6 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 14, height: 50, backgroundColor: '#F9FAFB'
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1F2937' },

  registerButton: {
    backgroundColor: '#00B5F1', height: 52, borderRadius: 14, marginTop: 10,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#00B5F1', shadowOffset: {width:0, height:4}, shadowOpacity:0.3, shadowRadius:8, elevation:4
  },
  registerButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  footer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 30 },
  footerText: { color: '#6B7280', fontSize: 14 },
  loginLink: { color: '#00B5F1', fontSize: 14, fontWeight: 'bold' }
});