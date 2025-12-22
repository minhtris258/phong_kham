// src/components/patient/DoctorRatings.jsx
import React, { useEffect, useState } from "react";
import ratingService from "../../services/RatingService"; //
import { Star, ChevronDown } from "lucide-react";

export default function DoctorRatings({ doctorId }) {
  const [data, setData] = useState({ average: 0, count: 0, ratings: [] });
  const [loading, setLoading] = useState(true);
  
  // 1. Khởi tạo state để quản lý số lượng đánh giá hiển thị
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        // Sử dụng service để lấy đánh giá theo ID bác sĩ
        const res = await ratingService.getRatingsByDoctor(doctorId);
        setData(res.data);
      } catch (err) {
        console.error("Lỗi khi tải đánh giá:", err);
      } finally {
        setLoading(false);
      }
    };
    if (doctorId) fetchRatings();
  }, [doctorId]);

  // 2. Hàm xử lý khi nhấn "Xem thêm"
  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 5); // Mỗi lần nhấn hiện thêm 5 cái
  };

  if (loading) return <div className="p-4 text-gray-500">Đang tải đánh giá...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-xl font-bold text-slate-800">Đánh giá từ bệnh nhân</h3>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full">
          <span className="text-2xl font-bold text-yellow-500">{data.average}</span>
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} fill={i < Math.round(data.average) ? "currentColor" : "none"} />
            ))}
          </div>
          <span className="text-slate-400 text-sm">({data.count} đánh giá)</span>
        </div>
      </div>

      <div className="space-y-6">
        {data.ratings.length === 0 ? (
          <p className="text-slate-500 italic text-center py-4">Chưa có đánh giá nào cho bác sĩ này.</p>
        ) : (
          <>
            {/* 3. Chỉ render số lượng phần tử dựa trên visibleCount */}
            {data.ratings.slice(0, visibleCount).map((item) => (
              <div key={item._id} className="border-b border-slate-50 pb-4 last:border-0 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-slate-700">
                    {item.patient_id?.fullName || "Bệnh nhân"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="flex text-yellow-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < item.star ? "currentColor" : "none"} />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {item.comment ? `"${item.comment}"` : "Không có nhận xét."}
                </p>
              </div>
            ))}

            {/* 4. Nút xem thêm: Chỉ hiện nếu tổng số lượng > số lượng đang hiển thị */}
            {data.ratings.length > visibleCount && (
              <div className="text-center pt-4">
                <button
                  onClick={handleShowMore}
                  className="inline-flex items-center gap-2 text-sky-600 font-semibold hover:text-sky-700 transition-colors py-2 px-4 border border-sky-100 rounded-lg hover:bg-sky-50"
                >
                  Xem thêm đánh giá ({data.ratings.length - visibleCount})
                  <ChevronDown size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}