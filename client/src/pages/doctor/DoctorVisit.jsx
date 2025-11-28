import React, { useState, useEffect } from "react";
import { toastSuccess, toastError,toastWarning } from "../../utils/toast";

// Import Services
import visitService from "../../services/VisitService";

// Import Components đã tách
import DashboardStats from "../../components/doctor/visit/DashboardStats";
import VisitFilter from "../../components/doctor/visit/VisitFilter";
import VisitList from "../../components/doctor/visit/VisitList";
import VisitDetailModal from "../../components/doctor/visit/VistitDetailModal"; // File modal bạn đã có

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

  const [filters, setFilters] = useState({
    diagnosis: "",
    fromDate: "",
    toDate: "",
  });

  // --- EFFECTS ---
  useEffect(() => {
    fetchDashboardStats();
    handleSearch();
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

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await visitService.searchDoctorVisits(filters);
      if (res.data && Array.isArray(res.data.data)) {
        setVisits(res.data.data);
      } else {
        setVisits([]);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
        toastError("Không thể tải danh sách hồ sơ khám.");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilter = () => {
    setFilters({ diagnosis: "", fromDate: "", toDate: "" });
    // setTimeout để đảm bảo state đã clear trước khi gọi API
    setTimeout(() => {
        // Có thể gọi lại hàm search với bộ lọc rỗng thủ công để chắc chắn
        visitService.searchDoctorVisits({ diagnosis: "", fromDate: "", toDate: "" })
          .then(res => setVisits(res.data?.data || []))
          .catch(err => console.error(err));
    }, 0);
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

      {/* 1. Thống kê */}
      <DashboardStats stats={stats} />

      {/* 2. Bộ lọc */}
      <VisitFilter
        filters={filters}
        onChange={handleFilterChange}
        onSearch={handleSearch}
        onClear={handleClearFilter}
      />

      {/* 3. Danh sách */}
      <VisitList
        visits={visits}
        loading={loading}
        onViewDetail={handleOpenDetail}
      />

      {/* 4. Modal Chi tiết */}
      {selectedVisit && (
        <VisitDetailModal
          visit={selectedVisit}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default DoctorVisit;