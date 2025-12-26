// src/pages/SearchPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

// IMPORT CÁC SERVICE CỦA BẠN
import doctorService from "../services/doctorService.js";
import specialtyService from "../services/SpecialtyService.js";
import medicalServiceService from "../services/MedicalServiceService.js";
import postService from "../services/PostService.js";

// Hàm format tiền
const formatVND = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return value;
  return n.toLocaleString("vi-VN") + "đ";
};

export default function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [doctorResults, setDoctorResults] = useState([]);
  const [specialtyResults, setSpecialtyResults] = useState([]);
  const [serviceResults, setServiceResults] = useState([]);
  const [postResults, setPostResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const kw = keyword.trim();

    if (!kw) {
      setError("Vui lòng nhập từ khóa tìm kiếm.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Tất cả service của bạn đều hỗ trợ truyền params
      // doctorService.getAllDoctors({ page, limit, search, specialty })
      const paramsForDoctor = { page: 1, limit: 20, search: kw };
      // Các API khác mình dùng chung param 'search'
      const paramsForOthers = { search: kw };

      const [dRes, sRes, svRes, pRes] = await Promise.all([
        doctorService.getAllDoctors(paramsForDoctor),
        specialtyService.getAllSpecialties(paramsForOthers),
        medicalServiceService.getServices(paramsForOthers),
        postService.getPosts(paramsForOthers),
      ]);

      // Chuẩn hóa cách lấy list từ response
      const getList = (res) =>
        Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setDoctorResults(getList(dRes));
      setSpecialtyResults(getList(sRes));
      setServiceResults(getList(svRes));
      setPostResults(getList(pRes));
    } catch (err) {
      console.error(err);
      setError("Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container py-10 lg:py-40">
      {/* Tiêu đề & ô tìm kiếm */}
      <h1 className="text-2xl lg:text-3xl font-bold text-center text-sky-900 mb-6">
        Tìm kiếm
      </h1>

      <form
        onSubmit={handleSearch}
        className="max-w-2xl mx-auto flex gap-3 mb-8"
      >
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Nhập tên bác sĩ, khoa, dịch vụ hoặc bài viết..."
          className="flex-1 h-11 px-4 rounded-full border border-slate-200 outline-none
                     focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm"
        />
        <button
          type="submit"
          className="h-11 px-6 rounded-full bg-sky-500 text-white font-semibold text-sm
                     hover:bg-sky-600 transition"
        >
          Tìm kiếm
        </button>
      </form>

      {error && (
        <p className="text-center text-red-500 mb-6 text-sm">{error}</p>
      )}

      {loading && (
        <p className="text-center text-slate-600">Đang tìm kiếm...</p>
      )}

      {!loading &&
        !error &&
        !doctorResults.length &&
        !specialtyResults.length &&
        !serviceResults.length &&
        !postResults.length &&
        keyword.trim() && (
          <p className="text-center text-slate-600">
            Không tìm thấy kết quả phù hợp.
          </p>
        )}

      {/* ===== KẾT QUẢ: BÁC SĨ ===== */}
      {doctorResults.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-sky-900">
              Bác sĩ ({doctorResults.length})
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            {doctorResults.map((doctor) => {
              const id = doctor.id || doctor._id;
              const name = doctor.fullName || doctor.name;
              const degree = doctor.degree;
              const thumbnail = doctor.thumbnail || doctor.avatar;
              const specialtyName =
                doctor.specialty?.name ||
                doctor.specialty_name ||
                "Đang cập nhật";

              return (
                <article
                  key={id}
                  className="flex gap-4 p-4 rounded-2xl bg-[#e6f7ff] shadow-sm"
                >
                  <img
                    src={
                      thumbnail ||
                      "https://via.placeholder.com/120x140.png?text=Doctor"
                    }
                    alt={name}
                    className="w-24 h-28 object-cover rounded-2xl bg-white"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sky-900 text-sm mb-1">
                      {degree && <span className="mr-1">{degree}</span>}
                      {name}
                    </h3>
                    <p className="text-xs text-slate-700 mb-1">
                      <span className="font-medium">Chuyên khoa: </span>
                      {specialtyName}
                    </p>
                    {/* Nếu có route chi tiết bác sĩ thì mở comment Link này */}
                    {/* <Link
                      to={`/doctors/${id}`}
                      className="text-xs text-sky-600 font-semibold"
                    >
                      Xem chi tiết
                    </Link> */}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== KẾT QUẢ: KHOA / CHUYÊN KHOA ===== */}
      {specialtyResults.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-sky-900">
              Chuyên khoa ({specialtyResults.length})
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            {specialtyResults.map((spec) => {
              const id = spec.id || spec._id;
              const name = spec.name || spec.specialty_name;
              const description =
                spec.description || spec.short_desc || "";

              return (
                <article
                  key={id}
                  className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm"
                >
                  <h3 className="font-semibold text-sky-900 text-sm mb-1">
                    {name}
                  </h3>
                  {description && (
                    <p className="text-xs text-slate-700 line-clamp-3">
                      {description}
                    </p>
                  )}
                  {/* <Link
                    to={`/specialties/${id}`}
                    className="inline-block mt-2 text-xs text-sky-600 font-semibold"
                  >
                    Xem chi tiết
                  </Link> */}
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== KẾT QUẢ: DỊCH VỤ ===== */}
      {serviceResults.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-sky-900">
              Dịch vụ ({serviceResults.length})
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            {serviceResults.map((sv) => {
              const id = sv.id || sv._id;
              const name = sv.name || sv.service_name;
              const price = sv.price || sv.fee || sv.consultation_fee;
              const desc = sv.description || sv.short_desc || "";

              return (
                <article
                  key={id}
                  className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col"
                >
                  <h3 className="font-semibold text-sky-900 text-sm mb-1">
                    {name}
                  </h3>
                  <p className="text-xs text-slate-700 mb-1 line-clamp-2">
                    {desc}
                  </p>
                  <p className="text-xs text-sky-700 font-semibold">
                    Giá: {formatVND(price)}
                  </p>
                  {/* <Link
                    to={`/services/${id}`}
                    className="mt-2 text-xs text-sky-600 font-semibold"
                  >
                    Xem chi tiết
                  </Link> */}
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== KẾT QUẢ: BÀI VIẾT ===== */}
      {postResults.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-sky-900">
              Bài viết ({postResults.length})
            </h2>
          </div>
          <div className="space-y-3">
            {postResults.map((post) => {
              const id = post.id || post._id;
              const title = post.title;
              const excerpt = post.excerpt || post.summary || post.content;

              return (
                <article
                  key={id}
                  className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm"
                >
                  <h3 className="font-semibold text-sky-900 text-sm mb-1">
                    {title}
                  </h3>
                  {excerpt && (
                    <p className="text-xs text-slate-700 line-clamp-2">
                      {excerpt}
                    </p>
                  )}
                  {/* <Link
                    to={`/posts/${id}`}
                    className="mt-2 inline-block text-xs text-sky-600 font-semibold"
                  >
                    Đọc bài viết
                  </Link> */}
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
