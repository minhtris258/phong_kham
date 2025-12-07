import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import medicalServiceService from "../services/medicalServiceService";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("ALL");

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
        <p className="text-center text-slate-600">
          Hiện chưa có dịch vụ nào.
        </p>
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
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50">
                  {/* icon phễu lọc đơn giản */}
                  <span className="w-3 h-3 border-t-2 border-l-2 border-blue-500 rotate-[-45deg]" />
                </span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredServices.map((item) => {
              const fee = item.price || item.fee || 0;

              return (
                <div
                  key={item._id || item.id}
                  className="bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 p-6 flex flex-col"
                >
                  {/* Ảnh + tên + trạng thái */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="shrink-0">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-100 bg-slate-50">
                        <img
                          src={resolveServiceImage(item)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                      {/* Tag trạng thái nếu có */}
                      {item.status && (
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-1 ${
                            item.status === "active"
                              ? "bg-green-50 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.status === "active"
                            ? "Đang cung cấp"
                            : "Ngừng cung cấp"}
                        </div>
                      )}
                      <h3 className="text-base font-bold text-[#0a2463] leading-snug">
                        {item.name}
                      </h3>
                    </div>
                  </div>

                  {/* Giá + mã dịch vụ */}
                  <div className="space-y-1 text-sm mb-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="text-lg leading-none">💳</span>
                      <span className="font-semibold text-[#0a2463]">
                        {fee
                          ? Number(fee).toLocaleString("vi-VN") + "đ"
                          : "Liên hệ"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="text-xs uppercase tracking-wide">
                        Mã DV:
                      </span>
                      <span className="font-medium">
                        {item.code || "Tự động"}
                      </span>
                    </div>
                  </div>

                  {/* Mô tả ngắn */}
                  <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                    {item.description || "Không có mô tả"}
                  </p>

                  {/* Nút xem chi tiết */}
                  <div className="mt-auto">
                    <Link
                      to={`/services/${item._id || item.id}`}
                      className="w-full inline-flex items-center justify-center h-11 rounded-2xl bg-[#f4f7ff] text-[#0a2463] font-semibold text-sm hover:bg-[#e6ecff] transition"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
