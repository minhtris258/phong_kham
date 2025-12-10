import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, Eye, User, ArrowLeft, Clock, Share2, Tag } from "lucide-react";
import postService from "../services/PostService";

// --- 1. BlockRenderer (Giữ nguyên style đẹp) ---
const BlockRenderer = ({ block }) => {
  switch (block.type) {
    case "heading":
      const HeadingTag = `h${Math.min(Math.max(block.level, 1), 6)}`;
      const headingClass =
        block.level === 1 ? "text-3xl md:text-4xl font-bold text-slate-900 mt-10 mb-6" :
        block.level === 2 ? "text-2xl md:text-3xl font-bold text-slate-800 mt-10 mb-5 pb-2 border-b border-slate-100" :
        "text-xl md:text-2xl font-semibold text-slate-800 mt-8 mb-4";
      return <HeadingTag className={headingClass}>{block.text}</HeadingTag>;

    case "paragraph":
      return (
        <p className="text-slate-700 text-lg leading-8 mb-6 font-normal text-justify">
          {block.text}
        </p>
      );

    case "image":
      return (
        <figure className="my-10">
          <img
            src={block.url}
            alt={block.text || "Blog image"}
            className="w-full h-auto rounded-2xl shadow-sm border border-slate-100"
          />
          {block.text && (
            <figcaption className="text-center text-slate-500 text-sm mt-3 italic">
              {block.text}
            </figcaption>
          )}
        </figure>
      );

    case "quote":
      return (
        <blockquote className="border-l-4 border-indigo-500 pl-6 italic text-slate-600 text-xl my-10 py-4 bg-indigo-50/50 rounded-r-lg">
          "{block.text}"
        </blockquote>
      );

    case "list":
      const ListTag = block.style === "ordered" ? "ol" : "ul";
      const listClass = block.style === "ordered" ? "list-decimal" : "list-disc";
      const items = block.text.split("\n").filter(item => item.trim() !== "");
      
      return (
        <ListTag className={`${listClass} list-outside space-y-3 mb-8 ml-6 text-slate-700 text-lg leading-8`}>
          {items.map((item, index) => (
            <li key={index} className="pl-2">{item}</li>
          ))}
        </ListTag>
      );

    case "html":
      return (
        <div
          className="prose prose-lg max-w-none mb-8 text-slate-700"
          dangerouslySetInnerHTML={{ __html: block.text }}
        />
      );

    default:
      return null;
  }
};

