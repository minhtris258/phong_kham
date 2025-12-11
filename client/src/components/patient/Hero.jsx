import React from "react";
import { Link } from "react-router-dom";

export default function Hero({ user, patient }) {
  const displayName = patient?.fullName || user?.name;

  return (
    // Mobile: height auto + padding, Desktop: h-500px fixed
    <div className="w-full lg:h-[500px] min-h-[350px] relative bg-gradient-to-r from-sky-600 to-sky-400 flex items-center overflow-hidden mt-15">
      
      {/* LỚP 1: ẢNH NỀN */}
      <div className="absolute inset-0 z-0 flex justify-end">
        <img 
          src="https://medpro.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FconsultantDoctor.2aaaedb4.png&w=1920&q=75" 
          alt="Banner Doctor" 
          // Mobile: dịch sang phải nhiều hơn (translate-x) để chừa chỗ cho chữ
          className="h-full w-auto object-contain object-right opacity-30 lg:opacity-100 translate-x-1/4 lg:translate-x-0" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-sky-600 via-sky-500/80 to-transparent lg:via-transparent"></div>
      </div>

      {/* LỚP 2: NỘI DUNG */}
      <div className="container mx-auto px-4 relative z-10 text-white py-8 lg:py-0">
        <div className="max-w-full lg:max-w-2xl text-center lg:text-left">
          <h1 className="font-bold text-2xl lg:text-5xl mb-3 lg:mb-4 leading-tight drop-shadow-md">
            {displayName 
              ? `Xin chào, ${displayName}!` 
              : "KẾT NỐI NGƯỜI DÂN VỚI CƠ SỞ Y TẾ HÀNG ĐẦU"
            }
          </h1>

          <p className="text-base lg:text-xl mb-6 lg:mb-8 opacity-95 font-medium drop-shadow-sm max-w-xl mx-auto lg:mx-0">
            {displayName 
              ? "Chào mừng bạn quay trở lại. Hãy theo dõi sức khỏe và đặt lịch khám ngay hôm nay."
              : "Đặt khám với hơn 1000 bác sĩ, 25 bệnh viện, 100 phòng khám trên hệ thống."
            }
          </p>

          <Link
            to="/doctors"
            className="inline-block px-6 py-2.5 lg:px-8 lg:py-3 bg-white text-sky-600 font-bold rounded-xl text-sm lg:text-base transition shadow-lg transform hover:scale-105 hover:bg-slate-50"
          >
            Đặt Lịch Ngay
          </Link>
        </div>
      </div>
    </div>
  );
}