// src/components/Hero.jsx
import React, { useEffect, useState } from "react";
import "../index.css";

import hero1 from "../assets/slider-03-a.jpg";
import hero2 from "../assets/slider-03-b.jpg";

const slides = [
  {
    id: 1,
    image: hero1,
    title: "KẾT NỐI NGƯỜI DÂN VỚI CƠ SỞ Y TẾ HÀNG ĐẦU",
    description:
      "Đặt khám với hơn 1000 bác sĩ, 25 bệnh viện, 100 phòng khám trên YouMed để có số thứ tự và khung giờ khám trước.",
  },
  {
    id: 2,
    image: hero2,
    title: "ĐẶT LỊCH KHÁM NHANH CHÓNG, TIẾT KIỆM THỜI GIAN",
    description:
      "Chủ động chọn bác sĩ, khung giờ và cơ sở y tế phù hợp chỉ với vài bước đơn giản.",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  // Tự động chuyển slide sau mỗi 5 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const goToPrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const activeSlide = slides[current];

  return (
    <main id="page-content">
      <div
        // Mobile: h-[600px] để đảm bảo đủ cao hiển thị ảnh và text
        // Desktop: h-[750px] giữ nguyên như cũ
        className="w-full h-[600px] lg:h-[750px] relative bg-center bg-no-repeat bg-cover transition-all duration-700"
        style={{ backgroundImage: `url(${activeSlide.image})` }}
      >
        {/* Layer mờ (nếu cần thiết kế cũ có dùng thì giữ, không thì class này đang rỗng) */}
        <div className="absolute inset-0" />

        <div className="container h-full relative z-10 mx-auto px-4">
          {/* Mobile: Dùng flex để căn giữa nội dung theo chiều dọc
             Desktop: Dùng grid như cũ để giữ layout lệch trái
          */}
          <div className="h-full flex items-center justify-center lg:block lg:py-60">
            <div className="lg:grid lg:grid-cols-5 text-center">
              
              {/* Box nội dung */}
              <div className="w-full p-6 lg:p-10 bg-[#c7e1e778] rounded-2xl lg:col-span-3 shadow-sm backdrop-blur-[2px]">
                <h1 className="font-roboto font-bold lg:text-5xl text-2xl md:text-3xl color-title leading-tight">
                  {activeSlide.title}
                </h1>

                <p className="color-title font-roboto lg:text-[24px] text-sm md:text-base p-2 lg:p-4 mt-2">
                  {activeSlide.description}
                </p>

                <a
                  href="/doctors"
                  className="inline-block mt-4 px-6 py-3 btn-color rounded transition hover:opacity-90 font-medium"
                >
                  Đặt Lịch Ngay
                </a>
              </div>
              
              <div className="w-full" />
            </div>
          </div>
        </div>

        {/* --- NÚT PREV (Đã thay bằng Icon SVG) --- */}
        <button
          type="button"
          onClick={goToPrev}
          className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/40 hover:bg-white text-gray-800 rounded-full items-center justify-center transition-all duration-300"
        >
          <span className="sr-only">Previous</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* --- NÚT NEXT (Đã thay bằng Icon SVG) --- */}
        <button
          type="button"
          onClick={goToNext}
          className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/40 hover:bg-white text-gray-800 rounded-full items-center justify-center transition-all duration-300"
        >
          <span className="sr-only">Next</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full border border-white/70 transition-all duration-300 ${
                index === current ? "bg-white scale-125" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </main>
  );
}