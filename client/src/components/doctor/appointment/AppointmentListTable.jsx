// src/components/doctor/appointment/AppointmentListTable.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Plus,
  CalendarSync,
  CalendarX,
  ClipboardPen,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Clock,
  FileText, // Thêm icons cho mobile view
  CalendarIcon,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

// Độ ưu tiên trạng thái để sắp xếp
const STATUS_PRIORITY = {
  confirmed: 1,
  pending: 2,
  completed: 3,
  cancelled: 4,
};

const AppointmentListTable = ({
  appointments,
  selectedDate,
  getStatusStyle,
  handleAddEdit,
  confirmCancel,
  handleOpenVisitModal,
  onDateChange,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, appointments]);

  const title = selectedDate
    ? `Lịch Hẹn Ngày ${selectedDate.split("-").reverse().join("/")}`
    : "Danh Sách Lịch Hẹn";

  const getDisplay = (obj) => {
    if (!obj) return "Không rõ";
    if (typeof obj === "object") return obj.name || obj.fullName || "Không rõ";
    return obj;
  };

  // === 1. XỬ LÝ LỌC & SẮP XẾP ===
  const processedData = useMemo(() => {
    let data = [...appointments];

    // Lọc theo trạng thái
    if (filterStatus !== "all") {
      data = data.filter((app) => app.status === filterStatus);
    }

    // Sắp xếp
    data.sort((a, b) => {
      // Ưu tiên trạng thái
      const priorityA = STATUS_PRIORITY[a.status] || 99;
      const priorityB = STATUS_PRIORITY[b.status] || 99;
      if (priorityA !== priorityB) return priorityA - priorityB;

      // Cùng trạng thái -> Sắp theo thời gian (Tăng dần)
      const dateTimeA = new Date(
        `${String(a.date).substring(0, 10)}T${a.start}`
      );
      const dateTimeB = new Date(
        `${String(b.date).substring(0, 10)}T${b.start}`
      );
      return dateTimeA - dateTimeB;
    });

    return data;
  }, [appointments, filterStatus]);

  // === 2. PHÂN TRANG ===
  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
  const paginatedData = processedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl border border-gray-100 flex flex-col h-full">
      {/* HEADER: TITLE + ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-4 border-b pb-4">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            {selectedDate
              ? `Lịch Hẹn Ngày ${selectedDate.split("-").reverse().join("/")}`
              : "Danh Sách Lịch Hẹn"}
            <span className="text-xs md:text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {processedData.length}
            </span>
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* --- 2. BỘ LỌC NGÀY (MỚI THÊM VÀO ĐÂY) --- */}
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="date"
              value={selectedDate || ""} // Hiển thị ngày đang chọn
              onChange={onDateChange} // Gọi hàm từ cha
              className="w-full sm:w-auto pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none bg-white text-gray-700 cursor-pointer hover:bg-gray-50 transition"
            />
          </div>

          {/* Bộ lọc Trạng thái (Giữ nguyên) */}
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-500" />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto pl-9 pr-8 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none bg-white cursor-pointer hover:bg-gray-50 transition appearance-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* CONTENT: MOBILE CARDS + DESKTOP TABLE */}
      <div className="flex-1 min-h-[400px]">
        {paginatedData.length > 0 ? (
          <>
            {/* --- MOBILE VIEW (Cards) --- */}
            <div className="md:hidden space-y-4">
              {paginatedData.map((app) => (
                <div
                  key={app._id || app.id}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm relative"
                >
                  {/* Status Badge (Góc phải trên) */}
                  <span
                    className={`absolute top-4 right-4 px-2 py-1 text-xs font-bold rounded-lg ${getStatusStyle(
                      app.status
                    )}`}
                  >
                    {app.status === "pending"
                      ? "Chờ xác nhận"
                      : app.status === "confirmed"
                      ? "Đã xác nhận"
                      : app.status === "completed"
                      ? "Hoàn thành"
                      : app.status === "cancelled"
                      ? "Đã hủy"
                      : app.status}
                  </span>

                  {/* Thông tin chính */}
                  <div className="space-y-3 mb-4 pr-20">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-gray-900 text-base">
                          {getDisplay(app.patient_id)}
                        </div>
                        {app.patient_id?.phone && (
                          <div className="text-xs text-gray-500">
                            {app.patient_id.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Clock className="w-5 h-5 text-sky-500 shrink-0" />
                      <div>
                        <span className="font-bold text-sky-700 text-lg mr-2">
                          {app.start}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {new Date(app.date).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-sm text-gray-600 bg-white p-2 rounded border border-gray-100">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <span className="line-clamp-2 italic">
                        {app.reason || "Không có lý do khám"}
                      </span>
                    </div>
                  </div>

                  {/* Actions (Footer Card) */}
                  <div className="flex justify-end gap-2 border-t border-gray-200 pt-3 mt-2">
                    {["confirmed", "pending"].includes(app.status) && (
                      <button
                        onClick={() => handleOpenVisitModal(app)}
                        className="flex items-center gap-1 text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg text-sm font-medium transition flex-1 justify-center"
                      >
                        <ClipboardPen className="w-4 h-4" /> Khám
                      </button>
                    )}
                    {app.status !== "cancelled" &&
                      app.status !== "completed" && (
                        <button
                          onClick={() => handleAddEdit(app)}
                          className="flex items-center gap-1 text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-2 rounded-lg text-sm font-medium transition flex-1 justify-center"
                        >
                          <CalendarSync className="w-4 h-4" /> Sửa
                        </button>
                      )}
                    {app.status !== "cancelled" &&
                      app.status !== "completed" && (
                        <button
                          onClick={() => confirmCancel(app._id || app.id)}
                          className="flex items-center gap-1 text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-medium transition flex-1 justify-center"
                        >
                          <CalendarX className="w-4 h-4" /> Hủy
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>

            {/* --- DESKTOP VIEW (Table) --- */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Bệnh Nhân
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Thời Gian
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Lý Do
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Trạng Thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((app, index) => (
                    <tr
                      key={app._id || app.id}
                      className="hover:bg-sky-50/50 transition duration-150 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex flex-col">
                          <span>{getDisplay(app.patient_id)}</span>
                          {app.patient_id?.phone && (
                            <span className="text-xs text-gray-500">
                              {app.patient_id.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          <span className="text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded">
                            {app.start}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(app.date).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 text-sm text-gray-500 max-w-2xs truncate">
                        {app.reason || "Không rõ"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${getStatusStyle(
                            app.status
                          )}`}
                        >
                          {app.status === "pending"
                            ? "Chờ xác nhận"
                            : app.status === "confirmed"
                            ? "Đã xác nhận"
                            : app.status === "completed"
                            ? "Hoàn thành"
                            : app.status === "cancelled"
                            ? "Đã hủy"
                            : app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          {["confirmed", "pending"].includes(app.status) && (
                            <button
                              onClick={() => handleOpenVisitModal(app)}
                              className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-100 transition"
                              title="Khám bệnh"
                            >
                              <ClipboardPen className="w-5 h-5" />
                            </button>
                          )}
                          {app.status !== "cancelled" &&
                            app.status !== "completed" && (
                              <button
                                onClick={() => handleAddEdit(app)}
                                className="text-sky-600 hover:text-sky-900 p-2 rounded-full hover:bg-sky-100 transition"
                                title="Sửa"
                              >
                                <CalendarSync className="w-5 h-5" />
                              </button>
                            )}
                          {app.status !== "cancelled" &&
                          app.status !== "completed" ? (
                            <button
                              onClick={() => confirmCancel(app._id || app.id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition"
                              title="Hủy"
                            >
                              <CalendarX className="w-5 h-5" />
                            </button>
                          ) : (
                            <span className="w-9 h-9 inline-block"></span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 py-16">
            <Search className="w-16 h-16 mb-3 opacity-20" />
            <p className="font-medium">Không tìm thấy lịch hẹn nào</p>
          </div>
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-4 mt-4 gap-4">
          <div className="text-sm text-gray-500 text-center sm:text-left">
            Trang{" "}
            <span className="font-medium text-sky-600">{currentPage}</span> /{" "}
            {totalPages}
            <span className="hidden sm:inline">
              {" "}
              • Tổng {processedData.length} lịch hẹn
            </span>
          </div>
          <div className="flex items-center gap-2">
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

            {/* Mobile: Chỉ hiện số trang hiện tại */}
            <span className="sm:hidden font-medium text-gray-700 px-2">
              {currentPage}
            </span>

            {/* Desktop: Hiện danh sách trang */}
            <div className="hidden sm:flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  if (
                    totalPages > 5 &&
                    Math.abs(page - currentPage) > 1 &&
                    page !== 1 &&
                    page !== totalPages
                  ) {
                    if (Math.abs(page - currentPage) === 2)
                      return (
                        <span key={page} className="text-gray-400 px-1">
                          ...
                        </span>
                      );
                    return null;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${
                        currentPage === page
                          ? "bg-sky-600 text-white border-sky-600"
                          : "text-gray-600 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
              )}
            </div>

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
