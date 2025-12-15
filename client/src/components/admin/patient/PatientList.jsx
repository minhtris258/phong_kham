// src/components/admin/patient/PatientList.jsx
import React from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  KeyRound,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import StatusBadge from "./StatusBadge"; // Đảm bảo bạn đã import component này

const getGenderVietnamese = (gender) => {
  switch (gender) {
    case "male":
      return "Nam";
    case "female":
      return "Nữ";
    case "other":
      return "Khác";
    default:
      return "Chưa cập nhật";
  }
};

const getProfileStatusStyle = (isCompleted) => {
  return isCompleted
    ? "bg-green-50 text-green-700 border border-green-200"
    : "bg-orange-50 text-orange-700 border border-orange-200";
};

const PatientList = ({
  patients,
  loading,
  filters,
  onSearchChange,
  onStatusChange,
  pagination,
  onPageChange,
  handleAddEdit,
  handleViewPatient,
  confirmDelete,
  handleChangePassword,
}) => {
  const patientsArray = Array.isArray(patients) ? patients : [];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-800">Danh Sách Bệnh Nhân</h3>
        <button
          onClick={() => handleAddEdit(null)}
          className="flex items-center bg-[#00B5F1] text-white px-4 py-2.5 text-sm rounded-lg font-semibold hover:bg-[#0099CC] transition shadow-sm"
        >
          <Plus className="w-5 h-5 mr-1" /> Thêm Bệnh Nhân
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        {/* Search */}
        <div className="md:col-span-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B5F1] focus:border-transparent sm:text-sm transition"
            placeholder="Tìm kiếm tên, email, số điện thoại..."
            value={filters.search}
            onChange={onSearchChange}
          />
        </div>

        {/* Status Filter */}
        <div className="md:col-span-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <select
            value={filters.status}
            onChange={onStatusChange}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00B5F1] sm:text-sm appearance-none"
          >
            <option value="">Tất cả trạng thái</option>

            {/* Value phải là "active" */}
            <option value="active">Hoạt động (Active)</option>

            {/* Value phải là "inactive" (vì Database lưu là inactive khi mới tạo) */}
            <option value="pending_profile">
              Chờ cập nhật / Chưa kích hoạt
            </option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Thông tin cá nhân
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Liên hệ
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Trạng thái TK
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Hồ sơ
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Hành Động
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : patientsArray.length > 0 ? (
              patientsArray.map((patient) => {
                const completed = Boolean(patient?.profile_completed);

                // Logic hiển thị StatusBadge
                // Nếu status là active -> Active
                // Nếu status là pending_profile (User status) -> Pending
                // Nếu status là inactive (Patient status cũ) -> Inactive
                let statusForBadge = patient.status;
                if (patient.status === "pending_profile")
                  statusForBadge = "pending";

                return (
                  <tr
                    key={patient._id}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">
                        {patient?.fullName || "Chưa đặt tên"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getGenderVietnamese(patient?.gender)} •{" "}
                        {patient?.dob
                          ? new Date(patient.dob).getFullYear()
                          : "Năm sinh?"}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex flex-col">
                        <span>{patient?.phone || "---"}</span>
                        <span className="text-xs text-gray-400">
                          {patient?.email}
                        </span>
                      </div>
                    </td>

                    {/* CỘT TRẠNG THÁI TÀI KHOẢN (ACTIVE/INACTIVE) */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <StatusBadge status={patient.status} />
                    </td>

                    {/* CỘT TRẠNG THÁI HỒ SƠ (COMPLETED/NOT) */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getProfileStatusStyle(
                          completed
                        )}`}
                      >
                        {completed ? "Đủ hồ sơ" : "Thiếu"}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => handleViewPatient(patient)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAddEdit(patient)}
                          className="text-sky-600 hover:bg-sky-50 p-2 rounded-lg transition"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleChangePassword(patient)}
                          className="text-yellow-600 hover:bg-yellow-50 p-2 rounded-lg transition"
                          title="Đổi mật khẩu"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(patient._id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  Không tìm thấy bệnh nhân nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
          <div className="hidden sm:flex flex-1 sm:items-center sm:justify-between">
            <p className="text-sm text-gray-700">
              Trang <span className="font-medium">{pagination.page}</span> /{" "}
              {pagination.totalPages}
            </p>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {/* Simplified Pagination logic */}
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                {pagination.page}
              </span>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
