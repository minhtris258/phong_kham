// src/components/admin/doctor/DoctorList.jsx
import React, { useState, useRef, useEffect } from "react"; // Thêm useState, useRef, useEffect
import { Plus, Eye, Calendar, Search, Filter, Edit, Trash2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import StatusBadge from "./StatusBadge";

const DoctorList = ({
  doctors,
  loading,
  specialtyMap,
  specialties = [],
  filters,
  onSearchChange,
  onSpecialtyFilterChange,
  onStatusFilterChange,
  pagination,
  onPageChange,
  handleAddEdit,
  handleViewDoctor,
  confirmDelete,
  handleManageSchedule,
}) => {
  const doctorsArray = Array.isArray(doctors) ? doctors : [];
  const safeSpecialties = Array.isArray(specialties) ? specialties : [];

  // === LOGIC CHO CUSTOM DROPDOWN CHUYÊN KHOA ===
  const [isSpecOpen, setIsSpecOpen] = useState(false);
  const specDropdownRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (specDropdownRef.current && !specDropdownRef.current.contains(event.target)) {
        setIsSpecOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [specDropdownRef]);

  // Xử lý chọn item trong dropdown (giả lập event giống thẻ select)
  const handleSelectSpec = (val) => {
    onSpecialtyFilterChange({ target: { value: val } });
    setIsSpecOpen(false);
  };

  // Lấy tên chuyên khoa đang chọn để hiển thị
  const currentSpecName = filters.specialty 
    ? safeSpecialties.find(s => (s._id || s.id) === filters.specialty)?.name 
    : `Tất cả chuyên khoa (${safeSpecialties.length})`;
  // ============================================

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-full flex flex-col">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
        <h3 className="text-xl font-bold text-gray-800">
          Danh Sách Bác Sĩ
        </h3>
        <button
          onClick={() => handleAddEdit(null)}
          className="flex items-center bg-[#00B5F1] text-white px-4 py-2.5 text-sm rounded-lg font-bold hover:bg-[#0099CC] transition shadow-sm"
        >
          <Plus className="w-5 h-5 mr-1" /> Thêm Bác Sĩ
        </button>
      </div>

      {/* 2. FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 shrink-0 bg-gray-50 p-4 rounded-lg border border-gray-200">
        
        {/* A. Tìm kiếm */}
        <div className="md:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B5F1] sm:text-sm transition"
                placeholder="Tìm kiếm tên, email, sđt..."
                value={filters.search}
                onChange={onSearchChange}
            />
        </div>

        {/* B. Lọc Trạng Thái */}
        <div className="md:col-span-3 relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-500" />
            </div>
            <select
                value={filters.status || ""} 
                onChange={onStatusFilterChange}
                className="block w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B5F1] sm:text-sm bg-white cursor-pointer"
            >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Hoạt động (Active)</option>
                <option value="inactive">Chưa kích hoạt / Khóa</option>
            </select>
        </div>

        {/* C. Lọc Chuyên Khoa (CUSTOM DROPDOWN CÓ SCROLL) */}
        <div className="md:col-span-4 relative" ref={specDropdownRef}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Filter className="h-4 w-4 text-gray-500" />
            </div>
            
            {/* Nút bấm mở dropdown (Thay thế thẻ select) */}
            <button
                type="button"
                onClick={() => setIsSpecOpen(!isSpecOpen)}
                className="block w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg bg-white text-left text-sm focus:outline-none focus:ring-2 focus:ring-[#00B5F1] transition relative truncate"
            >
                <span className={filters.specialty ? "text-gray-900 font-medium" : "text-gray-600"}>
                    {currentSpecName}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                </span>
            </button>

            {/* Danh sách xổ xuống (Custom List) */}
            {isSpecOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm custom-scrollbar">
                    {/* Option Tất cả */}
                    <div
                        className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-sky-50 ${filters.specialty === "" ? 'bg-sky-100 text-sky-700 font-semibold' : 'text-gray-900'}`}
                        onClick={() => handleSelectSpec("")}
                    >
                        <span className="block truncate">Tất cả chuyên khoa ({safeSpecialties.length})</span>
                    </div>

                    {/* Map danh sách khoa */}
                    {safeSpecialties.map((spec) => {
                        const isSelected = filters.specialty === (spec._id || spec.id);
                        return (
                            <div
                                key={spec._id || spec.id}
                                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-sky-50 ${isSelected ? 'bg-sky-100 text-sky-700 font-semibold' : 'text-gray-900'}`}
                                onClick={() => handleSelectSpec(spec._id || spec.id)}
                            >
                                <span className="block truncate">{spec.name}</span>
                                {isSelected && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-sky-600">
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
      </div>

      {/* 3. BẢNG DỮ LIỆU */}
      <div className="border border-gray-200 rounded-lg overflow-hidden flex-1 min-h-0 relative flex flex-col bg-white">
        <div className="overflow-y-auto custom-scrollbar max-h-[550px]"> 
            <table className="min-w-full divide-y divide-gray-200 relative">
            <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                <tr>
                <th className="px-3 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">STT</th>
                <th className="px-3 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Ảnh</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Thông tin bác sĩ</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Chuyên Khoa</th>
                <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Phí Khám</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Trạng Thái</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Hành Động</th>
                </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                    <tr><td colSpan="8" className="px-6 py-20 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                ) : doctorsArray.length > 0 ? (
                doctorsArray.map((doc, index) => (
                    <tr key={doc._id} className="hover:bg-blue-50 transition duration-150 group">
                    <td className="px-3 py-4 text-sm text-gray-500 text-center font-medium">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>

                    <td className="px-3 py-2 text-center">
                        <div className="relative inline-block">
                            {doc.thumbnail ? (
                            <img src={doc.thumbnail} alt={doc.fullName} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm group-hover:scale-110 transition-transform" />
                            ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-bold">N/A</div>
                            )}
                        </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{doc.fullName}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{doc.email}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{doc.phone || "---"}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-semibold border border-indigo-100">
                            {doc.specialty_id?.name || specialtyMap?.get(doc.specialty_id) || "Chưa chọn"}
                        </span>
                    </td>

                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-bold">
                        {doc.consultation_fee ? doc.consultation_fee.toLocaleString("vi-VN") : 0} ₫
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                        <StatusBadge status={doc.status} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center gap-1">
                            <button onClick={() => handleViewDoctor(doc)} className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition" title="Xem chi tiết">
                            <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleManageSchedule(doc)} className="text-green-600 hover:bg-green-100 p-2 rounded-lg transition" title="Lịch làm việc">
                            <Calendar className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleAddEdit(doc)} className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-lg transition" title="Sửa">
                            <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => confirmDelete(doc._id)} className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition" title="Xóa">
                            <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan="8" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                            <Search className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium text-gray-500">Không tìm thấy bác sĩ nào</p>
                            <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm lại</p>
                        </div>
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* 4. PAGINATION */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-4 mt-auto shrink-0 pt-4">
             <div className="hidden sm:flex flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Trang <span className="font-bold text-[#00B5F1]">{pagination.page}</span> / {pagination.totalPages} 
                        {' '}<span className="text-gray-300 mx-2">|</span> Tổng <span className="font-bold text-gray-900">{pagination.totalDocs}</span> bác sĩ
                    </p>
                </div>
                
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                            Trang {pagination.page}
                        </span>

                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${pagination.page === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </nav>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default DoctorList;