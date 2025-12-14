import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { debounce } from 'lodash';

// Services & Components
import doctorService from '../services/DoctorService';
import { DoctorCard, Doctor } from '../components/DoctorCard';
import { IP_ADDRESS, PORT } from '../config';

// Helper xử lý ảnh
const resolveImage = (img: string) => {
  if (!img) return 'https://ui-avatars.com/api/?name=Doctor&background=random';
  if (img.startsWith('http')) return img;
  const cleanPath = img.startsWith('/') ? img.substring(1) : img;
  return `http://${IP_ADDRESS}:${PORT}/${cleanPath}`;
};

interface DoctorsScreenProps {
  onBack: () => void;
  onSelectDoctor: (doc: any) => void;
  initialSpecialty?: string | null;
}

export const DoctorsScreen: React.FC<DoctorsScreenProps> = ({ onBack, onSelectDoctor,initialSpecialty }) => {
  // --- STATE DỮ LIỆU ---
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- STATE BỘ LỌC ---
  const [searchText, setSearchText] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(initialSpecialty || null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // --- 1. LẤY DANH SÁCH CHUYÊN KHOA ---
  useEffect(() => {
    if (initialSpecialty !== undefined) {
        setSelectedSpecialty(initialSpecialty);
    }
  }, [initialSpecialty]);
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await doctorService.getSpecialties({ limit: 100 });

        let list: any[] = [];
        const data = res.data || res;

        if (Array.isArray(data)) list = data;
        else if (data.data && Array.isArray(data.data)) list = data.data;
        else if (data.specialties && Array.isArray(data.specialties)) list = data.specialties;
        else if (data.items && Array.isArray(data.items)) list = data.items;

        setSpecialties(list);
      } catch (e) {
        console.error('Lỗi tải chuyên khoa:', e);
        setSpecialties([]);
      }
    };
    fetchSpecialties();
  }, []);

  // --- 2. HÀM LẤY BÁC SĨ ---
  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        limit: 100,
        search: searchText,
      };

      if (selectedSpecialty) {
        params.specialty = selectedSpecialty;
      }

      const res = await doctorService.getAllDoctors(params);

      const data = res.data || res;
      const rawList = data.doctors || data.data || (Array.isArray(data) ? data : []);

      const currentYear = new Date().getFullYear();

      const mappedList = rawList
        .map((doc: any) => {
          // 👇 LOGIC TÍNH NĂM KINH NGHIỆM TẠI ĐÂY
          let expString = 'Mới hành nghề';
          if (doc.career_start_year) {
            const years = currentYear - doc.career_start_year;
            if (years > 0) expString = `${years} năm kinh nghiệm`;
          }

          return {
            _id: doc._id,
            name: doc.fullName || doc.name,
            specialty: doc.specialty_id?.name || 'Đa khoa',
            rating: doc.averageRating || 0,

            // 👇 Sử dụng giá trị đã tính toán
            experience: expString,

            location: doc.address || 'Hồ Chí Minh',
            price: doc.consultation_fee || 0,
            imageUrl: resolveImage(doc.thumbnail),
            ...doc,
          };
        })
        .filter((doc: any) => {
          if (!selectedRating) return true;
          return doc.rating >= selectedRating;
        });

      setDoctors(mappedList);
    } catch (error) {
      console.error('Lỗi tải bác sĩ:', error);
    } finally {
      setLoading(false);
    }
  }, [searchText, selectedSpecialty, selectedRating]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleSearchChange = useCallback(
    debounce((text) => {
      setSearchText(text);
    }, 500),
    []
  );

  const activeFiltersCount = (selectedSpecialty ? 1 : 0) + (selectedRating ? 1 : 0);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Tìm bác sĩ..."
            style={styles.searchInput}
            onChangeText={handleSearchChange}
          />
        </View>

        <TouchableOpacity
          style={[styles.filterIconBtn, activeFiltersCount > 0 && styles.filterIconBtnActive]}
          onPress={() => setShowFilterModal(true)}>
          <Ionicons
            name="options-outline"
            size={24}
            color={activeFiltersCount > 0 ? '#00B5F1' : '#fff'}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* FILTER CHIPS BAR */}
      {(selectedSpecialty || selectedRating) && (
        <View style={styles.chipsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedRating && (
              <TouchableOpacity style={styles.activeChip} onPress={() => setSelectedRating(null)}>
                <Text style={styles.activeChipText}>{selectedRating} sao trở lên</Text>
                <Ionicons name="close" size={14} color="#2563EB" />
              </TouchableOpacity>
            )}
            {selectedSpecialty && (
              <TouchableOpacity
                style={styles.activeChip}
                onPress={() => setSelectedSpecialty(null)}>
                <Text style={styles.activeChipText}>
                  {specialties.find((s) => s._id === selectedSpecialty)?.name || 'Chuyên khoa'}
                </Text>
                <Ionicons name="close" size={14} color="#2563EB" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                setSelectedRating(null);
                setSelectedSpecialty(null);
              }}>
              <Text style={styles.clearText}>Xóa hết</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* LIST BÁC SĨ */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item._id || Math.random().toString()}
          renderItem={({ item }) => (
            <DoctorCard doctor={item} onPress={() => onSelectDoctor(item)} />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="person-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Không tìm thấy bác sĩ phù hợp.</Text>
            </View>
          }
        />
      )}

      {/* MODAL BỘ LỌC */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bộ lọc tìm kiếm</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionTitle}>Đánh giá</Text>
              <View style={styles.ratingRow}>
                {[5, 4, 3].map((star) => (
                  <TouchableOpacity
                    key={star}
                    style={[styles.ratingChip, selectedRating === star && styles.ratingChipActive]}
                    onPress={() => setSelectedRating(selectedRating === star ? null : star)}>
                    <Ionicons
                      name="star"
                      size={16}
                      color={selectedRating === star ? '#FFF' : '#FBBF24'}
                    />
                    <Text
                      style={[
                        styles.ratingChipText,
                        selectedRating === star && styles.ratingChipTextActive,
                      ]}>
                      {star} sao +
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Chuyên khoa</Text>
              <View style={styles.specialtyGrid}>
                {Array.isArray(specialties) &&
                  specialties.map((spec) => (
                    <TouchableOpacity
                      key={spec._id}
                      style={[
                        styles.specialtyChip,
                        selectedSpecialty === spec._id && styles.specialtyChipActive,
                      ]}
                      onPress={() =>
                        setSelectedSpecialty(selectedSpecialty === spec._id ? null : spec._id)
                      }>
                      <Text
                        style={[
                          styles.specialtyText,
                          selectedSpecialty === spec._id && styles.specialtyTextActive,
                        ]}>
                        {spec.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setSelectedRating(null);
                  setSelectedSpecialty(null);
                }}>
                <Text style={styles.resetBtnText}>Thiết lập lại</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilterModal(false)}>
                <Text style={styles.applyBtnText}>Áp dụng ({doctors.length})</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
   
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#00B5F1',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    padding: 16, paddingTop: Platform.OS === 'android' ? 40 : 50,
  },
  backButton: { padding: 8, marginRight: 8 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#333' },
  filterIconBtn: { padding: 8, marginLeft: 8, position: 'relative' },
  filterIconBtnActive: { backgroundColor: '#EFF6FF', borderRadius: 8 },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 6,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  chipsContainer: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#FFF' },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 4,
  },
  activeChipText: { color: '#2563EB', fontSize: 12, fontWeight: '600' },
  clearText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
  listContent: { padding: 16, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 10, color: '#6B7280', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  modalBody: { padding: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 12 },
  ratingRow: { flexDirection: 'row', gap: 12 },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  ratingChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  ratingChipText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  ratingChipTextActive: { color: '#FFF' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },
  specialtyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  specialtyChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  specialtyChipActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  specialtyText: { fontSize: 13, color: '#4B5563' },
  specialtyTextActive: { color: '#2563EB', fontWeight: '600' },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 15,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  resetBtnText: { fontSize: 15, fontWeight: '600', color: '#4B5563' },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#00B5F1',
    alignItems: 'center',
  },
  applyBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
