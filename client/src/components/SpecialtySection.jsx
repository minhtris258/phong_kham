// src/components/SpecialtySection.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// 1. Giữ nguyên import service
import specialtyService from "../services/SpecialtyService";
import { toastError } from "../utils/toast";
import { ChevronDown, ChevronUp } from "lucide-react"; 
import "../index.css";

// Xóa bỏ API_URL và axios vì đã có trong service

const resolveSpecialtyImage = (thumbnail) =>
  thumbnail || "https://via.placeholder.com/110x110.png?text=Specialty";

// =================== 1. CARD CHUYÊN KHOA (GIỮ NGUYÊN) ===================
function SpecialtyCard({ spec }) {
  const { _id, id, name, thumbnail, imageUrl } = spec || {};
  const imgSrc = resolveSpecialtyImage(thumbnail || imageUrl);
  const specialtyId = _id || id;

  const linkTo = specialtyId ? `/doctors?specialtyId=${specialtyId}` : "/doctors";

  return (
    <Link to={linkTo} className="col-span-1 block">
      <div className="w-[110px] h-auto justify-self-center mx-auto text-center">
        <img
          src={imgSrc}
          alt={name || "Chuyên khoa"}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
        <h3 className="font-roboto text-xl color-title mt-2">
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
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const updateCount = () => {
      setVisibleCount(window.innerWidth < 768 ? 6 : 12);
    };
    updateCount();
  }, []);

  const shouldFetch = !specialtiesProp;

  useEffect(() => {
    if (!shouldFetch) return;
    let cancelled = false;

    (async () => {
      try {
        // 2. Thay thế axios.get bằng specialtyService
        const res = await specialtyService.getAllSpecialties({ limit: 100 });

        // Dữ liệu từ axiosClient trả về thường nằm trong res.data
        const rawData = res.data;
        
        // Logic trích xuất mảng linh hoạt
        const list =
          rawData?.specialties ||
          rawData?.data ||
          (Array.isArray(rawData) ? rawData : []);

        if (!cancelled) {
          setSpecialties(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        toastError("Lỗi khi tải chuyên khoa:", e);
        if (!cancelled) setSpecialties([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shouldFetch]);

  const handleShowMore = () => setVisibleCount((prev) => prev + 6);
  const handleCollapse = () => setVisibleCount(window.innerWidth < 768 ? 6 : 12);

  const totalItems = specialties.length;
  const isExpandedAll = visibleCount >= totalItems;

  return (
    <section className="container py-8 lg:px-0 px-4">
      <h2 className="lg:text-4xl text-2xl font-bold py-4 mb-8 color-title text-center">
        {title}
      </h2>

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