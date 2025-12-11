// src/components/Footer.jsx
import React, { useEffect, useState } from "react";
import "../index.css";
import "../assets/assets.js";
import axios from "axios";
import logo from "../assets/logo-ft.svg";

const SERVICES_API_URL = "http://localhost:3000/api/services";
const SPECIALTIES_API_URL = "http://localhost:3000/api/specialties";

// Hàm helper để luôn lấy ra 1 mảng từ response
const extractArray = (raw) => {
  if (!raw) return [];

  // TH1: bản thân raw là array
  if (Array.isArray(raw)) return raw;

  // TH2: raw.data là array
  if (Array.isArray(raw.data)) return raw.data;

  // TH3: raw.specialties là array
  if (Array.isArray(raw.specialties)) return raw.specialties;

  // TH4: raw.items là array
  if (Array.isArray(raw.items)) return raw.items;

  // TH5: tìm key nào trong object có value là array
  if (typeof raw === "object") {
    const keys = Object.keys(raw);
    for (const k of keys) {
      if (Array.isArray(raw[k])) {
        return raw[k];
      }
    }
  }

  return [];
};

// Helper tên + link
const getItemName = (item) =>
  item.name || item.title || item.fullName || "Không có tên";

const getServiceLink = (item) =>
  `/services/${item.slug || item._id || item.id || ""}`;

const getSpecialtyLink = (item) => {
  const id = item._id || item.id;
  return id ? `/doctors?specialtyId=${id}` : "/doctors";
};



export default function Footer() {
  const [services, setServices] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFooterData = async () => {
      setLoading(true);
      try {
        const [servicesRes, specialtiesRes] = await Promise.all([
          axios.get(SERVICES_API_URL),
          axios.get(SPECIALTIES_API_URL),
        ]);

        console.log("services response:", servicesRes.data);
        console.log("specialties response:", specialtiesRes.data);

        const _services = extractArray(servicesRes.data);
        const _specialties = extractArray(specialtiesRes.data);

        console.log("services array dùng để render:", _services);
        console.log("specialties array dùng để render:", _specialties);

        setServices(_services);
        setSpecialties(_specialties);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu footer:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  return (
    <footer className="bg-white  inset-shadow-sm inset-shadow-gray-100">
      <div className="container mx-auto px-4 py-6 lg:py-10 lg:grid lg:grid-cols-5 lg:gap-8">
        {/* Cột thông tin */}
        <div className="lg:col-span-2">
          <img className="w-32 lg:w-60 h-auto mb-4" src={logo} alt="logo" />

          <div className="space-y-1 text-sm text-slate-700">
            <p>
              <span className="font-bold">Địa chỉ:</span> 70 Nguyễn Huệ - Phường
              Thuận Hóa - TP Huế.
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
          {/* Group 1: Dịch vụ */}
          <div className="border-b lg:border-0">
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
              Dịch vụ
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
              {loading && (
                <li className="text-slate-500 text-sm">Đang tải dữ liệu...</li>
              )}

              {!loading && services.length === 0 && (
                <li className="text-slate-500 text-sm">
                  Chưa có dữ liệu dịch vụ
                </li>
              )}

              {!loading &&
                services.slice(0, 8).map((sv) => (
                  <li key={sv._id || sv.id}>
                    <a
                      href="/services"
                      className="text-slate-700 hover:text-[#083b55]"
                    >
                      {getItemName(sv)}
                    </a>
                  </li>
                ))}
            </ul>
          </div>

          {/* Group 2: Chuyên khoa */}
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
              Chuyên khoa
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
              {loading && (
                <li className="text-slate-500 text-sm">Đang tải dữ liệu...</li>
              )}

              {!loading && specialties.length === 0 && (
                <li className="text-slate-500 text-sm">
                  Chưa có dữ liệu chuyên khoa
                </li>
              )}

              {!loading &&
                specialties.slice(0, 8).map((sp) => (
                  <li key={sp._id || sp.id}>
                    <a
                      href={getSpecialtyLink(sp)}
                      className="text-slate-700 hover:text-slate-900"
                    >
                      {getItemName(sp)}
                    </a>
                  </li>
                ))}
            </ul>
          </div>

          {/* Group 3: Liên hệ hợp tác (tĩnh) */}
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

      <p className="bg-[#00B5F1] text-center font-roboto text-sm sm:text-base text-white h-16 sm:h-20 grid place-items-center">
        © 2025 Bản quyền thuộc về nhóm M.Trí, Trí, Quyền.
      </p>
    </footer>
  );
}
