// src/components/DoctorsDirectory.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { 
  Star, 
  Stethoscope, 
  MapPin, 
  Banknote, 
  Search, 
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Filter,
  SortAsc, // Icon sắp xếp
  SortDesc
} from "lucide-react"; 
import doctorService from "../../services/DoctorService";
import specialtyService from "../../services/SpecialtyService";
import { toastSuccess, toastError } from "../../utils/toast";

const formatVND = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return value;
  return n.toLocaleString("vi-VN") + "đ";
};

const ITEMS_PER_PAGE = 9; 
const SIDEBAR_SPECS_LIMIT = 5; // Số lượng khoa hiển thị trong sidebar trước khi xem thêm

export default function DoctorsDirectory() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);

    // === LẤY CHUYÊN KHOA TỪ URL ===
  const [searchParams] = useSearchParams();
  const urlSpecialtyId = searchParams.get("specialtyId") || "ALL";

  // === CÁC STATE BỘ LỌC ===
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState("ALL");
  const [filterPrice, setFilterPrice] = useState("ALL");
  const [filterRating, setFilterRating] = useState(0);
  const [sortOrder, setSortOrder] = useState("DEFAULT"); // DEFAULT, ASC, DESC

  // === STATE HIỂN THỊ ===
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(false); // Toggle xem thêm khoa ở sidebar

   useEffect(() => {
    setSelectedSpecialtyId(urlSpecialtyId || "ALL");
  }, [urlSpecialtyId])
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [doctorRes, specialtyRes] = await Promise.all([
          // 👇 SỬA DÒNG NÀY: Truyền thêm { limit: 1000 } để lấy hết danh sách
          doctorService.getAllDoctors({ limit: 1000 }), 
          
          specialtyService.getAllSpecialties({ limit: 100 })
        ]);
        
        const doctorList = doctorRes.data?.doctors || doctorRes.data || [];
        setDoctors(doctorList);

        const rawSpecs = specialtyRes.data?.specialties || specialtyRes.data || [];
        setSpecialties(Array.isArray(rawSpecs) ? rawSpecs : []);

      } catch (err) {
        toastError("Lỗi tải dữ liệu:", err);
        setDoctors([]);
        setSpecialties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Reset phân trang khi đổi bộ lọc
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedSpecialtyId, filterPrice, filterRating, sortOrder]);

  // === LOGIC LỌC VÀ SẮP XẾP ===
  const processedDoctors = useMemo(() => {
    // 1. Lọc
    let result = doctors.filter((doctor) => {
      // Chuyên khoa
      let matchSpec = true;
      if (selectedSpecialtyId !== "ALL") {
        const docSpecId = doctor.specialty_id?._id || doctor.specialty_id;
        matchSpec = String(docSpecId) === String(selectedSpecialtyId);
      }

      // Giá
      let matchPrice = true;
      const fee = Number(doctor.consultation_fee) || 0;
      if (filterPrice === "UNDER_200") matchPrice = fee < 200000;
      else if (filterPrice === "200_500") matchPrice = fee >= 200000 && fee <= 500000;
      else if (filterPrice === "ABOVE_500") matchPrice = fee > 500000;

      // Đánh giá
      let matchRating = true;
      const rating = doctor.averageRating || 0;
      if (filterRating > 0) matchRating = rating >= filterRating;

      return matchSpec && matchPrice && matchRating;
    });

    // 2. Sắp xếp (A-Z / Z-A)
    if (sortOrder === "ASC") {
      result.sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
    } else if (sortOrder === "DESC") {
      result.sort((a, b) => (b.fullName || "").localeCompare(a.fullName || ""));
    }

    return result;
  }, [doctors, selectedSpecialtyId, filterPrice, filterRating, sortOrder]);

  const displayedDoctors = processedDoctors.slice(0, visibleCount);

  // Danh sách khoa hiển thị ở Sidebar
  const displayedSpecs = isSpecsExpanded ? specialties : specialties.slice(0, SIDEBAR_SPECS_LIMIT);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const clearFilters = () => {
    setSelectedSpecialtyId("ALL");
    setFilterPrice("ALL");
    setFilterRating(0);
    setSortOrder("DEFAULT");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8 lg:py-12 min-h-screen ">
      
      {/* Header */}
      <div className="text-center mb-10 mt-15">
        <h2 className="text-3xl font-bold color-title mb-2">Đội ngũ chuyên gia</h2>
        <p className="text-slate-500">Đặt lịch khám với các bác sĩ hàng đầu.</p>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button 
          onClick={() => setShowMobileFilter(!showMobileFilter)}
          className="flex items-center justify-center gap-2 bg-white border border-slate-300 px-4 py-3 rounded-xl text-slate-700 font-bold shadow-sm w-full hover:bg-slate-50 transition"
        >
          <Filter size={18} />
          {showMobileFilter ? "Ẩn bộ lọc" : "Bộ lọc & Sắp xếp"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* === SIDEBAR (GỘP TẤT CẢ VÀO ĐÂY) === */}
        <aside className={`w-full lg:w-1/5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24 ${showMobileFilter ? 'block' : 'hidden lg:block'}`}>
          
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Filter size={20} className="text-sky-500"/> Bộ lọc
            </h3>
            <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-semibold hover:underline transition">
              Đặt lại
            </button>
          </div>

          {/* 1. SẮP XẾP (A-Z) */}
          <div className="mb-8">
            <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Sắp xếp tên</h4>
            <div className="space-y-2">
               <label className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-2 rounded-lg -mx-2 transition">
                  <input type="radio" name="sort" className="accent-sky-500 w-4 h-4" checked={sortOrder === "DEFAULT"} onChange={() => setSortOrder("DEFAULT")} />
                  <span className="text-sm text-slate-600">Mặc định</span>
               </label>
               <label className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-2 rounded-lg -mx-2 transition">
                  <input type="radio" name="sort" className="accent-sky-500 w-4 h-4" checked={sortOrder === "ASC"} onChange={() => setSortOrder("ASC")} />
                  <span className="text-sm text-slate-600 flex items-center gap-2"><SortAsc size={14}/> Tên (A - Z)</span>
               </label>
               <label className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-2 rounded-lg -mx-2 transition">
                  <input type="radio" name="sort" className="accent-sky-500 w-4 h-4" checked={sortOrder === "DESC"} onChange={() => setSortOrder("DESC")} />
                  <span className="text-sm text-slate-600 flex items-center gap-2"><SortDesc size={14}/> Tên (Z - A)</span>
               </label>
            </div>
          </div>

          {/* 2. CHUYÊN KHOA (ĐÃ GỘP VÀO ĐÂY) */}
          <div className="mb-8">
            <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Chuyên khoa</h4>
            <div className="space-y-1">
              <label className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg -mx-2 transition ${selectedSpecialtyId === "ALL" ? "bg-sky-50" : "hover:bg-slate-50"}`}>
                 <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedSpecialtyId === "ALL" ? "border-sky-500" : "border-slate-300"}`}>
                    {selectedSpecialtyId === "ALL" && <div className="w-2 h-2 bg-sky-500 rounded-full" />}
                 </div>
                 <input type="radio" name="specialty" className="hidden" checked={selectedSpecialtyId === "ALL"} onChange={() => setSelectedSpecialtyId("ALL")} />
                 <span className={`text-sm ${selectedSpecialtyId === "ALL" ? "text-sky-700 font-bold" : "text-slate-600"}`}>Tất cả</span>
              </label>

              {displayedSpecs.map((spec) => (
                <label key={spec._id} className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg -mx-2 transition ${selectedSpecialtyId === spec._id ? "bg-sky-50" : "hover:bg-slate-50"}`}>
                   <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${selectedSpecialtyId === spec._id ? "border-sky-500" : "border-slate-300"}`}>
                      {selectedSpecialtyId === spec._id && <div className="w-2 h-2 bg-sky-500 rounded-full" />}
                   </div>
                   <input type="radio" name="specialty" className="hidden" checked={selectedSpecialtyId === spec._id} onChange={() => setSelectedSpecialtyId(spec._id)} />
                   <span className={`text-sm line-clamp-1 ${selectedSpecialtyId === spec._id ? "text-sky-700 font-bold" : "text-slate-600"}`}>{spec.name}</span>
                </label>
              ))}
            </div>
            
            {/* Nút xem thêm khoa */}
            {specialties.length > SIDEBAR_SPECS_LIMIT && (
               <button 
                  onClick={() => setIsSpecsExpanded(!isSpecsExpanded)}
                  className="mt-2 text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 transition"
               >
                  {isSpecsExpanded ? <>Thu gọn <ChevronUp size={12}/></> : <>Xem thêm {specialties.length - SIDEBAR_SPECS_LIMIT} khoa <ChevronDown size={12}/></>}
               </button>
            )}
          </div>

          {/* 3. GIÁ */}
          <div className="mb-8">
            <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Phí tư vấn</h4>
            <div className="space-y-2">
              {[
                { label: "Tất cả", value: "ALL" },
                { label: "Dưới 200k", value: "UNDER_200" },
                { label: "200k - 500k", value: "200_500" },
                { label: "Trên 500k", value: "ABOVE_500" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-2 rounded-lg -mx-2 transition">
                  <input type="radio" name="price" className="accent-sky-500 w-4 h-4" checked={filterPrice === opt.value} onChange={() => setFilterPrice(opt.value)} />
                  <span className="text-sm text-slate-600">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. ĐÁNH GIÁ */}
          <div>
            <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Đánh giá</h4>
            <div className="space-y-2">
               <label className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg -mx-2 transition">
                  <input type="radio" name="rating" className="accent-sky-500 w-4 h-4" checked={filterRating === 0} onChange={() => setFilterRating(0)} />
                  <span className="text-sm text-slate-600">Mọi đánh giá</span>
               </label>
               {[5, 4, 3].map(star => (
                 <label key={star} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg -mx-2 transition">
                    <input type="radio" name="rating" className="accent-sky-500 w-4 h-4" checked={filterRating === star} onChange={() => setFilterRating(star)} />
                    <div className="flex text-sm text-slate-600 items-center">
                       <span className="mr-1">Từ {star}</span> <Star size={12} className="fill-amber-400 text-amber-400"/>
                    </div>
                 </label>
               ))}
            </div>
          </div>

        </aside>

        {/* === MAIN CONTENT (DANH SÁCH BÁC SĨ) === */}
        <div className="w-full lg:w-4/5">
          
          {/* Thông báo kết quả tìm kiếm */}
          <div className="mb-4 text-sm text-slate-500 font-medium">
             Tìm thấy <span className="text-sky-600 font-bold">{processedDoctors.length}</span> bác sĩ phù hợp
          </div>

          {displayedDoctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <Search size={48} className="text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">Không tìm thấy bác sĩ nào.</p>
              <button onClick={clearFilters} className="mt-2 text-sky-600 hover:underline text-sm font-bold">Xóa bộ lọc để xem tất cả</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedDoctors.map((doctor) => {
                  const { _id, fullName, thumbnail, specialty_id, consultation_fee, averageRating, address } = doctor;
                  return (
                    <div key={_id} className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                      <div className="flex gap-4 items-start mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-slate-100 shadow-inner">
                          <img src={thumbnail || "https://ui-avatars.com/api/?name=Doctor&background=random"} alt={fullName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div>
                           <span className="inline-block text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 mb-1">
                              {specialty_id?.name || "Đa khoa"}
                           </span>
                           <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-sky-600 transition-colors">
                              Bs. {fullName}
                           </h3>
                           <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                              <Star size={12} className="fill-amber-500"/>
                              <span className="font-bold text-slate-700">{averageRating || 0}</span>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-5 text-sm text-slate-500 flex-1">
                         <div className="flex items-start gap-2">
                            <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400"/>
                            <span className="line-clamp-2 text-xs">{address || "Chưa cập nhật địa chỉ"}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <Banknote size={14} className="shrink-0 text-slate-400"/>
                            <span className="font-bold text-sky-700">{formatVND(consultation_fee)}</span>
                         </div>
                      </div>

                      <Link to={`/doctors/${_id}`} className="mt-auto w-full py-2.5 rounded-xl bg-slate-50 text-slate-600 text-sm font-bold text-center hover:bg-sky-500 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-md">
                         <CalendarCheck size={16}/> Đặt lịch
                      </Link>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Load More */}
          {visibleCount < processedDoctors.length && (
            <div className="mt-12 text-center">
                <button onClick={handleLoadMore} className="px-8 py-3 rounded-full bg-white border border-slate-200 text-slate-600 font-bold shadow-sm hover:border-sky-300 hover:text-sky-600 transition-all inline-flex items-center gap-2">
                  Xem thêm {processedDoctors.length - visibleCount} bác sĩ <ChevronDown size={18}/>
                </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}