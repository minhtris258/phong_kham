import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, 
  ActivityIndicator, Dimensions, Platform, useWindowDimensions
} from 'react-native';
import { Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import postService from '../services/PostService';
import { IP_ADDRESS, PORT } from '../config'; 

// 👇 FIX LỖI: Cập nhật hàm xử lý ảnh an toàn hơn
const resolveImage = (img: string) => {
  if (!img) return "https://placehold.co/600x400?text=No+Image";
  
  // 1. Nếu là ảnh Base64 hoặc đã là link online đầy đủ
  if (img.startsWith("data:") || img.startsWith("http")) return img;
  
  // 2. Nếu là placeholder cũ (thường bị lỗi)
  if (img.includes("via.placeholder.com")) return "https://placehold.co/600x400?text=No+Image";

  // 3. Xử lý đường dẫn tương đối từ Server
  // Xóa dấu / ở đầu nếu có để tránh lỗi double slash //
  const cleanPath = img.startsWith('/') ? img.substring(1) : img;
  
  // Ghép chuỗi
  const fullUrl = `http://${IP_ADDRESS}:${PORT}/${cleanPath}`;

  // ⚠️ QUAN TRỌNG: encodeURI để mã hóa khoảng trắng và ký tự đặc biệt
  return encodeURI(fullUrl);
};

// --- 1. BLOCK RENDERER ---
const BlockRenderer = ({ block }: { block: any }) => {
  const { width } = useWindowDimensions();

  switch (block.type) {
    case "heading":
      const fontSize = block.level === 1 ? 24 : block.level === 2 ? 20 : 18;
      const marginTop = block.level === 1 ? 20 : 15;
      return (
        <Text style={[styles.blockHeading, { fontSize, marginTop }]}>
          {block.text}
        </Text>
      );

    case "paragraph":
      return (
        <Text style={styles.blockParagraph}>
          {block.text}
        </Text>
      );

    case "image":
      // Kiểm tra url trước khi render
      const imageUrl = resolveImage(block.url);
      return (
        <View style={styles.blockImageContainer}>
          <Image 
            source={{ uri: imageUrl }} 
            style={{ width: '100%', height: 200, borderRadius: 10 }}
            resizeMode="cover"
          />
          {block.text && <Text style={styles.blockCaption}>{block.text}</Text>}
        </View>
      );

    case "quote":
      return (
        <View style={styles.blockQuote}>
          <View style={styles.quoteLine} />
          <Text style={styles.quoteText}>"{block.text}"</Text>
        </View>
      );

    case "list":
      const items = block.text ? block.text.split("\n").filter((item: string) => item.trim() !== "") : [];
      return (
        <View style={styles.blockList}>
          {items.map((item: string, index: number) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );

    default:
      return null;
  }
};

// --- 2. MAIN SCREEN ---
interface PostDetailProps {
  postSlug: string; 
  onBack: () => void;
  onRelatedPostClick: (slug: string) => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({ postSlug, onBack, onRelatedPostClick }) => {
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postSlug) return; // Tránh gọi khi slug rỗng
      
      setLoading(true);
      try {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });

        const res = await postService.getPostBySlug(postSlug);
        const postData = res.data?.post || res.post;
        setPost(postData);

        if (postData?._id) {
            try {
                const relRes = await postService.getPosts({ limit: 4 }); 
                const list = (relRes.data?.items || relRes.data || []).filter((p:any) => p._id !== postData._id);
                setRelatedPosts(list);
            } catch (e) {}
        }

      } catch (error) {
        console.error("Lỗi tải bài viết:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postSlug]);

  if (loading) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#0095D5" />
      </View>
    );
  }

  if (!post) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0095D5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Chi tiết bài viết</Text>
        <View style={{width: 40}} /> 
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <Image 
            source={{ uri: resolveImage(post.thumbnail || post.cover_image) }} 
            style={styles.heroImage}
        />

        <View style={styles.bodyContent}>
            <View style={styles.metaRow}>
                <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>
                        {post.category?.name || (post.tags && post.tags[0]) || "Y Tế"}
                    </Text>
                </View>
                <Text style={styles.dateText}>
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString("vi-VN")}
                </Text>
            </View>

            <Text style={styles.postTitle}>{post.name || post.title}</Text>

            <View style={styles.authorRow}>
                <View style={styles.authorAvatar}>
                    <FontAwesome5 name="user" size={14} color="#0095D5" />
                </View>
                <Text style={styles.authorName}>
                    Tác giả: {post.author?.name || "MedPro Team"}
                </Text>
                <View style={{flex:1}} />
                <View style={styles.viewCount}>
                    <Ionicons name="eye-outline" size={16} color="#6B7280" />
                    <Text style={styles.viewText}>{post.views_count || 0}</Text>
                </View>
            </View>

            {post.excerpt && (
                <Text style={styles.excerptText}>{post.excerpt}</Text>
            )}

            <View style={styles.mainContent}>
                {post.blocks && post.blocks.map((block: any, index: number) => (
                    <BlockRenderer key={index} block={block} />
                ))}
            </View>

            {relatedPosts.length > 0 && (
                <View style={styles.relatedSection}>
                    <Text style={styles.relatedTitle}>Bài viết liên quan</Text>
                    {relatedPosts.map(item => (
                        <TouchableOpacity 
                            key={item._id} 
                            style={styles.relatedCard}
                            onPress={() => onRelatedPostClick(item.slug)}
                        >
                            <Image 
                                source={{ uri: resolveImage(item.thumbnail) }} 
                                style={styles.relatedImage} 
                            />
                            <View style={styles.relatedContent}>
                                <Text style={styles.relatedCardTitle} numberOfLines={2}>{item.name}</Text>
                                <Text style={styles.relatedDate}>
                                    {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 10, paddingHorizontal: 16,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    zIndex: 10
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#111' },

  scrollContent: { paddingBottom: 50 },
  
  heroImage: { width: '100%', height: 220, resizeMode: 'cover' },
  bodyContent: { padding: 20, marginTop: -20, backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20 },

  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  categoryTag: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  categoryText: { color: '#0095D5', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  dateText: { color: '#9CA3AF', fontSize: 12 },

  postTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 16, lineHeight: 32 },

  authorRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6', marginBottom: 20 },
  authorAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  authorName: { fontSize: 13, color: '#4B5563', fontWeight: '600' },
  viewCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewText: { fontSize: 12, color: '#6B7280' },

  excerptText: { fontSize: 16, fontStyle: 'italic', color: '#4B5563', lineHeight: 26, marginBottom: 20 },

  mainContent: { marginBottom: 30 },
  blockHeading: { fontWeight: 'bold', color: '#111', marginBottom: 10 },
  blockParagraph: { fontSize: 16, color: '#374151', lineHeight: 26, marginBottom: 16, textAlign: 'justify' },
  blockImageContainer: { marginVertical: 16 },
  blockCaption: { textAlign: 'center', fontSize: 12, color: '#6B7280', marginTop: 6, fontStyle: 'italic' },
  blockQuote: { 
    borderLeftWidth: 4, borderLeftColor: '#2563EB', 
    backgroundColor: '#F9FAFB', padding: 16, marginVertical: 16, borderRadius: 4 
  },
  quoteText: { fontSize: 16, fontStyle: 'italic', color: '#4B5563' },
  blockList: { marginVertical: 10 },
  listItem: { flexDirection: 'row', marginBottom: 8 },
  bulletPoint: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#374151', marginTop: 10, marginRight: 10 },
  listText: { fontSize: 16, color: '#374151', lineHeight: 24, flex: 1 },

  relatedSection: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 20 },
  relatedTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 15 },
  relatedCard: { flexDirection: 'row', marginBottom: 16, backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6' },
  relatedImage: { width: 100, height: 80, resizeMode: 'cover' },
  relatedContent: { flex: 1, padding: 10, justifyContent: 'center' },
  relatedCardTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  relatedDate: { fontSize: 11, color: '#9CA3AF' }
});