import React, { useState, useEffect, useCallback } from "react";
// 1. Thêm useNavigate
import { useNavigate } from "react-router-dom";
import postService from "../../services/PostService";
import { toastError } from "../../utils/toast";
import {
  Search,
  Filter,
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

// Hàm format ngày (Helper)
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
  const navigate = useNavigate(); // Hook chuyển trang

  // 1. STATE QUẢN LÝ DỮ LIỆU & BỘ LỌC
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // State phân trang
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    pages: 1,
  });

  // State bộ lọc
  const [filters, setFilters] = useState({
    q: "",
    tag: "",
    status: "published",
  });

  // State debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(filters.q);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.q);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.q]);

  // 2. HÀM FETCH DỮ LIỆU
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        q: debouncedSearch,
        tag: filters.tag,
        status: filters.status,
      };

      const res = await postService.getPosts(params);
      const { items, pagination: apiPagination } = res.data;

      setPosts(items || []);
      setPagination((prev) => ({
        ...prev,
        total: apiPagination?.total || 0,
        pages: apiPagination?.pages || 1,
      }));
    } catch (err) {
      console.error("Lỗi tải bài viết:", err);
      toastError("Không tải được danh sách bài viết.");
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    debouncedSearch,
    filters.tag,
    filters.status,
  ]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // 3. HANDLERS
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleResetFilter = () => {
    setFilters({ q: "", tag: "", status: "published" });
    setDebouncedSearch("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // === HÀM XỬ LÝ CLICK CARD ===
  const handleCardClick = (slug) => {
    navigate(`/post/${slug}`);
  };

  // 4. RENDER
  return (
    <section className="bg-gray-50 min-h-screen py-12 mt-15">
      <div className="container mx-auto px-4">
        {/* --- Header --- */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#081839] mb-4">
            Tin Tức & Cẩm Nang
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Cập nhật những thông tin y tế mới nhất, kiến thức sức khỏe bổ ích từ
            đội ngũ chuyên gia.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* === SIDEBAR BỘ LỌC === */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Filter size={20} className="color-title-hover" /> Bộ lọc
                </h3>
                <button
                  onClick={handleResetFilter}
                  className="text-xs color-title-hover flex items-center gap-1 font-medium bg-sky-50 px-2 py-1 rounded transition"
                  title="Xóa tất cả bộ lọc"
                >
                  <RotateCcw size={12} /> Xoá
                </button>
              </div>

              {/* Tìm kiếm */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tìm kiếm
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="q"
                    value={filters.q}
                    onChange={handleFilterChange}
                    placeholder="Nhập từ khóa..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-sm transition group-hover:bg-white"
                  />
                  <Search
                    className="absolute left-3 top-3 text-slate-400 group-hover:text-sky-500 transition"
                    size={18}
                  />
                </div>
              </div>

              {/* Lọc theo Tag */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Chủ đề (Tag)
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="tag"
                    value={filters.tag}
                    onChange={handleFilterChange}
                    placeholder="Ví dụ: vac-xin..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-sm transition group-hover:bg-white"
                  />
                  <Tag
                    className="absolute left-3 top-3 text-slate-400 group-hover:text-sky-500 transition"
                    size={18}
                  />
                </div>
              </div>

              {/* Số lượng hiển thị */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Hiển thị
                </label>
                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    setPagination((prev) => ({
                      ...prev,
                      limit: Number(e.target.value),
                      page: 1,
                    }));
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm cursor-pointer hover:bg-white transition"
                >
                  <option value="6">6 bài / trang</option>
                  <option value="9">9 bài / trang</option>
                  <option value="12">12 bài / trang</option>
                </select>
              </div>
            </div>
          </div>

          {/* === DANH SÁCH BÀI VIẾT === */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="bg-white rounded-3xl h-96 animate-pulse border border-slate-100 shadow-sm"
                  >
                    <div className="h-48 bg-slate-200 w-full rounded-t-3xl"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-full"></div>
                      <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <>
                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-10"
                  id="post-list-top"
                >
                  {posts.map((post) => {
                    const {
                      _id,
                      id,
                      slug,
                      name,
                      title,
                      thumbnail,
                      cover_image,
                      excerpt,
                      summary,
                      published_at,
                      publishedAt,
                      createdAt,
                      tags,
                    } = post;

                    const displayTitle = name || title;
                    const displayId = _id || id || slug;
                    const displayExcerpt = excerpt || summary;
                    const img =
                      thumbnail && !thumbnail.includes("undefined")
                        ? thumbnail
                        : cover_image ||
                          "https://placehold.co/600x360?text=No+Image";
                    const displayDate =
                      published_at || publishedAt || createdAt;
                    const tagName = tags && tags.length > 0 ? tags[0] : null;

                    return (
                      <article
                        key={displayId}
                        // THAY ĐỔI: Thêm onClick và cursor-pointer
                        onClick={() => handleCardClick(slug)}
                        className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100 flex flex-col hover:shadow-lg transition-all duration-300 group cursor-pointer"
                      >
                        {/* Ảnh: Đổi Link thành div để tránh lỗi lồng nhau, nhưng giữ style */}
                        <div className="relative block overflow-hidden aspect-[4/3]">
                          <img
                            src={img}
                            alt={displayTitle}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          {tagName && (
                            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-sky-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                              #{tagName}
                            </span>
                          )}
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                            <Calendar size={14} /> {formatDate(displayDate)}
                          </div>

                          {/* Tiêu đề: Bỏ Link, chỉ giữ text */}
                          <h3 className="text-lg font-bold text-slate-800 mb-3 line-clamp-2 color-title-2 transition-colors group-hover:text-sky-600">
                            {displayTitle}
                          </h3>

                          {displayExcerpt && (
                            <p className="text-sm text-slate-600 mb-4 line-clamp-3 flex-1">
                              {displayExcerpt}
                            </p>
                          )}

                          <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                            {/* Nút xem thêm: Đổi thành span giả lập link */}
                            <span className="text-sm font-semibold color-title-2 flex items-center gap-1 group-hover:gap-2 transition-all">
                              Đọc chi tiết <ChevronRight size={16} />
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* --- Pagination Controls --- */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <span className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm">
                      Trang {pagination.page} / {pagination.pages}
                    </span>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                <div className="text-center text-xs text-slate-400 mt-4">
                  Hiển thị {posts.length} / {pagination.total} kết quả
                </div>
              </>
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-300 py-20 px-4 text-center">
                <div className="bg-slate-50 p-6 rounded-full mb-6">
                  <Search size={48} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Không tìm thấy bài viết nào
                </h3>
                <p className="text-slate-500 max-w-md mb-8">
                  Rất tiếc, chúng tôi không tìm thấy bài viết phù hợp với từ
                  khóa "{filters.q}" hoặc bộ lọc hiện tại.
                </p>
                <button
                  onClick={handleResetFilter}
                  className="px-8 py-3 bg-[#00B5F1] text-white rounded-xl hover:bg-[#0095D5] transition font-medium shadow-lg shadow-sky-200"
                >
                  Xóa bộ lọc & Thử lại
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
