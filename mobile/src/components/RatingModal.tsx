import React, { useState } from 'react';
import { 
  View, Text, Modal, StyleSheet, TouchableOpacity, 
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ratingService from '../services/RatingService';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  notification: any; // Dữ liệu thông báo chứa appointment_id
  onSuccess?: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({ 
  visible, onClose, notification, onSuccess 
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn số sao!");
      return;
    }

    setLoading(true);
    try {
      await ratingService.createRating({
        appointment_id: notification?.appointment_id,
        star: rating,
        comment: comment.trim()
      });

      Alert.alert("Thành công", "Cảm ơn bạn đã gửi đánh giá!");
      if (onSuccess) onSuccess();
      onClose(); // Đóng modal
    } catch (error: any) {
      const msg = error.response?.data?.message || "Lỗi khi gửi đánh giá";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  // Helper text
  const getRatingLabel = (star: number) => {
    switch(star) {
      case 5: return "Tuyệt vời!";
      case 4: return "Rất tốt";
      case 3: return "Bình thường";
      case 2: return "Tệ";
      case 1: return "Rất tệ";
      default: return "";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Đánh giá trải nghiệm</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Bạn cảm thấy buổi khám với bác sĩ 
            {notification?.data?.doctorName ? ` ${notification.data.doctorName}` : ''} thế nào?
          </Text>

          {/* Stars */}
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons 
                  name={star <= rating ? "star" : "star-outline"} 
                  size={40} 
                  color="#FBBF24" 
                  style={{ marginHorizontal: 4 }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabel}>{getRatingLabel(rating)}</Text>

          {/* Comment */}
          <TextInput
            style={styles.input}
            placeholder="Chia sẻ thêm chi tiết (bác sĩ nhiệt tình...)"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity 
                style={[styles.btn, styles.cancelBtn]} 
                onPress={onClose}
                disabled={loading}
            >
                <Text style={styles.cancelText}>Để sau</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.btn, styles.submitBtn]} 
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                ) : (
                    <Text style={styles.submitText}>Gửi đánh giá</Text>
                )}
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 20
  },
  modalContent: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20, width: '100%', maxWidth: 400,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
  
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  ratingLabel: { textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#D97706', marginBottom: 20, height: 20 },

  input: {
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 12, fontSize: 14, color: '#374151', height: 100, marginBottom: 20
  },

  btnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  btn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB' },
  cancelText: { color: '#374151', fontWeight: '600' },
  submitBtn: { backgroundColor: '#4F46E5' },
  submitText: { color: '#FFF', fontWeight: '600' }
});