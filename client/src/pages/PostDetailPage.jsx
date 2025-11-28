import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Eye, User, ArrowLeft, Clock } from "lucide-react";
import postService from "../services/PostService";

// --- 1. Sub-component để Render từng Block nội dung ---
const BlockRenderer = ({ block }) => {
  switch (block.type) {
    case "heading":
      const HeadingTag = `h${Math.min(Math.max(block.level, 1), 6)}`;
      // Style heading tùy theo level
      const headingClass =
        block.level === 1 ? "text-3xl font-bold mt-8 mb-4 text-gray-900" :
        block.level === 2 ? "text-2xl font-bold mt-6 mb-3 text-gray-800" :
        "text-xl font-semibold mt-4 mb-2 text-gray-800";
      return <HeadingTag className={headingClass}>{block.text}</HeadingTag>;

    case "paragraph":
      return (
        <p className="text-gray-700 leading-relaxed mb-4 text-lg">
          {block.text}
        </p>
      );

    case "image":
      return (
        <figure className="my-8">
          <img
            src={block.url}
            alt={block.text || "Blog image"}
            className="w-full h-auto rounded-lg shadow-md object-cover max-h-[500px]"
          />
          {block.text && (
            <figcaption className="text-center text-gray-500 text-sm mt-2 italic">
              {block.text}
            </figcaption>
          )}
        </figure>
      );

    case "quote":
      return (
        <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-gray-600 my-6 bg-gray-50 py-2 pr-2 rounded-r">
          "{block.text}"
        </blockquote>
      );

    case "list":
      const ListTag = block.style === "ordered" ? "ol" : "ul";
      const listClass = block.style === "ordered" ? "list-decimal" : "list-disc";
      // Giả sử block.text chứa các item phân cách bởi xuống dòng hoặc logic editor của bạn
      // Nếu block.text là string thuần, ta tách dòng. Nếu editor lưu array items thì sửa lại logic này.
      const items = block.text.split("\n").filter(item => item.trim() !== "");
      
      return (
        <ListTag className={`${listClass} list-inside space-y-2 mb-4 ml-4 text-gray-700`}>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ListTag>
      );

    case "html":
      return (
        <div
          className="prose max-w-none mb-4"
          dangerouslySetInnerHTML={{ __html: block.text }}
        />
      );

    default:
      return null;
  }
};

// --- 2. Main Component ---
export default function PostDetailPage() {
  const { slug } = useParams(); // Lấy slug từ URL
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Lấy chi tiết bài viết
        // Lưu ý: PostService.getPostBySlug trả về { post: ... }
        const res = await postService.getPostBySlug(slug);
        const postData = res.data?.post || res.post; // Handle axios response structure

        if (!postData) {
            throw new Error("Bài viết không tồn tại");
        }
        setPost(postData);

        // 2. Lấy bài viết liên quan (nếu có ID)
        if (postData._id) {
          const relatedRes = await postService.relatedPosts(postData._id);
          setRelatedPosts(relatedRes.data?.items || relatedRes.items || []);
        }

      } catch (err) {
        console.error("Lỗi tải bài viết:", err);
        setError("Không thể tải bài viết. Vui lòng kiểm tra lại đường dẫn.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
        fetchData();
    }
  }, [slug]);

  // --- Render Loading ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // --- Render Error ---
  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Opps!</h2>
        <p className="text-gray-600 mb-8">{error || "Bài viết không tìm thấy."}</p>
        <Link to="/post" className="text-indigo-600 hover:underline flex items-center justify-center gap-2">
          <ArrowLeft size={20} /> Quay lại trang Blog
        </Link>
      </div>
    );
  }

  // --- Render Content ---
  return (
    <div className="bg-white min-h-screen pb-12">
      {/* Header Image / Thumbnail */}
      {post.thumbnail && (
        <div className="w-full h-[400px] relative">
          <img
            src={post.thumbnail}
            alt={post.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-opacity-40"></div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden p-6 md:p-10">
          
          {/* Breadcrumb / Back button */}
          <Link to="/post" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
            <ArrowLeft size={18} className="mr-2" /> Quay lại
          </Link>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags && post.tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full uppercase tracking-wide">
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            {post.name}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm border-b border-gray-100 pb-8 mb-8">
            <div className="flex items-center gap-2">
              <User size={18} />
              <span className="font-medium text-gray-700">
                {post.author?.fullName || "Tác giả ẩn danh"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>
                {new Date(post.published_at || post.createdAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={18} />
              <span>{post.views_count || 0} lượt xem</span>
            </div>
          </div>

          {/* Excerpt (Sapo) */}
          {post.excerpt && (
            <div className="text-xl font-medium text-gray-600 mb-10 italic border-l-4 border-gray-300 pl-4">
              {post.excerpt}
            </div>
          )}

          {/* Main Content (Blocks) */}
          <div className="article-content">
            {post.blocks && post.blocks.map((block, index) => (
              <BlockRenderer key={index} block={block} />
            ))}
          </div>

          {/* Share / Footer of Post */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-gray-500 text-sm text-center">
              Cảm ơn bạn đã đọc bài viết này. Hãy chia sẻ nếu thấy hữu ích!
            </p>
          </div>
        </div>
      </div>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <div className="container mx-auto px-4 mt-16 max-w-6xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 border-l-4 border-indigo-600 pl-3">
            Bài viết liên quan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedPosts.map((item) => (
              <Link to={`/post/${item.slug}`} key={item._id} className="group block h-full">
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col border border-gray-100 overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={item.thumbnail || "https://via.placeholder.com/300x200?text=No+Image"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-grow">
                      {item.excerpt}
                    </p>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-auto">
                      <Clock size={14} />
                      {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}