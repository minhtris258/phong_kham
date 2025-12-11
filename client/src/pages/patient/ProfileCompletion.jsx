import React, { useState } from "react";
import { toastSuccess,toastError, toastWarning, toastInfo } from "../../utils/toast";
import { useNavigate } from "react-router-dom";
import patientService from "../../services/PatientService";
import { useAppContext } from "../../context/AppContext";

const ProfileCompletion = () => {
  const navigate = useNavigate();

  const { setAuthToken, loadCurrentUser } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dữ liệu form
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "", 
    dob: "",
    phone: "",
    address: "",
  });

  // --- LOGIC TÍNH % TIẾN ĐỘ ---
  const calculateProgress = () => {
    const requiredFields = ["fullName", "gender", "dob", "phone", "address"];
    const filledCount = requiredFields.reduce((count, field) => {
      return count + (formData[field] && formData[field].trim() !== "" ? 1 : 0);
    }, 0);
    const percentage = 50 + (filledCount / requiredFields.length) * 50;
    return Math.round(percentage);
  };

  const progress = calculateProgress();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (progress < 100) throw new Error("Vui lòng điền đủ thông tin.");

      // 1. Gọi API
      const res = await patientService.completePatientProfile(formData);
      
      // LOG ĐỂ KIỂM TRA RESPONSE TRẢ VỀ
      console.log("Response từ server:", res);

      // 2. === SỬA LẠI ĐOẠN NÀY ===
      // Axios thường trả về dữ liệu trong res.data
      // Kiểm tra cả 2 trường hợp để chắc chắn
      const newToken = res.token || res.data?.token;

      if (newToken) {
          console.log("Đã nhận Token mới:", newToken);
          
          // Cập nhật Token mới ngay lập tức
          setAuthToken(newToken); 
          
          // Load lại User để AppContext nhận diện profile_completed = true
          await loadCurrentUser(newToken);
      } else {
          toastWarning("Không tìm thấy Token trong response!");
      }

      toastSuccess("Hồ sơ đã hoàn tất!");
      navigate("/");

    } catch (err) {
      toastError(err.response?.data?.error || err.message || "Có lỗi xảy ra.");
      setError(err.response?.data?.error || err.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 mt-10 mb-10">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
        <div className="grid lg:grid-cols-5">
          
          {/* Cột trái: Thông tin & Progress Bar */}
          <div className="bg-[#00B5F1] text-white p-8 lg:col-span-2 flex flex-col justify-center">
            <h1 className="text-2xl font-bold mb-4">Hoàn tất hồ sơ</h1>
            <p className="text-indigo-100 mb-6 text-sm">
              Bạn đã hoàn thành bước đăng ký. Hãy bổ sung thông tin cá nhân để hoàn tất.
            </p>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-blue-500">
                    Tiến độ
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-white">
                    {progress}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                <div
                  style={{ width: `${progress}%`, transition: "width 0.5s ease-in-out" }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    progress === 100 ? "bg-green-400" : "bg-white/80"
                  }`}
                ></div>
              </div>
            </div>
            <p className="text-xs mt-2 text-white italic">
              {progress === 100 ? "Tuyệt vời! Bạn đã sẵn sàng." : "Vui lòng điền đủ các trường bên phải."}
            </p>
          </div>

          {/* Cột phải: Form nhập liệu */}
          <div className="lg:col-span-3 p-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Thông tin cá nhân</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0912..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  {["male", "female", "other"].map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={formData.gender === g}
                        onChange={handleChange}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm capitalize">
                        {g === "male" ? "Nam" : g === "female" ? "Nữ" : "Khác"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Số nhà, đường, phường, quận..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || progress < 100} 
                  className={`w-full py-2.5 rounded-lg text-white font-medium text-sm transition duration-300
                    ${loading || progress < 100 
                        ? 'bg-slate-400 cursor-not-allowed' 
                        : 'btn-color shadow-md transform hover:-translate-y-0.5'}
                  `}
                >
                  {loading ? "Đang xử lý..." : "Lưu & Hoàn tất (100%)"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;