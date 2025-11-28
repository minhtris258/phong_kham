import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, Edit, Trash2, Search, Eye, FileText, 
  CheckCircle, XCircle, Loader2 
} from "lucide-react";
import postService from "../../services/PostService"; 
import { toastSuccess, toastError,toastWarning } from "../../utils/toast";
// Lưu ý: Thay đường dẫn import service cho đúng cấu trúc thư mục của bạn

const PostManagement = () => {
  // --- State ---
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ page: 1, limit: 10, q: "", status: "" });
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });

  const navigate = useNavigate();

  // --- Fetch Data ---
  const fetchPosts = async () => {
  setLoading(true);
  try {
    const res = await postService.getPosts(filter);

    // THÊM DÒNG NÀY ĐỂ DEBUG (rất quan trọng)
    console.log("Response từ API:", res);

    // SỬA Ở ĐÂY:
    const items = res.items || res.data?.items || res || []; // fallback an toàn
    const pagination = res.pagination || res.data?.pagination || { total: 0, pages: 1 };

    setPosts(items);
    setPagination(pagination);
  } catch (error) {
    console.error("Lỗi tải bài viết:", error);
    setPosts([]);
    setPagination({ total: 0, pages: 0 });
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchPosts();
  }, [filter]); // Gọi lại khi filter thay đổi

  // --- Actions ---
  const handleSearch = (e) => {
    e.preventDefault();
    // Khi submit form search, useEffect sẽ tự chạy do dependency filter
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa bài viết này? Hành động không thể hoàn tác.")) return;
    try {
      await postService.deletePost(id);
      setPosts(prev => prev.filter(p => p._id !== id)); // Xóa nóng trên UI
    } catch (error) {
      toastError("Xóa thất bại: " + error.message);
    }
  };

  const handleToggleStatus = async (post) => {
    const newStatus = post.status === "published" ? "draft" : "published";
    
    // Optimistic Update (Cập nhật giao diện ngay lập tức cho mượt)
    const oldPosts = [...posts];
    setPosts(posts.map(p => p._id === post._id ? { ...p, status: newStatus } : p));

    try {
      await postService.updatePost(post._id, { status: newStatus });
    } catch (error) {
      // Nếu lỗi thì revert lại giao diện cũ
      setPosts(oldPosts);
      toastError("Không thể cập nhật trạng thái.");
    }
  };

  // --- Render ---
  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="text-indigo-600" /> Quản Lý Bài Viết
            </h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý tin tức, blog và nội dung website</p>
          </div>
          <Link
            to="/admin/posts/new" // Đường dẫn tới trang PostEditor
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-md font-medium"
          >
            <Plus size={18} /> Viết Bài Mới
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 transition bg-gray-50 focus-within:bg-white">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề..."
              className="flex-1 outline-none text-sm bg-transparent"
              value={filter.q}
              onChange={(e) => setFilter({ ...filter, q: e.target.value })}
            />
          </form>
          
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value, page: 1 })}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-500"/>
              Đang tải dữ liệu...
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              Không tìm thấy bài viết nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4 w-24">Ảnh</th>
                    <th className="px-6 py-4">Thông tin bài viết</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Lượt xem</th>
                    <th className="px-6 py-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {posts.map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50 transition">
                      {/* Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="w-16 h-12 bg-gray-100 rounded-md border border-gray-200 overflow-hidden">
                          {post.thumbnail ? (
                            <img src={post.thumbnail} alt="thumb" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <FileText size={20} />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Info */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 line-clamp-1 text-base mb-1" title={post.name}>
                          {post.name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono bg-gray-100 inline-block px-1.5 py-0.5 rounded">
                          /{post.slug}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Ngày đăng: {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>

                      {/* Status (Toggle) */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(post)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all
                            ${post.status === "published" 
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                              : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                            }`}
                        >
                          {post.status === "published" ? (
                            <><CheckCircle size={12}/> Published</>
                          ) : (
                            <><XCircle size={12}/> Draft</>
                          )}
                        </button>
                      </td>

                      {/* Views */}
                      <td className="px-6 py-4 text-center text-sm text-gray-600 font-medium">
                        <div className="flex items-center justify-center gap-1">
                          <Eye size={14} className="text-gray-400"/>
                          {post.views_count || 0} {/* Model bạn là views_count */}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/posts/edit/${post._id}`, { state: { post } })}
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Chỉnh sửa"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Pagination */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
             <span className="text-sm text-gray-500">
                Hiển thị {posts.length} / {pagination.total} bài viết
             </span>
             <div className="flex gap-2">
                <button 
                  disabled={filter.page === 1}
                  onClick={() => setFilter(p => ({...p, page: p.page - 1}))}
                  className="px-3 py-1.5 border border-gray-300 bg-white rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Trước
                </button>
                <span className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                   {filter.page}
                </span>
                <button 
                  disabled={filter.page >= pagination.pages}
                  onClick={() => setFilter(p => ({...p, page: p.page + 1}))}
                  className="px-3 py-1.5 border border-gray-300 bg-white rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Sau
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostManagement;