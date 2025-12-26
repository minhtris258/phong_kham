import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import doctorService from '../services/DoctorService';
import specialtyService from '../services/SpecialtyService';

interface SearchProps {
  onBack: () => void;
  onSelectDoctor: (doctor: any) => void;
}

export const Search: React.FC<SearchProps> = ({ onBack, onSelectDoctor }) => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState<any[]>([]);

  // Lấy danh sách chuyên khoa để gợi ý khi chưa nhập gì
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await specialtyService.getAllSpecialties({ limit: 10 });
        setSpecialties(res.data?.data || []);
      } catch (err) {
        console.log("Lỗi tải chuyên khoa:", err);
      }
    };
    fetchSpecialties();
  }, []);

  const handleSearch = async (text: string) => {
    setKeyword(text);
    if (text.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Gọi API tìm kiếm bác sĩ
      const res = await doctorService.getAllDoctors({ search: text, limit: 10 });
      setResults(res.data?.data || []);
    } catch (err) {
      console.log("Lỗi tìm kiếm:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.searchWrapper}>
          <Feather name="search" size={20} color="#9CA3AF" />
          <TextInput
            autoFocus
            placeholder="Tìm bác sĩ hoặc chuyên khoa..."
            style={styles.input}
            value={keyword}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} color="#00B5F1" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.doctorItem} onPress={() => onSelectDoctor(item)}>
              <Image source={{ uri: item.avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.doctorName}>{item.fullName}</Text>
                <Text style={styles.specialtyName}>{item.specialty?.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            keyword.length < 2 ? (
              <View>
                <Text style={styles.sectionTitle}>Chuyên khoa gợi ý</Text>
                <View style={styles.specialtyGrid}>
                  {specialties.map((s) => (
                    <TouchableOpacity key={s._id} style={styles.tag}>
                      <Text style={styles.tagText}>{s.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <Text style={styles.emptyText}>Không tìm thấy bác sĩ nào</Text>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { marginRight: 12 },
  searchWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, height: 45 },
  input: { flex: 1, marginLeft: 8, fontSize: 16 },
  doctorItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  doctorName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  specialtyName: { fontSize: 14, color: '#6B7280' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1F2937' },
  specialtyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#E0F7FE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { color: '#00B5F1', fontSize: 14 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#9CA3AF' }
});