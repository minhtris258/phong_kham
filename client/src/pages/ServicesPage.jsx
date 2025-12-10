import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import medicalServiceService from "../services/medicalServiceService";
import ServicesModal from "../components/ServicesModal";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("ALL");
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await medicalServiceService.getAllServices();

        console.log("LIST services res:", res.data);

        let list = [];
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res.data.data)) {
          list = res.data.data;
        } else if (Array.isArray(res.data.services)) {
          list = res.data.services;
        }

        setServices(list);
      } catch (err) {
        console.error("LIST error:", err);
        setError("Không thể tải danh sách dịch vụ!");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // ====== FILTER THEO GIÁ ======
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const fee = Number(s.price || s.fee || 0);

      if (selectedPrice === "ALL") return true;
      if (selectedPrice === "<200") return fee && fee < 200000;
      if (selectedPrice === "200-500") return fee >= 200000 && fee <= 500000;
      if (selectedPrice === ">500") return fee > 500000;
      return true;
    });
  }, [services, selectedPrice]);

  if (loading) {
    return (
      <div className="container mx-auto py-20 text-center text-xl font-semibold">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-20 text-center text-red-500 text-xl">
        {error}
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <section className="container mx-auto py-12">
        <h2 className="text-center text-3xl lg:text-4xl font-bold mb-6 text-[#0a2463]">
          DANH SÁCH DỊCH VỤ
        </h2>
        <p className="text-center text-slate-600">Hiện chưa có dịch vụ nào.</p>
      </section>
    );
  }

  // helper ảnh dịch vụ
  const resolveServiceImage = (s) =>
    s.thumbnail ||
    s.image ||
    "https://via.placeholder.com/160x160.png?text=Service";

  return (
    <div className="max-w-7xl mx-auto px-4 mt-14 py-10 bg-[#f5f7fb]">
      {/* Tiêu đề giống mẫu */}
      <div className="text-center mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#0a2463]">
          DỊCH VỤ CHUYÊN SÂU
        </h1>
        <p className="mt-2 text-slate-600">
          Lựa chọn dịch vụ phù hợp với nhu cầu khám chữa bệnh của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ====== BỘ LỌC BÊN TRÁI ====== */}
        <aside className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#0a2463] text-lg">
                  Bộ lọc
                </span>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-red-500"
                onClick={() => setSelectedPrice("ALL")}
              >
                Đặt lại
              </button>
            </div>

            {/* LỌC THEO GIÁ */}
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Giá dịch vụ
              </h3>

              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="price"
                    value="ALL"
                    className="accent-blue-500"
                    checked={selectedPrice === "ALL"}
                    onChange={(e) => setSelectedPrice(e.target.value)}
                  />
                  <span>Tất cả</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="price"
                    value="<200"
                    className="accent-blue-500"
                    checked={selectedPrice === "<200"}
                    onChange={(e) => setSelectedPrice(e.target.value)}
                  />
                  <span>Dưới 200.000đ</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="price"
                    value="200-500"
                    className="accent-blue-500"
                    checked={selectedPrice === "200-500"}
                    onChange={(e) => setSelectedPrice(e.target.value)}
                  />
                  <span>200.000đ - 500.000đ</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="price"
                    value=">500"
                    className="accent-blue-500"
                    checked={selectedPrice === ">500"}
                    onChange={(e) => setSelectedPrice(e.target.value)}
                  />
                  <span>Trên 500.000đ</span>
                </label>
              </div>
            </div>
          </div>
        </aside>
        {/* ====== DANH SÁCH DỊCH VỤ BÊN PHẢI ====== */}
        <main className="lg:col-span-9">
          <p className="text-sm text-slate-600 mb-4">
            Tìm thấy{" "}
            <span className="font-semibold text-[#0a2463]">
              {filteredServices.length}
            </span>{" "}
            dịch vụ phù hợp
          </p>

          {/* Giới hạn còn 9 dịch vụ */}
          {(() => {
            const limitedServices = filteredServices.slice(0, 9);
            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {limitedServices.map((item) => {
                    const fee = item.price || item.fee || 0;
                    const createdAt =
                      item.published_at || item.created_at || item.date;

                    return (
                      <div
                        key={item._id || item.id}
                        className="bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                      >
                        {/* ẢNH LỚN */}
                        <div className="w-full h-40 md:h-48">
                          <img
                            src={resolveServiceImage(item)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* NỘI DUNG */}
                        <div className="flex-1 flex flex-col p-4 md:p-5">
                          <h3 className="text-base md:text-lg font-bold text-[#0a2463] leading-snug line-clamp-2 mb-1">
                            {item.name}
                          </h3>

                          <div className="text-[15px] font-semibold text-[#0a2463] mb-3">
                            {fee
                              ? Number(fee).toLocaleString("vi-VN") + "đ"
                              : "Liên hệ"}
                          </div>

                          <div className="mt-auto pt-2 flex items-center justify-between text-xs md:text-sm text-slate-500">
                            <span>
                              {createdAt
                                ? new Date(createdAt).toLocaleDateString(
                                    "vi-VN"
                                  )
                                : ""}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedService(item);
                                setIsModalOpen(true);
                              }}
                              className="inline-flex items-center text-[13px] font-semibold text-sky-600 hover:text-sky-700"
                            >
                              Xem Chi Tiết{" "}
                              <span className="ml-1 text-lg leading-none">
                                →
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Nút xem thêm nếu > 9 dịch vụ */}
                {filteredServices.length > 9 && (
                  <div className="text-center mt-8">
                    <Link
                      to="/services/all"
                      className="inline-block px-6 py-3 rounded-xl btn-color text-white font-semibold hover:bg-opacity-90 transition"
                    >
                      Xem thêm dịch vụ
                    </Link>
                  </div>
                )}
              </>
            );
          })()}
        </main>
      </div>
    </div>
  );
}
