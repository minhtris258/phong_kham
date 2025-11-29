// src/components/DoctorsDirectory.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Star, 
  Stethoscope, 
  MapPin, 
  Banknote, 
  Search, 
  CalendarCheck
} from "lucide-react"; 
import doctorService from "../../services/DoctorService";
import specialtyService from "../../services/SpecialtyService";

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

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [doctorRes, specialtyRes] = await Promise.all([
          doctorService.getAllDoctors(),
          specialtyService.getAllSpecialties()
        ]);
        const doctorList = doctorRes.data?.doctors || doctorRes.data || [];
        setDoctors(doctorList);
        const specialtyList = specialtyRes.data || [];
        setSpecialties(specialtyList);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filteredDoctors = useMemo(() => {
    if (selectedSpecialtyId === "ALL") return doctors;
    return doctors.filter((doctor) => {
      const docSpecId = doctor.specialty_id?._id || doctor.specialty_id;
      return String(docSpecId) === String(selectedSpecialtyId);
    });
  }, [doctors, selectedSpecialtyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-10 lg:py-16  min-h-screen">
      <div className="text-center mb-10 mt-15">
        <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-3">
          Đội ngũ chuyên gia
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Đặt lịch khám với các bác sĩ hàng đầu, chuyên môn cao và tận tâm với nghề.
        </p>
      </div>

      <div className="mb-10">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={() => setSelectedSpecialtyId("ALL")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300
            ${
              selectedSpecialtyId === "ALL"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30 ring-2 ring-sky-300 ring-offset-2"
                : "bg-white text-slate-600 border border-slate-200 hover:border-sky-300 hover:text-sky-600 shadow-sm"
            }`}
          >
            <Search size={16} />
            Tất cả
          </button>
          {specialties.map((spec) => (
            <button
              key={spec._id}
              type="button"
              onClick={() => setSelectedSpecialtyId(spec._id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300
              ${
                selectedSpecialtyId === spec._id
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30 ring-2 ring-sky-300 ring-offset-2"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-sky-300 hover:text-sky-600 shadow-sm"
              }`}
            >
              {spec.name}
            </button>
          ))}
        </div>
      </div>

      {filteredDoctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 mx-auto max-w-2xl">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
             <Search size={32} className="text-slate-400" />
          </div>
          <p className="text-slate-600 text-lg font-medium">Chưa có bác sĩ nào thuộc chuyên khoa này.</p>
          <button 
            onClick={() => setSelectedSpecialtyId("ALL")}
            className="mt-4 text-sky-500 font-medium hover:underline hover:text-sky-600 transition-colors"
          >
            Quay lại xem tất cả
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => {
            const {
              _id,
              fullName,
              thumbnail,
              specialty_id,
              consultation_fee,
              averageRating,
              address
            } = doctor;

            const displayName = fullName || "Bác sĩ";
            const displaySpec = specialty_id?.name || "Đa khoa";
            const displayImage = thumbnail || "https://ui-avatars.com/api/?name=Doctor&background=random";
            const ratingValue = averageRating || 0;
            const hasRating = ratingValue > 0;

            return (
              <div
                key={_id}
                className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row gap-5"
              >
                {/* Cột Trái: Ảnh (Đã center sẵn ở flex-col items-center) */}
                <div className="shrink-0 flex flex-col items-center sm:items-start">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-slate-100 shadow-inner group-hover:shadow-md transition-shadow">
                    <img
                      src={displayImage}
                      alt={displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Cột Phải: Thông tin (THAY ĐỔI Ở ĐÂY: Thêm items-center text-center cho mobile) */}
                <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                  
                  {/* Badge Row (Thêm justify-center) */}
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 flex-wrap w-full">
                      <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                        <Stethoscope size={12} />
                        {displaySpec}
                      </span>

                      {hasRating ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                          <Star size={12} className="fill-amber-500" />
                          <span>{ratingValue}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                          <Star size={12} className="text-slate-400" />
                          <span>Mới</span>
                        </div>
                      )}
                  </div>

                  {/* Tên Bác sĩ */}
                  <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-sky-600 transition-colors line-clamp-1 capitalize w-full">
                    Bs. {displayName}
                  </h3>

                  {/* Địa chỉ & Giá (Thêm justify-center) */}
                  <div className="space-y-1.5 mb-5 mt-1 w-full">
                      <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-2">
                        <MapPin size={15} className="text-slate-400 shrink-0" />
                        <span className="line-clamp-1 text-center sm:text-left">{address || "Chưa cập nhật địa chỉ"}</span>
                      </p>
                      
                      <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-2">
                        <Banknote size={15} className="text-slate-400 shrink-0" />
                        <span className="font-semibold text-sky-700 bg-sky-50 px-1.5 rounded">
                          {formatVND(consultation_fee)}
                        </span>
                      </p>
                  </div>
                  
                  {/* Button Đặt lịch */}
                  <div className="mt-auto w-full">
                    <Link
                      to={`/doctors/${_id}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-sky-500 hover:text-white transition-all active:scale-95"
                    >
                      <CalendarCheck size={16} />
                      Đặt lịch hẹn
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}