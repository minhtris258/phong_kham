// src/components/admin/patient/PatientEditModal.jsx (ĐÃ SỬA CHO PATIENT)

import React from "react";
import Modal from "../Modal"; // sửa đường dẫn nếu cần

const PatientEditModal = ({
  isOpen,
  onClose,
  formData,
  handleInputChange,
  handleSave,
  editingPatient, // Đây là Patient object
  // Các props ảnh không cần thiết cho Patient (trừ khi Patient có avatar)
  // handleFileChange,
  // clearThumbnail,
  // isImagePending,
}) => {
  // Xử lý ngày sinh (chuyển Date → string yyyy-MM-dd)
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  // Tên bệnh nhân đang sửa
  const patientName =
    editingPatient?.fullName || editingPatient?.name || "Đang tải...";

  return (
    <Modal
      title={`Chỉnh sửa thông tin bệnh nhân: ${patientName}`}
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md" // Kích thước phù hợp hơn cho form Patient
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* === Hàng 1: Họ và tên & Email === */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName || ""}
              onChange={handleInputChange}
              required
              placeholder="Nguyễn Văn A"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              // Lấy email từ editingPatient (Giả định không cho Admin sửa Email)
              value={editingPatient?.email || ""}
              disabled
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
            />
          </div>
        </div>

        {/* === Hàng 2: Giới tính & Ngày sinh & SĐT === */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giới tính <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender || ""}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-sky-500"
            >
              <option value="">-- Chọn --</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày sinh <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dob"
              value={formatDateForInput(formData.dob)}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ""}
              onChange={handleInputChange}
              required
              placeholder="0901234567"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Địa chỉ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Địa chỉ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address || ""}
            onChange={handleInputChange}
            required
            placeholder="Số 123 Đường ABC, Quận 1, TP.HCM"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition font-medium shadow-sm"
            // isImagePending không cần thiết ở đây, nhưng giữ lại nếu bạn định dùng nó cho trạng thái loading chung
            // disabled={isImagePending}
          >
            Lưu Thay Đổi
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PatientEditModal;
