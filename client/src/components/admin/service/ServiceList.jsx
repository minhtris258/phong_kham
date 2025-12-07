import React from 'react';
import { Edit, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'; // Import thêm icon điều hướng

const ServiceList = ({ 
    services, 
    handleAddEdit, 
    confirmDelete, 
    pagination,     // Prop mới: chứa { page, limit, totalPages, totalDocs }
    onPageChange    // Prop mới: function(newPage)
}) => {
    
    // Hàm tạo danh sách số trang (1, 2, 3...)
    const renderPageNumbers = () => {
        if (!pagination || !pagination.totalPages) return null;
        
        const pages = [];
        for (let i = 1; i <= pagination.totalPages; i++) {
            // Logic hiển thị đơn giản: Hiển thị tất cả nếu ít trang, 
            // Thực tế nếu nhiều trang bạn có thể thêm logic "..."
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold border 
                    ${pagination.page === i 
                        ? 'z-10 bg-indigo-600 text-white border-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' 
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình Ảnh</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã DV</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Dịch Vụ</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá Tiền</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {services.length > 0 ? (
                            services.map((svc) => (
                                <tr key={svc._id || svc.id} className="hover:bg-gray-50">
                                    {/* Hiển thị Hình Ảnh */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {svc.image ? (
                                            <img 
                                                src={svc.image} 
                                                alt={svc.name} 
                                                className="w-12 h-12 object-cover rounded-md border border-gray-200" 
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 border border-gray-200">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{svc.code || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{svc.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-semibold">
                                        {svc.price?.toLocaleString('vi-VN')} đ
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            svc.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {svc.status === 'active' ? 'Hoạt động' : 'Tạm ẩn'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center gap-2">
                                        <button onClick={() => handleAddEdit(svc)} className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 transition"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => confirmDelete(svc._id || svc.id)} className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 transition"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">Chưa có dịch vụ nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- PHẦN PHÂN TRANG --- */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                    {/* Mobile: Nút Trước/Sau đơn giản */}
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

                    {/* Desktop: Đầy đủ thông tin */}
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Đang xem trang <span className="font-medium">{pagination.page}</span> trên tổng số <span className="font-medium">{pagination.totalPages}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                {/* Nút Previous */}
                                <button
                                    onClick={() => onPageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${pagination.page <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>

                                {/* Các số trang */}
                                {renderPageNumbers()}

                                {/* Nút Next */}
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

export default ServiceList;