import React from "react";
import Modal from "../Modal"; // Đảm bảo đường dẫn đúng
import StatusBadge from "./StatusBadge";

const PatientViewModal = ({ isOpen, onClose, viewingPatient }) => {
  // Hàm chuyển đổi giới tính
  const getGenderVietnamese = (gender) => {
    switch (gender) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      case "other":
        return "Khác";
      default:
        return "N/A";
    }
  };

  // Định dạng ngày sinh (nếu có)
  const formatDOB = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch (e) {
      return dateString; // Trả về chuỗi gốc nếu không thể parse
    }
  };

  // Helper function để hiển thị trạng thái hồ sơ
  const getProfileCompletedBadge = (isCompleted) => {
    const style = isCompleted
      ? "bg-blue-100 text-blue-800"
      : "bg-yellow-100 text-yellow-800";
    const text = isCompleted ? "Hoàn thành" : "Chưa đủ";
    return (
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}
      >
        {text}
      </span>
    );
  };

  // Giả định viewingPatient.user_id chứa đối tượng User hoặc ID của User
  const userId =
    viewingPatient?.user_id?._id || viewingPatient?.user_id || "N/A";

  return (
    <Modal
      title={`Chi Tiết Bệnh Nhân: ${viewingPatient?.fullName || ""}`}
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-xl"
    >
      {viewingPatient && (
        <div className="space-y-4 text-gray-700">
          {/* === Phần 1: Tóm tắt và Trạng thái (KHÔNG CÓ ẢNH) === */}
          <div className="border-b pb-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold">Tên Tài Khoản/User ID:</p>
                <p className="text-sm font-mono text-gray-500 truncate">
                  {userId}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold">Hoàn Thành Hồ Sơ:</p>
                {getProfileCompletedBadge(viewingPatient.profile_completed)}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold">Trạng Thái Tài Khoản:</p>
              <StatusBadge status={viewingPatient.status} />
            </div>
          </div>

          {/* === Phần 2: Thông tin Cá nhân === */}
          <div className="grid grid-cols-2 gap-4 border-t pt-3">
            <p className="col-span-2 text-md font-bold text-gray-800 mb-1">
              Thông tin cơ bản
            </p>

            <div>
              <p className="text-sm font-semibold">Giới Tính:</p>
              <p>{getGenderVietnamese(viewingPatient.gender)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Ngày Sinh:</p>
              <p>{formatDOB(viewingPatient.dob)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">SĐT:</p>
              <p>{viewingPatient.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Email:</p>
              <p>{viewingPatient.email || "N/A"}</p>
            </div>
          </div>

          {/* === Phần 3: Địa chỉ & Giới thiệu === */}
          <div className="border-t pt-3 mt-4 space-y-3">
            <div>
              <p className="text-sm font-semibold">Địa Chỉ Đầy Đủ:</p>
              <p>{viewingPatient.address || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Giới Thiệu Ngắn:</p>
              <p className="italic bg-gray-100 p-3 rounded-md text-sm">
                {viewingPatient.introduction || "Không có giới thiệu."}
              </p>
            </div>
          </div>

          {/* === Phần 4: Ghi chú Nội bộ (Admin Only) === */}
          <div className="border-t pt-3 mt-4">
            <p className="text-sm font-semibold text-red-700">
              Ghi Chú Nội Bộ:
            </p>
            <p className="bg-yellow-50 text-sm p-3 rounded-md border border-yellow-200">
              {viewingPatient.note || "Không có ghi chú nội bộ."}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PatientViewModal;
