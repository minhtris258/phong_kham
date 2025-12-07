// src/components/post/HomePosts.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Calendar, ArrowRight } from "lucide-react";

// ==== SỬA ĐƯỜNG DẪN NÀY CHO ĐÚNG VỚI BACKEND CỦA BẠN ====
const POSTS_API_URL = "http://localhost:3000/api/posts";   // ← sửa nếu khác

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

export default function HomePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        console.log("Fetching posts từ:", POSTS_API_URL);
        const res = await axios.get(POSTS_API_URL);
        console.log("Response đầy đủ:", res);
        console.log("res.data:", res.data);

        let list = [];

        // BẮT HẾT MỌI TRƯỜNG HỢP PHỔ BIẾN NHẤT
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (res.data?.posts && Array.isArray(res.data.posts)) {
          list = res.data.posts;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          list = res.data.data;
        } else if (res.data?.items && Array.isArray(res.data.items)) {
          list = res.data.items;
        } else {
          console.warn("Cấu trúc dữ liệu không mong đợi:", res.data);
        }

        console.log("Danh sách bài viết sau khi xử lý:", list);
        setPosts(list.slice(0, 4)); // chỉ lấy 4 bài
      } catch (err) {
        console.error("Lỗi khi fetch bài viết:", err);
        setError("Không tải được bài viết");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  // Loading
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
            <div className="h-52 bg-slate-200"></div>
            <div className="p-5 space-y-3">
              <div className="h-6 bg-slate-200 rounded w-4/5"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Lỗi
  if (error) {
    return <div className="text-center py-16 text-red-600">{error}</div>;
  }

  // Không có bài
  if (posts.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
        <p className="text-slate-500 text-lg">
          Chưa có bài viết nào hoặc API chưa trả dữ liệu đúng.
          <br />
          <span className="text-sm">Mở Console (F12) để xem log chi tiết</span>
        </p>
      </div>
    );
  }

  // HIỂN THỊ BÀI VIẾT
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {posts.map((post) => {
          const id = post._id || post.id;
          const slug = post.slug || id;
          const title = post.name || "Không có tiêu đề";
          const img = post.thumbnail || post.cover_image || "https://via.placeholder.com/600x400/0ea5e9/fff?text=No+Image";
          const excerpt = post.excerpt || post.summary || "Xem chi tiết...";
          const cat = post.category?.name || post.category?.title || "Tin tức";
          const date = post.publishedAt || post.createdAt;

          return (
            <article
              key={id}
              className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <Link to={`/post/${slug}`}>
                <div className="relative overflow-hidden">
                  <img
                    src={img}
                    alt={title}
                    className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-full shadow-lg">
                    {cat}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">{excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>{formatDate(date)}</span>
                    </div>
                    <span className="text-sky-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Đọc thêm <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Link
          to="/post"
          className="inline-flex items-center gap-3 py-2 px-4 btn-color text-white font-bold text-lg rounded-2xl  hover:gap-5 transition-all shadow-lg"
        >
          Xem tất cả bài viết <ArrowRight size={22} />
        </Link>
      </div>
    </div>
  );
}