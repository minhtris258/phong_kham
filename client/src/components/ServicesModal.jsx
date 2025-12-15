import React from "react";
import Modal from "./Modal";

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

export default function ServicesModal({ isOpen, onClose, service }) {
  if (!isOpen || !service) return null;

  const fee = service.price || service.fee || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service.name || "Chi tiết dịch vụ"}
      maxWidth="2xl"
    >
      <div className="flex flex-col gap-4">
        {/* ẢNH FULL TRÊN CÙNG */}
        <div className="w-full h-60 md:h-72 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          <img
            src={resolveServiceImage(service)}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* NỘI DUNG BÊN DƯỚI */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xl font-bold text-[#0a2463]">{service.name}</h3>

          {service.code && (
            <p className="text-sm text-slate-500">
              Mã dịch vụ: <span className="font-medium">{service.code}</span>
            </p>
          )}

          {/* GIÁ */}
          <p className="text-lg font-semibold text-[#0a2463]">
            Giá: {formatPrice(fee)}
          </p>

          {/* MÔ TẢ */}
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {service.description || "Chưa có mô tả chi tiết cho dịch vụ này."}
          </div>
        </div>
      </div>
    </Modal>
  );
}
