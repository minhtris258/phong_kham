import React from "react";
import { Link } from "react-router-dom";


export default function Hero({ user, patient }) {
  // Ưu tiên hiển thị tên bệnh nhân, nếu không có thì tên tài khoản
  const displayName = patient?.fullName || user?.name;

  return (
    <div
      className="w-full lg:h-[500px] h-[400px] relative bg-center bg-no-repeat bg-cover flex items-center"
      style={{ backgroundImage: `url()` }}
    >
      {/* Lớp phủ đen mờ để chữ dễ đọc hơn */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="container mx-auto px-4 relative z-10 text-white">
        <div className="max-w-3xl">
          <h1 className="font-bold text-3xl lg:text-5xl mb-4 leading-tight">
            {displayName 
              ? `Xin chào, ${displayName}!` 
              : "KẾT NỐI NGƯỜI DÂN VỚI CƠ SỞ Y TẾ HÀNG ĐẦU"
            }
          </h1>

          <p className="text-lg lg:text-xl mb-8 opacity-90 font-light">
            {displayName 
              ? "Chào mừng bạn quay trở lại. Hãy theo dõi sức khỏe và đặt lịch khám ngay hôm nay."
              : "Đặt khám với hơn 1000 bác sĩ, 25 bệnh viện, 100 phòng khám trên hệ thống để lấy số thứ tự trực tuyến."
            }
          </p>

          <Link
            to="/doctors"
            className="inline-block px-8 py-3 bg-[#00B5F1] hover:bg-[#0099cc] text-white font-bold rounded-xl transition shadow-lg transform hover:scale-105"
          >
            Đặt Lịch Ngay
          </Link>
        </div>
      </div>
    </div>
  );
}