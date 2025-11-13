// src/components/PartnersSection.jsx
import { useRef } from "react";
import React from "react";
import Title from "./Title";
import "../index.css";
import "../assets/assets.js";
import logo_1 from "../assets/logo-bv/bv1.png";
import logo_2 from "../assets/logo-bv/bv2.jpeg";
import logo_3 from "../assets/logo-bv/bv3.png";
import logo_4 from "../assets/logo-bv/bv4.jpeg";
import logo_5 from "../assets/logo-bv/bv5.png";
import logo_6 from "../assets/logo-bv/bv6.png";
import logo_7 from "../assets/logo-bv/bv7.png";
import logo_8 from "../assets/logo-bv/bv8.png";
import logo_9 from "../assets/logo-bv/bv9.png";
import logo_10 from "../assets/logo-bv/bv10.png";

export default function PartnersSection() {
  const trackRef = useRef(null);

  const scrollPage = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  // Danh sách logo (đặt ảnh trong public/img/logo/* hoặc import từ /src/assets)
  const logos = [
    { src: logo_1, alt: "partner1" },
    { src: logo_2, alt: "partner2" },
    { src: logo_3, alt: "partner3" },
    { src: logo_4, alt: "partner4" },
    { src: logo_5, alt: "partner5" },
    { src: logo_6, alt: "partner6" },
    { src: logo_7, alt: "partner7" },
    { src: logo_8, alt: "partner8" },
    { src: logo_9, alt: "partner9" },
    { src: logo_10, alt: "partner10" },
  ];

  return (
    <section className="container py-12 mt-8">
        <Title>Được tin tưởng hợp tác và đồng hành</Title>
     

      <div className="relative">
        {/* Prev */}
        <button
          type="button"
          aria-label="Prev logos"
          onClick={() => scrollPage(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex
                     h-10 w-10 items-center justify-center rounded-full bg-white shadow
                     ring-1 ring-slate-200"
        >
          ‹
        </button>

        {/* Track */}
        <div
          id="partners-track"
          ref={trackRef}
          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory
                     lg:[scrollbar-width:none] lg:[-ms-overflow-style:none] gap-2 py-2"
        >
          {/* Ẩn scrollbar WebKit */}
          <style>{`
            #partners-track::-webkit-scrollbar { display: none; }
          `}</style>

          {logos.map((logo, idx) => (
            <div
              key={idx}
              className="shrink-0 basis-1/2 sm:basis-1/3 lg:basis-1/6 snap-start w-[50%]"
            >
              <div className="flex items-center justify-center bg-white box-shadow h-full py-4">
                <img className="h-20 w-auto object-cover" src={logo.src} alt={logo.alt} />
              </div>
            </div>
          ))}
        </div>

        {/* Next */}
        <button
          type="button"
          aria-label="Next logos"
          onClick={() => scrollPage(1)}
          className="absolute right-[-2rem] top-1/2 -translate-y-1/2 z-10 hidden lg:flex
                     h-10 w-10 items-center justify-center rounded-full bg-white shadow
                     ring-1 ring-slate-200"
        >
          ›
        </button>
      </div>
    </section>
  );
}
