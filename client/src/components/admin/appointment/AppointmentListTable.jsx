
// src/components/admin/appointment/AppointmentListTable.jsx
import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AppointmentListTable = ({
    appointments,
    selectedDate,
    getDoctorName,
    getPatientName,
    getStatusStyle,
    handleAddEdit,
    confirmDelete,
}) => {
    const title = selectedDate 
        ? `Lịch Hẹn Ngày ${selectedDate.split('-').reverse().join('/')}` 
        : 'Danh Sách Lịch Hẹn';

    return (
        <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
                <button 
                    onClick={() => handleAddEdit(null)}
                    className="flex items-center bg-indigo-600 text-white px-4 py-2 text-sm rounded-xl font-semibold shadow-md hover:bg-indigo-700 transition transform hover:scale-105"
                >
                    <Plus className="w-5 h-5 mr-1" /> Thêm Lịch Hẹn
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bệnh Nhân</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bác Sĩ</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thời Gian</th>
                            <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lý Do</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng Thái</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {appointments.length > 0 ? (
                            appointments.map((app) => (
                                <tr key={app.id} className="hover:bg-indigo-50/50 transition duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getPatientName(app.patient_id)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getDoctorName(app.doctor_id)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{app.start} - {app.date}</td>
                                    <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{app.reason || 'Không rõ'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${getStatusStyle(app.status)}`}>
                                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center">
                                        <button 
                                            onClick={() => handleAddEdit(app)}
                                            className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-100 transition"
                                            title="Sửa"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => confirmDelete(app.id)}
                                            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition ml-1"
                                            title="Xóa"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-10 text-center text-gray-500 font-medium bg-gray-50">
                                    Không có lịch hẹn nào được tìm thấy {selectedDate ? `trong ngày ${selectedDate.split('-').reverse().join('/')}.` : '.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AppointmentListTable;