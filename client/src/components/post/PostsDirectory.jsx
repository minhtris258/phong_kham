// src/components/PostsDirectory.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toastSuccess,toastError, toastWarning, toastInfo } from "../../utils/toast";
import axios from "axios";

// ==== URL API (chỉnh lại cho đúng backend của bạn) ====
const POSTS_API_URL = "http://localhost:3000/api/posts";

// Hàm format ngày
const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function PostsDirectory() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(POSTS_API_URL);

        let postList = [];
        if (Array.isArray(res.data)) {
          postList = res.data;
        } else if (Array.isArray(res.data?.data)) {
          postList = res.data.data;
        } else if (Array.isArray(res.data?.posts)) {
          postList = res.data.posts;
        } else if (Array.isArray(res.data?.items)) {
          postList = res.data.items;
        }

        setPosts(postList);
      } catch (err) {
        toastError("Không tải được danh sách bài viết. Vui lòng thử lại sau.");
        setError("Không tải được danh sách bài viết. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const safePosts = Array.isArray(posts) ? posts : [];

  if (loading) {
    return (
      <section className="container py-10">
        <p className="text-center text-slate-600">
          Đang tải danh sách bài viết...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container py-10">
        <p className="text-center text-red-500">{error}</p>
      </section>
    );
  }

  return (
    <section className="container py-20 lg:py-25 mt-10">
      {/* Title */}
      <h2 className="text-2xl lg:text-3xl font-bold text-center text-sky-900 mb-6">
        Tin tức & cẩm nang
      </h2>

      {safePosts.length === 0 ? (
        <p className="text-center text-slate-600">
          Hiện chưa có bài viết nào.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {safePosts.map((post) => {
            const {
              id,
              slug,
              title = post.name,
              thumbnail,
              cover_image,
              excerpt,
              summary,
              category,
              publishedAt,
              createdAt,
            } = post;

            const img =
              thumbnail ||
              cover_image ||
              "https://via.placeholder.com/600x360.png?text=Post";

            const catName = category?.name || category?.title || "";

            return (
              <article
                key={id || slug || title}
                className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100 flex flex-col w-[90%] mx-auto md:mx-0 "
              >
                {/* Ảnh */}
                <div className="relative">
                  <img
                    src={img}
                    alt={title}
                    className="w-full  h-44 lg:h-48 object-cover transition-transform duration-300 hover:scale-110"
                  />
                  {catName && (
                    <span className="absolute left-3 top-3 inline-flex items-center px-3 py-1 rounded-full bg-sky-600/90 text-white text-xs font-semibold">
                      {catName}
                    </span>
                  )}
                </div>

                {/* Nội dung */}
                <div className="p-4 lg:p-5 flex flex-col flex-1">
                  <h3 className="text-base lg:text-lg font-semibold text-[#081839] mb-2 line-clamp-2">
                    <Link
                      to={`/post/${slug}`}
                      className="hover:text-sky-600 transition-colors"
                    >
                      {title}
                    </Link>
                  </h3>

                  {(excerpt || summary) && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-3">
                      {excerpt || summary}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {formatDate(publishedAt || createdAt)}{/* ngày đăng */}
                    </span>
                    <Link
                      to={`/post/${slug}`}
                      className="text-sky-600 font-semibold text-sm hover:text-sky-500"
                    >
                      Đọc tiếp →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
