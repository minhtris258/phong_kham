import React, { useEffect, useState, useRef } from "react";
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo,
} from "../utils/toast";
import partnerService from "../services/PartnersService";

const PartnersSection = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const trackRef = useRef(null);

  // Gọi API thông qua service
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await partnerService.listPartners();

        const items = Array.isArray(res.data) ? res.data : res.data.data || [];
        setPartners(items);
      } catch (err) {
        toastError("Lỗi load partners:", err);
        setError("Không thể tải danh sách đối tác");
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const handlePrev = () => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const handleNext = () => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <section className="container py-16 mt-26">
      <h2 className="lg:text-4xl text-2xl font-bold py-4 mb-8 mt-16 color-title text-center">
        Được tin tưởng hợp tác và đồng hành
      </h2>

      {/* Có thể hiển thị loading/error nhẹ nhàng */}
      {loading && (
        <p className="text-center text-sm text-gray-500 mb-4">
          Đang tải danh sách đối tác...
        </p>
      )}
      {error && (
        <p className="text-center text-sm text-red-500 mb-4">{error}</p>
      )}

      <div className="relative">
        {/* Nút prev */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex
                 h-10 w-10 items-center justify-center rounded-full bg-white shadow ring-1 ring-slate-200"
        >
          ‹
        </button>

        {/* Thanh trượt */}
        <div
          id="partners-track"
          ref={trackRef}
          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory
              lg:[scrollbar-width:none] lg:[-ms-overflow-style:none] gap-2 py-2"
        >
          <style>{`
            #partners-track::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {partners.map((partner, index) => (
            <div
              key={partner.id || partner._id || index}
              className="shrink-0 basis-1/2 sm:basis-1/3 lg:basis-1/6 snap-start w-[50%]"
            >
              <div className="flex items-center justify-center bg-white box-shadow h-full py-4">
                <img
                  className="h-20 w-auto object-cover"
                  src={
                    partner.logo ||
                    partner.image ||
                    partner.thumbnail ||
                    partner.image_url
                  }
                  alt={partner.name || partner.title || `partner-${index + 1}`}
                />
              </div>
            </div>
          ))}

          {/* Nếu API trả về rỗng */}
          {!loading && partners.length === 0 && !error && (
            <div className="w-full text-center text-gray-500 text-sm py-4">
              Chưa có đối tác nào.
            </div>
          )}
        </div>

        {/* Nút next */}
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-[-2rem] top-1/2 -translate-y-1/2 z-10 hidden lg:flex
                 h-10 w-10 items-center justify-center rounded-full bg-white shadow ring-1 ring-slate-200"
        >
          ›
        </button>
      </div>
    </section>
  );
};

export default PartnersSection;
