import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import doctorService from "../../services/DoctorService";

const CompletedProfileDoctor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  
  // State preview ảnh và form
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "male",
    dob: "",
    phone: "",
    address: "",
    city: "",      // Chỉ dùng để hiển thị/ghép chuỗi địa chỉ nếu cần
    district: "",  // Chỉ dùng để hiển thị/ghép chuỗi địa chỉ nếu cần
    specialty_id: "",
    consultation_fee: "",
    career_start_year: "",
    introduction: "",
    thumbnail: "", // Chứa base64 string
  });

  // 1. Fetch danh sách Chuyên khoa khi vào trang
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await doctorService.getSpecialties();
        // Kiểm tra cấu trúc response trả về để set state đúng (res.data hoặc res)
        setSpecialties(res.data || res || []);
      } catch (error) {
        console.error("Lỗi lấy chuyên khoa:", error);
        toast.error("Không tải được danh sách chuyên khoa");
      }
    };
    fetchSpecialties();
  }, []);

  // 2. Xử lý tính toán Progress Bar (Bắt đầu 50%)
  const progress = useMemo(() => {
    const requiredFields = [
      "fullName", "dob", "phone", "address", 
      "specialty_id", "consultation_fee", "introduction"
    ];
    
    // Đếm số trường đã điền
    const filledCount = requiredFields.reduce((count, field) => {
      return formData[field] && formData[field].toString().trim() !== "" ? count + 1 : count;
    }, 0);

    const totalFields = requiredFields.length;
    
    // Công thức: 50% cứng + (50% còn lại chia theo tỉ lệ điền)
    const percentage = 50 + Math.round((filledCount / totalFields) * 50);
    return percentage > 100 ? 100 : percentage;
  }, [formData]);

  // 3. Handle Change Input Text
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 4. Handle Upload Avatar & Convert to Base64
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB");
      return;
    }

    // Preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    // Convert to Base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        thumbnail: reader.result, // Chuỗi base64 gửi lên server
      }));
    };
  };

  // 5. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate sơ bộ
    if (!formData.specialty_id) {
      toast.warning("Vui lòng chọn chuyên khoa!");
      setLoading(false);
      return;
    }
    if (!formData.phone) {
        toast.warning("Vui lòng nhập số điện thoại!");
        setLoading(false);
        return;
    }

    // Ghép địa chỉ đầy đủ (nếu cần)
    const fullAddress = `${formData.address}${formData.district ? `, ${formData.district}` : ""}${formData.city ? `, ${formData.city}` : ""}`;

    const payload = {
        ...formData,
        address: fullAddress, // Gửi địa chỉ đã ghép hoặc địa chỉ gốc tùy logic
        // Ép kiểu số
        consultation_fee: Number(formData.consultation_fee),
        career_start_year: Number(formData.career_start_year)
    };

    try {
      const res = await doctorService.completeProfile(payload);
      
      toast.success("Cập nhật hồ sơ thành công!");
      
      // Cập nhật LocalStorage ngay lập tức
      localStorage.setItem("profileCompleted", "true");
      
      // Chờ socket hoặc redirect sau 1s
      setTimeout(() => {
        // Điều hướng về trang Dashboard của bác sĩ hoặc trang chủ
        // Sử dụng window.location.reload() để App cập nhật lại Route Guard nếu cần thiết
        window.location.href = "/doctor"; 
      }, 1500);

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || "Có lỗi xảy ra khi cập nhật hồ sơ.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10 mt-10">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="grid lg:grid-cols-5 min-h-[600px]">
          
          {/* CỘT TRÁI: INFO & PROGRESS */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 lg:col-span-2 flex flex-col justify-between relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                 <div className="absolute bottom-10 left-10 w-32 h-32 bg-teal-400 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-4">
                Bước cuối cùng
              </p>
              <h1 className="text-3xl font-bold leading-tight mb-4">
                Xây dựng hồ sơ chuyên nghiệp
              </h1>
              <p className="text-sm text-blue-100/90 leading-relaxed">
                Hồ sơ chi tiết giúp bệnh nhân tin tưởng và dễ dàng tìm thấy bạn hơn. 
                Vui lòng cung cấp thông tin chính xác về chuyên môn và kinh nghiệm.
              </p>

              {/* THANH TIẾN ĐỘ */}
              <div className="mt-10 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="flex justify-between mb-2 text-sm font-medium text-white">
                  <span>Mức độ hoàn thiện</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-black/20 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-300 to-emerald-400 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <p className="text-xs text-blue-200 mt-2">
                  {progress < 100 ? "Hãy điền thêm thông tin để đạt 100%" : "Tuyệt vời! Hồ sơ đã đầy đủ."}
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-8 text-xs text-blue-200/80 space-y-2">
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full"></span> 
                Thông tin được mã hóa bảo mật
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full"></span>
                Dễ dàng chỉnh sửa sau này
              </p>
            </div>
          </div>

          {/* CỘT PHẢI: FORM NHẬP LIỆU */}
          <div className="lg:col-span-3 p-6 lg:p-10 overflow-y-auto max-h-[85vh]">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Thông tin Bác sĩ</h2>
              <p className="text-slate-500 text-sm mt-1">Các trường đánh dấu <span className="text-red-500">*</span> là bắt buộc.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* PHẦN 1: ẢNH ĐẠI DIỆN */}
              <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full bg-white border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center text-slate-400 shadow-sm">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    )}
                  </div>
                  <label htmlFor="avatar" className="absolute bottom-0 right-0 h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-indigo-700 shadow-lg transition-transform transform group-hover:scale-110">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  </label>
                  <input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-700">Ảnh đại diện</h3>
                  <p className="text-xs text-slate-500 mt-1">Nên dùng ảnh chân dung rõ mặt, mặc áo blouse (nếu có).</p>
                </div>
              </div>

              {/* PHẦN 2: THÔNG TIN CÁ NHÂN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
                  <input
                    type="text" name="fullName"
                    value={formData.fullName} onChange={handleChange}
                    className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-sm border"
                    placeholder="VD: Nguyễn Văn A" required
                  />
                </div>

                <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
                   <input
                    type="tel" name="phone"
                    value={formData.phone} onChange={handleChange}
                    className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-sm border"
                    placeholder="09xx xxx xxx" required
                   />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ngày sinh <span className="text-red-500">*</span></label>
                  <input
                    type="date" name="dob"
                    value={formData.dob} onChange={handleChange}
                    className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-sm border"
                    required
                  />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Giới tính</label>
                    <div className="flex gap-4">
                        {["male", "female", "other"].map((g) => (
                            <label key={g} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-all ${formData.gender === g ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-medium" : "border-slate-200 hover:bg-slate-50"}`}>
                                <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleChange} className="hidden" />
                                <span className="capitalize">{g === 'male' ? 'Nam' : g === 'female' ? 'Nữ' : 'Khác'}</span>
                            </label>
                        ))}
                    </div>
                </div>
              </div>

              {/* PHẦN 3: THÔNG TIN CHUYÊN MÔN (QUAN TRỌNG) */}
              <div className="border-t border-slate-100 pt-6">
                 <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    Thông tin Chuyên môn
                 </h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* CHUYÊN KHOA */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Chuyên khoa <span className="text-red-500">*</span></label>
                        <select 
                            name="specialty_id" 
                            value={formData.specialty_id} 
                            onChange={handleChange}
                            className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-sm border"
                            required
                        >
                            <option value="">-- Chọn chuyên khoa --</option>
                            {specialties.map((spec) => (
                                <option key={spec._id} value={spec._id}>
                                    {spec.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* GIÁ KHÁM */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Giá khám (VND) <span className="text-red-500">*</span></label>
                        <input
                            type="number" name="consultation_fee"
                            value={formData.consultation_fee} onChange={handleChange}
                            placeholder="VD: 200000"
                            className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-sm border"
                            min="0" required
                        />
                    </div>

                    {/* NĂM BẮT ĐẦU */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Năm bắt đầu hành nghề</label>
                        <input
                            type="number" name="career_start_year"
                            value={formData.career_start_year} onChange={handleChange}
                            placeholder="VD: 2015"
                            className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-sm border"
                            min="1950" max={new Date().getFullYear()}
                        />
                    </div>
                 </div>
              </div>

              {/* PHẦN 4: ĐỊA CHỈ & GIỚI THIỆU */}
              <div className="border-t border-slate-100 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                     <div className="md:col-span-3">
                         <label className="block text-sm font-semibold text-slate-700 mb-1.5">Địa chỉ phòng khám/nơi làm việc</label>
                         <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Số nhà, tên đường..." className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm mb-3" required />
                     </div>
                     <div><input type="text" name="district" value={formData.district} onChange={handleChange} placeholder="Quận / Huyện" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm" /></div>
                     <div className="md:col-span-2"><input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Tỉnh / Thành phố" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm" /></div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Giới thiệu bản thân (Bio)</label>
                    <textarea 
                        name="introduction" 
                        value={formData.introduction} 
                        onChange={handleChange}
                        rows="4"
                        placeholder="Mô tả ngắn gọn về kinh nghiệm, thế mạnh chuyên môn của bác sĩ..."
                        className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-sm border"
                    ></textarea>
                </div>
              </div>

              {/* BUTTON ACTION */}
              <div className="pt-4 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all
                    ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transform hover:-translate-y-0.5"}
                  `}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Đang xử lý...
                    </>
                  ) : "Lưu hồ sơ & Hoàn tất"}
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