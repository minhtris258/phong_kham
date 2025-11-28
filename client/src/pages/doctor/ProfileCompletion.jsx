// src/pages/ProfileCompletion.jsx
import React, { useState } from "react";

const ProfileCompletion = () => {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    address: "",
    city: "",
    district: "",
    dob: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    // Nếu bạn muốn upload file lên server:
    // const form = new FormData();
    // form.append("avatar", file);
    // await api.post("/upload-avatar", form, { headers: { "Content-Type": "multipart/form-data" } });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data gửi lên API:", formData);
    // TODO: call API update profile ở đây
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 lg:mt-15 mt-20">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
        <div className="grid lg:grid-cols-5">
          {/* Cột trái: Giới thiệu / tiến độ */}
          <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white p-8 lg:col-span-2 flex flex-col justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-100 mb-3">
                Bước 2 / 2
              </p>
              <h1 className="text-2xl lg:text-3xl font-semibold leading-snug mb-3">
                Hoàn thiện hồ sơ của bạn
              </h1>
              <p className="text-sm text-indigo-100/90">
                Hồ sơ đầy đủ giúp bác sĩ và phòng khám hỗ trợ bạn tốt hơn. Vui
                lòng bổ sung một số thông tin cơ bản bên phải.
              </p>

              {/* Thanh progress */}
              <div className="mt-6">
                <div className="flex justify-between mb-1 text-xs text-indigo-100/90">
                  <span>Tiến độ hoàn thiện</span>
                  <span>70%</span>
                </div>
                <div className="h-2 rounded-full bg-indigo-400/40 overflow-hidden">
                  <div className="h-full w-4/5 bg-white/90 rounded-full" />
                </div>
              </div>
            </div>

            <div className="mt-8 text-xs text-indigo-100/80">
              <p>• Thông tin của bạn được bảo mật.</p>
              <p>
                • Bạn có thể chỉnh sửa lại profile sau trong phần tài khoản.
              </p>
            </div>
          </div>

          {/* Cột phải: Form hoàn thiện hồ sơ */}
          <div className="lg:col-span-3 p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-800">
                Thêm thông tin cá nhân
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Chỉ mất khoảng 1–2 phút để hoàn tất.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avartar + tên & giới tính */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <div className="flex flex-col items-center md:items-start">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-400 text-xs">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>Ảnh đại diện</span>
                      )}
                    </div>
                    <label
                      htmlFor="avatar"
                      className="absolute bottom-0 right-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-md border border-slate-200 text-[10px] font-medium text-slate-700 cursor-pointer hover:bg-slate-50"
                    >
                      <span>+</span>
                    </label>
                  </div>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <p className="mt-2 text-xs text-slate-400 text-center md:text-left">
                    PNG, JPG dưới 5MB.
                  </p>
                </div>

                {/* Họ tên + giới tính + ngày sinh */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Giới tính
                    </label>
                    <div className="flex items-center gap-3 text-sm">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={formData.gender === "male"}
                          onChange={handleChange}
                          className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                        />
                        <span>Nam</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={formData.gender === "female"}
                          onChange={handleChange}
                          className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                        />
                        <span>Nữ</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="other"
                          checked={formData.gender === "other"}
                          onChange={handleChange}
                          className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                        />
                        <span>Khác</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="dob"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Địa chỉ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Địa chỉ chi tiết
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Số nhà, tên đường, phường/xã..."
                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Tỉnh / Thành phố
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="VD: TP. Hồ Chí Minh"
                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="district"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Quận / Huyện
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="VD: Quận 1"
                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Nút hành động */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-500">
                  Bằng cách tiếp tục, bạn xác nhận thông tin cung cấp là chính
                  xác.
                </p>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                    onClick={() => {
                      window.location.href = "/";
                    }}
                  >
                    Để sau
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                  >
                    Lưu & Hoàn tất
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;
