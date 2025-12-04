import React from 'react';
import { Eye, Trash2, Search, Calendar, ChevronLeft, ChevronRight, FileText, User, Stethoscope } from 'lucide-react';

const VisitList = ({
    visits,
    loading,
    filters,
    onSearchChange,
    onDateChange,
    pagination, // { totalDocs, page, totalPages, limit } <-- Dữ liệu nhận vào
    onPageChange,
    handleViewVisit,
    confirmDelete
}) => {
    const data = Array.isArray(visits) ? visits : [];

    // Helper format tiền
    const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-full flex flex-col">
            
            {/* 1. HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    Danh Sách Phiếu Khám
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full border">
                        {/* Hiển thị tổng số bản ghi */}
                        {pagination?.totalDocs || 0}
                    </span>
                </h3>
            </div>

            {/* 2. FILTER BAR (Giữ nguyên) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 shrink-0 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="md:col-span-8 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm transition"
                        placeholder="Tìm theo tên bệnh nhân, bác sĩ, chẩn đoán..."
                        value={filters?.search || ''}
                        onChange={onSearchChange}
                    />
                </div>
                <div className="md:col-span-4 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                        type="date" 
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm text-gray-600 cursor-pointer"
                        value={filters?.date || ''}
                        onChange={onDateChange}
                    />
                </div>
            </div>

            {/* 3. TABLE (Giữ nguyên) */}
            <div className="border border-gray-200 rounded-lg overflow-hidden flex-1 min-h-0 relative flex flex-col bg-white">
                <div className="overflow-y-auto custom-scrollbar max-h-[550px]">
                    <table className="min-w-full divide-y divide-gray-200 relative">
                        <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase w-16">STT</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Thông Tin</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Chẩn Đoán</th>
                                <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Tổng Tiền</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">Ngày Khám</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-20 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                            ) : data.length > 0 ? (
                                data.map((visit, index) => (
                                    <tr key={visit._id} className="hover:bg-indigo-50 transition duration-150">
                                        <td className="px-6 py-4 text-center text-sm text-gray-500 font-medium">
                                            {((pagination?.page || 1) - 1) * (pagination?.limit || 10) + index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <User className="w-3 h-3 text-gray-400"/>
                                                <span className="text-sm font-bold text-gray-900">
                                                    {visit.patient_id?.fullName || "Vãng lai"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Stethoscope className="w-3 h-3 text-gray-400"/>
                                                <span className="text-xs text-gray-500">
                                                    BS: {visit.doctor_id?.fullName || "Không rõ"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate font-medium">
                                            {visit.diagnosis || "Chưa có chẩn đoán"}
                                        </td>
                                        <td className="hidden lg:table-cell px-6 py-4 text-sm text-gray-700 font-bold">
                                            {formatVND(visit.total_amount)}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-700">
                                            {new Date(visit.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end items-center gap-2">
                                                <button onClick={() => handleViewVisit(visit)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition" title="Xem chi tiết">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => confirmDelete(visit._id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition" title="Xóa phiếu khám">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <Search className="w-12 h-12 mb-2 opacity-20"/>
                                            <span>Không tìm thấy phiếu khám nào.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 4. PAGINATION (ĐÃ SỬA LỖI TẠI ĐÂY) */}
            {/* Sử dụng totalPages thay vì pages */}
            {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center shrink-0">
                    <span className="text-sm text-gray-500">
                        Trang <span className="font-bold text-indigo-600">{pagination.page}</span> / {pagination.totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button 
                            disabled={pagination.page === 1}
                            onClick={() => onPageChange(pagination.page - 1)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm text-gray-700 font-medium"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Trước
                        </button>
                        <button 
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() => onPageChange(pagination.page + 1)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm text-gray-700 font-medium"
                        >
                            Sau <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisitList;