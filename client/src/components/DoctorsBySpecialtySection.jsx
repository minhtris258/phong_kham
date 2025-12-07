import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Banknote, CalendarCheck } from "lucide-react";
import doctorService from "../services/DoctorService";

// Format tiền
const formatVND = (value) => {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return n.toLocaleString("vi-VN") + "đ";
};

export default function DoctorsBySpecialtySection() {
  // Luôn có 1 khoa "ALL"
  const [specialties, setSpecialties] = useState([
    { id: "ALL", name: "Tất cả" },
  ]);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState("ALL");

  const [doctors, setDoctors] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [error, setError] = useState("");

  // ====== LẤY DANH SÁCH KHOA ======
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setLoadingSpecialties(true);
        setError("");

        const res = await doctorService.getSpecialties({ limit: 100 });
        console.log("specialties response:", res);

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

        const params = {
          page: 1,
          limit: 4, // tối đa 4 bác sĩ
        };

        if (selectedSpecialtyId !== "ALL") {
          params.specialty = selectedSpecialtyId;
        }

        const res = await doctorService.getAllDoctors(params);
        console.log("doctors response:", res);

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

  const doctorsToShow = useMemo(() => doctors.slice(0, 4), [doctors]);
  const safeSpecialties = Array.isArray(specialties) ? specialties : [];
  const displayedDoctors = doctorsToShow;

  return (
    <section className="w-full bg-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Header + Tabs */}
        <div className=" md:flex-row md:items-end md:justify-between gap-4 mb-8 ">
          <div className=" text-center">
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] color-title font-semibold">
              ĐỘI NGŨ CHUYÊN GIA
            </p>
            <h2 className="text-2xl md:text-3xl font-bold color-title mt-1">
              BÁC SĨ THEO CHUYÊN KHOA
            </h2>
            <div className="justify-center flex mb-4">
              <p className="text-sm md:text-base text-slate-600 mt-2 max-w-xl justify-center">
              Chọn chuyên khoa để xem nhanh một số bác sĩ tiêu biểu. Nhấn
              &quot;Xem thêm&quot; để tới trang danh sách đầy đủ.
            </p>
            </div>
            
          </div>

          {/* Tabs chọn khoa */}
          <div className="w-full md:w-auto overflow-x-auto">
            <div className="flex gap-2 md:gap-3 min-w-max md:min-w-0">
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
                      className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm md:text-base border transition whitespace-nowrap
                        ${
                          isActive
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm"
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

        {/* Thông báo lỗi */}
        {error && (
          <p className="text-center text-sm text-red-500 mb-4">{error}</p>
        )}

        {/* Danh sách bác sĩ */}
        {loadingDoctors ? (
          <p className="text-center text-slate-500">Đang tải bác sĩ...</p>
        ) : displayedDoctors.length === 0 ? (
          <p className="text-center text-slate-500">
            Chưa có bác sĩ nào cho chuyên khoa này.
          </p>
        ) : (
          <div className="grid md:grid-cols-3 xl:grid-cols-3 gap-6">
            {displayedDoctors.slice(0, 6).map((doctor) => {
              const {
                _id,
                id,
                fullName,
                thumbnail,
                specialty_id,
                consultation_fee,
                averageRating,
                address,
              } = doctor;

              const doctorId = _id || id;

              return (
                <div
                  key={doctorId}
                  className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="flex gap-4 items-start mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-slate-100 shadow-inner">
                      <img
                        src={
                          thumbnail ||
                          "https://ui-avatars.com/api/?name=Doctor&background=random"
                        }
                        alt={fullName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    <div>
                      <span className="inline-block text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 mb-1">
                        {specialty_id?.name || "Đa khoa"}
                      </span>
                      <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-sky-600 transition-colors">
                        Bs. {fullName}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                        <Star size={12} className="fill-amber-500" />
                        <span className="font-bold text-slate-700">
                          {averageRating || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-5 text-sm text-slate-500 flex-1">
                    <div className="flex items-start gap-2">
                      <MapPin
                        size={14}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />
                      <span className="line-clamp-2 text-xs">
                        {address || "Chưa cập nhật địa chỉ"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Banknote size={14} className="shrink-0 text-slate-400" />
                      <span className="font-bold text-sky-700">
                        {formatVND(consultation_fee)}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/doctors/${doctorId}`}
                    className="mt-auto w-full py-2.5 rounded-xl bg-slate-50 text-slate-600 text-sm font-bold text-center hover:bg-sky-500 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                  >
                    <CalendarCheck size={16} /> Đặt lịch
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Nút xem thêm */}
        <div className="mt-8 flex justify-center">
          <Link
            to="/doctors"
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold shadow hover:bg-blue-700 transition"
          >
            Xem thêm bác sĩ
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-4 h-4 ml-2"
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
