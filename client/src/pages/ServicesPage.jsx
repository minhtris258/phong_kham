import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Filter, ArrowUpDown } from "lucide-react"; // Cần cài lucide-react nếu chưa có
import medicalServiceService from "../services/medicalServiceService";
import ServicesModal from "../components/ServicesModal";

const ITEMS_PER_PAGE = 6; // Số lượng dịch vụ mỗi trang

export default function ServicesPage() {
  // === STATE QUẢN LÝ DỮ LIỆU ===
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // === STATE BỘ LỌC & SẮP XẾP ===
  const [selectedPriceRange, setSelectedPriceRange] = useState("ALL"); // Khoảng giá
  const [sortOption, setSortOption] = useState("default"); // Tùy chọn sắp xếp (giá/tên)
  
  // === STATE PHÂN TRANG ===
  const [currentPage, setCurrentPage] = useState(1);

  // === STATE MODAL ===
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. FETCH DATA
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await medicalServiceService.getAllServices({ limit: 1000 });
        
        let list = [];
        if (Array.isArray(res.data)) list = res.data;
        else if (Array.isArray(res.data?.data)) list = res.data.data;
        else if (Array.isArray(res.data?.services)) list = res.data.services;

        setServices(list);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Không thể tải danh sách dịch vụ!");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // 2. XỬ LÝ LỌC VÀ SẮP XẾP (USE MEMO)
  const processedServices = useMemo(() => {
    let result = [...services];

    // A. Lọc theo khoảng giá
    if (selectedPriceRange !== "ALL") {
      result = result.filter((s) => {
        const fee = Number(s.price || s.fee || 0);
        if (selectedPriceRange === "<200") return fee < 200000;
        if (selectedPriceRange === "200-500") return fee >= 200000 && fee <= 500000;
        if (selectedPriceRange === ">500") return fee > 500000;
        return true;
      });
    }

    // B. Sắp xếp (Sort)
    switch (sortOption) {
      case "price-asc": // Giá thấp -> cao
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-desc": // Giá cao -> thấp
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "name-asc": // Tên A-Z
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc": // Tên Z-A
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Mặc định (có thể theo ngày tạo mới nhất)
        break;
    }

    return result;
  }, [services, selectedPriceRange, sortOption]);

  // 3. XỬ LÝ PHÂN TRANG
  const totalPages = Math.ceil(processedServices.length / ITEMS_PER_PAGE);
  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedServices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedServices, currentPage]);

  // Reset về trang 1 khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPriceRange, sortOption]);

  // Helper hiển thị ảnh
  const resolveServiceImage = (s) =>
    s.thumbnail || s.image || "https://via.placeholder.com/300x200.png?text=Service";

  // --- RENDER ---
  if (loading) return <div className="py-20 text-center text-xl font-semibold text-slate-500">Đang tải dữ liệu...</div>;
  if (error) return <div className="py-20 text-center text-red-500 text-xl">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 mt-14 py-10 min-h-screen">
      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#0a2463]">
          DỊCH VỤ CHUYÊN SÂU
        </h1>
        <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
          Danh sách các gói khám và dịch vụ y tế chất lượng cao, được thiết kế phù hợp với nhu cầu của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ====== SIDEBAR: BỘ LỌC ====== */}
        <aside className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-[#0a2463] font-bold text-lg">
                <Filter size={20} /> Bộ lọc
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-red-500 hover:underline"
                onClick={() => {
                  setSelectedPriceRange("ALL");
                  setSortOption("default");
                }}
              >
                Đặt lại
              </button>
            </div>

            {/* Filter Group: Giá */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Khoảng giá</h3>
              <div className="space-y-3">
                {[
                  { label: "Tất cả mức giá", value: "ALL" },
                  { label: "Dưới 200.000đ", value: "<200" },
                  { label: "200.000đ - 500.000đ", value: "200-500" },
                  { label: "Trên 500.000đ", value: ">500" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="radio"
                        name="price"
                        value={option.value}
                        className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-blue-600 checked:bg-blue-600 transition-all"
                        checked={selectedPriceRange === option.value}
                        onChange={(e) => setSelectedPriceRange(e.target.value)}
                      />
                      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100">
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      </div>
                    </div>
                    <span className={`text-sm group-hover:text-blue-600 transition-colors ${selectedPriceRange === option.value ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ====== MAIN CONTENT: DANH SÁCH & SẮP XẾP ====== */}
        <main className="lg:col-span-9">
          
          {/* TOOLBAR: Kết quả & Sắp xếp */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <p className="text-slate-600 text-sm mb-3 sm:mb-0">
              Hiển thị <span className="font-bold text-[#0a2463]">{processedServices.length}</span> dịch vụ
            </p>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 hidden sm:inline-block">Sắp xếp theo:</span>
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-8 cursor-pointer font-medium"
                >
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                  <option value="name-asc">Tên: A - Z</option>
                  <option value="name-desc">Tên: Z - A</option>
                </select>
                <ArrowUpDown className="absolute right-2.5 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* GRID DỊCH VỤ */}
          {paginatedServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedServices.map((item) => {
                const fee = item.price || item.fee || 0;
                return (
                  <div
                    key={item._id || item.id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full group"
                  >
                    <div className="w-full h-48 overflow-hidden relative">
                      <img
                        src={resolveServiceImage(item)}
                        alt={item.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="flex-1 flex flex-col p-5">
                      <div className="flex justify-between items-start mb-2">
                         <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
                           Dịch vụ
                         </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors" title={item.name}>
                        {item.name}
                      </h3>

                      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-lg font-bold text-[#0a2463]">
                          {fee ? Number(fee).toLocaleString("vi-VN") + "đ" : "Liên hệ"}
                        </span>
                        
                        <button
                          onClick={() => {
                            setSelectedService(item);
                            setIsModalOpen(true);
                          }}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                        >
                          Chi tiết <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-2xl text-center shadow-sm border border-dashed border-slate-300">
              <p className="text-slate-500 text-lg">Không tìm thấy dịch vụ nào phù hợp với bộ lọc.</p>
              <button 
                onClick={() => setSelectedPriceRange("ALL")}
                className="mt-4 px-6 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {/* PHÂN TRANG */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-all shadow-sm
                    ${currentPage === page 
                      ? "bg-[#0a2463] text-white border border-[#0a2463]" 
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MODAL CHI TIẾT (Đặt ngoài vòng lặp) */}
      <ServicesModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedService(null);
        }}
        service={selectedService}
      />
    </div>
  );
}