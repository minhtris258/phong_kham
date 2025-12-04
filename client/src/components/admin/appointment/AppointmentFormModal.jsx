import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import Modal from '../Modal'; 
import timeslotService from '../../../services/TimeslotService'; 
import { toastSuccess, toastError } from "../../../utils/toast";

// === COMPONENT CON: Dropdown Có Tìm Kiếm & Scroll (ĐÃ SỬA LỖI) ===
const SearchableSelect = ({ 
    label, 
    options, 
    value, 
    onChange, 
    placeholder, 
    disabled, 
    getLabel,   // [MỚI] Hàm trả về chuỗi text để tìm kiếm & hiển thị giá trị chọn
    renderItem  // [MỚI] Hàm trả về JSX để hiển thị đẹp trong list (Optional)
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef(null);

    // Tìm item đang được chọn
    const selectedOption = options.find(opt => opt._id === value);

    // Lọc danh sách theo từ khóa (Dùng getLabel để lấy text thuần)
    const filteredOptions = options.filter(opt => {
        const text = getLabel(opt).toLowerCase(); 
        return text.includes(searchTerm.toLowerCase());
    });

    // Đóng khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className="relative mb-4" ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            
            {/* Ô hiển thị giá trị đã chọn */}
            <div 
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full rounded-xl border border-gray-300 shadow-sm p-3 bg-white flex justify-between items-center cursor-pointer ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-indigo-500'}`}
            >
                <span className={`block truncate ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
                    {/* Dùng getLabel để hiển thị text thuần khi đã chọn */}
                    {selectedOption ? getLabel(selectedOption) : placeholder}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>

            {/* Danh sách xổ xuống */}
            {isOpen && !disabled && (
                <div className="absolute z-50 mt-1 w-full bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
                    {/* Ô Input Tìm kiếm */}
                    <div className="p-2 border-b border-gray-100 bg-gray-50 sticky top-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input 
                                type="text"
                                autoFocus
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                                placeholder="Gõ để tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Danh sách cuộn */}
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div 
                                    key={opt._id}
                                    onClick={() => {
                                        onChange(opt._id);
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                    className={`px-4 py-3 text-sm cursor-pointer hover:bg-indigo-50 transition border-b border-gray-50 last:border-0 ${value === opt._id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'}`}
                                >
                                    {/* Nếu có renderItem thì dùng JSX đẹp, không thì dùng text thuần */}
                                    {renderItem ? renderItem(opt) : getLabel(opt)}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">Không tìm thấy kết quả</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// === COMPONENT CHÍNH ===
const AppointmentFormModal = ({
    isOpen,
    onClose,
    formData,
    handleInputChange,
    handleSave,
    editingAppointment,
    mockPatients = [],
    mockDoctors = [],
}) => {
    
    const [availableSlots, setAvailableSlots] = useState([]); 
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [slotError, setSlotError] = useState(null);

    const isEditing = !!editingAppointment;

    // 1. Fetch Slot
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
                let slots = [];
                if (Array.isArray(res)) slots = res;
                else if (Array.isArray(res.data)) slots = res.data;
                else if (res.data?.slots) slots = res.data.slots;

                if (isEditing && editingAppointment.start) {
                    const currentSlot = {
                        _id: editingAppointment.timeslot_id, 
                        start: editingAppointment.start, 
                        status: 'current'
                    };
                    if (!slots.find(s => s.start === currentSlot.start)) {
                        slots = [currentSlot, ...slots].sort((a, b) => a.start.localeCompare(b.start));
                    }
                }
                setAvailableSlots(slots);
            } catch (error) {
                console.error(error);
                setSlotError("Không thể tải lịch rảnh.");
            } finally {
                setIsLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [formData.doctor_id, formData.date, isEditing, editingAppointment]);

    // Helpers update state
    const updateField = (name, value) => {
        handleInputChange({ target: { name, value } });
    };

    const handleSlotChange = (e) => {
        const selectedTime = e.target.value;
        const selectedSlot = availableSlots.find(slot => slot.start === selectedTime);
        
        updateField('start', selectedTime);
        if (selectedSlot) {
            updateField('timeslot_id', selectedSlot._id);
        }
    };

    // Wrapper for custom select
    const handleSelectChange = (name, value) => {
        handleInputChange({ target: { name, value } });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.patient_id || !formData.doctor_id || !formData.date || !formData.start) {
             toastError('Vui lòng nhập đầy đủ thông tin.');
             return;
        }
        handleSave(formData); 
    };

    return (
        <Modal 
            title={isEditing ? 'Chỉnh Sửa Lịch Hẹn' : 'Thêm Lịch Hẹn Mới'} 
            isOpen={isOpen} 
            onClose={onClose}
            maxWidth="2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-4"> 
                
                {/* 1. CHỌN BỆNH NHÂN */}
                <SearchableSelect 
                    label="Bệnh Nhân"
                    placeholder="-- Tìm & Chọn Bệnh nhân --"
                    options={mockPatients}
                    value={formData.patient_id}
                    onChange={(val) => handleSelectChange('patient_id', val)}
                    disabled={isEditing} 
                    
                    // A. Hàm lấy text thuần để search và hiện khi chọn (BẮT BUỘC)
                    getLabel={(p) => `${p.fullName || p.name} - ${p.phone || "SĐT?"}`} 
                    
                    // B. Hàm render JSX để hiện danh sách đẹp (TÙY CHỌN)
                    renderItem={(p) => (
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-800">{p.fullName || p.name}</span>
                            <span className="text-xs text-gray-500">Email: {p.email} | SĐT: {p.phone || "N/A"}</span>
                        </div>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 2. CHỌN BÁC SĨ */}
                    <SearchableSelect 
                        label="Bác Sĩ"
                        placeholder="-- Tìm & Chọn Bác sĩ --"
                        options={mockDoctors}
                        value={formData.doctor_id}
                        onChange={(val) => handleSelectChange('doctor_id', val)}
                        
                        // A. Hàm lấy text thuần
                        getLabel={(d) => d.fullName || d.name}

                        // B. Hàm render JSX
                        renderItem={(d) => (
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-900">{d.fullName || d.name}</span>
                                <span className="text-xs text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded w-fit mt-1">
                                    {d.specialty?.name || d.specialty_id?.name || "Đa khoa"}
                                </span>
                            </div>
                        )}
                    />

                    {/* Ngày Hẹn */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày Hẹn:</label>
                        <input 
                            type="date" 
                            name="date"
                            value={formData.date || ''}
                            onChange={handleInputChange}
                            required
                            className="w-full rounded-xl border border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                {/* Giờ Hẹn */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ Hẹn:</label>
                    {isLoadingSlots ? (
                        <div className="p-3 text-sm text-gray-500 bg-gray-50 rounded-xl border animate-pulse">Đang tải lịch rảnh...</div>
                    ) : slotError ? (
                        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-xl border border-red-200">{slotError}</div>
                    ) : (
                        <select 
                            name="start"
                            value={formData.start || ''}
                            onChange={handleSlotChange}
                            required
                            disabled={availableSlots.length === 0}
                            className="w-full rounded-xl border border-gray-300 shadow-sm p-3 bg-white focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                        >
                            <option value="">
                                {availableSlots.length === 0 ? (formData.date ? "Hết lịch trống" : "Chọn ngày trước") : "-- Chọn giờ khám --"}
                            </option>
                            {availableSlots.map((slot) => (
                                <option key={slot._id} value={slot.start}>
                                    {slot.start} {slot.status === 'current' ? '(Hiện tại)' : ''}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Trạng thái */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái:</label>
                        <select 
                            name="status"
                            value={formData.status || 'pending'}
                            onChange={handleInputChange}
                            className="w-full rounded-xl border border-gray-300 shadow-sm p-3 bg-white focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="pending">Đang chờ (Pending)</option>
                            <option value="confirmed">Đã xác nhận (Confirmed)</option>
                            <option value="completed">Đã hoàn thành (Completed)</option>
                            <option value="cancelled">Đã hủy (Cancelled)</option>
                        </select>
                    </div>
                </div>
                
                {/* Lý do */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lý Do / Triệu Chứng:</label>
                    <textarea
                        name="reason"
                        value={formData.reason || ''}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Nhập ghi chú..."
                        className="w-full rounded-xl border border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                    ></textarea>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium">Hủy</button>
                    <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition font-medium">
                        {isEditing ? 'Lưu Thay Đổi' : 'Tạo Lịch Hẹn'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AppointmentFormModal;