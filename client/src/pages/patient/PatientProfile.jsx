import React, { useState, useEffect } from "react";
import patientService from "../../services/PatientService";
// import PatientDashboard from "./PatientDashboard"; // <-- XÓA DÒNG NÀY
import { X, Edit3, Save, User } from "lucide-react";

export const PatientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await patientService.getMyProfile();
      const data = response.profile || response;

      let formattedDob = "";
      if (data.dob) formattedDob = data.dob.split("T")[0];

      const safeProfile = {
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        gender: data.gender || "male",
        note: data.note || "",
        dob: formattedDob,
      };
      setProfile(safeProfile);
    } catch (error) {
      setMessage({ type: "error", text: "Lỗi tải dữ liệu." });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    setFormData({ ...profile });
    setMessage({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const closeEditModal = () => setIsModalOpen(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await patientService.updateProfile(formData);
      setProfile({ ...formData });
      setIsModalOpen(false);
      setMessage({ type: "success", text: "Cập nhật hồ sơ thành công!" });
    } catch (error) {
      setMessage({ type: "error", text: "Cập nhật thất bại." });
    }
  };

  const renderGender = (g) =>
    g === "male" ? "Nam" : g === "female" ? "Nữ" : "Khác";

  const renderDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    const [y, m, d] = dateString.split("-");
    return `${d}/${m}/${y}`;
  };

  // --- KHÔNG BỌC <PatientDashboard> Ở ĐÂY NỮA ---
  return (
    <>
      {/* Thông báo (Giữ nguyên) */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl border-l-4 shadow-sm bg-white animate-fade-in ${
            message.type === "success"
              ? "border-green-500 text-green-700"
              : "border-red-500 text-red-700"
          }`}
        >
          <p className="font-medium">
            {message.type === "success" ? "Thành công!" : "Lỗi!"}
          </p>
          <p>{message.text}</p>
        </div>
      )}

      {/* Nội dung chính */}
      {loading || !profile ? (
        <div className="flex justify-center p-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
          <div className="px-4 py-4 md:px-6 md:py-5 border-b border-gray-100 bg-white flex justify-between items-center">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                <User className="title-color w-5 h-5" /> Thông tin cá nhân
              </h3>
              <p className="text-xs md:text-sm text-gray-500 mt-1 hidden md:block">
                Quản lý thông tin hồ sơ và liên lạc của bạn
              </p>
            </div>
            <button
              onClick={openEditModal}
              className="flex items-center gap-2 text-xs md:text-sm title-color bg-blue-50 hover:bg-sky-100 border border-sky-50 px-3 py-2 md:px-4 md:py-2 rounded-lg transition font-medium whitespace-nowrap"
            >
              <Edit3 size={14} className="md:w-4 md:h-4" />{" "}
              <span className="hidden md:inline">Chỉnh sửa</span>
              <span className="md:hidden">Sửa</span>
            </button>
          </div>

          {/* THAY ĐỔI LỚN NHẤT Ở ĐÂY: p-4 cho mobile, p-8 cho desktop */}
          <div className="p-4 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-y-8 gap-x-12">
              <InfoItem label="Họ và tên" value={profile.fullName} />
              <InfoItem label="Email" value={profile.email} />
              <InfoItem label="Ngày sinh" value={renderDate(profile.dob)} />
              <InfoItem
                label="Giới tính"
                value={renderGender(profile.gender)}
              />
              <InfoItem
                label="Số điện thoại"
                value={profile.phone || "Chưa cập nhật"}
              />
              <InfoItem
                label="Địa chỉ"
                value={profile.address || "Chưa cập nhật"}
              />
              <div className="md:col-span-2 border-t pt-4 md:pt-6 mt-2">
                <InfoItem
                  label="Ghi chú sức khỏe"
                  value={profile.note || "Không có ghi chú"}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal giữ nguyên */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                Cập nhật hồ sơ
              </h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[55vh] overflow-y-auto">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email
                  </label>
                  <input
                    type="text"
                    value={formData.email}
                    disabled
                    className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <FormInput
                  label="Họ và tên"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleFormChange}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <FormInput
                  label="Số điện thoại"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none bg-white"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <FormInput
                    label="Địa chỉ"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    name="note"
                    rows="3"
                    value={formData.note}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                  ></textarea>
                </div>
              </div>
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 flex items-center gap-2"
                >
                  <Save size={18} /> Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500 mb-1 uppercase tracking-wide font-semibold">
      {label}
    </p>
    <p className="text-gray-900 font-medium text-lg break-words">{value}</p>
  </div>
);

const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  required = false,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition"
    />
  </div>
);

export default PatientProfile;
