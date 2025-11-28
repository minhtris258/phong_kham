import React, { useState, useEffect } from 'react';
import Modal from '../Modal'; 
import timeslotService from '../../../services/TimeslotService'; 
import { toastSuccess, toastError,toastWarning,toastInfo } from "../../../utils/toast";

const AppointmentFormModal = ({
    isOpen,
    onClose,
    formData,
    handleInputChange, // <-- Hàm này cần sửa nhẹ ở cha hoặc override ở đây
    handleSave,
    editingAppointment,
    mockPatients,
    mockDoctors,
}) => {
    
    const [availableSlots, setAvailableSlots] = useState([]); 
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [slotError, setSlotError] = useState(null);

    const isEditing = !!editingAppointment;
    const defaultPatientId = mockPatients[0]?._id; 
    const defaultDoctorId = mockDoctors[0]?._id;

    // === 1. Gọi API lấy Slot rảnh ===
    useEffect(() => {
        const fetchSlots = async () => {
            const { doctor_id, date } = formData;
            
            if (!doctor_id || !date) {
                setAvailableSlots([]);
                return;
            }

            setIsLoadingSlots(true);
            setSlotError(null);

            try {
                const res = await timeslotService.getSlotsByDate(doctor_id, date);
                let slots = res.data || [];

                // Nếu đang EDIT, thêm lại slot hiện tại vào danh sách
                if (isEditing && editingAppointment.start) {
                    const currentSlot = {
                        _id: editingAppointment.timeslot_id, // Quan trọng: Lấy đúng ID slot cũ
                        start: editingAppointment.start, 
                        status: 'current'
                    };
                    if (!slots.find(s => s.start === currentSlot.start)) {
                        slots = [currentSlot, ...slots].sort((a, b) => a.start.localeCompare(b.start));
                    }
                }

                setAvailableSlots(slots);
            } catch (error) {
                toastError("Lỗi lấy lịch rảnh: " + (error.response?.data?.message || error.message));
                setSlotError("Không thể tải lịch rảnh của bác sĩ.");
            } finally {
                setIsLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [formData.doctor_id, formData.date, isEditing, editingAppointment]);

    // === 2. Xử lý chọn Slot đặc biệt ===
    const handleSlotChange = (e) => {
        const selectedTime = e.target.value;
        
        // Tìm slot object tương ứng với giờ được chọn
        const selectedSlot = availableSlots.find(slot => slot.start === selectedTime);

        // Gọi hàm cha để update formData
        // Lưu ý: Cần update cả 'start' VÀ 'timeslot_id'
        handleInputChange({
            target: { name: 'start', value: selectedTime }
        });
        
        if (selectedSlot) {
            handleInputChange({
                target: { name: 'timeslot_id', value: selectedSlot._id }
            });
        }
    };

    // === 3. Xử lý Submit ===
    const handleSaveAndCheck = (e) => {
        e.preventDefault();
        
        // Kiểm tra kỹ timeslot_id
        if (!formData.patient_id || !formData.date || !formData.timeslot_id) {
             toastError('Vui lòng chọn đầy đủ Bệnh nhân, Bác sĩ, Ngày và Giờ khám.');
             return;
        }
        handleSave(formData); 
    };

    return (
        <Modal 
            title={isEditing ? 'Chỉnh Sửa Lịch Hẹn' : 'Thêm Lịch Hẹn Mới'} 
            isOpen={isOpen} 
            onClose={onClose}
            maxWidth="lg"
        >
            <form onSubmit={handleSaveAndCheck}> 
                <div className="space-y-5">
                    
                    {/* Bệnh nhân & Bác sĩ */}
                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Bệnh Nhân:</span>
                            <select 
                                name="patient_id"
                                value={formData.patient_id || defaultPatientId}
                                onChange={handleInputChange}
                                required
                                disabled={isEditing} 
                                className={`mt-1 block w-full rounded-xl border-gray-300 shadow-sm p-3 ${isEditing ? 'bg-gray-100' : 'bg-white'}`}
                            >
                                <option value="">-- Chọn bệnh nhân --</option>
                                {mockPatients.map(p => (
                                    <option key={p._id} value={p._id}>{p.fullName || p.name} ({p.phone || "N/A"})</option>
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
                                className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm p-3 bg-white"
                            >
                                <option value="">-- Chọn bác sĩ --</option>
                                {mockDoctors.map(doctor => (
                                    <option key={doctor._id} value={doctor._id}>{doctor.fullName || doctor.name}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {/* Ngày & Giờ (Slot) */}
                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Ngày Hẹn:</span>
                            <input 
                                type="date" 
                                name="date"
                                value={formData.date || ''}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm p-3"
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Giờ Hẹn (Slot):</span>
                            {isLoadingSlots ? (
                                <div className="mt-1 p-3 text-sm text-gray-500 bg-gray-50 rounded-xl border">Đang tải lịch rảnh...</div>
                            ) : slotError ? (
                                <div className="mt-1 p-3 text-sm text-red-500 bg-red-50 rounded-xl border border-red-200">{slotError}</div>
                            ) : (
                                <select 
                                    name="start"
                                    value={formData.start || ''}
                                    onChange={handleSlotChange} // <-- Dùng hàm handler mới
                                    required
                                    disabled={availableSlots.length === 0}
                                    className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm p-3 bg-white disabled:bg-gray-100"
                                >
                                    <option value="">
                                        {availableSlots.length === 0 ? "Không có lịch rảnh" : "-- Chọn giờ --"}
                                    </option>
                                    {availableSlots.map((slot) => (
                                        <option key={slot._id} value={slot.start}>
                                            {slot.start}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </label>
                    </div>

                    {/* Trạng thái */}
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Trạng Thái:</span>
                        <select 
                            name="status"
                            value={formData.status || 'pending'}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm p-3 bg-white"
                        >
                            <option value="pending">Đang chờ</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="completed">Đã hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </label>
                    
                    {/* Lý do */}
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Lý Do Khám:</span>
                        <textarea
                            name="reason"
                            value={formData.reason || ''}
                            onChange={handleInputChange}
                            rows="3"
                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm p-3"
                        ></textarea>
                    </label>
                </div>
                
                <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
                    <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition">Hủy</button>
                    <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition">
                        {isEditing ? 'Cập nhật' : 'Lưu'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AppointmentFormModal;