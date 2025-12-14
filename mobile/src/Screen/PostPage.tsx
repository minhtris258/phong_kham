import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { debounce } from 'lodash';

// Services
import postService from '../services/PostService';
import medicalServiceService from '../services/MedicalServiceService';

// Config
import { IP_ADDRESS, PORT } from '../config';

const resolveImage = (img: string) => {
  if (!img || img.includes('via.placeholder.com'))
    return 'https://placehold.co/600x400?text=No+Image';
  if (img.startsWith('http')) return img;
  return `http://${IP_ADDRESS}:${PORT}/${img}`;
};

const formatPrice = (price: number) => {
  return price ? price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ';
};

// 👇 1. Thêm lại onServiceSelect vào Interface
interface PostPageProps {
  onPostSelect: (slug: string) => void;
  onServiceSelect: (service: any) => void;
}

// 👇 2. Nhận prop onServiceSelect ở đây
export const PostPage: React.FC<PostPageProps> = ({ onPostSelect, onServiceSelect }) => {
  const [activeTab, setActiveTab] = useState<'POSTS' | 'SERVICES'>('POSTS');
  const [searchText, setSearchText] = useState('');

  // State Posts
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postPage, setPostPage] = useState(1);
  const [postHasMore, setPostHasMore] = useState(true);

  // State Services
  const [services, setServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [priceFilter, setPriceFilter] = useState('ALL');
  const [sortOption, setSortOption] = useState('default');

  // --- API ---
  const fetchPosts = useCallback(async (page = 1, query = '') => {
    try {
      if (page === 1) setPostsLoading(true);
      const res = await postService.getPosts({
        page,
        limit: 10,
        q: query,
        status: 'published',
      });
      const newItems = res.data?.items || res.data || [];

      if (page === 1) setPosts(newItems);
      else setPosts((prev) => [...prev, ...newItems]);

      setPostHasMore(newItems.length >= 10);
    } catch (err) {
      console.error('Lỗi tải bài viết', err);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  const debouncedPostSearch = useCallback(
    debounce((text) => {
      setPostPage(1);
      fetchPosts(1, text);
    }, 500),
    []
  );

  const fetchServices = useCallback(async () => {
    try {
      setServicesLoading(true);
      const res = await medicalServiceService.getAllServices({ limit: 1000 });
      const list = res.data?.data || res.data || [];
      setServices(list);
    } catch (err) {
      console.error('Lỗi tải dịch vụ', err);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  // Filter Services
  const filteredServices = useMemo(() => {
    let result = [...services];
    if (searchText)
      result = result.filter((s) => s.name.toLowerCase().includes(searchText.toLowerCase()));
    if (priceFilter !== 'ALL') {
      result = result.filter((s) => {
        const fee = Number(s.price || s.fee || 0);
        if (priceFilter === '<200') return fee < 200000;
        if (priceFilter === '200-500') return fee >= 200000 && fee <= 500000;
        if (priceFilter === '>500') return fee > 500000;
        return true;
      });
    }
    return result;
  }, [services, searchText, priceFilter, sortOption]);

  useEffect(() => {
    if (activeTab === 'POSTS') fetchPosts(1, '');
    else fetchServices();
  }, [activeTab]);

  // --- RENDER ITEMS ---
  const renderPostItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => onPostSelect(item.slug)}
      activeOpacity={0.8}>
      <Image source={{ uri: resolveImage(item.thumbnail) }} style={styles.postImage} />
      <View style={styles.postContent}>
        <Text style={styles.postCategory}>{item.category?.name || 'Tin tức'}</Text>
        <Text style={styles.postTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.postMeta}>
          <Feather name="clock" size={12} color="#9CA3AF" />
          <Text style={styles.postDate}>
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderServiceItem = ({ item }: { item: any }) => (
    <View style={styles.serviceCard}>
      <Image
        source={{ uri: resolveImage(item.image || item.thumbnail) }}
        style={styles.serviceImage}
      />
      <View style={styles.serviceContent}>
        <View style={styles.serviceTag}>
          <Text style={styles.serviceTagText}>Dịch vụ</Text>
        </View>
        <Text style={styles.serviceTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.servicePrice}>{formatPrice(item.price || item.fee)}</Text>

        {/* 👇 3. Sửa lại nút bấm gọi onServiceSelect */}
        <TouchableOpacity style={styles.serviceBtn} onPress={() => onServiceSelect(item)}>
          <Text style={styles.serviceBtnText}>Chi tiết</Text>
          <Ionicons name="arrow-forward" size={14} color="#2563EB" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const isPosts = activeTab === 'POSTS';
  const listData = isPosts ? posts : filteredServices;
  const isLoading = isPosts ? postsLoading : servicesLoading;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Khám phá</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder={isPosts ? 'Tìm kiếm bài viết...' : 'Tìm dịch vụ y tế...'}
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              if (isPosts) debouncedPostSearch(text);
            }}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                if (isPosts) debouncedPostSearch('');
              }}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, isPosts && styles.tabBtnActive]}
          onPress={() => setActiveTab('POSTS')}>
          <Text style={[styles.tabText, isPosts && styles.tabTextActive]}>Tin tức</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, !isPosts && styles.tabBtnActive]}
          onPress={() => setActiveTab('SERVICES')}>
          <Text style={[styles.tabText, !isPosts && styles.tabTextActive]}>Dịch vụ</Text>
        </TouchableOpacity>
      </View>

      {/* Filters (Service Only) */}
      {!isPosts && (
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              { id: 'ALL', label: 'Tất cả' },
              { id: '<200', label: '< 200k' },
              { id: '200-500', label: '200k-500k' },
              { id: '>500', label: '> 500k' },
            ]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.filterChip, priceFilter === item.id && styles.filterChipActive]}
                onPress={() => setPriceFilter(item.id)}>
                <Text
                  style={[styles.filterText, priceFilter === item.id && styles.filterTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}
          />
        </View>
      )}

      {/* CONTENT LIST */}
      <View style={styles.listArea}>
        <FlatList
          // Key để fix lỗi "numColumns on the fly"
          key={activeTab}
          data={listData}
          renderItem={isPosts ? renderPostItem : renderServiceItem}
          keyExtractor={(item) => item._id || item.id}
          numColumns={isPosts ? 1 : 2}
          columnWrapperStyle={!isPosts ? { justifyContent: 'space-between' } : undefined}
          contentContainerStyle={styles.listContent}
          onEndReached={() => {
            if (isPosts && postHasMore && !postsLoading) {
              setPostPage((prev) => prev + 1);
              fetchPosts(postPage + 1, searchText);
            }
          }}
          ListFooterComponent={
            isLoading ? <ActivityIndicator color="#00B5F1" style={{ margin: 20 }} /> : null
          }
          ListEmptyComponent={
            !isLoading && <Text style={styles.emptyText}>Không tìm thấy dữ liệu.</Text>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  headerContainer: {
    backgroundColor: '#00B5F1',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#374151' },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    
  },
  tabBtn: {
    marginRight: 24,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: '#00B5F1' },
  tabText: { fontSize: 16, color: '#6B7280', fontWeight: '600' },
  tabTextActive: { color: '#00B5F1' },
  filterContainer: { backgroundColor: '#FFF', paddingBottom: 0, paddingTop: 10 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: { backgroundColor: '#EFF6FF', borderColor: '#00B5F1' },
  filterText: { fontSize: 13, color: '#4B5563', fontWeight: '500' },
  filterTextActive: { color: '#00B5F1', fontWeight: '700' },
  listArea: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 100 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#9CA3AF', fontSize: 16 },
  postCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  postImage: { width: 110, height: '100%', resizeMode: 'cover' },
  postContent: { flex: 1, padding: 12 },
  postCategory: {
    fontSize: 11,
    color: '#00B5F1',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  postTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 8, lineHeight: 22 },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  postDate: { fontSize: 12, color: '#9CA3AF' },
  serviceCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  serviceImage: { width: '100%', height: 120, resizeMode: 'cover' },
  serviceContent: { padding: 12 },
  serviceTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  serviceTagText: { fontSize: 10, color: '#2563EB', fontWeight: '700', textTransform: 'uppercase' },
  serviceTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 6, height: 40 },
  servicePrice: { fontSize: 15, fontWeight: '700', color: '#DC2626', marginBottom: 8 },
  serviceBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  serviceBtnText: { fontSize: 13, color: '#2563EB', fontWeight: '600' },
});
