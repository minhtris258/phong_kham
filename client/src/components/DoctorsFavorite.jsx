// src/components/DoctorsFavorite.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Banknote, CalendarCheck, ArrowRight } from "lucide-react";
import doctorService from "../services/DoctorService";

// Format tiền tệ
const formatVND = (value) => {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  return Number.isNaN(n) ? "—" : n.toLocaleString("vi-VN") + "đ";
};

export default function DoctorsFavorite({ title = "Bác Sĩ Nổi Bật Tuần Này" }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopDoctors = async () => {
      try {
        setLoading(true);
        // Gọi API lấy tất cả bác sĩ
        const res = await doctorService.getAllDoctors({ limit: 100 }); 
        
        // Xử lý dữ liệu trả về linh hoạt
        const list = res.data?.doctors || res.doctors || res.data || [];

        if (Array.isArray(list)) {
          // Sắp xếp theo Rating giảm dần và lấy 4 người cao nhất
          const top4 = list
            .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
            .slice(0, 4);
          setDoctors(top4);
        }
      } catch (err) {
        console.error("Lỗi tải bác sĩ nổi bật:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopDoctors();
  }, []);

  return (
    <section className="w-full bg-white py-12 md:py-16 border-b border-slate-100">
      <div className="container mx-auto px-4">
        {/* === HEADER === */}
        <div className="md:flex md:items-end md:justify-between gap-4 mb-8">
          <div className="text-center md:text-left">
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-sky-600 font-bold">
              ĐƯỢC ĐÁNH GIÁ CAO
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
              {title}
            </h2>
            <p className="text-sm md:text-base text-slate-500 mt-2 max-w-2xl">
              Danh sách các bác sĩ nhận được nhiều phản hồi tích cực nhất từ bệnh nhân trong tuần qua.
            </p>
          </div>

          {/* Nút xem thêm (Desktop) */}
          <div className="hidden md:block">
             <Link
                to="/doctors"
                className="inline-flex items-center gap-2 text-sky-600 font-bold hover:text-sky-800 transition-colors"
              >
                Xem tất cả <ArrowRight size={20} />
              </Link>
          </div>
        </div>

        {/* === GRID DANH SÁCH BÁC SĨ === */}
        {loading ? (
          // Skeleton Loading
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm h-80 animate-pulse">
                 <div className="flex gap-4 mb-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                       <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                       <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                 </div>
                 <div className="space-y-3 mt-6">
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                 </div>
                 <div className="mt-auto pt-6">
                    <div className="h-10 bg-slate-200 rounded-xl"></div>
                 </div>
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-10 text-slate-500">Chưa có dữ liệu bác sĩ nổi bật.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {doctors.map((doctor) => {
              const {
                _id,
                id,
                fullName,
                thumbnail,
                specialty_id,
                consultation_fee,
                averageRating,
                address,
              } = doctor;

              const doctorId = _id || id;
              const rating = averageRating ? Number(averageRating).toFixed(1) : "0";

              return (
                <div
                  key={doctorId}
                  className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Phần trên: Ảnh + Tên + Chuyên khoa */}
                  <div className="flex gap-4 items-start mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-slate-100 shadow-inner">
                      <img
                        src={thumbnail || "https://ui-avatars.com/api/?name=Doctor&background=random"}
                        alt={fullName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    <div className="min-w-0">
                      <span className="inline-block text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 mb-1 truncate max-w-full">
                        {specialty_id?.name || "Đa khoa"}
                      </span>
                      <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-sky-600 transition-colors text-base">
                        Bs. {fullName}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                        <Star size={12} className="fill-amber-500" />
                        <span className="font-bold text-slate-700">{rating}</span>
                        <span className="text-slate-400 font-normal">({doctor.visits || 0} lượt khám)</span>
                      </div>
                    </div>
                  </div>

                  {/* Phần giữa: Địa chỉ + Giá */}
                  <div className="space-y-2 mb-5 text-sm text-slate-500 flex-1 border-t border-dashed border-slate-100 pt-3">
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" />
                      <span className="line-clamp-2 text-xs">
                        {address || "Chưa cập nhật địa chỉ"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Banknote size={14} className="shrink-0 text-slate-400" />
                      <span className="font-bold text-sky-700">
                        {formatVND(consultation_fee)}
                      </span>
                    </div>
                  </div>

                  {/* Nút Đặt lịch */}
                  <Link
                    to={`/doctors/${doctorId}`}
                    className="mt-auto w-full py-2.5 rounded-xl bg-slate-50 text-slate-600 text-sm font-bold text-center hover:bg-sky-600 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                  >
                    <CalendarCheck size={16} /> Đặt lịch ngay
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Nút xem thêm (Mobile) */}
        <div className="mt-8 text-center md:hidden">
          <Link
            to="/doctors"
            className="inline-block px-6 py-3 bg-sky-50 text-sky-600 font-bold rounded-full hover:bg-sky-100 transition"
          >
            Xem tất cả bác sĩ
          </Link>
        </div>
      </div>
    </section>
  );
}