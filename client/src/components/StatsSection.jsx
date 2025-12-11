// src/components/StatsSection.jsx
import React, { useState, useEffect } from "react";
import {Hospital, UserCheck, Users, Activity, Eye, BarChart2, NotepadText} from "lucide-react";
import banner1 from "../assets/asset51.jpeg";
import banner2 from "../assets/asset52.png";
import banner3 from "../assets/asset53.png";

// Dữ liệu thống kê
const stats = [
  { icon: <NotepadText />, value: "4.0M+", label: "Lượt khám" },
  { icon: <Hospital />, value: "300+", label: "Cơ sở Y tế" },
  { icon: <Users />, value: "2500+", label: "Bác sĩ" },
  { icon: <BarChart2 />, value: "1.0M+", label: "Lượt truy cập tháng" },
  { icon: <Eye />, value: "35K+", label: "Lượt truy cập trong ngày" },
];

// 🖼️ MẢNG ẢNH SLIDE – bạn thay ảnh ở đây
const slideImages = [banner1, banner2, banner3];

export default function StatsSection() {
  const [index, setIndex] = useState(0);

  // Auto slide every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slideImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full py-12 md:py-16 ">
      <div className="bg-gradient-to-b from-[#ffffffe5] to-[#e8f6ffe5] h-20"></div>
      <div className="bg-[#e8f6ffe5]">
      <div className="container mx-auto px-4 ">
        {/* Title */}
        <h2 className="text-center text-2xl md:text-3xl font-bold color-title mb-8">
          THỐNG KÊ
        </h2>

        {/* White card */}
        <div className="mx-auto max-w-6xl bg-white rounded-[32px] shadow-lg px-6 py-8 md:px-10 md:py-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-6 md:gap-y-8">
            {stats.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center text-center gap-1"
              >
                {/* Icon */}
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#e5f7ff] text-2xl">
                  <span>{item.icon}</span>
                </div>

                {/* Number */}
                <p className="text-lg md:text-xl font-bold text-[#222]">
                  {item.value}
                </p>

                {/* Label */}
                <p className="text-xs md:text-sm text-gray-500 leading-snug">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SLIDE ẢNH */}
        <div className="mt-10 w-full flex justify-center">
          <div className="relative w-full max-w-6xl h-[250px] md:h-[350px] overflow-hidden rounded-2xl shadow-lg">
            {/* Các ảnh */}
            <div
              className="flex transition-transform duration-700"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {slideImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Slide ${i}`}
                  className="w-full h-[250px] md:h-[350px] object-cover flex-shrink-0"
                />
              ))}
            </div>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {slideImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`w-3 h-3 rounded-full transition ${
                    index === i ? "bg-blue-600" : "bg-white/70"
                  }`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
      <div className="bg-gradient-to-b from-[#e8f6ffe5] to-[#ffffffe5] h-20"></div>
    </section>
  );
}
