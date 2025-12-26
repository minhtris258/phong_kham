import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import patientService from '../services/PatientService';
import Toast from 'react-native-toast-message';

interface EditProfileProps {
  onBack: () => void;
}

export const EditProfileScreen: React.FC<EditProfileProps> = ({ onBack }) => {
  const { user, loadCurrentUser } = useAppContext();
  const [loading, setLoading] = useState(false);

  // State form
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    gender: 'male',
    dob: '',
    note: ''
  });

  // Load dữ liệu khi vào màn hình
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || 'male',
        dob: user.dob ? user.dob.split('T')[0] : '', 
        note: user.note || ''
      });
    }
  }, [user]);

  const handleUpdate = async () => {
    if (!formData.fullName.trim()) {
      return Alert.alert("Lỗi", "Họ tên không được để trống");
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (formData.dob && !dateRegex.test(formData.dob)) {
       return Alert.alert("Lỗi", "Ngày sinh phải đúng định dạng YYYY-MM-DD (Ví dụ: 1990-01-30)");
    }

    setLoading(true);
    try {
      await patientService.updateProfile(formData);
      await loadCurrentUser();
      
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Cập nhật hồ sơ thành công!',
        visibilityTime: 2000,
      });
      
      // Tự động quay lại sau 1 giây
      setTimeout(() => {
        onBack();
      }, 1000); 

    } catch (error: any) {
      console.error("Update Error:", error);
      const msg = error.response?.data?.error || error.response?.data?.message || "Cập nhật thất bại";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  const GenderOption = ({ value, label, icon }: any) => (
    <TouchableOpacity 
      style={[
        styles.genderBtn, 
        formData.gender === value && styles.genderBtnActive
      ]}
      onPress={() => setFormData({...formData, gender: value})}
    >
      <FontAwesome 
        name={icon} 
        size={18} 
        color={formData.gender === value ? '#FFF' : '#6B7280'} 
      />
      <Text style={[
        styles.genderText, 
        formData.gender === value && styles.genderTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.inputGroup}>
            <Text style={styles.label}>Email (Tên đăng nhập)</Text>
            <TextInput 
                style={[styles.input, styles.disabledInput]} 
                value={user?.email}
                editable={false}
            />
        </View>

        <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên <Text style={styles.required}>*</Text></Text>
            <TextInput 
                style={styles.input} 
                value={formData.fullName}
                onChangeText={(t) => setFormData({...formData, fullName: t})}
                placeholder="Nhập họ tên"
            />
        </View>

        <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.genderContainer}>
                <GenderOption value="male" label="Nam" icon="male" />
                <GenderOption value="female" label="Nữ" icon="female" />
                <GenderOption value="other" label="Khác" icon="transgender" />
            </View>
        </View>

        <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Ngày sinh</Text>
                <TextInput 
                    style={styles.input} 
                    value={formData.dob}
                    onChangeText={(t) => setFormData({...formData, dob: t})}
                    placeholder="YYYY-MM-DD"
                />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput 
                    style={styles.input} 
                    value={formData.phone}
                    onChangeText={(t) => setFormData({...formData, phone: t})}
                    placeholder="09xx..."
                    keyboardType="phone-pad"
                />
            </View>
        </View>

        <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput 
                style={styles.input} 
                value={formData.address}
                onChangeText={(t) => setFormData({...formData, address: t})}
                placeholder="Nhập địa chỉ"
            />
        </View>

        <View style={styles.inputGroup}>
            <Text style={styles.label}>Ghi chú sức khỏe</Text>
            <TextInput 
                style={[styles.input, styles.textArea]} 
                value={formData.note}
                onChangeText={(t) => setFormData({...formData, note: t})}
                placeholder="Tiền sử bệnh, dị ứng..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
            />
        </View>

        {/* Nút Lưu Chính */}
        <TouchableOpacity 
            style={styles.saveBtnMain} 
            onPress={handleUpdate}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color="#FFF" />
            ) : (
                <Text style={styles.saveBtnMainText}>Cập nhật hồ sơ</Text>
            )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: Platform.OS === 'android' ? 40 : 50,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6', backgroundColor: '#FFF'
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },

  content: { padding: 20, paddingBottom: 50 },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  required: { color: '#EF4444' },
  
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 12, fontSize: 16, color: '#1F2937', backgroundColor: '#F9FAFB'
  },
  disabledInput: { backgroundColor: '#F3F4F6', color: '#9CA3AF' },
  textArea: { height: 100 },

  row: { flexDirection: 'row', justifyContent: 'space-between' },

  genderContainer: { flexDirection: 'row', gap: 10 },
  genderBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    backgroundColor: '#F9FAFB', gap: 6
  },
  genderBtnActive: {
    backgroundColor: '#00B5F1', borderColor: '#00B5F1'
  },
  genderText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  genderTextActive: { color: '#FFF', fontWeight: '700' },

  saveBtnMain: {
    backgroundColor: '#00B5F1', borderRadius: 12, paddingVertical: 15,
    alignItems: 'center', marginTop: 10,
    shadowColor: '#00B5F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8
  },
  saveBtnMainText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});