// src/components/admin/medicine/MedicineList.jsx
import React from 'react';
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'; // Import icon điều hướng

const MedicineList = ({ 
    medicines, 
    handleAddEdit, 
    confirmDelete,
    pagination,     // Prop mới
    onPageChange    // Prop mới
}) => {

    // Hàm render số trang
    const renderPageNumbers = () => {
        if (!pagination || !pagination.totalPages) return null;
        
        const pages = [];
        for (let i = 1; i <= pagination.totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold border 
                    ${pagination.page === i 
                        ? 'z-10 bg-sky-500 text-white border-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600' 
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between h-full">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Thuốc</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn Vị</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liều Lượng Có Sẵn</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô Tả</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {medicines.length > 0 ? (
                            medicines.map((med) => (
                                <tr key={med._id || med.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{med.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.unit}</td>
                                    
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {med.dosages && med.dosages.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {med.dosages.map((d, i) => (
                                                    <span key={i} className="px-2 py-0.5 rounded text-xs bg-gray-100 border border-gray-200">
                                                        {d}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic text-xs">Chưa cập nhật</span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{med.description || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            med.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {med.status === 'active' ? 'Đang dùng' : 'Ngừng dùng'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center gap-2">
                                        <button onClick={() => handleAddEdit(med)} className="text-sky-600 hover:text-sky-900 p-1 hover:bg-sky-50 transition"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => confirmDelete(med._id || med.id)} className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 transition"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">Chưa có thuốc nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- PHẦN PHÂN TRANG UI --- */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                    {/* Mobile View */}
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${pagination.page <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Trước
                        </button>
                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${pagination.page >= pagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Sau
                        </button>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Đang xem trang <span className="font-medium">{pagination.page}</span> trên tổng số <span className="font-medium">{pagination.totalPages}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => onPageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${pagination.page <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                
                                {renderPageNumbers()}

                                <button
                                    onClick={() => onPageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${pagination.page >= pagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
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

export default MedicineList;