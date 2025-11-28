// src/pages/admin/posts/PostEditor.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Loader2,
  Upload,
  X
} from "lucide-react";
import postService from "../../services/PostService";
import { toastSuccess, toastError,toastWarning } from "../../utils/toast";

// Chuyển file thành base64
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Component Block riêng – dễ bảo trì
const BlockItem = ({ block, index, onUpdate, onRemove }) => {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      onUpdate(index, "url", base64);
    } catch (err) {
      toastError("Upload ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-5 border rounded-lg bg-gray-50 relative group hover:shadow-md transition">
      <button
        onClick={() => onRemove(index)}
        className="absolute top-3 right-3 text-red-500 hover:bg-red-50 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition"
      >
        <Trash2 size={18} />
      </button>

      <div className="text-xs font-bold text-indigo-600 uppercase mb-3">{block.type}</div>

      {block.type === "heading" && (
        <div className="space-y-2">
          <select
            value={block.level || 2}
            onChange={(e) => onUpdate(index, "level", Number(e.target.value))}
            className="text-sm border rounded px-2 py-1"
          >
            <option value={1}>Heading 1</option>
            <option value={2}>Heading 2</option>
            <option value={3}>Heading 3</option>
          </select>
          <input
            type="text"
            placeholder="Nhập tiêu đề..."
            value={block.text || ""}
            onChange={(e) => onUpdate(index, "text", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg border font-bold text-lg"
          />
        </div>
      )}

      {(block.type === "paragraph" || block.type === "quote" || block.type === "list") && (
        <textarea
          rows={4}
          placeholder={block.type === "quote" ? "Trích dẫn..." : "Nhập nội dung..."}
          value={block.text || ""}
          onChange={(e) => onUpdate(index, "text", e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${block.type === "quote" ? "italic text-gray-600" : ""}`}
        />
      )}

      {block.type === "image" && (
        <div className="space-y-3">
          {block.url ? (
            <div className="relative">
              <img src={block.url} alt="preview" className="w-full h-64 object-cover rounded-lg" />
              <button
                onClick={() => onUpdate(index, "url", "")}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition bg-gray-50">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              ) : (
                <>
                  <Upload size={32} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click để upload ảnh</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>
      )}
    </div>
  );
};

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    excerpt: "",
    thumbnail: "",
    status: "draft",
    tags: "",
    blocks: [],
  });
  const [saving, setSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  // Load dữ liệu khi edit
  useEffect(() => {
    if (isEditMode && location.state?.post) {
      const post = location.state.post;
      setFormData({
        name: post.name || "",
        excerpt: post.excerpt || "",
        thumbnail: post.thumbnail || "",
        status: post.status || "draft",
        tags: post.tags?.join(", ") || "",
        blocks: post.blocks || [],
      });
    }
  }, [isEditMode, location.state]);

  const addBlock = (type) => {
    const newBlock = {
      type,
      text: "",
      url: "",
      level: type === "heading" ? 2 : undefined,
    };
    setFormData((prev) => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
  };

  const updateBlock = (index, field, value) => {
    setFormData((prev) => {
      const blocks = [...prev.blocks];
      blocks[index] = { ...blocks[index], [field]: value };
      return { ...prev, blocks };
    });
  };

  const removeBlock = (index) => {
    setFormData((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index),
    }));
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingThumb(true);
    try {
      const base64 = await fileToBase64(file);
      setFormData((prev) => ({ ...prev, thumbnail: base64 }));
    } catch {
      toastError("Upload thất bại");
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toastWarning("Vui lòng nhập tiêu đề");

    setSaving(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (isEditMode) {
        await postService.updatePost(id, payload);
        toastSuccess("Cập nhật bài viết thành công!");
      } else {
        await postService.createPost(payload);
        toastSuccess("Tạo bài viết thành công!");
      }
      navigate("/admin/posts");
    } catch (err) {
      toastError("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const blockTypes = [
    { type: "heading", icon: Heading2, label: "Tiêu đề" },
    { type: "paragraph", icon: Type, label: "Đoạn văn" },
    { type: "image", icon: ImageIcon, label: "Ảnh" },
    { type: "quote", icon: Quote, label: "Trích dẫn" },
    { type: "list", icon: List, label: "Danh sách" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={20} />
            Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditMode ? "Chỉnh sửa" : "Viết"} bài viết
          </h1>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-medium shadow-lg transition disabled:opacity-70"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? "Đang lưu..." : "Lưu bài viết"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tiêu đề & Mô tả */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <input
                type="text"
                placeholder="Tiêu đề bài viết *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-3xl font-bold outline-none mb-4 placeholder-gray-300"
                required
              />
              <textarea
                placeholder="Mô tả ngắn cho bài viết (hiển thị ở danh sách)..."
                rows={3}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Blocks Editor */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h3 className="text-lg font-bold mb-6">Nội dung bài viết</h3>
              <div className="space-y-6">
                {formData.blocks.map((block, index) => (
                  <BlockItem
                    key={index}
                    block={block}
                    index={index}
                    onUpdate={updateBlock}
                    onRemove={removeBlock}
                  />
                ))}
              </div>

              {/* Add Block Buttons */}
              <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t">
                {blockTypes.map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addBlock(type)}
                    className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-indigo-100 hover:border-indigo-500 border rounded-lg transition font-medium text-sm"
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Thumbnail */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h3 className="font-bold text-lg mb-4">Ảnh đại diện</h3>
              {formData.thumbnail ? (
                <div className="relative group">
                  <img
                    src={formData.thumbnail}
                    alt="Thumbnail"
                    className="w-full h-56 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setFormData({ ...formData, thumbnail: "" })}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="h-56 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-indigo-500 transition">
                    {uploadingThumb ? (
                      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                    ) : (
                      <>
                        <ImageIcon size={40} className="mb-3 text-gray-400" />
                        <span>Click để chọn ảnh đại diện</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6 border space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-medium">Trạng thái</span>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="draft">Nháp</option>
                  <option value="published">Công khai</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2">Tags</label>
                <input
                  type="text"
                  placeholder="detox, sức khỏe, giảm cân..."
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Cách nhau bởi dấu phẩy</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostEditor;