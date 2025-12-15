import React from "react";

const DownloadAppSection = () => {
  return (
    <section className="overflow-hidden pb-10">
      {/* --- Header Title --- */}
      <div className="flex flex-col lg:flex-row text-center items-center justify-center pt-8 lg:pt-16">
        <h2 className="color-title lg:text-4xl text-xl font-bold py-2 lg:py-4 lg:mb-8 text-center">
          Tải ứng dụng Đặt khám nhanh
        </h2>
        <h2 className="text-[#16B7D7] lg:text-4xl text-xl font-bold py-2 lg:py-4 lg:mb-8 text-center lg:ml-2">
          Med Pro
        </h2>
      </div>

      {/* --- Store Buttons --- */}
      <div className="flex gap-4 justify-center py-4 lg:py-8 px-4">
        <img
          className="h-8 lg:h-12 w-auto object-contain hover:scale-105 transition-transform cursor-pointer"
          src="https://medpro.vn/_next/image?url=https%3A%2F%2Fcdn.medpro.vn%2Fprod-partner%2Fa99f5240-f39c-40d7-a340-aa4b68b90fb5-icon_download_google_play.svg&w=1920&q=75"
          alt="Tải trên Google Play"
        />
        <img
          className="h-8 lg:h-12 w-auto object-contain hover:scale-105 transition-transform cursor-pointer"
          src="https://medpro.vn/_next/image?url=https%3A%2F%2Fcdn.medpro.vn%2Fprod-partner%2Fecbe7465-3d2a-4f1d-985e-4cf14dd30924-logo_download_ios.svg&w=1920&q=75"
          alt="Tải trên App Store"
        />
      </div>

      <div className="container mx-auto px-2 lg:px-4">
        {/* QUAN TRỌNG: grid-cols-3 ngay cả trên mobile.
            Để nhét vừa, ta phải chia tỷ lệ cột khéo léo.
            Ví dụ: Cột trái 35% - Cột giữa 30% - Cột phải 35%
        */}
        <div className="grid grid-cols-3 gap-1 lg:gap-4 mt-4 lg:mt-8">
          
          {/* --- CỘT TRÁI (3 Items) --- */}
          <div className="col-span-1 flex flex-col justify-between py-4 lg:py-20">
            {/* Item 1 */}
            <div className="text-right">
              <h2 className="color-title font-bold font-roboto text-[11px] lg:text-xl leading-tight mb-1">
                Tra cứu KQ <br className="lg:hidden" /> Cận lâm sàng
              </h2>
              <p className="text-[9px] lg:text-base text-gray-500 leading-snug">
                Tra cứu KQ trực tuyến dễ dàng.
              </p>
            </div>

            {/* Item 2 */}
            <div className="text-right lg:mr-5">
              <h2 className="color-title font-bold font-roboto text-[11px] lg:text-xl leading-tight mb-1">
                Đặt Lịch Khám <br className="lg:hidden" /> Trực Tuyến
              </h2>
              <p className="text-[9px] lg:text-base text-gray-500 leading-snug">
                Đăng ký khám nhanh, chọn bác sĩ.
              </p>
            </div>

            {/* Item 3 */}
            <div className="text-right">
              <h2 className="color-title font-bold font-roboto text-[11px] lg:text-xl leading-tight mb-1">
                Tư vấn sức khỏe <br className="lg:hidden" /> từ xa
              </h2>
              <p className="text-[9px] lg:text-base text-gray-500 leading-snug">
                Video call với bác sĩ chuyên môn.
              </p>
            </div>
          </div>

          {/* --- CỘT GIỮA (Hình ảnh) --- */}
          <div className="col-span-1 relative flex items-center justify-center">
             {/* Hình nền mờ */}
            <img
              src="https://medpro.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fellipse.a457aed3.png&w=1920&q=75"
              alt=""
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full z-0 opacity-70"
            />
             {/* Hình điện thoại: Scale 100% width của cột giữa */}
            <img
              src="src/assets/phone.png"
              alt="app-preview"
              className="relative z-10 w-full h-auto max-h-[300px] lg:max-h-[500px] object-contain drop-shadow-lg"
            />
          </div>

          {/* --- CỘT PHẢI (3 Items) --- */}
          <div className="col-span-1 flex flex-col justify-between py-4 lg:py-20">
            {/* Item 4 */}
            <div className="text-left">
              <h2 className="color-title font-bold font-roboto text-[11px] lg:text-xl leading-tight mb-1">
                Đặt Lịch Khám <br className="lg:hidden" /> Nhanh
              </h2>
              <p className="text-[9px] lg:text-base text-gray-500 leading-snug">
                Giao diện dễ dùng, AI hỗ trợ.
              </p>
            </div>

            {/* Item 5 */}
            <div className="text-left lg:ml-5">
              <h2 className="color-title font-bold font-roboto text-[11px] lg:text-xl leading-tight mb-1">
                Chăm sóc Y tế <br className="lg:hidden" /> tại nhà
              </h2>
              <p className="text-[9px] lg:text-base text-gray-500 leading-snug">
                Dịch vụ Y tế chuyên nghiệp tại nhà.
              </p>
            </div>

            {/* Item 6 */}
            <div className="text-left">
              <h2 className="color-title font-bold font-roboto text-[11px] lg:text-xl leading-tight mb-1">
                Mạng lưới <br className="lg:hidden" /> Cơ sở hợp tác
              </h2>
              <p className="text-[9px] lg:text-base text-gray-500 leading-snug">
                Kết nối BV, phòng khám toàn quốc.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default DownloadAppSection;