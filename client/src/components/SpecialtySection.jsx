// src/components/SpecialtySection.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toastError } from "../utils/toast";
import axios from "axios";
import { ChevronDown, ChevronUp } from "lucide-react"; // Import thêm icon cho nút
import "../index.css";

const API_URL = "http://localhost:3000/api/specialties";

const resolveSpecialtyImage = (thumbnail) =>
  thumbnail || "https://via.placeholder.com/110x110.png?text=Specialty";

// =================== 1 CARD CHUYÊN KHOA (GIỮ NGUYÊN GIAO DIỆN) ===================
function SpecialtyCard({ spec }) {
  const { _id, id, name, thumbnail, imageUrl } = spec || {};

  const imgSrc = resolveSpecialtyImage(thumbnail || imageUrl);
  const specialtyId = _id || id;
  
  const linkTo = specialtyId
    ? `/doctors?specialtyId=${specialtyId}`
    : "/doctors";

  return (
    <Link to={linkTo} className="col-span-1 block">
      <div className="w-[110px] h-auto justify-self-center mx-auto">
        <img
          src={imgSrc}
          alt={name || "Chuyên khoa"}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
        <h3 className="font-roboto text-xl color-title text-center mt-2">
          {name || "Chuyên khoa"}
        </h3>
      </div>
    </Link>
  );
}

// =================== SECTION DANH SÁCH CHUYÊN KHOA ===================
export default function SpecialtySection({
  title = "Chuyên khoa",
  specialties: specialtiesProp,
}) {
  const [specialties, setSpecialties] = useState(specialtiesProp || []);
  
  // 1. Thêm state quản lý số lượng hiển thị, mặc định 12
  const [visibleCount, setVisibleCount] = useState(12);
  
  const shouldFetch = !specialtiesProp;

  useEffect(() => {
    if (!shouldFetch) return;
    let cancelled = false;

    (async () => {
      try {
        // 2. Sửa API call: Thêm limit: 100 để lấy đủ danh sách về client xử lý
        const res = await axios.get(API_URL, {
          params: { limit: 100 }, 
          headers: { "Content-Type": "application/json" },
        });

        const list =
          res.data?.specialties ||
          res.data?.data ||
          (Array.isArray(res.data) ? res.data : []);

        if (!cancelled) {
          setSpecialties(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        toastError("Fetch specialties failed:", e);
        if (!cancelled) setSpecialties([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shouldFetch]);

  // 3. Logic xử lý nút bấm
  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 4); // Thêm 4 khoa tiếp theo
  };

  const handleCollapse = () => {
    setVisibleCount(12); // Reset về 12
  };

  const totalItems = specialties.length;
  // Kiểm tra xem đã hiển thị hết danh sách chưa
  const isExpandedAll = visibleCount >= totalItems;

  return (
    <section className="container py-8">
      <h2 className="lg:text-4xl text-2xl font-bold py-4 mb-8 color-title text-center">
        {title}
      </h2>

      <div className="grid lg:grid-cols-6 md:grid-cols-3 grid-cols-2 gap-8">
        {specialties.length === 0 ? (
          <p className="text-center col-span-full text-slate-600">
            Chưa có dữ liệu chuyên khoa.
          </p>
        ) : (
          // 4. Chỉ render số lượng visibleCount
          specialties.slice(0, visibleCount).map((s) => (
            <SpecialtyCard
              key={s._id || s.id || s.slug || Math.random()}
              spec={s}
            />
          ))
        )}
      </div>

      {/* 5. Khu vực nút Xem thêm / Thu lại (Chỉ hiện khi tổng số > 12) */}
      {totalItems > 12 && (
        <div className="mt-8 text-center">
          {!isExpandedAll ? (
            <button
              onClick={handleShowMore}
              className="inline-flex items-center gap-1 text-sky-600 font-bold hover:text-sky-800 transition-colors"
            >
              Xem thêm <ChevronDown size={20} />
            </button>
          ) : (
            <button
              onClick={handleCollapse}
              className="inline-flex items-center gap-1 text-gray-500 font-bold hover:text-gray-700 transition-colors"
            >
              Thu gọn <ChevronUp size={20} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}