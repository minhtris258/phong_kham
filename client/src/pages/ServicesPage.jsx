import React, { useEffect, useMemo, useState } from "react";
// import { Link } from "react-router-dom"; // Không dùng Link nếu muốn bật Modal
import { ChevronLeft, ChevronRight, Filter, ArrowUpDown } from "lucide-react";
import medicalServiceService from "../services/MedicalServiceService";
import ServicesModal from "../components/ServicesModal";

const ITEMS_PER_PAGE = 6;

export default function ServicesPage() {
  // === STATE QUẢN LÝ DỮ LIỆU ===
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // === STATE BỘ LỌC & SẮP XẾP ===
  const [selectedPriceRange, setSelectedPriceRange] = useState("ALL");
  const [sortOption, setSortOption] = useState("default");

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

  // 2. XỬ LÝ LỌC VÀ SẮP XẾP
  const processedServices = useMemo(() => {
    let result = [...services];

    // Lọc giá
    if (selectedPriceRange !== "ALL") {
      result = result.filter((s) => {
        const fee = Number(s.price || s.fee || 0);
        if (selectedPriceRange === "<200") return fee < 200000;
        if (selectedPriceRange === "200-500")
          return fee >= 200000 && fee <= 500000;
        if (selectedPriceRange === ">500") return fee > 500000;
        return true;
      });
    }

    // Sắp xếp
    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-desc":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
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

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPriceRange, sortOption]);

  const resolveServiceImage = (s) =>
    s.thumbnail ||
    s.image ||
    "https://via.placeholder.com/300x200.png?text=Service";

  // === HÀM MỞ MODAL NHANH ===
  const handleOpenModal = (item) => {
    setSelectedService(item); // Lấy data hiện tại ném vào state
    setIsModalOpen(true); // Mở modal lên
  };

  // --- RENDER ---
  if (loading)
    return <div className="py-20 text-center text-slate-500">Đang tải...</div>;
  if (error)
    return <div className="py-20 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 mt-14 py-10 min-h-screen">
      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#0a2463]">
          DỊCH VỤ CHUYÊN SÂU
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SIDEBAR BỘ LỌC (Giữ nguyên logic cũ) */}
        <aside className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
            {/* ... (Phần code bộ lọc giữ nguyên như cũ để tiết kiệm chỗ hiển thị) ... */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-[#0a2463] font-bold text-lg">
                <Filter size={20} /> Bộ lọc
              </div>
              <button
                onClick={() => {
                  setSelectedPriceRange("ALL");
                  setSortOption("default");
                }}
                className="text-xs font-semibold text-red-500 hover:underline"
              >
                Đặt lại
              </button>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase">
                Khoảng giá
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Tất cả", value: "ALL" },
                  { label: "< 200k", value: "<200" },
                  { label: "200k - 500k", value: "200-500" },
                  { label: "> 500k", value: ">500" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="price"
                      value={option.value}
                      checked={selectedPriceRange === option.value}
                      onChange={(e) => setSelectedPriceRange(e.target.value)}
                      className="peer h-4 w-4 cursor-pointer"
                    />
                    <span className="text-sm peer-checked:font-bold peer-checked:text-blue-600">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="lg:col-span-9">
          {/* TOOLBAR */}
          <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <p className="text-slate-600 text-sm">
              Hiển thị <b>{processedServices.length}</b> dịch vụ
            </p>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2"
            >
              <option value="default">Mặc định</option>
              <option value="price-asc">Giá: Thấp - Cao</option>
              <option value="price-desc">Giá: Cao - Thấp</option>
              <option value="name-asc">Tên: A - Z</option>
            </select>
          </div>

          {/* GRID DỊCH VỤ - SỬA LẠI PHẦN CLICK */}
          {paginatedServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedServices.map((item) => {
                const fee = item.price || item.fee || 0;
                return (
                  <div
                    key={item._id || item.id}
                    // THAY ĐỔI QUAN TRỌNG TẠI ĐÂY:
                    // 1. Click vào div cha là mở modal luôn
                    onClick={() => handleOpenModal(item)}
                    // 2. Thêm cursor-pointer để biết là bấm được
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full group cursor-pointer"
                  >
                    <div className="w-full h-48 overflow-hidden relative">
                      <img
                        src={resolveServiceImage(item)}
                        alt={item.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all" />
                    </div>

                    <div className="flex-1 flex flex-col p-5">
                      <span className="bg-blue-50 color-title-hover  text-[10px] font-bold px-2 py-1 rounded w-fit mb-2">
                        DỊCH VỤ
                      </span>

                      <h3 className="text-lg font-bold text-slate-800 line-clamp-2 mb-2 color-title-2 transition-colors">
                        {item.name}
                      </h3>

                      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-lg font-bold text-[#0a2463]">
                          {fee
                            ? Number(fee).toLocaleString("vi-VN") + "đ"
                            : "Liên hệ"}
                        </span>

                        {/* Nút giả lập (chỉ để đẹp, click vào div cha đã kích hoạt rồi) */}
                        <button className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                          Chi tiết <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-10 text-center rounded-2xl border border-dashed">
              Không tìm thấy dịch vụ.
            </div>
          )}

          {/* PHÂN TRANG */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 border rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-10" />
              </button>
              <span className="flex items-center font-bold px-2">
                Trang {currentPage}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="w-10 h-10 border rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronRight className="w-10 " />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MODAL */}
      <ServicesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={selectedService} // Dữ liệu service được truyền thẳng vào đây
      />
    </div>
  );
}
