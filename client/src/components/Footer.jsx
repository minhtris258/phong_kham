// src/components/Footer.jsx
import { useEffect, useRef, useState } from "react";
import "../index.css";
import "../assets/assets.js";
import React from "react";
import logo from "../assets/logo-ft.svg"; 

export default function Footer() {
  return (
    <footer className="bg-white border-t-4 border-indigo-500 mt-8">
      <div className="container mx-auto px-4 py-6 lg:py-10 lg:grid lg:grid-cols-5 lg:gap-8">
        {/* Cột thông tin */}
        <div className="lg:col-span-2">
          <img
            className="w-32 lg:w-60 h-auto mb-4"
            src={logo}
            alt="logo"
          />

          <div className="space-y-1 text-sm text-slate-700">
            <p>
              <span className="font-bold">Địa chỉ:</span> 18 Cầu Bông - Quận
              Bình Thạnh - TPHCM.
            </p>
            <p>
              <span className="font-bold">Email:</span> cskh@medpro.vn
            </p>
            <p>
              <span className="font-bold">Website:</span> https://medpro.vn
            </p>
            <p>
              <span className="font-bold">Điện thoại:</span> (028) 710 78098
            </p>
          </div>
        </div>

        {/* Các nhóm link */}
        <div className="lg:col-span-3 lg:grid lg:grid-cols-3 lg:gap-6 mt-8 lg:mt-0">
          {/* Group 1 */}
          <div className="border-b lg:border-0">
            {/* trigger (mobile) */}
            <input
              id="ft-1"
              type="checkbox"
              className="peer hidden lg:hidden"
            />
            <label
              htmlFor="ft-1"
              className="flex items-center justify-between py-3 lg:py-0 cursor-pointer lg:cursor-default
                         text-[#083b55] font-roboto text-lg font-bold"
            >
              Dịch vụ Y tế
              {/* chevron chỉ hiện mobile */}
              <svg
                className="size-4 text-[#083b55] transition-transform peer-checked:rotate-90 lg:hidden"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </label>

            <ul className="hidden peer-checked:block lg:block pb-3 lg:pb-0 pl-4 lg:pl-0 space-y-2">
              <li>
                <a href="#" className="text-slate-700 hover:text-slate-900">
                  Khám bệnh trực tuyến
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-700 hover:text-slate-900">
                  Đặt lịch khám
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-700 hover:text-slate-900">
                  Tư vấn từ xa
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-700 hover:text-slate-900">
                  Xét nghiệm tại nhà
                </a>
              </li>
            </ul>
          </div>

          {/* Group 2 */}
          <div className="border-b lg:border-0">
            <input
              id="ft-2"
              type="checkbox"
              className="peer hidden lg:hidden"
            />
            <label
              htmlFor="ft-2"
              className="flex items-center justify-between py-3 lg:py-0 cursor-pointer lg:cursor-default
                         text-[#083b55] font-roboto text-lg font-bold"
            >
              Hướng dẫn
              <svg
                className="size-4 text-[#083b55] transition-transform peer-checked:rotate-90 lg:hidden"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </label>

            <ul className="hidden peer-checked:block lg:block pb-3 lg:pb-0 pl-4 lg:pl-0 space-y-2">
              <li>
                <a href="#" className="text-slate-700 hover:text-slate-900">
                  Cách đặt lịch
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-700 hover:text-slate-900">
                  Thanh toán
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-700 hover:text-slate-900">
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-700 hover:text-slate-900">
                  Hỗ trợ kỹ thuật
                </a>
              </li>
            </ul>
          </div>

          {/* Group 3 */}
          <div className="border-b lg:border-0">
            <input
              id="ft-3"
              type="checkbox"
              className="peer hidden lg:hidden"
            />
            <label
              htmlFor="ft-3"
              className="flex items-center justify-between py-3 lg:py-0 cursor-pointer lg:cursor-default
                         text-[#083b55] font-roboto text-lg font-bold"
            >
              Liên hệ hợp tác
              <svg
                className="size-4 text-[#083b55] transition-transform peer-checked:rotate-90 lg:hidden"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </label>

            <ul className="hidden peer-checked:block lg:block pb-3 lg:pb-0 pl-4 lg:pl-0 space-y-2">
              <li>
                <a href="#" className="text-slate-700 hover:text-slate-900">
                  Hợp tác bệnh viện
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-700 hover:text-slate-900">
                  Nhà cung cấp
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-700 hover:text-slate-900">
                  Truyền thông
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-700 hover:text-slate-900">
                  Tuyển dụng
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <p className="text-center font-roboto text-sm sm:text-base text-white bg-black h-16 sm:h-20 grid place-items-center">
        © 2025 Bản quyền thuộc về nhóm M.Trí, Trí, Quyền.
      </p>
    </footer>
  );
}
