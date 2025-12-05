import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

interface Doctor {
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  location: string;
  price: string;
  imageUrl: string;
}

interface DoctorCardProps {
  doctor: Doctor;
  onPress?: () => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onPress }) => {
  const isHeart = doctor.specialty === 'Tim mạch';
  const specialtyColor = isHeart ? '#2563EB' : '#A855F7'; 

  return (
    <TouchableOpacity style={styles.doctorCard} activeOpacity={0.8} onPress={onPress}>
      <Image source={{ uri: doctor.imageUrl }} style={styles.doctorImage} />
      <View style={styles.doctorInfo}>
        <View style={styles.doctorHeader}>
          <Text style={[styles.doctorSpecialty, { color: specialtyColor }]}>{doctor.specialty}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FBBF24" />
            <Text style={styles.ratingText}>{doctor.rating}</Text>
          </View>
        </View>
        <Text style={styles.doctorName}>{doctor.name}</Text>
        <Text style={styles.doctorExperience}>{doctor.experience}</Text>
        <View style={styles.doctorFooter}>
          <View style={styles.doctorFooterItem}>
            <FontAwesome name="map-marker" size={12} color="#6B7280" />
            <Text style={styles.locationText}>{doctor.location}</Text>
          </View>
          <View style={styles.doctorFooterItem}>
            <FontAwesome name="dollar" size={12} color="#6B7280" />
            <Text style={styles.priceText}>{doctor.price}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  doctorCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  doctorInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doctorSpecialty: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBBF241A', 
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FBBF24',
    marginLeft: 4,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginVertical: 4,
  },
  doctorExperience: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  doctorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  doctorFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
});