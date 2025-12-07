import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  rating: number;
}

interface DoctorCardProps {
  doctor: Doctor;
  onPress?: (event: GestureResponderEvent) => void;
}
export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{doctor.name[0]}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.name}>{doctor.name}</Text>
      <Text style={styles.specialization}>{doctor.specialization}</Text>
      <Text style={styles.rating}>
        <Ionicons name="star" size={14} color="#fbbf24" /> {doctor.rating}
      </Text>
    </View>
    {onPress && <Ionicons name="chevron-forward" size={24} color="#ccc" />}
  </TouchableOpacity>
);

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  style?: any;
}
export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  disabled,
  style,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}
    style={[
      variant === 'primary' ? styles.btnPrimary : styles.btnSecondary,
      disabled && { opacity: 0.5 },
      style,
    ]}
  >
    <Text style={variant === 'primary' ? styles.btnPrimaryTxt : styles.btnSecondaryTxt}>
      {children}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    elevation: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#a5b4fc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  name: { fontWeight: '700', fontSize: 16, color: '#1F2937' },
  specialization: { fontSize: 13, color: '#4F46E5', marginTop: 2 },
  rating: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  btnPrimary: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  btnPrimaryTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnSecondary: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  btnSecondaryTxt: { color: '#374151', fontWeight: '600', fontSize: 15 },
});