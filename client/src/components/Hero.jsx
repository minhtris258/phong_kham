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
        className="w-full lg:h-[750px] relative bg-center bg-no-repeat bg-cover transition-all duration-700"
        style={{ backgroundImage: `url(${activeSlide.image})` }}
      >
        {/* Layer mờ để chữ dễ đọc hơn */}
        <div className="absolute inset-0 bg-black/20" />

        <div className="container relative z-10">
          <div className="lg:grid lg:grid-cols-5 text-center lg:py-60 py-16">
            <div className="w-full p-10 bg-[#a49f9f57] rounded-2xl col-span-3">
              <h1 className="font-roboto font-bold lg:text-5xl text-3xl color-title">
                {activeSlide.title}
              </h1>

              <p className="color-title font-roboto lg:text-[24px] text-base p-4">
                {activeSlide.description}
              </p>

              <a
                href="#"
                className="inline-block mt-4 px-6 py-3 btn-color rounded transition"
              >
                Đặt Lịch Ngay
              </a>
            </div>
            <div className="w-full" />
          </div>
        </div>

        {/* Nút Prev / Next */}
        <button
          type="button"
          onClick={goToPrev}
          className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 hover:bg-gray-400 rounded-full  flex items-center justify-center"
        >
          <span className="sr-only">Previous</span>
          <span className="inline-block">&lt;</span>
        </button>

        <button
          type="button"
          onClick={goToNext}
          className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 hover:bg-gray-400 rounded-full  flex items-center justify-center"
        >
          <span className="sr-only">Next</span>
          <span className="inline-block">&gt;</span>
        </button>

        {/* Dots ở dưới cho cả mobile + desktop */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full border border-white/70 ${
                index === current ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
