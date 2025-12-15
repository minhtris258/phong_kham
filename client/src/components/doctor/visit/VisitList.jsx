import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const VisitList = ({
  visits,
  loading,
  onViewDetail,
  pagination,
  onPageChange,
}) => {
  // Helpers format tiền và ngày tháng...
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return (
      new Date(dateString).toLocaleDateString("vi-VN") +
      " " +
      new Date(dateString).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  // --- LOGIC HIỂN THỊ PHÂN TRANG ---
  // Lấy giá trị từ props pagination, fallback nếu undefined
  const {
    page = 1,
    limit = 10,
    totalDocs = 0,
    totalPages = 1,
  } = pagination || {};

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalDocs);

  // Hàm render số trang thông minh (rút gọn nếu quá nhiều trang)
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // Số trang tối đa hiển thị liền kề

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Logic hiển thị dạng: 1 ... 4 5 6 ... 10
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }

    return pages.map((pageNum, index) => {
      if (pageNum === "...") {
        return (
          <span key={`dots-${index}`} className="px-3 py-2 text-gray-500">
            ...
          </span>
        );
      }
      return (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
            page === pageNum
              ? "z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          }`}
        >
          {pageNum}
        </button>
      );
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-full">
      {/* BẢNG DỮ LIỆU */}
      <div className="overflow-x-auto flex-grow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày khám
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bệnh nhân
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chẩn đoán
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex justify-center items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span>Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
            ) : visits.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-gray-500 italic"
                >
                  Không tìm thấy hồ sơ bệnh án nào phù hợp.
                </td>
              </tr>
            ) : (
              visits.map((visit) => (
                <tr
                  key={visit._id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(visit.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {visit.patient_id?.fullName || "Bệnh nhân vãng lai"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {visit.patient_id?.phone || "Không có SĐT"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <span className="font-medium text-blue-600 block mb-1">
                      {visit.diagnosis || "Chưa chẩn đoán"}
                    </span>
                    <p
                      className="text-xs text-gray-500 truncate max-w-xs"
                      title={visit.symptoms}
                    >
                      {visit.symptoms}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                    {formatCurrency(visit.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      onClick={() => onViewDetail(visit)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* THANH PHÂN TRANG */}
      {!loading && visits.length > 0 && totalPages > 1 && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className={`relative inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${
                page <= 1
                  ? "bg-gray-100 text-gray-400"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Trước
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className={`relative ml-3 inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${
                page >= totalPages
                  ? "bg-gray-100 text-gray-400"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Sau
            </button>
          </div>

          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-bold">{startItem}</span> đến{" "}
                <span className="font-bold">{endItem}</span> trong tổng số{" "}
                <span className="font-bold">{totalDocs}</span> kết quả
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                    page <= 1 ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>

                {renderPageNumbers()}

                <button
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                    page >= totalPages
                      ? "bg-gray-100 cursor-not-allowed"
                      : "bg-white"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitList;
