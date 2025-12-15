// src/components/admin/specialty/SpecialtyList.jsx
import React from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Image as ImageIcon,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const SpecialtyList = ({
  specialtys,
  loading,
  searchTerm,
  onSearchChange,
  pagination,
  onPageChange,
  handleAddEdit,
  confirmDelete,
  handleViewDoctors,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      {/* Header & Button Thêm */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Danh Sách Chuyên Khoa
        </h3>
        <button
          onClick={() => handleAddEdit(null)}
          className="flex items-center bg-sky-500 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-sky-700 transition shadow-sm"
        >
          <Plus className="w-5 h-5 mr-1" /> Thêm Chuyên Khoa
        </button>
      </div>

      {/* Thanh Tìm Kiếm */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
          placeholder="Tìm kiếm theo tên hoặc từ khóa..." // Update placeholder
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>

      {/* Bảng Dữ Liệu */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-16">
                STT
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-24">
                Hình Ảnh
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Tên Chuyên Khoa
              </th>
              {/* THÊM CỘT TỪ KHÓA */}
              <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Từ Khóa (AI)
              </th>
              <th className="hidden sm:table-cell px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-24">
                Số Bác Sĩ
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-32">
                Hành Động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : specialtys.length > 0 ? (
              specialtys.map((s, index) => (
                <tr
                  key={s._id || s.id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {(pagination.page - 1) * pagination.limit + index + 1}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center">
                      {s.thumbnail ? (
                        <img
                          src={s.thumbnail}
                          alt={s.name}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    {s.name}
                  </td>

                  {/* HIỂN THỊ TỪ KHÓA */}
                  <td className="hidden lg:table-cell px-6 py-4 text-sm text-gray-500">
                    {s.keywords && s.keywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {s.keywords.slice(0, 3).map((k, i) => (
                          <span
                            key={i}
                            className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs border border-gray-200"
                          >
                            {k}
                          </span>
                        ))}
                        {s.keywords.length > 3 && (
                          <span className="text-xs text-gray-400 self-center">
                            +{s.keywords.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">
                        Chưa có từ khóa
                      </span>
                    )}
                  </td>

                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
                      {s.doctor_count || (s.doctors ? s.doctors.length : "0")}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => handleViewDoctors(s)}
                        className="text-sky-600 hover:bg-sky-50 p-1.5 rounded-lg transition"
                        title="Xem bác sĩ"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAddEdit(s)}
                        className="text-sky-600 hover:bg-sky-50 p-1.5 rounded-lg transition"
                        title="Sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(s._id || s.id)}
                        className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition"
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
                  colSpan={6}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  Không tìm thấy chuyên khoa nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls (Giữ nguyên) */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
          {/* ... (Phần Pagination giữ nguyên code cũ) ... */}
          <div className="hidden sm:flex flex-1 sm:items-center sm:justify-between">
            <p className="text-sm text-gray-700">
              Trang <span className="font-medium">{pagination.page}</span> /{" "}
              <span className="font-medium">{pagination.totalPages}</span>
            </p>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => onPageChange(i + 1)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    pagination.page === i + 1
                      ? "z-10 bg-sky-500 text-white"
                      : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
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

export default SpecialtyList;
