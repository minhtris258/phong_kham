// src/components/DoctorsDirectory.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

// ==== URL API (chỉnh lại cho đúng backend của bạn) ====
const DOCTORS_API_URL = "http://localhost:3000/api/doctors";
const SPECIALTIES_API_URL = "http://localhost:3000/api/specialties";

// Hàm format tiền VND
const formatVND = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return value;
  return n.toLocaleString("vi-VN") + "đ";
};

export default function DoctorsDirectory() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState("ALL");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError("");

        // Gọi song song 2 API
        const [doctorRes, specialtyRes] = await Promise.all([
          axios.get(DOCTORS_API_URL),
          axios.get(SPECIALTIES_API_URL),
        ]);

        // ======= LẤY LIST BÁC SĨ =======
        let doctorList = [];
        if (Array.isArray(doctorRes.data)) {
          doctorList = doctorRes.data;
        } else if (Array.isArray(doctorRes.data?.data)) {
          doctorList = doctorRes.data.data;
        } else if (Array.isArray(doctorRes.data?.doctors)) {
          doctorList = doctorRes.data.doctors;
        } else if (Array.isArray(doctorRes.data?.items)) {
          doctorList = doctorRes.data.items;
        }
        setDoctors(doctorList);

        // ======= LẤY LIST KHOA / CHUYÊN KHOA =======
        let specialtyList = [];
        if (Array.isArray(specialtyRes.data)) {
          specialtyList = specialtyRes.data;
        } else if (Array.isArray(specialtyRes.data?.data)) {
          specialtyList = specialtyRes.data.data;
        } else if (Array.isArray(specialtyRes.data?.specialties)) {
          specialtyList = specialtyRes.data.specialties;
        }

        // Nếu API chuyên khoa trống, Fallback lấy từ doctors
        if (!specialtyList.length) {
          const set = new Set();
          doctorList.forEach((d) => {
            // d.specialty là object { id, name }
            if (d.specialty?.id && d.specialty?.name) {
              set.add(JSON.stringify({ id: d.specialty.id, name: d.specialty.name }));
            }
          });
          specialtyList = Array.from(set).map((s) => JSON.parse(s));
        }

        setSpecialties(specialtyList);
      } catch (err) {
        console.error(err);
        setError("Không tải được dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const safeDoctors = Array.isArray(doctors) ? doctors : [];

  // ===== Chuẩn hóa ID chuyên khoa của 1 bác sĩ =====
  const getDoctorSpecialtyId = (doctor) => {
    // Ưu tiên object specialty {id, name}
    if (doctor.specialty && doctor.specialty.id != null) {
      return doctor.specialty.id;
    }

    // Nếu specialty là số (ví dụ: 1, 2, 3)
    if (typeof doctor.specialty === "number") {
      return doctor.specialty;
    }

    // Nếu có trường specialty_id là số
    if (doctor.specialty_id != null && typeof doctor.specialty_id !== "object") {
      return doctor.specialty_id;
    }

    return null;
  };

  // ===== Lọc bác sĩ theo chuyên khoa =====
  const filteredDoctors = useMemo(() => {
    if (selectedSpecialtyId === "ALL") return safeDoctors;

    return safeDoctors.filter((d) => {
      const docSpecId = getDoctorSpecialtyId(d);
      if (docSpecId == null) return false;
      return String(docSpecId) === String(selectedSpecialtyId);
    });
  }, [safeDoctors, selectedSpecialtyId]);

  if (loading) {
    return (
      <section className="container py-10">
        <p className="text-center text-slate-600">
          Đang tải danh sách bác sĩ...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container py-10">
        <p className="text-center text-red-500">{error}</p>
      </section>
    );
  }

  return (
    <section className="container py-10 lg:py-16">
      {/* Title */}
      <h2 className="text-2xl lg:text-3xl font-bold text-center text-sky-900 mb-6">
        Đội ngũ bác sĩ
      </h2>

      {/* ===== THANH CHỌN KHOA ===== */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={() => setSelectedSpecialtyId("ALL")}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition 
            ${
              selectedSpecialtyId === "ALL"
                ? "bg-sky-500 text-white border-sky-500"
                : "bg-white text-sky-700 border-sky-200 hover:bg-sky-50"
            }`}
          >
            Tất cả
          </button>

          {specialties.map((spec) => {
            // id & name của chuyên khoa
            const id = spec.id ?? spec.specialty_id ?? spec.code;
            const label = spec.name ?? spec.specialty_name ?? spec.title;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedSpecialtyId(id)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition 
                ${
                  String(selectedSpecialtyId) === String(id)
                    ? "bg-sky-500 text-white border-sky-500"
                    : "bg-white text-sky-700 border-sky-200 hover:bg-sky-50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== DANH SÁCH BÁC SĨ ===== */}
      {filteredDoctors.length === 0 ? (
        <p className="text-center text-slate-600">
          Không tìm thấy bác sĩ phù hợp.
        </p>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredDoctors.map((doctor) => {
            const {
              id,
              name,
              degree, // "BS CKII.", "BS CKI.", "Ths. BS."
              thumbnail,
              avatar,
              specialty,
              schedule,
              rating,
              total_reviews,
              review_count,
              consultation_fee,
            } = doctor;

            const doctorImg = thumbnail || avatar;
            const doctorRating = rating || "4.5";
            const doctorReviewCount = total_reviews || review_count || 0;

            // tên chuyên khoa hiển thị
            const docSpecName =
              specialty?.name ||
              specialties.find(
                (s) =>
                  String(s.id) === String(getDoctorSpecialtyId(doctor))
              )?.name ||
              "Đang cập nhật";

            return (
              <article
                key={id || name}
                className="bg-[#e6f7ff] rounded-3xl shadow-md p-4 flex gap-4 items-stretch"
              >
                {/* Ảnh bác sĩ */}
                <div className="relative w-28 shrink-0 flex flex-col items-center">
                  <img
                    src={
                      doctorImg ||
                      "https://via.placeholder.com/200x240.png?text=Doctor"
                    }
                    alt={name}
                    className="w-28 h-32 lg:w-32 lg:h-36 object-cover rounded-2xl bg-white"
                  />
                  <button
                    type="button"
                    className="mt-3 text-xs font-semibold px-4 py-1 rounded-full bg-white text-sky-700 shadow"
                  >
                    Xem chi tiết
                  </button>
                </div>

                {/* Thông tin bác sĩ */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-sky-900 mb-1">
                    {degree && <span className="mr-1">{degree}</span>}
                    <span>{name}</span>
                  </h3>

                  <ul className="space-y-1 text-sm text-slate-700 mb-3">
                    <li>
                      <span className="font-medium">Chuyên khoa: </span>
                      <span>{docSpecName}</span>
                    </li>

                    <li>
                      <span className="font-medium">Lịch khám: </span>
                      <span>{schedule || "Hẹn khám"}</span>
                    </li>
                    <li>
                      <span className="font-medium">Giá khám: </span>
                      <span>{formatVND(consultation_fee)}</span>
                    </li>
                  </ul>

                  {/* Rating + Button */}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white rounded-full px-2 py-1 text-xs font-semibold text-slate-700">
                        <span className="mr-1 text-yellow-400 text-sm">★</span>
                        <span>{doctorRating}</span>
                      </div>
                      <div className="flex items-center bg-white rounded-full px-2 py-1 text-xs font-semibold text-slate-700">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 448 512"
                          className="w-3 h-3 mr-1"
                          fill="currentColor"
                        >
                          <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z" />
                        </svg>
                        <span>{doctorReviewCount}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-5 py-2 rounded-full bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition"
                    >
                      Đặt ngay
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
