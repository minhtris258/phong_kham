import React from "react";
import "../index.css";

import hero from "../assets/slider-03-a.jpg";

export default function Hero() {
  return (
    <main id="page-content">
      <div
        className="w-full lg:h-[750px] relative bg-center bg-no-repeat bg-cover"
        style={{ backgroundImage: `url(${hero})` }}
      >
        <div className="container">
          <div className="lg:grid lg:grid-cols-5 text-center lg:py-60 py-16">
            <div className="w-full col-span-3">
              <h1 className="font-roboto font-bold lg:text-5xl text-3xl color-title">
                KẾT NỐI NGƯỜI DÂN VỚI CƠ SỞ Y TẾ HÀNG ĐẦU
              </h1>

              <p className="color-title font-roboto lg:text-[24px] text-base p-4">
                Đặt khám với hơn 1000 bác sĩ, 25 bệnh viện, 100 phòng khám trên
                YouMed để có số thứ tự và khung giờ khám trước.
              </p>

              <a
                href="#"
                className="inline-block mt-4 px-6 py-3 text-white bg-[#16B7D7] rounded hover:bg-[#14c4e9] transition"
              >
                Đặt Lịch Ngay
              </a>
            </div>
            <div className="w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
