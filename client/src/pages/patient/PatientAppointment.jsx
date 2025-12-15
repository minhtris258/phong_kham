// src/pages/patient/PatientAppointment.jsx
import React, { useEffect, useState, useMemo } from "react";
import appointmentsService from "../../services/AppointmentsService";
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { toastSuccess, toastError } from "../../utils/toast";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 5;

const PatientAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // State cho bộ lọc trạng thái
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentsService.myAppointments();
      const body = response && response.data ? response.data : response;
      const dataArray = body && body.data ? body.data : body;

      if (Array.isArray(dataArray)) {
        // Sắp xếp mới nhất lên đầu
        const sortedData = dataArray.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAppointments(sortedData);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("❌ Lỗi tải lịch khám:", error);
      toastError("Không thể tải danh sách lịch khám.");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC LỌC ---
  const filteredAppointments = useMemo(() => {
    if (filterStatus === "ALL") return appointments;
    return appointments.filter((apt) => apt.status === filterStatus);
  }, [appointments, filterStatus]);

  // --- LOGIC PHÂN TRANG ---
  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset về trang 1 khi đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này không?")) {
      try {
        await appointmentsService.cancelAppointment(id);
        toastSuccess("Hủy lịch hẹn thành công!");
        fetchAppointments();
      } catch (error) {
        console.error("Lỗi hủy lịch:", error);
        toastError(error.response?.data?.message || "Hủy lịch thất bại.");
      }
    }
  };

  const handleViewVisit = (appointmentId) => {
    navigate(`/visit-detail/${appointmentId}`);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "approved":
        return (
          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
            <CheckCircle size={14} /> Đã xác nhận
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
            <Clock size={14} /> Chờ xác nhận
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
            <XCircle size={14} /> Đã hủy
          </span>
        );
      case "completed":
        return (
          <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
            <CheckCircle size={14} /> Đã khám
          </span>
        );
      default:
        return (
          <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm">
            {status}
          </span>
        );
    }
  };

  const renderReason = (reason) => {
    if (!reason) return "Không có ghi chú";
    return reason.length > 50 ? reason.substring(0, 50) + "..." : reason;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-full flex flex-col">
      {/* Header + Bộ lọc */}
      <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="title-color" /> Lịch Khám Bệnh
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các cuộc hẹn của bạn
          </p>
        </div>

        {/* Dropdown Bộ lọc trạng thái */}
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-sky-500 outline-none bg-gray-50 hover:bg-white transition cursor-pointer min-w-[160px]"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="completed">Đã khám</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="p-6 flex-1">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
            <p>
              {appointments.length === 0
                ? "Bạn chưa có lịch khám nào."
                : "Không tìm thấy lịch khám phù hợp."}
            </p>
            {appointments.length > 0 && (
              <button
                onClick={() => setFilterStatus("ALL")}
                className="mt-2 text-sky-600 font-medium hover:underline"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedAppointments.map((apt) => {
                // --- XỬ LÝ LOGIC HIỂN THỊ TÊN KHOA AN TOÀN ---
                const doctor = apt.doctor_id || {};
                const specialtyName =
                  doctor.specialty_id?.name || // Case 1: Populate full object
                  doctor.specialty?.name || // Case 2: Cấu trúc khác
                  (typeof doctor.specialty === "string"
                    ? doctor.specialty
                    : "") || // Case 3: Chỉ là string
                  "Đa khoa"; // Case 4: Mặc định

                return (
                  <div
                    key={apt._id}
                    className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition bg-white"
                  >
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                      <div className="flex-1">
                        {/* Tên Bác sĩ + Trạng thái */}
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-gray-900">
                            BS. {doctor.fullName || "Bác sĩ"}
                          </h4>
                          {getStatusBadge(apt.status)}
                        </div>

                        {/* Thông tin chi tiết */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-gray-600 mt-3">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="title-color" />
                            <span>
                              Ngày:{" "}
                              <span className="font-medium text-gray-800">
                                {new Date(apt.date).toLocaleDateString("vi-VN")}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="title-color" />
                            <span>
                              Giờ:{" "}
                              <span className="font-medium text-gray-800">
                                {apt.start}
                              </span>
                            </span>
                          </div>

                          {/* Hiển thị CHUYÊN KHOA */}
                          <div className="flex items-center gap-2">
                            <User size={16} className="title-color" />
                            <span>
                              Chuyên khoa:{" "}
                              <span className="font-medium title-color">
                                {specialtyName}
                              </span>
                            </span>
                          </div>

                          <div className="flex items-start gap-2 col-span-1 sm:col-span-2">
                            <AlertCircle
                              size={16}
                              className="title-color mt-0.5 shrink-0"
                            />
                            <span className="text-gray-500 italic line-clamp-2">
                              Ghi chú: {renderReason(apt.reason)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Nút hành động */}
                      <div className="flex flex-col gap-2 items-end mt-4 md:mt-0">
                        {(apt.status === "pending" ||
                          apt.status === "confirmed") && (
                          <button
                            onClick={() => handleCancel(apt._id)}
                            className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition whitespace-nowrap w-full md:w-auto"
                          >
                            Hủy lịch
                          </button>
                        )}

                        {apt.status === "completed" && (
                          <button
                            onClick={() => handleViewVisit(apt._id)}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm title-color bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg font-medium transition whitespace-nowrap shadow-sm w-full md:w-auto"
                          >
                            <FileText size={16} /> Xem kết quả
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* --- PAGINATION --- */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg border transition ${
                    currentPage === 1
                      ? "text-gray-300 border-gray-200 cursor-not-allowed"
                      : "text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-sky-600"
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>

                <span className="text-sm font-medium text-gray-700">
                  Trang{" "}
                  <span className="title-color font-bold">{currentPage}</span> /{" "}
                  {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg border transition ${
                    currentPage === totalPages
                      ? "text-gray-300 border-gray-200 cursor-not-allowed"
                      : "text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-sky-600"
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PatientAppointment;
