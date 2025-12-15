import React, { useState, useEffect } from "react";
import { toastSuccess, toastError, toastWarning } from "../../utils/toast";

// Import Services
import visitService from "../../services/VisitService";

// Import Components
import DashboardStats from "../../components/doctor/visit/DashboardStats";
import VisitFilter from "../../components/doctor/visit/VisitFilter";
import VisitList from "../../components/doctor/visit/VisitList";
import VisitDetailModal from "../../components/doctor/visit/VistitDetailModal";

const DoctorVisit = () => {
  // --- STATE ---
  const [stats, setStats] = useState({
    visits_today: 0,
    visits_this_month: 0,
    revenue_this_month: 0,
  });

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  // State phân trang
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalDocs: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    diagnosis: "",
    fromDate: "",
    toDate: "",
    patientName: "", // Thêm trường này nếu backend bạn hỗ trợ tìm tên
  });

  // --- EFFECTS ---
  useEffect(() => {
    fetchDashboardStats();
    handleSearch(1); // Load dữ liệu trang 1 khi mới vào
  }, []);

  // --- API FUNCTIONS ---
  const fetchDashboardStats = async () => {
    try {
      const res = await visitService.getDoctorStats();
      if (res.data && res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error("Lỗi tải thống kê:", error);
    }
  };

  // HÀM SEARCH & PHÂN TRANG (QUAN TRỌNG)
  const handleSearch = async (pageNumber = 1) => {
    setLoading(true);
    try {
      // Chuẩn bị params gửi lên server
      const params = {
        ...filters,
        page: pageNumber,
        limit: 10,
      };

      // Gọi API searchDoctorVisits (đã update ở backend)
      const res = await visitService.searchDoctorVisits(params);

      // Cấu trúc trả về từ Backend mới:
      // { data: [...], pagination: { totalItems, totalPages, currentPage, pageSize } }

      if (res.data) {
        // 1. Lấy danh sách visits
        const fetchedVisits = res.data.data || [];
        setVisits(fetchedVisits);

        // 2. Lấy thông tin phân trang (nếu có) hoặc fallback
        const meta = res.data.pagination || {};

        setPagination({
          page: meta.currentPage || pageNumber,
          limit: meta.pageSize || 10,
          totalDocs: meta.totalItems || fetchedVisits.length,
          totalPages: meta.totalPages || 1,
        });
      }
    } catch (error) {
      console.error(error);
      toastError("Không thể tải danh sách hồ sơ khám.");
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Khi bấm nút "Tìm kiếm", luôn reset về trang 1
  const onSearchClick = () => {
    handleSearch(1);
  };

  // Khi bấm nút "Xóa lọc"
  const handleClearFilter = () => {
    const emptyFilters = {
      diagnosis: "",
      fromDate: "",
      toDate: "",
      patientName: "",
    };
    setFilters(emptyFilters);

    // Gọi lại API với bộ lọc rỗng, về trang 1
    setLoading(true);
    visitService
      .searchDoctorVisits({ ...emptyFilters, page: 1, limit: 10 })
      .then((res) => {
        const fetchedVisits = res.data.data || [];
        const meta = res.data.pagination || {};

        setVisits(fetchedVisits);
        setPagination({
          page: 1,
          limit: 10,
          totalDocs: meta.totalItems || 0,
          totalPages: meta.totalPages || 1,
        });
      })
      .catch((err) => toastError("Lỗi làm mới dữ liệu"))
      .finally(() => setLoading(false));
  };

  // Chuyển trang
  const handlePageChange = (newPage) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    handleSearch(newPage);
  };

  // Modal Handlers
  const handleOpenDetail = (visit) => setSelectedVisit(visit);
  const handleCloseDetail = () => setSelectedVisit(null);

  // --- RENDER ---
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Quản Lý Hồ Sơ Khám Bệnh
      </h1>

      <DashboardStats stats={stats} />

      <VisitFilter
        filters={filters}
        onChange={handleFilterChange}
        onSearch={onSearchClick}
        onClear={handleClearFilter}
      />

      <VisitList
        visits={visits}
        loading={loading}
        onViewDetail={handleOpenDetail}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {selectedVisit && (
        <VisitDetailModal visit={selectedVisit} onClose={handleCloseDetail} />
      )}
    </div>
  );
};

export default DoctorVisit;
