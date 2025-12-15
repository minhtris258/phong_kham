import React from "react";
import { X } from "lucide-react";

const Modal = ({
  title,
  children,
  isOpen,
  onClose,
  className = "",
  maxWidth = "3xl",
}) => {
  if (!isOpen) return null;

  // Lớp CSS cho kích thước tối đa của modal container
  const maxWidthClass = `max-w-${maxWidth}`;

  return (
    <div
      className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      // Cho phép đóng modal khi click ra ngoài
      onClick={onClose}
    >
      <div
        // Ngăn chặn sự kiện click lan truyền lên lớp background
        onClick={(e) => e.stopPropagation()}
        // Sử dụng kích thước maxWidth mới
        className={`bg-white p-6 rounded-xl shadow-2xl ${maxWidthClass} w-full transform transition-all duration-300 ${className}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
            title="Đóng"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Nội dung */}
        <div className="max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
