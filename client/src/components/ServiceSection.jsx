// src/components/ServiceSection.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import medicalServiceService from "../services/medicalServiceService";
import ServicesModal from "./ServicesModal";

// --- Dùng chung logic với file modal ---
const formatPrice = (value) => {
  if (value === null || value === undefined || value === "") return "Liên hệ";
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return n.toLocaleString("vi-VN") + "đ";
};

const resolveServiceImage = (service) =>
  service?.thumbnail ||
  service?.image ||
  "https://via.placeholder.com/800x400.png?text=Service";

// ======================== COMPONENT ========================
export default function ServiceSection() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await medicalServiceService.getAllServices();

        let list = [];
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          list = res.data.data;
        }

        setServices(list || []);
      } catch (err) {
        console.error("Lỗi load dịch vụ:", err);
        setError("Không tải được danh sách dịch vụ.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const openModal = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedService(null);
    setIsModalOpen(false);
  };

  // Tách 1 dịch vụ nổi bật + 4 dịch vụ còn lại
  const featured = services[0];
  const others = services.slice(1, 5); // tối đa 4 dịch vụ bên phải
  const emptySlots = Math.max(0, 4 - others.length);

  return (
    <section className="container mx-auto px-4 py-10">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold color-title ">
          DỊCH VỤ Y TẾ
        </h2>

        <Link
          to="/services"
          className="text-base font-semibold color-title hover:underline flex items-center gap-1"
        >
          Xem tất cả
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {/* GRID GIỐNG ẢNH: 1 ô to bên trái + 4 ô bên phải */}
      <div className="grid gap-6 lg:grid-cols-4 auto-rows-[1fr]">
        {/* Ô to bên trái (dịch vụ nổi bật) */}
        {featured && (
          <button
            type="button"
            onClick={() => openModal(featured)}
            className="lg:col-span-2 lg:row-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden text-left flex flex-col"
          >
            <div className="relative">
              <div className="w-full h-56 md:h-72 overflow-hidden">
                <img
                  src={resolveServiceImage(featured)}
                  alt={featured.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="absolute top-4 left-4 inline-flex items-center rounded-md bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow">
                NỔI BẬT
              </span>
            </div>

            <div className="flex-1 p-5 md:p-6 flex flex-col">
              {/* Có thể hiện ngày tạo nếu API có */}
              {featured.createdAt && (
                <p className="text-xs md:text-sm text-slate-500 mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-slate-300 text-[10px]">
                    ⏱
                  </span>
                  {new Date(featured.createdAt).toLocaleDateString("vi-VN")}
                </p>
              )}

              <h3 className="text-xl md:text-3xl font-bold color-title mb-2 line-clamp-2">
                {featured.name}
              </h3>

              <p className="text-base text-slate-600 mb-3 line-clamp-8">
                {featured.shortDescription ||
                  featured.description ||
                  "Dịch vụ y tế chất lượng cao dành cho mọi người."}
              </p>

              <p className="text-base md:text-2xl font-semibold color-title">
                Giá từ: {formatPrice(featured.price || featured.fee)}
              </p>

              <span className="mt-4 inline-flex items-center gap-1 text-base font-medium text-[#0a2463]">
                Xem chi tiết
                <span aria-hidden="true">→</span>
              </span>
            </div>
          </button>
        )}

        {/* 4 ô nhỏ bên phải */}
        {others.map((sv) => (
          <button
            type="button"
            key={sv._id || sv.id}
            onClick={() => openModal(sv)}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden text-left flex flex-col"
          >
            <div className="w-full h-40 md:h-40 overflow-hidden">
              <img
                src={resolveServiceImage(sv)}
                alt={sv.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 p-4 flex flex-col">
              {/* Tag loại dịch vụ nếu có */}
              {sv.category && (
                <span className="inline-flex px-2 py-1 rounded-full bg-blue-50 text-[11px] font-semibold text-blue-600 mb-2">
                  {sv.category}
                </span>
              )}

              <h4 className="text-3xl md:text-base font-bold text-[#0a2463] mb-1 line-clamp-2">
                {sv.name}
              </h4>

              <p className="text-base md:text-sm text-slate-600 mb-2 md:line-clamp-2 line-clamp-10 ">
                {sv.shortDescription ||
                  sv.description ||
                  "Dịch vụ sẽ được cập nhật chi tiết."}
              </p>

              <p className="md:text-sm text-2xl font-semibold text-[#0a2463]">
                {formatPrice(sv.price || sv.fee)}
              </p>

              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#0a2463]">
                Xem chi tiết
                <span aria-hidden="true">→</span>
              </span>
            </div>
          </button>
        ))}

        {/* Các ô trống: "Sắp có dịch vụ mới" */}
        {Array.from({ length: emptySlots }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 text-sm md:text-base"
          >
            Sắp có dịch vụ mới
          </div>
        ))}
      </div>

      {/* Modal chi tiết dịch vụ */}
      <ServicesModal
        isOpen={isModalOpen}
        onClose={closeModal}
        service={selectedService}
      />
    </section>
  );
}
