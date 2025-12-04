// src/components/MediaMentionSection.jsx
import React from "react";

const mediaLogos = [
  { name: "Thanh Niên", src: "../assets/thanh-nien-logo.webp" },
  { name: "Tuổi Trẻ", src: "../assets/tuoi-tre-logo.webp" },
  { name: "Dân Trí", src: "../assets/dan-tri-logo.webp" },
  { name: "Người Lao Động", src: "../assets/nguoi-lao-dong-logo.webp" },
  { name: "HTV", src: "../assets/htv-logo.webp" },
  { name: "VTV1", src: "../assets/vtv1-logo.webp" },
];

export default function MediaMentionSection() {
  return (
    <section className="w-full bg-white py-12 md:py-16">
      <div className="container mx-auto px-4">

        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-xl md:text-3xl font-bold tracking-wide color-title mb-2">
            TRUYỀN THÔNG NÓI GÌ VỀ MEDPRO
          </h2>
          <p className="text-sm md:text-base text-slate-500">
            Lợi ích của Ứng dụng đặt khám nhanh Medpro đã được ghi nhận rộng rãi
          </p>
        </div>

        {/* Logo grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6 md:gap-8 items-center justify-items-center mb-12">
          {mediaLogos.map((logo) => (
            <div
              key={logo.name}
              className="flex items-center justify-center h-16 md:h-20 grayscale hover:grayscale-0 opacity-80 hover:opacity-100 transition"
            >
              <img
                src={logo.src}
                alt={logo.name}
                className="max-h-full w-auto object-contain"
              />
            </div>
          ))}
        </div>

        {/* VIDEO */}
        <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg">
          <div className="relative pb-[56.25%] h-0"> 
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/g1c3V4TpMVY?rel=0"
              title="Medpro Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

      </div>
    </section>
  );
}
