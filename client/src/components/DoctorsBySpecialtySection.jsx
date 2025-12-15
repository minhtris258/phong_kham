import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, MapPin, Banknote, CalendarCheck, Briefcase } from "lucide-react";
import doctorService from "../services/DoctorService";

// Format tiền
const formatVND = (value) => {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return n.toLocaleString("vi-VN") + "đ";
};

export default function DoctorsBySpecialtySection() {
  const navigate = useNavigate();

  const [specialties, setSpecialties] = useState([
    { id: "ALL", name: "Tất cả" },
  ]);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState("ALL");
  const [doctors, setDoctors] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [error, setError] = useState("");

  // --- 1. THÊM STATE ĐỂ CHECK MOBILE ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ====== LẤY DANH SÁCH KHOA (Giữ nguyên) ======
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setLoadingSpecialties(true);
        setError("");
        const res = await doctorService.getSpecialties({ limit: 100 });
        const raw = res.data;
        let list = [];
        if (Array.isArray(raw)) list = raw;
        else if (Array.isArray(raw?.specialties)) list = raw.specialties;
        else if (Array.isArray(raw?.data)) list = raw.data;
        else if (Array.isArray(raw?.data?.specialties))
          list = raw.data.specialties;
        else if (Array.isArray(raw?.items)) list = raw.items;
        else if (Array.isArray(raw?.results)) list = raw.results;

        if (list.length > 0) {
          const normalized = list.map((s) => ({
            id: s.id || s._id,
            name: s.name || s.title || "Chuyên khoa",
          }));
          setSpecialties([{ id: "ALL", name: "Tất cả" }, ...normalized]);
        }
      } catch (err) {
        console.error(err);
        setError("Không tải được danh sách chuyên khoa.");
      } finally {
        setLoadingSpecialties(false);
      }
    };
    fetchSpecialties();
  }, []);

  // ====== LẤY BÁC SĨ THEO KHOA ======
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        setError("");
        // Vẫn lấy 6 để dư giả dữ liệu, xử lý hiển thị ở client
        const params = { page: 1, limit: 6 };
        if (selectedSpecialtyId !== "ALL")
          params.specialty = selectedSpecialtyId;

        const res = await doctorService.getAllDoctors(params);
        const raw = res.data;
        let list = [];
        if (Array.isArray(raw)) list = raw;
        else if (Array.isArray(raw?.doctors)) list = raw.doctors;
        else if (Array.isArray(raw?.data)) list = raw.data;
        else if (Array.isArray(raw?.data?.doctors)) list = raw.data.doctors;
        else if (Array.isArray(raw?.items)) list = raw.items;
        else if (Array.isArray(raw?.results)) list = raw.results;

        setDoctors(list);
      } catch (err) {
        console.error(err);
        setError("Không tải được danh sách bác sĩ.");
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, [selectedSpecialtyId]);

  // --- 2. LOGIC CẮT DANH SÁCH: MOBILE 4, DESKTOP 6 ---
  const displayedDoctors = useMemo(() => {
    const limit = isMobile ? 4 : 6;
    return doctors.slice(0, limit);
  }, [doctors, isMobile]);

  const safeSpecialties = Array.isArray(specialties) ? specialties : [];

  const handleCardClick = (id) => {
    navigate(`/doctors/${id}`);
  };

  return (
    <section className="w-full bg-white py-8 md:py-16">
      <div className="container mx-auto px-4">
        {/* Header + Tabs */}
        <div className="gap-4 mb-6 md:mb-8">
          <div className="text-center">
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] color-title font-semibold">
              ĐỘI NGŨ CHUYÊN GIA
            </p>
            <h2 className="text-xl md:text-3xl font-bold color-title mt-1">
              BÁC SĨ THEO CHUYÊN KHOA
            </h2>
            <div className="justify-center flex mb-4">
              <p className="text-sm md:text-base text-slate-600 mt-2 max-w-xl justify-center line-clamp-2 md:line-clamp-none">
                Chọn chuyên khoa để xem nhanh bác sĩ tiêu biểu.
              </p>
            </div>
          </div>
          
          <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex justify-start md:justify-center gap-2 md:gap-3 min-w-max px-1">
              {loadingSpecialties && (
                <span className="text-sm text-slate-500">
                  Đang tải chuyên khoa...
                </span>
              )}
              {!loadingSpecialties &&
                safeSpecialties.map((spec) => {
                  const id = spec.id;
                  const isActive = id === selectedSpecialtyId;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedSpecialtyId(id)}
                      className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-base border transition whitespace-nowrap ${
                        isActive
                          ? "btn-color border-blue-400 text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600"
                      }`}
                    >
                      {spec.name}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {error && (
          <p className="text-center text-sm text-red-500 mb-4">{error}</p>
        )}

        {loadingDoctors ? (
          <p className="text-center text-slate-500">Đang tải bác sĩ...</p>
        ) : displayedDoctors.length === 0 ? (
          <p className="text-center text-slate-500">
            Chưa có bác sĩ nào cho chuyên khoa này.
          </p>
        ) : (
          // --- 3. GRID SYSTEM: MOBILE 2 CỘT, DESKTOP 3 CỘT ---
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-6">
            {displayedDoctors.map((doctor) => {
              const {
                _id,
                id,
                fullName,
                thumbnail,
                specialty_id,
                consultation_fee,
                averageRating,
                address,
                experience: { value: expValue } = { value: 0 },
              } = doctor;

              const experienceYears = doctor.career_start_year
                ? new Date().getFullYear() - new Date(doctor.career_start_year)
                : "—";
              const doctorId = _id || id;

              return (
                <div
                  key={doctorId}
                  onClick={() => handleCardClick(doctorId)}
                  // --- 4. CARD STYLING RESPONSIVE ---
                  // Mobile: p-3, Desktop: p-5
                  className="group bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer h-full"
                >
                  {/* Wrapper Header: Mobile xếp dọc (flex-col), Desktop xếp ngang (flex-row) */}
                  <div className="flex flex-col items-center md:flex-row md:items-start gap-2 md:gap-4 mb-2 md:mb-4">
                    {/* Avatar */}
                    <div className="w-20 h-20 md:w-16 md:h-16 rounded-full overflow-hidden shrink-0 border border-slate-100 shadow-inner">
                      <img
                        src={
                          thumbnail ||
                          "https://ui-avatars.com/api/?name=Doctor&background=random"
                        }
                        alt={fullName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    
                    {/* Info Header: Mobile căn giữa, Desktop căn trái */}
                    <div className="text-center md:text-left w-full overflow-hidden">
                      <span className="inline-block text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 mb-1">
                        {specialty_id?.name || "Đa khoa"}
                      </span>
                      <h3 className="font-bold text-sm md:text-base text-slate-800 line-clamp-1 group-hover:text-sky-600 transition-colors">
                        Bs. {fullName}
                      </h3>
                      <div className="flex items-center justify-center md:justify-start gap-1 text-xs text-amber-500 mt-1">
                        <Star size={12} className="fill-amber-500" />
                        <span className="font-bold text-slate-700">
                          {averageRating || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Info: Căn chỉnh lại cho gọn trên mobile */}
                  <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-5 text-xs md:text-sm text-slate-500 flex-1">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Briefcase
                        size={14}
                        className="shrink-0 text-slate-400 hidden md:block" // Ẩn icon trên mobile cho gọn
                      />
                      <span className="text-[11px] md:text-xs text-center md:text-left">
                        {experienceYears !== "—"
                          ? `${experienceYears} năm KN`
                          : "Chưa cập nhật KN"}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 justify-center md:justify-start">
                      <MapPin
                        size={14}
                        className="mt-0.5 shrink-0 text-slate-400 hidden md:block"
                      />
                      <span className="line-clamp-2 text-[11px] md:text-xs text-center md:text-left">
                        {address || "Chưa cập nhật địa chỉ"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 justify-center md:justify-start pt-1 border-t border-slate-50 md:border-none md:pt-0 mt-1 md:mt-0">
                      <Banknote size={14} className="shrink-0 text-slate-400" />
                      <span className="font-bold text-sky-700 text-xs md:text-sm">
                        {formatVND(consultation_fee)}
                      </span>
                    </div>
                  </div>

                  {/* Button */}
                  <div className="mt-auto w-full py-2 md:py-2.5 rounded-lg md:rounded-xl bg-slate-50 text-slate-600 text-xs md:text-sm font-bold text-center group-hover:bg-sky-500 group-hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-md">
                    <CalendarCheck size={14} className="md:w-4 md:h-4" /> 
                    <span className="hidden md:inline">Đặt lịch</span>
                    <span className="md:hidden">Đặt ngay</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 md:mt-8 flex justify-center">
          <Link
            to="/doctors"
            className="inline-flex items-center px-4 md:px-5 py-2 md:py-2.5 rounded-full btn-color text-white text-xs md:text-sm font-semibold shadow transition"
          >
            Xem thêm bác sĩ
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-3 h-3 md:w-4 md:h-4 ml-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}