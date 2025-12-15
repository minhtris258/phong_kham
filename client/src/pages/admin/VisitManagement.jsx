import React, { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { toastSuccess, toastError } from "../../utils/toast";

// Services
import visitService from "../../services/VisitService";

// Components
import VisitList from "../../components/admin/visit/VisitList";
import VisitDetailModal from "../../components/admin/visit/VisitDetailModal";
import Modal from "../../components/Modal"; // Modal chung (dùng cho xác nhận xóa)

const VisitManagement = () => {
  // === 1. STATE QUẢN LÝ DỮ LIỆU ===
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Phân trang & Bộ lọc
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalDocs: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    date: "",
  });

  // State Modals
  const [viewVisit, setViewVisit] = useState(null); // Lưu thông tin phiếu khám đang xem
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null); // Lưu ID phiếu khám cần xóa

  // === 2. HÀM GỌI API (FETCH DATA) ===
  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        date: filters.date,
      };

      const response = await visitService.getAllVisitsAdmin(params);

      // Log để debug xem cấu trúc thật sự là gì
      console.log("API Response:", response);

      // Xử lý linh hoạt dữ liệu trả về
      const dataList = response.data?.data || response.data || [];
      const meta = response.data?.meta || response.data?.pagination || {};

      // Lấy tổng số bản ghi (Thử nhiều key phổ biến)
      const totalCount =
        Number(meta.total) || Number(meta.totalDocs) || Number(meta.count) || 0;
      const totalPagesCount =
        Number(meta.pages) || Number(meta.totalPages) || 1;

      setVisits(dataList);

      setPagination((prev) => ({
        ...prev,
        page: Number(meta.page) || 1,
        totalPages: totalPagesCount,
        totalDocs: totalCount, // <--- Key quan trọng để hiện tổng số
        limit: Number(meta.limit) || 10,
      }));
    } catch (error) {
      console.error("Lỗi tải phiếu khám:", error);
      toastError("Không thể tải danh sách phiếu khám.");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // === 3. EFFECTS ===
  // Gọi API khi filter hoặc page thay đổi (Có debounce cho search để tối ưu)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVisits();
    }, 500); // Đợi 0.5s sau khi gõ phím mới gọi API
    return () => clearTimeout(timer);
  }, [fetchVisits]);

  // === 4. HANDLERS (XỬ LÝ SỰ KIỆN) ===

  // Xử lý tìm kiếm
  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset về trang 1 khi tìm kiếm
  };

  // Xử lý chọn ngày
  const handleDateChange = (e) => {
    setFilters((prev) => ({ ...prev, date: e.target.value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Mở modal xem chi tiết
  const handleViewVisit = (visit) => {
    setViewVisit(visit);
    setIsViewOpen(true);
  };

  // Xác nhận xóa (Mở modal xóa)
  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  // Thực hiện xóa (Gọi API)
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await visitService.deleteVisitAdmin(deleteId);
      toastSuccess("Xóa phiếu khám thành công!");
      setDeleteId(null);
      fetchVisits(); // Tải lại danh sách sau khi xóa
    } catch (error) {
      console.error(error);
      toastError(
        "Lỗi xóa: " + (error.response?.data?.message || error.message)
      );
    }
  };

  // === 5. RENDER GIAO DIỆN ===
  return (
    <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Tiêu đề trang */}
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Quản Lý Hồ Sơ Khám Bệnh
      </h2>

      {/* Nội dung chính: Loading hoặc Danh sách */}
      {loading && visits.length === 0 ? (
        <div className="flex h-96 justify-center items-center">
          <Loader2 className="w-12 h-12 animate-spin text-sky-600" />
        </div>
      ) : (
        <VisitList
          visits={visits}
          loading={loading}
          filters={filters}
          pagination={pagination}
          // Truyền các hàm xử lý xuống component con
          onSearchChange={handleSearchChange}
          onDateChange={handleDateChange}
          onPageChange={handlePageChange}
          handleViewVisit={handleViewVisit}
          confirmDelete={confirmDelete}
        />
      )}

      {/* --- CÁC MODAL --- */}

      {/* 1. Modal Xem Chi Tiết */}
      <VisitDetailModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        visit={viewVisit}
      />

      {/* 2. Modal Xác Nhận Xóa */}
      {deleteId && (
        <Modal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          title="Xác nhận xóa hồ sơ"
          maxWidth="sm"
        >
          <div className="p-4">
            <p className="text-gray-700 mb-6 text-base">
              Bạn có chắc chắn muốn xóa hồ sơ khám này không?
              <br />
              <span className="text-red-500 text-sm font-medium italic">
                Hành động này không thể hoàn tác.
              </span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition shadow-md"
              >
                Xóa Vĩnh Viễn
              </button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
};

export default VisitManagement;
