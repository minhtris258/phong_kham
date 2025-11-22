// src/components/admin/appointment/AppointmentFormModal.jsx (ĐÃ SỬA ĐẦY ĐỦ)

import React, { useState, useEffect } from 'react';
import Modal from '../Modal'; 

const AppointmentFormModal = ({
    isOpen,
    onClose,
    formData,
    handleInputChange,
    handleSave,
    editingAppointment,
    mockPatients,
    mockDoctors,
    getDoctorName,
    checkAvailability, // <-- PROP MỚI: Hàm kiểm tra rảnh/bận từ cha
}) => {
    
    const [isConflict, setIsConflict] = useState(false); // State báo xung đột
    
    // Hàm đóng modal
    const handleClose = () => {
        onClose();
    };

    // Xác định ID mặc định nếu không có trong form data
    const defaultPatientId = mockPatients[0]?.id;
    const defaultDoctorId = mockDoctors[0]?.id;
    const isEditing = !!editingAppointment;

    // === HÀM KIỂM TRA XUNG ĐỘT ===
    const checkConflict = () => {
        const { doctor_id, date, start } = formData;
        
        if (!doctor_id || !date || !start) {
            setIsConflict(false);
            return;
        }

        // Gọi hàm kiểm tra từ prop
        const isAvailable = checkAvailability(
            doctor_id, 
            date, 
            start, 
            editingAppointment?.id // Loại trừ lịch hẹn hiện tại khi sửa
        );
        setIsConflict(!isAvailable);
    };

    // Gọi kiểm tra khi form data thay đổi
    useEffect(() => {
        // Chỉ chạy khi formData đã được load và checkAvailability có sẵn
        if (formData.doctor_id && formData.date && formData.start && checkAvailability) {
             checkConflict();
        }
    }, [formData.doctor_id, formData.date, formData.start, checkAvailability]);


    // === HÀM SAVE CUỐI CÙNG (CÓ CHECK) ===
    const handleSaveAndCheck = (e) => {
        e.preventDefault();

        // Kiểm tra validation cơ bản
        if (!formData.patient_id || !formData.date || !formData.start || !formData.doctor_id) {
             alert('Vui lòng điền đầy đủ Bệnh nhân, Bác sĩ, Ngày và Giờ.');
             return;
        }
        
        // Kiểm tra xung đột lần cuối
        if (isConflict) {
            alert('Lỗi: Bác sĩ đã có lịch hẹn khác vào thời điểm này. Vui lòng chọn giờ khác.');
            return;
        }
        
        handleSave(formData); // Gọi hàm save chính thức từ component cha (truyền formData)
    };


    return (
        <Modal 
            title={isEditing ? 'Chỉnh Sửa Lịch Hẹn' : 'Thêm Lịch Hẹn Mới'} 
            isOpen={isOpen} 
            onClose={handleClose}
            maxWidth="lg"
        >
            <form onSubmit={handleSaveAndCheck}> 
                <div className="space-y-5">
                    
                    {/* Hàng 1: Bệnh Nhân & Bác Sĩ */}
                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Bệnh Nhân:</span>
                            <select 
                                name="patient_id"
                                value={formData.patient_id || defaultPatientId}
                                onChange={handleInputChange}
                                required
                                disabled={isEditing} 
                                className={`mt-1 block w-full rounded-xl border-gray-300 shadow-sm p-3 transition ${isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                            >
                                {mockPatients.map(p => (
                                    <option key={p.id} value={p.id}>{p.fullName} ({p.phone})</option>
                                ))}
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Bác Sĩ:</span>
                            <select 
                                name="doctor_id"
                                value={formData.doctor_id || defaultDoctorId}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-3 bg-white"
                            >
                                {mockDoctors.map(doctor => (
                                    <option key={doctor.id} value={doctor.id}>{getDoctorName(doctor.id)}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {/* Hàng 2: Ngày, Giờ & Trạng Thái */}
                    <div className="grid grid-cols-3 gap-4">
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Ngày Hẹn:</span>
                            <input 
                                type="date" 
                                name="date"
                                value={formData.date || ''}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 p-3"
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Giờ Hẹn:</span>
                            <input 
                                type="time" 
                                name="start"
                                value={formData.start || ''}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 p-3"
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Trạng Thái:</span>
                            <select 
                                name="status"
                                value={formData.status || 'pending'}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 p-3 bg-white"
                            >
                                <option value="pending">Đang chờ</option>
                                <option value="confirmed">Đã xác nhận</option>
                                <option value="completed">Đã hoàn thành</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                        </label>
                    </div>

                    {/* HIỂN THỊ CẢNH BÁO XUNG ĐỘT */}
                    {isConflict && formData.date && formData.start && (
                         <div className="p-3 bg-red-100 text-red-700 rounded-xl font-medium border border-red-300">
                             ⚠️ Bác sĩ **{getDoctorName(formData.doctor_id)}** đã có lịch hẹn vào **{formData.start}** ngày **{formData.date}**.
                         </div>
                    )}
                    
                    {/* Lý do */}
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Lý Do Khám:</span>
                        <textarea
                            name="reason"
                            value={formData.reason || ''}
                            onChange={handleInputChange}
                            rows="3"
                            placeholder="Mô tả các triệu chứng hoặc lý do cần gặp bác sĩ."
                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 p-3"
                        ></textarea>
                    </label>
                    
                </div>
                
                {/* Nút hành động */}
                <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
                    <button 
                        type="button"
                        onClick={handleClose}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
                    >
                        Hủy
                    </button>
                    <button 
                        type="submit"
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:bg-indigo-700 transition"
                        disabled={isConflict} // Disable nếu có xung đột
                    >
                        {isEditing ? 'Cập nhật Lịch Hẹn' : 'Đặt Lịch Hẹn'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AppointmentFormModal;