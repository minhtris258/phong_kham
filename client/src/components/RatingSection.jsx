// src/components/RatingSection.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../index.css";

// 👉 ĐỔI URL NÀY THEO API CỦA BẠN
const API_URL = "http://localhost:3000/api/ratings/me";

// Avatar fallback
const resolveAvatar = (avatar) =>
  avatar || "https://via.placeholder.com/48x48.png?text=U";

// ================= CARD CẢM NHẬN =================
function TestimonialCard({ item }) {
  // Tùy tên field trong API của bạn, mình try nhiều key:
  const content =
    item.content ||
    item.comment ||
    item.message ||
    item.feedback ||
    "Chưa có nội dung.";

  const name =
    item.name || item.customer_name || item.fullName || "Khách hàng ẩn danh";

  const avatar = resolveAvatar(
    item.avatar || item.avatar_url || item.customer_avatar
  );

  return (
    <div className="bg-white rounded-3xl shadow-lg px-8 py-10 max-w-[420px] h-full flex flex-col justify-between">
      {/* Icon quote */}
      <div className="flex justify-center mb-4 text-slate-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 512 512"
        >
          <path
            fill="currentColor"
            d="M464 256c0-88.4-71.6-160-160-160c-13.2 0-26 1.6-38.4 4.6C288 63.1 247.9 32 200 32C146.1 32 102.2 66.5 88.1 116.3C38.2 130.4 4 174.2 4 228c0 61.9 50.1 112 112 112h48v96c0 26.5 21.5 48 48 48h224c44.2 0 80-35.8 80-80V304c0-44.2-35.8-80-80-80h-16z"
          />
        </svg>
      </div>

      {/* Nội dung */}
      <p className="text-[15px] leading-relaxed text-slate-700 text-center mb-8">
        {content}
      </p>

      {/* Footer: avatar + tên */}
      <div className="mt-auto pt-4 border-t border-slate-200 flex items-center gap-3">
        <img
          src={avatar}
          alt={name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="font-roboto font-semibold text-slate-800">{name}</span>
      </div>
    </div>
  );
}

// ================= SECTION CẢM NHẬN =================
export default function CustomerTestimonials({
  title = "CẢM NHẬN TỪ KHÁCH HÀNG",
  testimonials: testimonialsProp,
}) {
  const [testimonials, setTestimonials] = useState(testimonialsProp || []);
  const [loading, setLoading] = useState(!testimonialsProp);
  const [error, setError] = useState("");
  const shouldFetch = !testimonialsProp; // có props thì không gọi API nữa

  useEffect(() => {
    if (!shouldFetch) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(API_URL, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Tuỳ backend bạn trả:
        // - { testimonials: [...] }
        // - { data: [...] }
        // - [ ... ]
        const list =
          res.data?.testimonials ||
          res.data?.data ||
          (Array.isArray(res.data) ? res.data : []);

        if (!cancelled) {
          setTestimonials(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        console.error("Fetch testimonials failed:", e);
        if (!cancelled) {
          setError("Không tải được danh sách cảm nhận.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shouldFetch]);

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto max-w-[1232px] px-4 relative">
        {/* Tiêu đề */}
        <h2 className="text-center font-bold color-title lg:text-4xl text-2xl mb-10">
          {title}
        </h2>

        {loading ? (
          <p className="text-center text-slate-600">Đang tải cảm nhận...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : testimonials.length === 0 ? (
          <p className="text-center text-slate-600">
            Chưa có cảm nhận nào của khách hàng.
          </p>
        ) : (
          <div className="grid lg:grid-cols-3 md:grid-cols-3 grid-cols-1 gap-6 lg:gap-8 items-stretch">
            {testimonials.map((item) => (
              <TestimonialCard
                key={item._id || item.id || item.uuid || Math.random()}
                item={item}
              />
            ))}
          </div>
        )}

        {/* Nút next bên phải (UI giống hình, chưa làm slider) */}
        <button
          type="button"
          className="hidden lg:flex absolute top-1/2 -translate-y-1/2 -right-4 w-10 h-10 rounded-full bg-white shadow-md items-center justify-center hover:bg-slate-50 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20"
            width="20"
            viewBox="0 0 320 512"
          >
            <path
              fill="#0a2342"
              d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
