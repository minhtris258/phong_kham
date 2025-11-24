// src/components/admin/specialty/SpecialtyList.jsx
import React from 'react';
import { Plus, Edit, Trash2, Eye, Image as ImageIcon } from 'lucide-react'; // Thêm icon Image nếu muốn

const SpecialtyList = ({ specialtys, handleAddEdit, confirmDelete, handleViewDoctors }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Danh Sách Chuyên Khoa</h3>
                <button 
                    onClick={() => handleAddEdit(null)}
                    className="flex items-center bg-indigo-600 text-white px-3 py-2 text-sm rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                    <Plus className="w-5 h-5 mr-1" /> Thêm Chuyên Khoa
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                            {/* Cột Ảnh Mới */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình Ảnh</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Chuyên Khoa</th>
                            <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số Bác Sĩ</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        { specialtys.map((s, index) => (
                            <tr key={s._id || s.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                
                                {/* Hiển thị Ảnh */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {s.thumbnail ? (
                                        <img 
                                            src={s.thumbnail} 
                                            alt={s.name} 
                                            className="w-12 h-12 object-cover rounded-md border border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{s.name}</td>
                                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {s.doctor_count || (s.doctors ? s.doctors.length : '0')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center gap-2">
                                    <button onClick={() => handleViewDoctors(s)} className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 transition"><Eye className="w-4 h-4" /></button>
                                    <button onClick={() => handleAddEdit(s)} className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 transition"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => confirmDelete(s._id || s.id)} className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 transition"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SpecialtyList;