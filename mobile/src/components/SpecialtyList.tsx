import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import specialtyService from '../services/SpecialtyService';
import { IP_ADDRESS, PORT } from '../config';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const resolveImage = (img: string) => {
  if (!img) return 'https://via.placeholder.com/60?text=Khoa';
  if (img.startsWith('http')) return img;
  return `http://${IP_ADDRESS}:${PORT}/${img}`;
};

interface Specialty {
  _id: string;
  name: string;
  thumbnail: string;
}

// 👇 1. Thêm prop onSelectSpecialty
interface SpecialtyListProps {
  onSelectSpecialty?: (id: string) => void;
}

export const SpecialtyList: React.FC<SpecialtyListProps> = ({ onSelectSpecialty }) => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setLoading(true);
        const res = await specialtyService.getAllSpecialties({ limit: 50 });
        const data = res.data?.specialties || res.data || [];
        setSpecialties(data);
      } catch (error) {
        console.error('Lỗi fetch specialties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialties();
  }, []);

  const handleShowMore = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVisibleCount((prev) => prev + 4);
  };

  const handleCollapse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVisibleCount(8);
  };

  if (loading) {
    return <ActivityIndicator size="small" color="#00B5F1" style={{ height: 100 }} />;
  }

  const visibleItems = specialties.slice(0, visibleCount);
  const canShowMore = visibleCount < specialties.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Chuyên khoa</Text>
      </View>

      <View style={styles.gridContainer}>
        {visibleItems.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={styles.itemContainer}
            // 👇 2. Gọi hàm onSelectSpecialty khi bấm vào khoa
            onPress={() => onSelectSpecialty && onSelectSpecialty(item._id)}>
            <View style={styles.iconCircle}>
              <Image
                source={{ uri: resolveImage(item.thumbnail) }}
                style={styles.iconImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {canShowMore ? (
        <TouchableOpacity style={styles.showMoreBtn} onPress={handleShowMore}>
          <Text style={styles.showMoreText}>Xem thêm</Text>
          <Ionicons name="chevron-down" size={16} color="#00B5F1" />
        </TouchableOpacity>
      ) : (
        specialties.length > 8 && (
          <TouchableOpacity style={styles.showMoreBtn} onPress={handleCollapse}>
            <Text style={styles.showMoreText}>Thu gọn</Text>
            <Ionicons name="chevron-up" size={16} color="#00B5F1" />
          </TouchableOpacity>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 20, paddingHorizontal: 16,  },
  header: { marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -5,
  },
  itemContainer: { width: '25%', alignItems: 'center', marginBottom: 20, paddingHorizontal: 5 },
  iconCircle: {
    width: 60,
    height: 60,
   
    
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    
    borderColor: '#E5E7EB',
  },
  iconImage: { width: '100%', height: '100%' },
  itemName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
    minHeight: 32,
  },
  showMoreBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: -5,
    gap: 4,
  },
  showMoreText: { fontSize: 13, color: '#00B5F1', fontWeight: '600' },
});
