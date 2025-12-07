import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import Modal from '../../Modal'; // Tái sử dụng Modal chung của bạn

const MedicineFormModal = ({ isOpen, onClose, formData, setFormData, handleSave, editingMedicine }) => {
    // State tạm để nhập liều lượng trước khi push vào mảng
    const [dosageInput, setDosageInput] = useState("");

    // Xử lý thay đổi các input text bình thường
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Thêm liều lượng vào mảng
    const handleAddDosage = () => {
        if (!dosageInput.trim()) return;
        
        const currentDosages = formData.dosages || [];
        // Không thêm trùng
        if (currentDosages.includes(dosageInput.trim())) {
            setDosageInput("");
            return;
        }

        setFormData({
            ...formData,
            dosages: [...currentDosages, dosageInput.trim()]
        });
        setDosageInput("");
    };

    // Xóa liều lượng khỏi mảng
    const handleRemoveDosage = (indexToRemove) => {
        const currentDosages = formData.dosages || [];
        setFormData({
            ...formData,
            dosages: currentDosages.filter((_, index) => index !== indexToRemove)
        });
    };

    // Bắt sự kiện Enter khi đang nhập liều lượng
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Chặn submit form
            handleAddDosage();
        }
    };

    return (
        <Modal 
            title={editingMedicine ? 'Cập Nhật Thuốc' : 'Thêm Thuốc Mới'} 
            isOpen={isOpen} 
            onClose={onClose}
        >
            <form onSubmit={handleSave}>
                <div className="space-y-4">
                    {/* Tên thuốc */}
                    <label className="block">
                        <span className="text-gray-700 font-medium">Tên Thuốc <span className="text-red-500">*</span></span>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name || ''} 
                            onChange={handleChange}
                            placeholder="Ví dụ: Panadol Extra"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border outline-none"
                            required
                        />
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Đơn vị */}
                        <label className="block">
                            <span className="text-gray-700 font-medium">Đơn Vị Tính</span>
                            <input 
                                type="text" 
                                name="unit" 
                                value={formData.unit || ''} 
                                onChange={handleChange}
                                placeholder="Viên, Vỉ..."
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border outline-none"
                            />
                        </label>

                        {/* Trạng thái */}
                        <label className="block">
                            <span className="text-gray-700 font-medium">Trạng Thái</span>
                            <select
                                name="status"
                                value={formData.status || 'active'}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border outline-none"
                            >
                                <option value="active">Đang sử dụng</option>
                                <option value="inactive">Ngừng sử dụng</option>
                            </select>
                        </label>
                    </div>

                    {/* --- PHẦN QUẢN LÝ LIỀU LƯỢNG (MỚI) --- */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <label className="block text-gray-700 font-medium mb-2">Các Liều Lượng (Dosages)</label>
                        <div className="flex gap-2 mb-2">
                            <input 
                                type="text"
                                value={dosageInput}
                                onChange={(e) => setDosageInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Nhập liều (vd: 500mg) rồi Enter"
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 p-2 border text-sm outline-none"
                            />
                            <button 
                                type="button" 
                                onClick={handleAddDosage}
                                className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md hover:bg-indigo-200 transition flex items-center"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        
                        {/* Danh sách các tag liều lượng đã thêm */}
                        <div className="flex flex-wrap gap-2 min-h-[30px]">
                            {formData.dosages && formData.dosages.length > 0 ? (
                                formData.dosages.map((dose, index) => (
                                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                        {dose}
                                        <button 
                                            type="button"
                                            onClick={() => handleRemoveDosage(index)}
                                            className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-gray-400 italic">Chưa có liều lượng nào.</span>
                            )}
                        </div>
                    </div>
                    {/* --------------------------------------- */}

                    {/* Mô tả */}
                    <label className="block">
                        <span className="text-gray-700 font-medium">Mô Tả / Công Dụng</span>
                        <textarea 
                            name="description" 
                            value={formData.description || ''} 
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border outline-none"
                        ></textarea>
                    </label>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold">Hủy</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold">Lưu Thông Tin</button>
                </div>
            </form>
        </Modal>
    );
};

export default MedicineFormModal;