// src/components/admin/specialty/SpecialtyFormModal.jsx
import React, { useEffect, useState } from "react";
import Modal from "../Modal";

const SpecialtyFormModal = ({
  isOpen,
  onClose,
  formData,
  handleInputChange,
  handleFileChange,
  handleSave,
  editingSpecialty,
}) => {
  // State cục bộ để xử lý hiển thị keywords (Array -> String)
  const [keywordsStr, setKeywordsStr] = useState("");

  // Mỗi khi formData thay đổi (khi mở modal edit), cập nhật state keywordsStr
  useEffect(() => {
    if (formData.keywords && Array.isArray(formData.keywords)) {
      setKeywordsStr(formData.keywords.join(", "));
    } else if (typeof formData.keywords === "string") {
      setKeywordsStr(formData.keywords);
    } else {
      setKeywordsStr("");
    }
  }, [formData.keywords, isOpen]);

  // Wrapper cho handleInputChange để xử lý riêng trường keywords
  const onKeywordsChange = (e) => {
    const val = e.target.value;
    setKeywordsStr(val);
    // Gọi hàm gốc để cập nhật formData (gửi dạng string, backend sẽ tự parse)
    handleInputChange({
      target: {
        name: "keywords",
        value: val,
      },
    });
  };

  return (
    <Modal
      title={
        editingSpecialty ? "Chỉnh Sửa Chuyên Khoa" : "Thêm Chuyên Khoa Mới"
      }
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSave}>
        <div className="space-y-4">
          {/* Input Tên */}
          <label className="block">
            <span className="text-gray-700 font-medium">Tên Chuyên Khoa:</span>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-50 p-2 border"
              placeholder="VD: Khoa Nhi, Khoa Tim Mạch..."
              required
            />
          </label>

          {/* Input Keywords (MỚI) */}
          <label className="block">
            <span className="text-gray-700 font-medium">
              Từ khóa tìm kiếm (Hỗ trợ AI):
              <span className="text-xs font-normal text-gray-500 ml-2">
                (Ngăn cách bằng dấu phẩy)
              </span>
            </span>
            <textarea
              name="keywords"
              value={keywordsStr}
              onChange={onKeywordsChange}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-50 p-2 border text-sm"
              placeholder="VD: đau bụng, dạ dày, rối loạn tiêu hóa, trào ngược..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Giúp AI nhận diện triệu chứng bệnh nhân để gợi ý khoa này.
            </p>
          </label>

          {/* Input Ảnh */}
          <label className="block">
            <span className="text-gray-700 font-medium">
              Hình ảnh (Thumbnail):
            </span>

            <div className="mt-2 flex items-center space-x-4">
              {/* Preview */}
              <div className="w-20 h-20 border border-gray-300 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center relative group">
                {formData.thumbnail ? (
                  <img
                    src={formData.thumbnail}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-xs text-center px-1">
                    Chưa có ảnh
                  </span>
                )}
              </div>

              {/* Input File */}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-sky-50 file:text-sky-700
                                hover:file:bg-sky-100 cursor-pointer"
              />
            </div>
          </label>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-700 transition font-semibold"
          >
            Lưu Chuyên Khoa
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SpecialtyFormModal;
