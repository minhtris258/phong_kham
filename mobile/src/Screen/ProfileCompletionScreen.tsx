import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Platform, StatusBar, Alert, ActivityIndicator, KeyboardAvoidingView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker'; // Cần cài: npx expo install @react-native-community/datetimepicker
import { useAppContext } from '../context/AppContext';
import patientService from '../services/PatientService'; // Giả sử bạn đã có service này giống web
import Toast from 'react-native-toast-message';

interface ProfileCompletionProps {
  onSuccess: () => void;
}

export const ProfileCompletionScreen: React.FC<ProfileCompletionProps> = ({ onSuccess }) => {
  const { user, loadCurrentUser, setAuthToken } = useAppContext();
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    gender: 'male',
    dob: new Date(),
  });

  // Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Validate
  const validate = () => {
    if (!formData.fullName.trim()) return "Vui lòng nhập họ tên.";
    if (!formData.phone.trim()) return "Vui lòng nhập số điện thoại.";
    if (!formData.address.trim()) return "Vui lòng nhập địa chỉ.";
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      Alert.alert("Thiếu thông tin", error);
      return;
    }

    setLoading(true);
    try {
      // Chuẩn bị dữ liệu gửi đi (Format ngày tháng cho chuẩn YYYY-MM-DD)
      const payload = {
        ...formData,
        dob: formData.dob.toISOString().split('T')[0]
      };

      // 1. Gọi API (Tương tự web: patientService.completePatientProfile)
      // Lưu ý: Bạn cần đảm bảo patientService.completePatientProfile đã được định nghĩa
      const res = await patientService.completePatientProfile(payload);

      // 2. Xử lý Token mới (Nếu backend trả về token mới như web)
      const newToken = res.token || res.data?.token;
      if (newToken) {
          await setAuthToken(newToken);
          await loadCurrentUser(newToken);
      } else {
          // Nếu không có token mới, just reload user
          await loadCurrentUser();
      }

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Hồ sơ đã được cập nhật!',
      });

      // 3. Gọi callback để App chuyển về trang chủ
      onSuccess();

    } catch (err: any) {
      console.error("Lỗi cập nhật:", err);
      const msg = err.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại.";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, dob: selectedDate });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Background Header */}
      <LinearGradient colors={['#00B5F1', '#0095D5']} style={styles.headerBackground}>
        <View style={styles.headerContent}>
            <View style={styles.iconCircle}>
                <Ionicons name="person-circle-outline" size={60} color="#00B5F1" />
            </View>
            <Text style={styles.title}>Hoàn tất hồ sơ</Text>
            <Text style={styles.subtitle}>Vui lòng cập nhật thông tin để tiếp tục</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
            
            {/* Họ tên */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Họ và tên <Text style={{color: 'red'}}>*</Text></Text>
                <TextInput 
                    style={styles.input} 
                    value={formData.fullName}
                    onChangeText={(t) => setFormData({...formData, fullName: t})}
                    placeholder="Nguyễn Văn A"
                />
            </View>

            {/* SĐT & Giới tính Row */}
            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Số điện thoại <Text style={{color: 'red'}}>*</Text></Text>
                    <TextInput 
                        style={styles.input} 
                        value={formData.phone}
                        onChangeText={(t) => setFormData({...formData, phone: t})}
                        placeholder="09xx..."
                        keyboardType="phone-pad"
                    />
                </View>
                <View style={[styles.inputGroup, { width: 120 }]}>
                    <Text style={styles.label}>Giới tính</Text>
                    <View style={styles.genderRow}>
                        <TouchableOpacity 
                            style={[styles.genderBtn, formData.gender === 'male' && styles.genderBtnActive]}
                            onPress={() => setFormData({...formData, gender: 'male'})}
                        >
                            <Ionicons name="male" size={18} color={formData.gender === 'male' ? '#FFF' : '#6B7280'} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.genderBtn, formData.gender === 'female' && styles.genderBtnActive]}
                            onPress={() => setFormData({...formData, gender: 'female'})}
                        >
                            <Ionicons name="female" size={18} color={formData.gender === 'female' ? '#FFF' : '#6B7280'} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Ngày sinh */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Ngày sinh</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
                    <Text style={styles.dateText}>
                        {formData.dob.toLocaleDateString('vi-VN')}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={formData.dob}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                        maximumDate={new Date()}
                    />
                )}
            </View>

            {/* Địa chỉ */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Địa chỉ <Text style={{color: 'red'}}>*</Text></Text>
                <TextInput 
                    style={styles.input} 
                    value={formData.address}
                    onChangeText={(t) => setFormData({...formData, address: t})}
                    placeholder="Số nhà, đường, phường, quận..."
                />
            </View>

            {/* Nút Lưu */}
            <TouchableOpacity 
                style={styles.submitBtn} 
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.submitBtnText}>CẬP NHẬT & TIẾP TỤC</Text>
                )}
            </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  headerBackground: {
    height: 220, justifyContent: 'center', alignItems: 'center',
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    paddingTop: 30
  },
  headerContent: { alignItems: 'center' },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 5 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },

  formContainer: {
    padding: 20, marginTop: -30, backgroundColor: '#FFF', 
    marginHorizontal: 16, borderRadius: 20,
    shadowColor: '#000', shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5,
    marginTop: 40,
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 12, fontSize: 16, color: '#1F2937', backgroundColor: '#F9FAFB'
  },
  row: { flexDirection: 'row' },
  
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: {
    flex: 1, height: 46, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#F9FAFB'
  },
  genderBtnActive: { backgroundColor: '#00B5F1', borderColor: '#00B5F1' },

  dateInput: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 12, backgroundColor: '#F9FAFB'
  },
  dateText: { fontSize: 16, color: '#1F2937' },

  submitBtn: {
    backgroundColor: '#00B5F1', height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
    shadowColor: '#00B5F1', shadowOffset: {width:0, height:4}, shadowOpacity:0.3, shadowRadius:8, elevation:4
  },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});