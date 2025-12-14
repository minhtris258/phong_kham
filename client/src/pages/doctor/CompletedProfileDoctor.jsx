import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toastSuccess, toastError, toastWarning } from "../../utils/toast";
import doctorService from "../../services/DoctorService"; 
import specialtyService from "../../services/SpecialtyService";
// 1. Import Context
import { useAppContext } from "../../context/AppContext";

const CompletedProfileDoctor = () => {
  const navigate = useNavigate();
  // 2. Lấy hàm từ Context
  const { setAuthToken, loadCurrentUser } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState([]);

  // === STATE MỚI CHO VIỆC TÌM KIẾM CHUYÊN KHOA ===
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false); // Ẩn/hiện dropdown
  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
  const dropdownRef = useRef(null); // Để xử lý click outside (tùy chọn)

  // State preview ảnh và form
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "male",
    dob: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    specialty_id: "",
    consultation_fee: "",
    career_start_year: "",
    introduction: "",
    thumbnail: "",
  });

  // Fetch danh sách Chuyên khoa
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        // Lấy limit lớn để search client-side
        const res = await specialtyService.getAllSpecialties({ limit: 1000 });
        const dataResponse = res.data ? res.data : res;
        const listData = dataResponse.specialties || [];
        setSpecialties(listData);
      } catch (error) {
        toastError("Lỗi lấy chuyên khoa:", error);
        console.error(error);
      }
    };
    fetchSpecialties();
  }, []);

  // --- LOGIC LỌC CHUYÊN KHOA ---
  const filteredSpecialties = useMemo(() => {
    if (!searchTerm) return specialties;
    return specialties.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [specialties, searchTerm]);

  // Handle khi chọn 1 chuyên khoa từ list
  const handleSelectSpecialty = (spec) => {
    setFormData((prev) => ({ ...prev, specialty_id: spec._id }));
    setSearchTerm(spec.name); // Hiển thị tên đã chọn lên ô input
    setShowSpecialtyDropdown(false); // Đóng dropdown
  };

  // Handle khi gõ vào ô tìm kiếm
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSpecialtyDropdown(true); // Mở dropdown khi gõ
    // Nếu người dùng xóa hết hoặc gõ lại, có thể reset specialty_id nếu muốn bắt buộc chọn đúng
    if (e.target.value === "") {
      setFormData((prev) => ({ ...prev, specialty_id: "" }));
    }
  };

  // Ẩn dropdown khi click ra ngoài (đơn giản hóa bằng onBlur có delay)
  const handleBlurSearch = () => {
    // Timeout để sự kiện click vào item kịp chạy trước khi dropdown đóng
    setTimeout(() => {
      setShowSpecialtyDropdown(false);
    }, 200);
  };

  // Progress Bar Logic
  const progress = useMemo(() => {
    const requiredFields = [
      "fullName",
      "dob",
      "phone",
      "address",
      "specialty_id",
      "consultation_fee",
      "introduction",
    ];
    const filledCount = requiredFields.reduce((count, field) => {
      return formData[field] && formData[field].toString().trim() !== ""
        ? count + 1
        : count;
    }, 0);
    const totalFields = requiredFields.length;
    const percentage = 50 + Math.round((filledCount / totalFields) * 50);
    return percentage > 100 ? 100 : percentage;
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toastError("Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, thumbnail: reader.result }));
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.specialty_id) {
      toastWarning("Vui lòng chọn chuyên khoa trong danh sách!");
      setLoading(false);
      return;
    }
    if (!formData.phone) {
      toastWarning("Vui lòng nhập số điện thoại!");
      setLoading(false);
      return;
    }

    // Ghép địa chỉ
    const fullAddress = `${formData.address}${
      formData.district ? `, ${formData.district}` : ""
    }${formData.city ? `, ${formData.city}` : ""}`;

    const payload = {
      ...formData,
      address: fullAddress,
      consultation_fee: Number(formData.consultation_fee),
      career_start_year: Number(formData.career_start_year),
    };

    try {
      const res = await doctorService.completeProfile(payload);

      const newToken = res.token || res.data?.token;

      if (newToken) {
        setAuthToken(newToken);
        await loadCurrentUser(newToken);
      } else {
        toastWarning("Không thấy token mới từ server.");
      }

      toastSuccess("Cập nhật hồ sơ thành công!");
      setTimeout(() => {
        navigate("/doctor");
      }, 500);
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.error || "Có lỗi xảy ra khi cập nhật hồ sơ.";
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10 mt-10">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="grid lg:grid-cols-5 min-h-[600px]">
          {/* CỘT TRÁI: INFO */}
          <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white p-8 lg:col-span-2 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-sky-500/30 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-600/30 blur-3xl"></div>

            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-4">
                Bước cuối cùng
              </p>
              <h1 className="text-3xl font-bold leading-tight mb-4">
                Xây dựng hồ sơ chuyên nghiệp
              </h1>
              <p className="text-sm text-blue-100/90 leading-relaxed">
                Hồ sơ chi tiết giúp bệnh nhân tin tưởng và dễ dàng tìm thấy bạn
                hơn.
              </p>
              {/* THANH TIẾN ĐỘ */}
              <div className="mt-10 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="flex justify-between mb-2 text-sm font-medium text-white">
                  <span>Mức độ hoàn thiện</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-black/20 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-300 to-emerald-400 transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-12">
              <div className="flex items-center gap-3 text-blue-200 text-xs">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  ></path>
                </svg>
                <span>Thông tin được bảo mật an toàn</span>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: FORM */}
          <div className="lg:col-span-3 p-6 lg:p-10 overflow-y-auto max-h-[85vh]">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800">
                Thông tin Bác sĩ
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Các trường đánh dấu <span className="text-red-500">*</span> là
                bắt buộc.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 1. ẢNH ĐẠI DIỆN */}
              <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full bg-white border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center text-slate-400 shadow-sm">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                    )}
                  </div>
                  <label
                    htmlFor="avatar"
                    className="absolute bottom-0 right-0 h-8 w-8 bg-sky-500 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-sky-700 shadow-lg transition-transform transform group-hover:scale-110"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      ></path>
                    </svg>
                  </label>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-700">Ảnh đại diện</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Nên dùng ảnh chân dung rõ mặt, mặc áo blouse.
                  </p>
                </div>
              </div>

              {/* 2. THÔNG TIN CÁ NHÂN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Giới tính
                  </label>
                  <div className="flex gap-4">
                    {["male", "female", "other"].map((g) => (
                      <label
                        key={g}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${
                          formData.gender === g
                            ? "bg-sky-50 border-sky-500 text-sky-700"
                            : "border-slate-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={formData.gender === g}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <span className="capitalize">
                          {g === "male"
                            ? "Nam"
                            : g === "female"
                            ? "Nữ"
                            : "Khác"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. THÔNG TIN CHUYÊN MÔN */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">
                  Thông tin Chuyên môn
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* === CUSTOM SEARCHABLE DROPDOWN CHO CHUYÊN KHOA === */}
                  <div className="md:col-span-2 relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Chuyên khoa <span className="text-red-500">*</span>
                    </label>

                    {/* Input tìm kiếm thay thế select */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="-- Gõ để tìm hoặc chọn chuyên khoa --"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => setShowSpecialtyDropdown(true)}
                        onBlur={handleBlurSearch}
                        className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm border focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                      />

                      {/* Icon mũi tên bên phải */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            showSpecialtyDropdown ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </div>
                    </div>

                    {/* Danh sách dropdown */}
                    {showSpecialtyDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {filteredSpecialties.length > 0 ? (
                          <ul>
                            {filteredSpecialties.map((spec) => (
                              <li
                                key={spec._id}
                                // === SỬA Ở ĐÂY: Đổi onClick thành onMouseDown ===
                                onMouseDown={(e) => {
                                  e.preventDefault(); // Ngăn không cho input bị mất focus ngay lập tức
                                  handleSelectSpecialty(spec);
                                }}
                                className={`px-4 py-2.5 cursor-pointer hover:bg-sky-50 text-sm flex items-center justify-between ${
                                  formData.specialty_id === spec._id
                                    ? "bg-sky-50 text-sky-700 font-medium"
                                    : "text-slate-700"
                                }`}
                              >
                                <span>{spec.name}</span>
                                {formData.specialty_id === spec._id && (
                                  <svg
                                    className="w-4 h-4 text-sky-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M5 13l4 4L19 7"
                                    ></path>
                                  </svg>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="px-4 py-3 text-sm text-slate-500 text-center">
                            Không tìm thấy chuyên khoa phù hợp
                          </div>
                        )}
                      </div>
                    )}
                    {/* Input ẩn để giữ logic validate nếu cần, hoặc đơn giản dùng state */}
                    <input
                      type="hidden"
                      name="specialty_id"
                      value={formData.specialty_id}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Giá khám (VND) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="consultation_fee"
                      value={formData.consultation_fee}
                      onChange={handleChange}
                      className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm border"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Năm bắt đầu
                    </label>
                    <input
                      type="number"
                      name="career_start_year"
                      value={formData.career_start_year}
                      onChange={handleChange}
                      className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm border"
                    />
                  </div>
                </div>
              </div>

              {/* 4. ĐỊA CHỈ & GIỚI THIỆU */}
              <div className="border-t border-slate-100 pt-6">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Địa chỉ làm việc
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Giới thiệu (Bio)
                  </label>
                  <textarea
                    name="introduction"
                    value={formData.introduction}
                    onChange={handleChange}
                    rows="4"
                    className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm border"
                  ></textarea>
                </div>
              </div>

              {/* BUTTON */}
              <div className="pt-4 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all ${
                    loading
                      ? "bg-sky-400"
                      : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-700"
                  }`}
                >
                  {loading ? "Đang xử lý..." : "Lưu hồ sơ & Hoàn tất"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletedProfileDoctor;
