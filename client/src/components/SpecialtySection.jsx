// src/components/SpecialtySection.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toastError } from "../utils/toast";
import axios from "axios";
import { ChevronDown, ChevronUp } from "lucide-react"; 
import "../index.css";

const API_URL = "http://localhost:3000/api/specialties";

const resolveSpecialtyImage = (thumbnail) =>
  thumbnail || "https://via.placeholder.com/110x110.png?text=Specialty";

// =================== 1. CARD CHUYÊN KHOA (GIỮ NGUYÊN 100% GIAO DIỆN CŨ) ===================
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

// =================== 2. SECTION DANH SÁCH ===================
export default function SpecialtySection({
  title = "Chuyên khoa",
  specialties: specialtiesProp,
}) {
  const [specialties, setSpecialties] = useState(specialtiesProp || []);

  // --- LOGIC MỚI: Tự động set số lượng hiển thị theo màn hình ---
  // Mặc định là 12, nhưng sẽ tính toán lại khi component mount
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const updateCount = () => {
      // Nếu màn hình < 768px (Mobile) -> Hiện 6
      if (window.innerWidth < 768) {
        setVisibleCount(6);
      } else {
        // Tablet/Desktop -> Hiện 12
        setVisibleCount(12);
      }
    };

    // Chạy 1 lần khi mount
    updateCount();

    // (Tuỳ chọn) Lắng nghe resize nếu muốn responsive real-time
    // window.addEventListener("resize", updateCount);
    // return () => window.removeEventListener("resize", updateCount);
  }, []);
  // -------------------------------------------------------------

  const shouldFetch = !specialtiesProp;

  useEffect(() => {
    if (!shouldFetch) return;
    let cancelled = false;

    (async () => {
      try {
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

  // Logic nút bấm: Tăng thêm 6 item mỗi lần bấm (để chia hết cho 2 và 3 cột đều đẹp)
  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 6); 
  };

  const handleCollapse = () => {
    // Khi thu gọn cũng kiểm tra lại màn hình để về đúng số lượng mặc định
    setVisibleCount(window.innerWidth < 768 ? 6 : 12);
  };

  const totalItems = specialties.length;
  const isExpandedAll = visibleCount >= totalItems;

  return (
    <section className="container py-8 lg:px-0 px-4">
      <h2 className="lg:text-4xl text-2xl font-bold py-4 mb-8 color-title text-center">
        {title}
      </h2>

      {/* GRID SYSTEM:
         - Mobile (grid-cols-2): 2 cột để phù hợp kích thước 110px của card.
         - Desktop (grid-cols-6): 6 cột như cũ.
         - Gap: Mobile gap-4 (nhỏ hơn chút cho đỡ thưa), Desktop gap-8.
      */}
      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-8">
        {specialties.length === 0 ? (
          <p className="text-center col-span-full text-slate-600">
            Chưa có dữ liệu chuyên khoa.
          </p>
        ) : (
          specialties
            .slice(0, visibleCount)
            .map((s) => (
              <SpecialtyCard
                key={s._id || s.id || s.slug || Math.random()}
                spec={s}
              />
            ))
        )}
      </div>

      {/* Nút Xem thêm */}
      {totalItems > (window.innerWidth < 768 ? 6 : 12) && (
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