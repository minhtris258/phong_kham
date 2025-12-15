import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* --- Hình ảnh minh họa (SVG hoặc Icon lớn) --- */}
        <div className="relative">
          {/* Vòng tròn background mờ */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
          </div>

          {/* Số 404 lớn */}
          <h1 className="text-9xl font-extrabold text-[#16B7D7] tracking-widest drop-shadow-sm">
            404
          </h1>
          <div className="bg-white px-2 text-sm rounded rotate-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg border border-gray-200 font-bold text-gray-800">
            Page Not Found
          </div>
        </div>

        {/* --- Thông báo lỗi --- */}
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Oops! Trang không tồn tại
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Có vẻ như trang bạn đang tìm kiếm đã bị xóa, thay đổi tên hoặc tạm
            thời không khả dụng.
          </p>
        </div>

        {/* --- Các nút điều hướng --- */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-[#16B7D7] hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Về trang chủ
          </Link>
        </div>

        {/* --- Footer nhỏ --- */}
        <p className="mt-8 text-xs text-gray-400">
          Nếu bạn cho rằng đây là lỗi hệ thống, vui lòng{" "}
          <a
            href="mailto:support@medpro.com"
            className="text-[#16B7D7] hover:underline"
          >
            liên hệ hỗ trợ
          </a>
          .
        </p>
      </div>
    </div>
  );
}
