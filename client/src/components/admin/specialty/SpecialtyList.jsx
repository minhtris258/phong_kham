// src/components/admin/specialty/SpecialtyList.jsx
import React from 'react';
import { Plus, Edit, Trash2, Eye, Image as ImageIcon, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const SpecialtyList = ({ 
    specialtys, 
    loading,
    // Props Search & Pagination
    searchTerm,
    onSearchChange,
    pagination,
    onPageChange,
    // Actions
    handleAddEdit, 
    confirmDelete, 
    handleViewDoctors 
}) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            
            {/* 1. Header & Button Thêm */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Danh Sách Chuyên Khoa</h3>
                <button 
                    onClick={() => handleAddEdit(null)}
                    className="flex items-center bg-indigo-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-indigo-700 transition shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-1" /> Thêm Chuyên Khoa
                </button>
            </div>

            {/* 2. Thanh Tìm Kiếm */}
            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Tìm kiếm chuyên khoa..."
                    value={searchTerm}
                    onChange={onSearchChange}
                />
            </div>
            
            {/* 3. Bảng Dữ Liệu */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">STT</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Hình Ảnh</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tên Chuyên Khoa</th>
                            <th className="hidden sm:table-cell px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Số Bác Sĩ</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                             <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                        ) : specialtys.length > 0 ? (
                            specialtys.map((s, index) => (
                                <tr key={s._id || s.id} className="hover:bg-gray-50 transition duration-150">
                                    {/* Tính STT theo trang */}
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

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{s.name}</td>
                                    
                                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                        <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
                                            {s.doctor_count || (s.doctors ? s.doctors.length : '0')}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center gap-2">
                                            <button onClick={() => handleViewDoctors(s)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition" title="Xem bác sĩ"><Eye className="w-4 h-4" /></button>
                                            <button onClick={() => handleAddEdit(s)} className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition" title="Sửa"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => confirmDelete(s._id || s.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Không tìm thấy chuyên khoa nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 4. Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                    <div className="hidden sm:flex flex-1 sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-700">
                            Trang <span className="font-medium">{pagination.page}</span> / <span className="font-medium">{pagination.totalPages}</span> 
                            {' '}(Tổng <span className="font-medium">{pagination.totalDocs}</span>)
                        </p>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={() => onPageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            
                            {/* Hiển thị số trang */}
                            {[...Array(pagination.totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => onPageChange(i + 1)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                        pagination.page === i + 1
                                            ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => onPageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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