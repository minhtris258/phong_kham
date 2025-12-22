// src/components/DoctorsFavorite.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  Banknote,
  CalendarCheck,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import doctorService from "../services/doctorService.js";

// Format tiền tệ
const formatVND = (value) => {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  return Number.isNaN(n) ? "—" : n.toLocaleString("vi-VN") + "đ";
};

export default function DoctorsFavorite({ title = "Bác Sĩ Nổi Bật Tuần Này" }) {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopDoctors = async () => {
      try {
        setLoading(true);
        // Gọi API lấy bác sĩ (lấy nhiều để sort)
        const res = await doctorService.getAllDoctors({ limit: 100 });
        const list = res.data?.doctors || res.doctors || res.data || [];

        if (Array.isArray(list)) {
          // Sắp xếp Rating giảm dần -> Lấy top 4
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

  const handleCardClick = (id) => {
    navigate(`/doctors/${id}`);
  };

  return (
    <section className="w-full bg-white py-8 md:py-16 border-b border-slate-100">
      <div className="container mx-auto px-4">
        {/* === HEADER === */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 md:mb-8">
          <div className="text-center md:text-left">
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-sky-600 font-bold">
              ĐƯỢC ĐÁNH GIÁ CAO
            </p>
            <h2 className="text-xl md:text-3xl font-bold color-title mt-1">
              {title}
            </h2>
            <p className="text-sm md:text-base text-slate-500 mt-2 max-w-2xl mx-auto md:mx-0">
              Các bác sĩ nhận được nhiều phản hồi tích cực nhất tuần qua.
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
          <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm h-64 md:h-80 animate-pulse"
              >
                {/* Skeleton UI tương ứng */}
                <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto md:mx-0 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto md:mx-0 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto md:mx-0"></div>
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            Chưa có dữ liệu bác sĩ nổi bật.
          </div>
        ) : (
          /* GRID: Mobile 2 cột, Desktop 4 cột */
          <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
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
                career_start_year,
              } = doctor;

              const doctorId = _id || id;
              const rating = averageRating
                ? Number(averageRating).toFixed(1)
                : "0";
              const experienceYears = career_start_year
                ? new Date().getFullYear() - new Date(career_start_year)
                : "—";

              return (
                <div
                  key={doctorId}
                  onClick={() => handleCardClick(doctorId)}
                  // Card Wrapper: Mobile p-3, Desktop p-5
                  className="group bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer"
                >
                  {/* Header Card: Mobile (Cột/Giữa), Desktop (Ngang/Trái) */}
                  <div className="flex flex-col items-center md:flex-row md:items-start gap-2 md:gap-4 mb-2 md:mb-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden shrink-0 border border-slate-100 shadow-inner">
                      <img
                        src={
                          thumbnail ||
                          "https://ui-avatars.com/api/?name=Doctor&background=random"
                        }
                        alt={fullName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Info Header */}
                    <div className="min-w-0 text-center md:text-left w-full">
                      <span className="inline-block text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 mb-1 truncate max-w-full">
                        {specialty_id?.name || "Đa khoa"}
                      </span>
                      <h3 className="font-bold text-sm md:text-base text-slate-800 line-clamp-1 group-hover:text-sky-600 transition-colors">
                        Bs. {fullName}
                      </h3>
                      {/* Rating: Căn giữa mobile, trái desktop */}
                      <div className="flex items-center justify-center md:justify-start gap-1 text-xs text-amber-500 mt-1">
                        <Star size={12} className="fill-amber-500" />
                        <span className="font-bold text-slate-700">
                          {rating}
                        </span>
                        <span className="text-slate-400 font-normal hidden md:inline">
                          ({doctor.visits || 0} lượt)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Info: Mobile chữ nhỏ hơn, căn giữa */}
                  <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-5 text-xs md:text-sm text-slate-500 flex-1 border-t border-dashed border-slate-100 pt-2 md:pt-3">
                    {/* Kinh nghiệm */}
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Briefcase
                        size={14}
                        className="shrink-0 text-slate-400 hidden md:block"
                      />
                      <span className="text-[11px] md:text-xs">
                        {experienceYears !== "—"
                          ? `${experienceYears} năm KN`
                          : "Chưa cập nhật KN"}
                      </span>
                    </div>

                    {/* Địa chỉ */}
                    <div className="flex items-start gap-2 justify-center md:justify-start">
                      <MapPin
                        size={14}
                        className="mt-0.5 shrink-0 text-slate-400 hidden md:block"
                      />
                      <span className="line-clamp-2 text-[11px] md:text-xs text-center md:text-left">
                        {address || "Chưa cập nhật địa chỉ"}
                      </span>
                    </div>

                    {/* Giá tiền */}
                    <div className="flex items-center gap-2 justify-center md:justify-start pt-1 md:pt-0">
                      <Banknote
                        size={14}
                        className="shrink-0 text-slate-400 hidden md:block"
                      />
                      <span className="font-bold text-sky-700 text-xs md:text-sm">
                        {formatVND(consultation_fee)}
                      </span>
                    </div>
                  </div>

                  {/* Footer Button */}
                  <div className="mt-auto w-full py-2 md:py-2.5 rounded-lg md:rounded-xl bg-slate-50 text-slate-600 text-xs md:text-sm font-bold text-center group-hover:bg-sky-500 group-hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-md">
                    <CalendarCheck size={14} className="md:w-4 md:h-4" />
                    <span className="hidden md:inline">Đặt lịch ngay</span>
                    <span className="md:hidden">Đặt ngay</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Nút xem thêm (Mobile Only) */}
        <div className="mt-6 text-center md:hidden">
          <Link
            to="/doctors"
            className="inline-block px-5 py-2.5 bg-sky-50 text-sky-600 font-bold rounded-full hover:bg-sky-100 transition text-sm shadow-sm"
          >
            Xem tất cả bác sĩ
          </Link>
        </div>
      </div>
    </section>
  );
}
