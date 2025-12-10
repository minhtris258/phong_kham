// src/components/post/HomePosts.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import postService from "../../services/PostService";

// --- HELPER FUNCTIONS (Giữ nguyên) ---
const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const processPostData = (post) => {
  let thumb = post.thumbnail || post.cover_image;
  if (!thumb || thumb.includes("via.placeholder.com") || !thumb.startsWith("http")) {
      thumb = "https://placehold.co/600x400?text=No+Image"; 
  }

  return {
    id: post._id || post.id,
    slug: post.slug || post._id,
    name: post.name || post.title || "Không có tiêu đề",
    thumbnail: thumb,
    excerpt: post.excerpt || post.summary || "Nội dung đang cập nhật...",
    category: post.category?.name || (post.tags && post.tags[0]) || "Tin tức",
    createdAt: post.publishedAt || post.createdAt || new Date(),
  };
};

// --- MAIN COMPONENT ---
export default function HomePosts() {
  const [posts, setPosts] = useState([]);
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
        else if (response.items) list = response.items;
        else if (Array.isArray(response.data)) list = response.data;
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

  // -- SKELETON LOADING (Đã cập nhật theo tỷ lệ 2:3) --
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
         <div className="w-48 h-8 bg-gray-200 rounded mb-6 animate-pulse"></div>
         {/* Grid 5 cột cho skeleton */}
         <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
               {[1,2,3,4].map(i => <div key={i} className="h-44 bg-gray-200 rounded-xl animate-pulse"></div>)}
            </div>
         </div>
      </div>
    );
  }

  if (posts.length === 0) return null;

  const heroPost = posts[0];
  const subPosts = posts.slice(1, 5);

  return (
    <section className="py-12 bg-gradient-to-b from-[#e8f6ffe5] to-[#8fd2fcae] ">
      <div className="container mx-auto px-4">
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-2xl md:text-3xl font-bold color-title uppercase tracking-tight pl-3">
            Tin Tức Y Tế
          </h2>
          <Link 
            to="/post" 
            className="hidden md:flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Xem tất cả <ArrowRight size={16} />
          </Link>
        </div>

        {/* --- THAY ĐỔI CHÍNH Ở ĐÂY: LAYOUT 5 CỘT (2:3) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* === BÀI LỚN (HERO) - Chiếm 2/5 === */}
          <div className="lg:col-span-2">
             {heroPost && <HeroCard post={heroPost} />}
          </div>

          {/* === 4 BÀI NHỎ - Chiếm 3/5 === */}
          <div className="lg:col-span-3">
            {/* Grid con vẫn giữ 2 cột để chia đều 4 bài nhỏ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
              {subPosts.map((post) => (
                <SubCard key={post._id || post.id} post={post} />
              ))}
              
              {subPosts.length < 4 && Array(4 - subPosts.length).fill(0).map((_, i) => (
                 <div key={i} className="bg-white rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm h-full min-h-[200px]">
                    Sắp có bài viết mới
                 </div>
              ))}
            </div>
          </div>
        </div>


        {/* Nút mobile */}
        <div className="mt-8 text-center md:hidden">
          <Link
            to="/post"
            className="inline-block px-6 py-2 bg-white border border-blue-600 text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition"
          >
            Xem tất cả tin tức
          </Link>
        </div>

      </div>
    </section>
  );
}

// === COMPONENT CON: BÀI VIẾT LỚN ===
const HeroCard = ({ post }) => {
  const { slug, name, thumbnail, excerpt, createdAt, category } = processPostData(post);

  return (
    <Link to={`/post/${slug}`} className="group h-full block">
      <article className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 h-full flex flex-col hover:shadow-lg transition-all duration-300">
        {/* Giữ tỉ lệ 4:3 hoặc đổi sang 16:9 nếu muốn ảnh thấp hơn */}
        <div className="relative overflow-hidden w-full aspect-[4/3]">
          <img
            src={thumbnail}
            alt={name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
            {category}
          </span>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
             <Calendar size={12} />
             <span>{formatDate(createdAt)}</span>
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-3 group-hover:text-blue-600 transition-colors leading-snug">
            {name}
          </h3>
          
          <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">
            {excerpt}
          </p>

          <span className="text-blue-600 font-semibold text-xs flex items-center gap-1 mt-auto">
            Đọc tiếp <ArrowRight size={12} />
          </span>
        </div>
      </article>
    </Link>
  );
};

// === COMPONENT CON: BÀI VIẾT NHỎ ===
const SubCard = ({ post }) => {
  const { slug, name, thumbnail, createdAt, category } = processPostData(post);

  return (
    <Link to={`/post/${slug}`} className="group block h-full">
      <article className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 h-full flex flex-col hover:shadow-md transition-all duration-300">
        <div className="relative overflow-hidden w-full aspect-[16/9]">
          <img
            src={thumbnail}
            alt={name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
                {category}
            </span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                <Clock size={10} /> {formatDate(createdAt)}
            </span>
          </div>

          <h3 className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors leading-relaxed" title={name}>
            {name}
          </h3>
        </div>
      </article>
    </Link>
  );
};