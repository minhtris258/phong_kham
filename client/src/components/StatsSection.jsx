// src/components/StatsSection.jsx
import React, { useState, useEffect } from "react";
import {
  Hospital,
  UserCheck,
  Users,
  Activity,
  Eye,
  BarChart2,
  NotepadText,
} from "lucide-react";
import banner1 from "../assets/asset51.jpeg";
import banner2 from "../assets/asset52.png";
import banner3 from "../assets/asset53.png";

// Dữ liệu thống kê
const stats = [
  { icon: <NotepadText />, value: "4.0M+", label: "Lượt khám" },
  { icon: <Hospital />, value: "300+", label: "Cơ sở Y tế" },
  { icon: <Users />, value: "2500+", label: "Bác sĩ" },
  { icon: <BarChart2 />, value: "1.0M+", label: "Lượt truy cập tháng" },
  { icon: <Eye />, value: "35K+", label: "Lượt truy cập ngày" }, // Rút gọn text cho mobile
];

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
    <section className="w-full py-8 md:py-16"> {/* Giảm padding dọc tổng thể */}
      
      {/* Gradient Top: Mobile h-10, Desktop h-20 */}
      <div className="bg-gradient-to-b from-[#ffffffe5] to-[#e8f6ffe5] h-10 md:h-20"></div>
      
      <div className="bg-[#e8f6ffe5]">
        <div className="container mx-auto px-4">
          {/* Title */}
          <h2 className="text-center text-xl md:text-3xl font-bold color-title mb-6 md:mb-8">
            THỐNG KÊ
          </h2>

          {/* White card */}
          <div className="mx-auto max-w-6xl bg-white rounded-2xl md:rounded-[32px] shadow-lg px-4 py-6 md:px-10 md:py-10">
            {/* Grid System: 
                - Mobile: 2 cột (gap nhỏ)
                - Desktop: 5 cột (gap lớn) 
            */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-6 gap-x-2 md:gap-8">
              {stats.map((item, idx) => (
                <div
                  key={item.label}
                  // Logic: Item cuối cùng (idx === 4) sẽ chiếm 2 cột trên mobile để nằm giữa
                  className={`flex flex-col items-center text-center gap-1 ${
                    idx === 4 ? "col-span-2 md:col-span-1 lg:col-span-1" : "col-span-1"
                  }`}
                >
                  {/* Icon: Mobile nhỏ hơn (h-10 w-10), Desktop (h-12 w-12) */}
                  <div className="mb-1 md:mb-2 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-[#e5f7ff] text-xl md:text-2xl text-blue-600">
                    {/* Clone element để chỉnh size icon bên trong nếu cần */}
                    {React.cloneElement(item.icon, { size: 20, className: "md:w-6 md:h-6" })}
                  </div>

                  {/* Number */}
                  <p className="text-base md:text-xl font-bold text-[#222]">
                    {item.value}
                  </p>

                  {/* Label */}
                  <p className="text-[11px] md:text-sm text-gray-500 leading-snug px-1">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SLIDE ẢNH */}
          <div className="mt-8 md:mt-10 w-full flex justify-center">
            {/* Chiều cao: Mobile 180px, Desktop 350px */}
            <div className="relative w-full max-w-6xl h-[180px] sm:h-[250px] md:h-[350px] overflow-hidden rounded-xl md:rounded-2xl shadow-lg">
              <div
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${index * 100}%)` }}
              >
                {slideImages.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Slide ${i}`}
                    className="w-full h-full object-cover flex-shrink-0"
                  />
                ))}
              </div>

              {/* Dots */}
              <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2">
                {slideImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                      index === i ? "bg-blue-600 w-4 md:w-6" : "bg-white/70"
                    }`}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gradient Bottom */}
      <div className="bg-gradient-to-b from-[#e8f6ffe5] to-[#ffffffe5] h-10 md:h-20"></div>
    </section>
  );
}