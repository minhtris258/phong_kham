import React from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';

const DoctorList = ({ doctors, handleAddEdit, handleViewDoctor, confirmDelete }) => {
    const doctorsArray = Array.isArray(doctors) ? doctors : [];

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Danh Sách Bác Sĩ</h3>
                <button 
                    onClick={() => handleAddEdit(null)}
                    className="flex items-center bg-indigo-600 text-white px-3 py-2 text-sm rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                    <Plus className="w-5 h-5 mr-1" /> Thêm Bác Sĩ
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Bác Sĩ</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chuyên Khoa</th>
                            <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phí Khám</th>
                            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {doctorsArray.length > 0 ? (
                            doctorsArray.map((doc) => (
                                <tr key={doc._id} className="hover:bg-gray-50"> {/* ← Dùng _id thay vì id */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {doc.fullName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {doc.specialty_id?.name || 'Chưa chọn'} {/* ← Lấy tên từ object */}
                                    </td>
                                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {doc.consultation_fee?.toLocaleString('vi-VN')} VNĐ
                                    </td>
                                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {doc.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <StatusBadge status={doc.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center gap-2">
                                        <button onClick={() => handleViewDoctor(doc)} className="text-blue-600 hover:text-blue-900">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleAddEdit(doc)} className="text-indigo-600 hover:text-indigo-900">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => confirmDelete(doc._id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    Không có dữ liệu bác sĩ.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DoctorList;