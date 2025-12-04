import React from 'react';
import { Edit, Trash2, Image as ImageIcon } from 'lucide-react'; // Import thêm icon Image

const ServiceList = ({ services, handleAddEdit, confirmDelete }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {/* Thêm cột Hình Ảnh */}
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
        </div>
    );
};

export default ServiceList;