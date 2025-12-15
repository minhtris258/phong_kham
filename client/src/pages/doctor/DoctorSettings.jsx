// src/pages/doctor/DoctorSettings.jsx
import React, { useState } from "react";
import { Bell, Lock, HelpCircle, Phone, Mail } from "lucide-react";
import SettingsCard from "../../components/doctor/settings/SettingsCard";
import NotificationToggle from "../../components/doctor/settings/NotificationToggle";
import PasswordModal from "../../components/doctor/settings/PasswordModal";
import doctorService from "../../services/DoctorService";
import { toastSuccess, toastError, toastWarning } from "../../utils/toast";

export default function DoctorSettings() {
  // === KHẮC PHỤC LỖI Ở ĐÂY ===
  // Lấy thông tin user từ localStorage (để dùng cho biến 'user' ở dòng cuối)
  // Nếu bạn dùng Context, hãy thay bằng: const { user } = useAuth();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // --- 1. STATE QUẢN LÝ MODAL VÀ DỮ LIỆU ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // --- 2. CÁC HÀM XỬ LÝ (HANDLERS) ---

  // Xử lý khi nhập liệu
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Mở modal và reset dữ liệu
  const handleOpenModal = () => {
    setPasswordData({
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setMessage("");
    setIsModalOpen(true);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Xử lý Submit đổi mật khẩu
  const handleSavePassword = async (e) => {
    e.preventDefault();
    setMessage("");

    // Validation cơ bản
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toastError("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toastWarning("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setIsLoading(true);
      await doctorService.changeMyPassword(
        passwordData.oldPassword,
        passwordData.newPassword,
        passwordData.confirmNewPassword
      );

      toastSuccess("Đổi mật khẩu thành công!");
      handleCloseModal();
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Lỗi khi đổi mật khẩu";
      setMessage(errorMsg);
      toastError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Cài đặt</h1>

      <div className="space-y-8">
        {/* 1. KHỐI THÔNG BÁO */}
        <SettingsCard
          title="Thông báo"
          icon={Bell}
          iconColorClass="text-blue-600"
        >
          {[
            "Lịch hẹn mới",
            "Nhắc lịch trước 30 phút",
            "Tin nhắn từ bệnh nhân",
          ].map((item) => (
            <NotificationToggle key={item} label={item} />
          ))}
        </SettingsCard>

        {/* 2. KHỐI BẢO MẬT */}
        <SettingsCard title="Bảo mật" icon={Lock} iconColorClass="text-red-600">
          <button
            onClick={handleOpenModal}
            className="w-full text-left px-6 py-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
          >
            <div className="flex justify-between items-center">
              <p className="font-medium">Đổi mật khẩu</p>
              <span className="text-sm text-gray-500">
                Nên đổi định kỳ 3 tháng
              </span>
            </div>
          </button>
        </SettingsCard>

        {/* 3. KHỐI HỖ TRỢ */}
        <SettingsCard
          title="Hỗ trợ"
          icon={HelpCircle}
          iconColorClass="text-green-600"
        >
          <div className="space-y-4 pt-1">
            <a
              href="tel:19002156"
              className="flex items-center gap-3 text-blue-700 font-medium hover:underline"
            >
              <Phone className="w-5 h-5" /> 1900 2156
            </a>
            <a
              href="mailto:support@clinic.com"
              className="flex items-center gap-3 text-blue-700 font-medium hover:underline"
            >
              <Mail className="w-5 h-5" /> support@clinic.com
            </a>
          </div>
        </SettingsCard>
      </div>

      {/* --- RENDER MODAL --- */}
      <PasswordModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSavePassword}
        isLoading={isLoading}
        message={message}
        passwordData={passwordData}
        handlePasswordChange={handlePasswordChange}
        // Bây giờ biến user đã được định nghĩa ở đầu function
        isGoogleAccount={user?.authType === "google"}
      />
    </div>
  );
}
