// src/components/MediaMentionSection.jsx
import React from "react";
import thanhNienLogo from "../assets/thanh-nien-logo.webp";
import tuoiTreLogo from "../assets/tuoi-tre-logo.webp";
import danTriLogo from "../assets/dan-tri.webp";
import thvlLogo from "../assets/thvl-logo.webp";
import htvLogo from "../assets/htv.webp";
import vtv1Logo from "../assets/vtv1-logo.webp";

const mediaLogos = [
  { name: "Thanh Niên", src: thanhNienLogo },
  { name: "Tuổi Trẻ", src: tuoiTreLogo },
  { name: "Dân Trí", src: danTriLogo },
  { name: "THVL", src: thvlLogo },
  { name: "HTV", src: htvLogo },
  { name: "VTV1", src: vtv1Logo },
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
              className="flex items-center justify-center h-16 md:h-20 transition"
            >
                <a href="https://thanhnien.vn/benh-vien-mat-tphcm-chinh-thuc-ra-mat-ung-dung-dat-lich-1851509686.htm">
              <img
                src={logo.src}
                alt={logo.name}
                className="max-h-full w-[60%] justify-self-center object-contain"
              /></a>
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