// --- 2. Main Component ---
export default function PostDetailPage() {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchedSlug = useRef("");

  useEffect(() => {
    if (fetchedSlug.current === slug) return;
    fetchedSlug.current = slug;
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await postService.getPostBySlug(slug);
        const postData = res.data?.post || res.post; 

        if (!postData) throw new Error("Bài viết không tồn tại");
        setPost(postData);

        if (postData._id) {
          const relatedRes = await postService.relatedPosts(postData._id);
          setRelatedPosts(relatedRes.data?.items || relatedRes.items || []);
        }

      } catch (err) {
        console.error("Lỗi tải bài viết:", err);
        setError("Không thể tải bài viết. Vui lòng kiểm tra lại đường dẫn.");
        fetchedSlug.current = ""; 
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 pt-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 pt-20">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Opps!</h2>
        <p className="text-slate-500 mb-6">{error || "Bài viết không tìm thấy."}</p>
        <Link to="/post" className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition flex items-center gap-2">
          <ArrowLeft size={18} /> Quay lại trang Blog
        </Link>
      </div>
    );
  }

  return (
    // Thêm pt-24 để tránh header fixed che mất nội dung (Padding Top = header height + gap)
    <div className="bg-slate-50 min-h-screen pb-10 pt-24 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* === MAIN ARTICLE CARD === */}
        <article className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          
          {/* 1. HERO IMAGE (FULL WIDTH) & BACK BUTTON */}
          <div className="relative w-full aspect-video md:aspect-[21/9] bg-slate-100 group">
            
            {/* ẢNH BÌA */}
            {post.thumbnail ? (
                <img
                    src={post.thumbnail}
                    alt={post.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
                    <span className="font-bold text-4xl">MedPro Blog</span>
                </div>
            )}

            {/* LỚP PHỦ GRADIENT (Để nút quay lại dễ nhìn hơn) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent"></div>

            {/* NÚT QUAY LẠI (NẰM TRÊN ẢNH - GÓC TRÁI) */}
            <button 
                onClick={() => navigate(-1)} // <--- Quay lại trang trước đó
                className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-slate-700 text-sm font-semibold hover:bg-white hover:text-indigo-600 transition-all duration-300 border border-white/50 cursor-pointer"
            >
                <ArrowLeft size={18} /> 
                <span className="hidden sm:inline">Quay lại</span>
            </button>

          </div>

          {/* 2. NỘI DUNG CHÍNH */}
          <div className="px-6 py-8 md:px-12 md:py-12">
            
            {/* Tags & Date Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-2">
                    {post.tags && post.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wide border border-indigo-100">
                        <Tag size={12} className="mr-1.5" /> {tag}
                        </span>
                    ))}
                </div>
                <div className="flex items-center text-slate-400 text-sm font-medium">
                    <Calendar size={16} className="mr-1.5" />
                    {new Date(post.published_at || post.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric", month: "long", day: "numeric",
                    })}
                </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-8">
              {post.name}
            </h1>

            {/* Author & Stats Bar */}
            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm border-t border-b border-slate-100 py-4 mb-10">
              <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                   <User size={20} />
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wide">Tác giả</p>
                    <p className="font-semibold text-slate-700">{post.author?.name || "MedPro Team"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-auto">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Eye size={16} className="text-slate-400" />
                    <span className="font-bold text-slate-700">{post.views_count || 0}</span>
                </div>
              </div>
            </div>

            {/* Excerpt (Sapo) */}
            {post.excerpt && (
              <div className="text-xl md:text-2xl font-medium text-slate-800 mb-12 leading-relaxed font-serif">
                {post.excerpt}
              </div>
            )}

            {/* Main Blocks Content */}
            <div className="article-content max-w-none">
              {post.blocks && post.blocks.map((block, index) => (
                <BlockRenderer key={index} block={block} />
              ))}
            </div>

            {/* Footer Share */}
            <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-slate-500 text-sm font-medium">
                Chia sẻ bài viết này nếu bạn thấy hữu ích ❤️
              </p>
              <div className="flex gap-3">
                 <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition">
                    Facebook
                 </button>
                 <button className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 rounded-lg text-sm font-semibold hover:bg-sky-100 transition">
                    Twitter
                 </button>
                 <button className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-200 transition" title="Copy Link">
                    <Share2 size={18} />
                 </button>
              </div>
            </div>

          </div>
        </article>

        {/* === RELATED POSTS (Đã làm Responsive Mobile) === */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 mb-10">
            <div className="flex items-center justify-between mb-8 px-2">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-1 h-8 bg-indigo-600 rounded-full"></span>
                    Bài viết liên quan
                </h3>
                <Link to="/post" className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center group">
                    Xem tất cả <ArrowLeft size={16} className="rotate-180 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            
            {/* Grid Responsive: Mobile 1 cột, Tablet 2 cột, PC 3 cột */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((item) => (
                <Link to={`/post/${item.slug}`} key={item._id} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={item.thumbnail || "https://via.placeholder.com/300x200?text=No+Image"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="text-xs text-slate-400 mb-2 flex items-center gap-1 font-medium">
                        <Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-grow leading-relaxed">
                      {item.excerpt || "Không có mô tả ngắn..."}
                    </p>
                    <span className="text-indigo-600 text-sm font-semibold mt-auto flex items-center">
                        Đọc tiếp <ArrowLeft size={14} className="rotate-180 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}