import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, 
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import postService from '../services/PostService';
import { IP_ADDRESS, PORT } from '../config'; 

const resolveImage = (img: string) => {
  if (!img || img.includes("via.placeholder.com")) 
    return "https://placehold.co/600x400?text=No+Image";
  if (img.startsWith("http")) return img;
  return `http://${IP_ADDRESS}:${PORT}/${img}`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

// 👇 1. Thêm prop onSeeAll
interface HomePostsProps {
  onPostSelect: (slug: string) => void;
  onSeeAll?: () => void; 
}

export const HomePosts: React.FC<HomePostsProps> = ({ onPostSelect, onSeeAll }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postService.getPosts({
          limit: 5,
          status: "published",
          sort: "-createdAt", 
        });
        
        let list = [];
        if (response.data?.items) list = response.data.items;
        else if (response.data) list = response.data;
        else if (Array.isArray(response)) list = response;

        setPosts(list);
      } catch (err) {
        console.error("Lỗi tải tin tức:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <ActivityIndicator size="small" color="#00B5F1" style={{ margin: 20 }} />;
  if (posts.length === 0) return null;

  const heroPost = posts[0];
  const subPosts = posts.slice(1, 5);

  const handlePress = (post: any) => {
    if (post.slug) onPostSelect(post.slug);
  };

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tin Tức Y Tế</Text>
        {/* 👇 2. Gọi prop onSeeAll khi bấm nút */}
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.viewAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {/* 1. HERO POST */}
      {heroPost && (
        <TouchableOpacity 
          style={styles.heroCard} 
          activeOpacity={0.9}
          onPress={() => handlePress(heroPost)}
        >
          <Image 
            source={{ uri: resolveImage(heroPost.thumbnail || heroPost.cover_image) }} 
            style={styles.heroImage} 
          />
          <View style={styles.heroContent}>
            <View style={styles.categoryTag}>
               <Text style={styles.categoryText}>
                 {heroPost.category?.name || "Nổi bật"}
               </Text>
            </View>
            <Text style={styles.heroTitle} numberOfLines={2}>
                {heroPost.name || heroPost.title}
            </Text>
            <View style={styles.metaRow}>
                <Feather name="clock" size={12} color="#9CA3AF" />
                <Text style={styles.dateText}>{formatDate(heroPost.createdAt)}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* 2. SUB POSTS */}
      <View style={styles.gridContainer}>
        {subPosts.map((post) => (
          <TouchableOpacity 
            key={post._id} 
            style={styles.subCard}
            onPress={() => handlePress(post)}
            activeOpacity={0.8}
          >
            <Image 
                source={{ uri: resolveImage(post.thumbnail || post.cover_image) }} 
                style={styles.subImage} 
            />
            <View style={styles.subContent}>
                <Text style={styles.subCategory}>
                    {post.category?.name || "Y tế"}
                </Text>
                <Text style={styles.subTitle} numberOfLines={3}>
                    {post.name || post.title}
                </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 20, marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  viewAll: { fontSize: 13, color: '#00B5F1', fontWeight: '600' },
  heroCard: { marginHorizontal: 16, backgroundColor: '#FFF', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 16, overflow: 'hidden' },
  heroImage: { width: '100%', height: 180, resizeMode: 'cover' },
  heroContent: { padding: 12 },
  categoryTag: { position: 'absolute', top: -170, left: 10, backgroundColor: '#DC2626', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  categoryText: { color: '#FFF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  heroTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 6, lineHeight: 22 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, color: '#6B7280' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
  subCard: { width: '48%', backgroundColor: '#FFF', borderRadius: 10, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  subImage: { width: '100%', height: 100, resizeMode: 'cover' },
  subContent: { padding: 10 },
  subCategory: { fontSize: 10, color: '#00B5F1', fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  subTitle: { fontSize: 13, fontWeight: '600', color: '#374151', lineHeight: 18 },
});