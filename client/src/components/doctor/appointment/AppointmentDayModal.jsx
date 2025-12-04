// src/components/doctor/appointment/AppointmentDayModal.jsx
import React from 'react';
import Modal from '../../Modal';
import { Plus, CalendarSync, CalendarX, ClipboardPen } from 'lucide-react';

const AppointmentDayModal = ({
    isOpen, 
    onClose, 
    date, 
    dayAppointments, 
    getStatusStyle, 
    handleAddEdit,       // Hàm sửa/tạo mới lịch
    confirmCancel,       // Hàm hủy lịch
    handleOpenVisitModal // Hàm tạo phiếu khám (Mới thêm)
}) => {
    const formattedDate = date ? date.split('-').reverse().join('/') : '';
    const apps = dayAppointments || [];

    return (
        <Modal
            title={`Lịch Hẹn Ngày ${formattedDate}`}
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="4xl" // Tăng độ rộng để bảng dễ nhìn hơn
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                    Tổng cộng: {apps.length} lịch hẹn
                </h3>
                <button 
                    onClick={() => {
                        handleAddEdit(null); 
                        onClose(); // Đóng modal ngày khi mở modal thêm mới
                    }}
                    className="flex items-center bg-indigo-600 text-white px-4 py-2 text-sm rounded-xl font-semibold shadow-md hover:bg-indigo-700 transition"
                >
                    <Plus className="w-5 h-5 mr-1" /> Thêm Lịch Hẹn
                </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh] border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Bệnh Nhân</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Thời Gian</th>
                            <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Lý Do</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Trạng Thái</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {apps.length > 0 ? (
                            apps.sort((a, b) => a.start.localeCompare(b.start)).map((app) => (
                                <tr key={app._id || app.id} className="hover:bg-indigo-50/50 transition">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        <div className="flex flex-col">
                                            <span>{app.patient_id?.name || app.patient_id?.fullName || "N/A"}</span>
                                            {app.patient_id?.phone && (
                                                <span className="text-xs text-gray-500">{app.patient_id.phone}</span>
                                            )}
                                        </div>
                                    </td>
                                    
                                    <td className="px-4 py-3 text-sm text-indigo-700 font-bold">
                                        {app.start}
                                    </td>

                                    <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-500 truncate max-w-xs">
                                        {app.reason || "Không có lý do"}
                                    </td>

                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 inline-flex text-xs font-bold rounded-full ${getStatusStyle(app.status)}`}>
                                            {app.status === 'pending' ? 'Chờ xác nhận' : 
                                             app.status === 'confirmed' ? 'Đã xác nhận' :
                                             app.status === 'completed' ? 'Hoàn thành' :
                                             app.status === 'cancelled' ? 'Đã hủy' : app.status}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-right text-sm font-medium">
                                        <div className="flex justify-end items-center gap-2">
                                            
                                            {/* 1. NÚT KHÁM BỆNH (Chỉ hiện khi đã xác nhận hoặc chờ) */}
                                            {["confirmed", "pending"].includes(app.status) && (
                                                <button 
                                                    onClick={() => { 
                                                        handleOpenVisitModal(app); // Gọi hàm mở modal khám
                                                        onClose(); // Đóng modal ngày lại
                                                    }}
                                                    className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-100 transition"
                                                    title="Tạo kê đơn / Khám bệnh"
                                                >
                                                    <ClipboardPen className="w-5 h-5" />
                                                </button>
                                            )}

                                            {/* 2. NÚT SỬA / DỜI LỊCH (Ẩn nếu đã hủy/hoàn thành) */}
                                            {app.status !== 'cancelled' && app.status !== 'completed' && (
                                                <button 
                                                    onClick={() => { 
                                                        handleAddEdit(app); // Gọi hàm sửa
                                                        onClose(); 
                                                    }} 
                                                    className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-100 transition" 
                                                    title="Dời lịch / Cập nhật thông tin"
                                                >
                                                    <CalendarSync className="w-5 h-5" />
                                                </button>
                                            )}

                                            {/* 3. NÚT HỦY (Ẩn nếu đã hủy/hoàn thành) */}
                                            {app.status !== 'cancelled' && app.status !== 'completed' ? (
                                                <button 
                                                    onClick={() => { 
                                                        confirmCancel(app._id || app.id); 
                                                        // Không cần đóng modal ngày, để bác sĩ thấy trạng thái chuyển sang hủy luôn
                                                    }} 
                                                    className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition" 
                                                    title="Hủy lịch hẹn"
                                                >
                                                    <CalendarX className="w-5 h-5" />
                                                </button>
                                            ) : (
                                                // Placeholder để giữ khoảng cách nếu không có nút hủy
                                                <div className="w-9 h-9"></div> 
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">Không có lịch hẹn nào trong ngày này.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Modal>
    );
};

export default AppointmentDayModal;