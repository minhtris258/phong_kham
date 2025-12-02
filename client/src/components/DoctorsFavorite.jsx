// src/components/DoctorsFavorite.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Users, Ticket, ArrowRight } from "lucide-react"; // Import icon
import doctorService from "../services/DoctorService";
import { toastSuccess,toastError, toastWarning, toastInfo } from "../utils/toast";

// ====================== UTIL ======================
const formatVND = (n) =>
  typeof n === "number"
    ? n.toLocaleString("vi-VN") + "đ"
    : n
    ? Number(n).toLocaleString("vi-VN") + "đ"
    : "—";

const resolveDoctorImage = (thumbnail) =>
  thumbnail || "https://ui-avatars.com/api/?name=Doctor&background=random";

// =================== 1 CARD BÁC SĨ ===================
function DoctorCard({ doc }) {
  const {
    _id,
    fullName,
    thumbnail,
    consultation_fee,
    specialty_id, // JSON trả về object { _id, name }
    specialty,    // Fallback cũ
    averageRating, // <--- TRƯỜNG MỚI TỪ JSON CỦA BẠN
    visits // Hiện tại JSON chưa có field này, sẽ để fallback
  } = doc || {};

  // 1. Xử lý tên chuyên khoa (Lấy từ specialty_id.name theo JSON mới)
  const specText = specialty_id?.name || specialty?.name || "Đa khoa";
  
  // 2. Xử lý ảnh
  const imgSrc = resolveDoctorImage(thumbnail);

  // 3. Xử lý đánh giá sao
  // Nếu có rating thì lấy, nếu không có (undefined) thì mặc định là 0 hoặc 5 tùy bạn muốn
  const ratingValue = averageRating !== undefined && averageRating !== null ? averageRating : 0;
  
  // Logic hiển thị text đánh giá: Nếu 0 thì hiện "Mới", ngược lại hiện số điểm
  const displayRating = ratingValue > 0 ? ratingValue : "Mới";

  return (
    <Link 
      to={`/doctors/${_id || ""}`} 
      className="group block h-full"
    >
      <div className="
        relative flex flex-col h-full bg-white rounded-2xl overflow-hidden
        border border-slate-100 shadow-sm
        transition-all duration-300 ease-in-out
        hover:shadow-xl hover:-translate-y-1 hover:border-sky-200
      ">
        
        {/* === PHẦN 1: ẢNH ĐẠI DIỆN === */}
        <div className="relative pt-6 pb-2 flex justify-center ">
          <div className="relative">
            <div className="absolute -inset-1  rounded-full opacity-70 blur-sm group-hover:opacity-100 transition-opacity"></div>
            <img
              className="relative h-28 w-28 rounded-full object-cover border-4 border-white shadow-md"
              src={imgSrc}
              alt={fullName}
              loading="lazy"
            />
            
            {/* --- BADGE ĐÁNH GIÁ SAO (Góc phải ảnh) --- */}
            <div className="absolute bottom-0 right-0 bg-white shadow-md border border-slate-100 rounded-full px-2 py-0.5 flex items-center gap-1">
                {/* Icon ngôi sao vàng */}
                <Star size={12} className={`text-yellow-400 ${ratingValue > 0 ? 'fill-yellow-400' : ''}`} />
                <span className="text-xs font-bold text-slate-700">
                  {displayRating}
                </span>
            </div>
          </div>
        </div>

        {/* === PHẦN 2: NỘI DUNG === */}
        <div className="p-5 flex-1 flex flex-col text-center">
          
          {/* Badge Chuyên khoa */}
          <div className="mb-2">
            <span className="inline-block px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-semibold tracking-wide uppercase">
              {specText}
            </span>
          </div>

          {/* Tên Bác sĩ */}
          <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-2 group-hover:text-sky-600 transition-colors">
            Bs. {fullName || "Bác sĩ"}
          </h3>
          
          {/* Lượt khám (Mockup hoặc lấy từ API nếu sau này có) */}
          <div className="flex justify-center items-center gap-4 text-xs text-slate-500 mb-4 mt-1">
             <div className="flex items-center gap-1">
                <Users size={12} />
                <span>{visits ?? 0} Lượt khám</span>
             </div>
             {/* Thêm hiển thị sao dạng text phụ ở đây nếu muốn */}
             {ratingValue > 0 && (
               <div className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-yellow-600 font-medium">{ratingValue} Sao</span>
               </div>
             )}
          </div>

          <div className="w-16 h-[1px] bg-slate-100 mx-auto my-auto"></div>

          {/* Giá khám */}
          <div className="mt-4 flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-100">
             <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
                <Ticket size={14} className="text-sky-500" />
                <span>Phí tư vấn</span>
             </div>
             <span className="text-sm font-bold text-sky-700">
                {formatVND(consultation_fee)}
             </span>
          </div>
        </div>

        {/* === PHẦN 3: BUTTON === */}
        <div className="px-5 pb-5">
          <button className="w-full py-2.5 rounded-xl bg-sky-500 text-white font-medium text-sm shadow-lg shadow-sky-500/20 hover:bg-sky-600 active:scale-95 transition-all flex items-center justify-center gap-2">
            Đặt lịch ngay <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </Link>
  );
}

// =================== SECTION CONTAINER ===================
export default function DoctorsFavorite({
  title = "Bác sĩ nổi bật tuần qua",
  doctors: doctorsProp,
}) {
  const [doctors, setDoctors] = useState(doctorsProp || []);
  const [loading, setLoading] = useState(!doctorsProp);
  const shouldFetch = !doctorsProp;

  useEffect(() => {
    if (!shouldFetch) return;

    let cancelled = false;
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await doctorService.getAllDoctors();
        // Xử lý dữ liệu trả về
        const list = res.data?.doctors || res.doctors || res.data || [];
        
        if (!cancelled) {
          setDoctors(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        toastError("Lỗi tải danh sách bác sĩ:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDoctors();
    return () => { cancelled = true; };
  }, [shouldFetch]);

  // Lấy tối đa 4 bác sĩ
  const displayDoctors = doctors.slice(0, 4);

  return (
    <section className="bg-slate-50 py-16 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div className="text-center md:text-left mx-auto md:mx-0">
             <h2 className="text-3xl font-bold text-slate-800 mb-2">{title}</h2>
             <p className="text-slate-500">Các chuyên gia y tế hàng đầu được bệnh nhân tin tưởng.</p>
          </div>
          
          <Link 
            to="/doctors" 
            className="hidden md:flex items-center gap-1 text-sky-600 font-semibold hover:text-sky-700 hover:gap-2 transition-all"
          >
            Xem tất cả <ArrowRight size={18} />
          </Link>
        </div>

        {/* Loading / Empty / Grid */}
        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white h-[400px] rounded-2xl shadow-sm border border-slate-100 animate-pulse"></div>
              ))}
           </div>
        ) : doctors.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
             <p className="text-slate-500">Chưa có thông tin bác sĩ nào.</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch">
             {displayDoctors.map((d) => (
               <DoctorCard key={d._id} doc={d} />
             ))}
           </div>
        )}

        {/* Mobile View More */}
        <div className="mt-10 text-center md:hidden">
            <Link 
              to="/doctors" 
              className="inline-flex px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium shadow-sm hover:bg-slate-50 transition-colors"
            >
              Xem tất cả bác sĩ
            </Link>
        </div>

      </div>
    </section>
  );
}