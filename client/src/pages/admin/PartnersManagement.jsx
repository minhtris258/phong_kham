import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Image as ImageIcon, X, Check, Search } from "lucide-react";
import partnersService from "../../services/PartnersService"; 
import { toastSuccess, toastError,toastWarning } from "../../utils/toast";

const PartnersManagement = () => {
  // --- State ---
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State (Khớp với PartnerModel: name, thumbnail)
  const [formData, setFormData] = useState({
    name: "",
    thumbnail: "",
  });

  // --- Fetch Data ---
  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await partnersService.listPartners();
      setPartners(Array.isArray(res.data) ? res.data : res.data?.data || []); 
    } catch (error) {
      console.error("Lỗi tải đối tác:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý chọn ảnh -> Chuyển sang Base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, thumbnail: reader.result }));
      };
    }
  };

  const openModal = (partner = null) => {
    if (partner) {
      // Edit mode
      setFormData({
        name: partner.name,
        thumbnail: partner.thumbnail || "",
      });
      setEditingItem(partner);
    } else {
      // Add mode
      setFormData({ name: "", thumbnail: "" });
      setEditingItem(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) return toastWarning("Vui lòng nhập tên đối tác");

    try {
      if (editingItem) {
        // Update
        await partnersService.updatePartner(editingItem._id || editingItem.id, formData);
        toastSuccess("Cập nhật đối tác thành công!");
      } else {
        // Create
        await partnersService.createPartner(formData);
        toastSuccess("Thêm đối tác thành công!");
      }
      setIsModalOpen(false);
      fetchPartners(); 
    } catch (error) {
      toastError("Lỗi: " + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đối tác này không?")) {
      try {
        await partnersService.deletePartner(id);
        fetchPartners();
      } catch (error) {
        toastError("Xóa thất bại: " + error.message);
      }
    }
  };

  // --- Render ---
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản Lý Đối Tác</h1>
            <p className="text-sm text-gray-500 mt-1">Danh sách các đối tác, công ty bảo hiểm liên kết</p>
          </div>
          <button
            onClick={() => openModal(null)}
            className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition shadow-sm font-medium"
          >
            <Plus size={18} />
            Thêm Đối Tác
          </button>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
          ) : partners.length === 0 ? (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center">
              <ImageIcon size={48} className="mb-3 opacity-20" />
              <p>Chưa có đối tác nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4 w-20">#</th>
                    <th className="px-6 py-4 w-32">Logo</th>
                    <th className="px-6 py-4">Tên Đối Tác</th>
                    <th className="px-6 py-4 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {partners.map((partner, index) => (
                    <tr key={partner._id || partner.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-500 font-medium">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                            {partner.thumbnail ? (
                                <img src={partner.thumbnail} alt={partner.name} className="w-full h-full object-contain" />
                            ) : (
                                <ImageIcon size={20} className="text-gray-400" />
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">{partner.name}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openModal(partner)}
                          className="p-2 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-md transition"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(partner._id || partner.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                {editingItem ? "Cập Nhật Đối Tác" : "Thêm Đối Tác Mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              {/* Input Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên đối tác <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Bảo hiểm Bảo Việt"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              {/* Input Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                   Logo / Hình ảnh
                </label>
                
                <div className="flex items-center gap-4">
                    {/* Preview Box */}
                    <div className="w-20 h-20 rounded-lg border border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 relative group">
                        {formData.thumbnail ? (
                            <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-xs text-gray-400">No Image</span>
                        )}
                    </div>

                    {/* File Input */}
                    <label className="flex-1 cursor-pointer">
                        <span className="inline-block px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
                            Chọn tệp tin...
                        </span>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            className="hidden" 
                        />
                        <p className="text-xs text-gray-500 mt-1">Hỗ trợ JPG, PNG, WEBP</p>
                    </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-sky-500 hover:bg-sky-700 rounded-lg font-medium shadow-md transition flex items-center gap-2"
                >
                  <Check size={18} />
                  {editingItem ? "Lưu Thay Đổi" : "Tạo Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnersManagement;