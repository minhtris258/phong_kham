// src/components/admin/appointment/AppointmentListTable.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
// import StatusBadge from './StatusBadge'; // Nếu bạn có component này, hãy uncomment

const ITEMS_PER_PAGE = 10;

// Độ ưu tiên trạng thái để sắp xếp (Confirmed -> Pending -> Completed -> Cancelled)
const STATUS_PRIORITY = {
  confirmed: 1,
  pending: 2,
  completed: 3,
  cancelled: 4,
};

const AppointmentListTable = ({
  appointments, // Danh sách đầy đủ hoặc đã lọc từ cha
  loading,

  // Props từ cha truyền xuống để điều khiển bộ lọc
  filters,
  onSearchChange,
  onStatusChange,
  onDateChange,

  // Actions
  handleAddEdit,
  confirmDelete,
}) => {
  // State phân trang nội bộ (Client-side Pagination)
  const [currentPage, setCurrentPage] = useState(1);

  // Helper lấy tên an toàn
  const getPatientDisplay = (patient) => {
    if (!patient) return "Không rõ";
    if (typeof patient === "object")
      return patient.name || patient.fullName || "Không rõ";
    return patient;
  };

  const getDoctorDisplay = (doctor) => {
    if (!doctor) return "Không rõ";
    if (typeof doctor === "object")
      return doctor.fullName || doctor.name || "Không rõ";
    return doctor;
  };

  // Helper hiển thị badge trạng thái (Nếu chưa có component riêng)
  const renderStatusBadge = (status) => {
    const styles = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };
    const label = {
      confirmed: "Đã xác nhận",
      pending: "Chờ xác nhận",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-bold rounded-full ${
          styles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {label[status] || status}
      </span>
    );
  };

  // === XỬ LÝ SẮP XẾP DỮ LIỆU (Client-side) ===
  // Sắp xếp danh sách (appointments đã được lọc ở cha) trước khi phân trang
  const sortedData = useMemo(() => {
    let data = [...appointments];
    data.sort((a, b) => {
      // Ưu tiên 1: Trạng thái
      const priorityA = STATUS_PRIORITY[a.status] || 99;
      const priorityB = STATUS_PRIORITY[b.status] || 99;
      if (priorityA !== priorityB) return priorityA - priorityB;

      // Ưu tiên 2: Thời gian (Ngày + Giờ) tăng dần
      const timeA = new Date(
        `${a.date ? new Date(a.date).toISOString().split("T")[0] : ""}T${
          a.start
        }`
      );
      const timeB = new Date(
        `${b.date ? new Date(b.date).toISOString().split("T")[0] : ""}T${
          b.start
        }`
      );
      return timeA - timeB;
    });
    return data;
  }, [appointments]);

  // === PHÂN TRANG ===
  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset trang về 1 khi bộ lọc thay đổi (dữ liệu đầu vào thay đổi)
  useEffect(() => {
    setCurrentPage(1);
  }, [appointments.length]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 h-full flex flex-col">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          Danh Sách Lịch Hẹn
          <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full border">
            {sortedData.length}
          </span>
        </h3>
        <button
          onClick={() => handleAddEdit(null)}
          className="flex items-center bg-sky-500 text-white px-4 py-2 text-sm rounded-xl font-semibold shadow-md hover:bg-sky-700 transition transform hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-1" /> Thêm Lịch Hẹn
        </button>
      </div>

      {/* 2. THANH BỘ LỌC (FILTER BAR) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 shrink-0 bg-gray-50 p-4 rounded-lg border border-gray-200">
        {/* A. Tìm kiếm (5 cột) */}
        <div className="md:col-span-5 relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm"
            placeholder="Tìm bệnh nhân, bác sĩ..."
            value={filters?.search || ""}
            onChange={onSearchChange}
          />
        </div>

        {/* B. Lọc Ngày (4 cột) - Gộp vào đây */}
        <div className="md:col-span-4 relative">
          <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type="date"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm text-gray-600 cursor-pointer"
            value={filters?.date || ""}
            onChange={onDateChange}
          />
        </div>

        {/* C. Lọc Trạng Thái (3 cột) */}
        <div className="md:col-span-3 relative">
          <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
          <select
            value={filters?.status || ""}
            onChange={onStatusChange}
            className="block w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm cursor-pointer appearance-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* 3. BẢNG DỮ LIỆU */}
      <div className="border border-gray-200 rounded-lg overflow-hidden flex-1 min-h-0 relative flex flex-col bg-white">
        <div className="overflow-y-auto custom-scrollbar max-h-[550px]">
          <table className="min-w-full divide-y divide-gray-200 relative">
            <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-16">
                  STT
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Thông Tin
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Thời Gian
                </th>
                <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Lý Do
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Trạng Thái
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-20 text-center text-gray-500"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((app, index) => (
                  <tr
                    key={app._id || app.id}
                    className="hover:bg-sky-50/50 transition duration-150"
                  >
                    <td className="px-6 py-4 text-center text-sm text-gray-500 font-medium">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        BN: {getPatientDisplay(app.patient_id)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        BS: {getDoctorDisplay(app.doctor_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      <span className="bg-sky-50 text-sky-600 px-2 py-1 rounded mr-2">
                        {app.start}
                      </span>
                      <span className="text-gray-500">
                        {app.date
                          ? new Date(app.date).toLocaleDateString("vi-VN")
                          : ""}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {app.reason || "Không rõ"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {/* Sử dụng component renderStatusBadge hoặc StatusBadge nếu có */}
                      {renderStatusBadge(app.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => handleAddEdit(app)}
                          className="text-sky-600 hover:text-sky-900 p-2 rounded-full hover:bg-sky-100 transition"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(app._id || app.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-20 text-center text-gray-500 font-medium bg-gray-50"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-12 h-12 text-gray-300 mb-2" />
                      <span>Không có lịch hẹn nào được tìm thấy.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4 shrink-0">
          <div className="hidden sm:block text-sm text-gray-500">
            Trang <span className="font-bold text-sky-600">{currentPage}</span>{" "}
            / {totalPages}
          </div>
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border ${
                currentPage === 1
                  ? "text-gray-300 border-gray-200 cursor-not-allowed"
                  : "text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`hidden sm:block px-3 py-1 text-sm font-medium rounded-lg border ${
                  currentPage === page
                    ? "bg-sky-600 text-white border-sky-600"
                    : "text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border ${
                currentPage === totalPages
                  ? "text-gray-300 border-gray-200 cursor-not-allowed"
                  : "text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentListTable;
