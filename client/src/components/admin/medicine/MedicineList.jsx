import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const MedicineList = ({ medicines, handleAddEdit, confirmDelete }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
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
                                    
                                    {/* Cột Liều Lượng Mới */}
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
                                        <button onClick={() => handleAddEdit(med)} className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 transition"><Edit className="w-4 h-4" /></button>
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
        </div>
    );
};

export default MedicineList;