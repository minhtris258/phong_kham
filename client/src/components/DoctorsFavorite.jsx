// src/components/DoctorsFavorite.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Users, ArrowRight } from "lucide-react";
import doctorService from "../services/DoctorService";
import { toastError } from "../utils/toast";

const formatVND = (n) => (typeof n === "number" ? n.toLocaleString("vi-VN") + "đ" : "—");
const resolveImage = (img) => img || "https://ui-avatars.com/api/?name=BS&background=0ea5e9&color=fff&bold=true";

function DoctorItem({ doc }) {
  const { _id, fullName, thumbnail, consultation_fee, specialty_id, averageRating = 0, visits } = doc;
  const rating = averageRating > 0 ? averageRating.toFixed(1) : "Mới";

  return (
    <Link to={`/doctors/${_id}`} className="block group">
      <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-sky-50/70 transition-all duration-200 border border-transparent hover:border-sky-200">
        <div className="relative flex-shrink-0">
          <img
            src={resolveImage(thumbnail)}
            alt={fullName}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-lg"
            loading="lazy"
          />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full shadow-md px-2 py-0.5 flex items-center gap-1">
            <Star size={11} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold text-slate-700">{rating}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-1">
            Bs. {fullName}
          </h4>
          <p className="text-xs font-medium text-sky-600 mt-0.5">
            {specialty_id?.name || "Đa khoa"}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span className="font-semibold text-sky-700">{formatVND(consultation_fee)}</span>
            <span className="flex items-center gap-1">
              <Users size={12} />
              {visits || "Nhiều"} lượt
            </span>
          </div>
        </div>

        <ArrowRight size={18} className="text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}

export default function DoctorsFavorite({ title = "Bác sĩ nổi bật tuần này" }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      try {
        setLoading(true);
        const res = await doctorService.getAllDoctors();
        const list = res.data?.doctors || res.doctors || res.data || [];

        if (!cancelled && Array.isArray(list)) {
          // Sắp xếp giảm dần theo averageRating → lấy 5 người cao nhất
          const top5 = list
            .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
            .slice(0, 5);

          setDoctors(top5);
        }
      } catch (err) {
        !cancelled && toastError("Lỗi tải bác sĩ nổi bật");
      } finally {
        !cancelled && setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, []);

  return (
    <aside className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 text-white p-6 text-center">
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-sky-50 text-sm">Được bệnh nhân đánh giá cao nhất</p>
      </div>

      {/* Danh sách 5 bác sĩ */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-32"></div>
                  <div className="h-3 bg-slate-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <p className="text-center text-slate-500 py-10 text-sm">Chưa có dữ liệu bác sĩ</p>
        ) : (
          doctors.map((doc) => <DoctorItem key={doc._id} doc={doc} />)
        )}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-t from-slate-50 to-white border-t border-slate-200 p-5 text-center">
        <Link
          to="/doctors"
          className="inline-flex items-center gap-2 text-sky-600 font-bold hover:text-sky-700 hover:gap-3 transition-all"
        >
          Xem tất cả bác sĩ <ArrowRight size={18} />
        </Link>
      </div>
    </aside>
  );
}