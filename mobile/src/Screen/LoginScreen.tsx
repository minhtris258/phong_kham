import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, 
  ScrollView, ImageBackground, Dimensions, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Cần cài: npx expo install expo-linear-gradient
import { useAppContext } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

interface LoginScreenProps {
  onRegisterPress: () => void;
  onBack?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onRegisterPress, onBack }) => {
  const { login } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập email và mật khẩu");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Đăng nhập thất bại.";
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
        colors={['#00B5F1', '#0095D5']} // Xanh y tế
        style={styles.background}
      >
        {/* Họa tiết trang trí (Circle mờ) */}
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
          
          {/* Header Logo */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
               <Ionicons name="medical" size={40} color="#00B5F1" />
            </View>
            <Text style={styles.welcomeText}>Xin chào,</Text>
            <Text style={styles.subText}>Đăng nhập để tiếp tục</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPass}>
              <Text style={styles.forgotPassText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.loginButtonText}>ĐĂNG NHẬP</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.orText}>HOẶC</Text>
                <View style={styles.line} />
            </View>

            <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialBtn}>
                    <Ionicons name="logo-google" size={24} color="#DB4437" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                    <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                </TouchableOpacity>
            </View>
          </View>

          {/* Footer Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Bạn chưa có tài khoản? </Text>
            <TouchableOpacity onPress={onRegisterPress}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
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
    position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.5, // Nền xanh chiếm nửa trên
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  // Họa tiết trang trí
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

  header: { marginBottom: 30, alignItems: 'center' },
  logoBox: {
    width: 70, height: 70, backgroundColor: '#FFF', borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
    shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity:0.1, shadowRadius:4, elevation:5
  },
  welcomeText: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
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

  forgotPass: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotPassText: { color: '#00B5F1', fontSize: 13, fontWeight: '600' },

  loginButton: {
    backgroundColor: '#00B5F1', height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#00B5F1', shadowOffset: {width:0, height:4}, shadowOpacity:0.3, shadowRadius:8, elevation:4
  },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  line: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  orText: { marginHorizontal: 10, color: '#9CA3AF', fontSize: 12, fontWeight: '600' },

  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  socialBtn: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB'
  },

  footer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 30 },
  footerText: { color: '#6B7280', fontSize: 14 },
  registerLink: { color: '#00B5F1', fontSize: 14, fontWeight: 'bold' }
});