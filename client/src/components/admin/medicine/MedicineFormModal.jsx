import React from 'react';
import Modal from '../../Modal'; // Tái sử dụng Modal chung của bạn

const MedicineFormModal = ({ isOpen, onClose, formData, handleInputChange, handleSave, editingMedicine }) => {
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
                            onChange={handleInputChange}
                            placeholder="Ví dụ: Panadol Extra"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border"
                            required
                        />
                    </label>

                    {/* Đơn vị */}
                    <label className="block">
                        <span className="text-gray-700 font-medium">Đơn Vị Tính</span>
                        <input 
                            type="text" 
                            name="unit" 
                            value={formData.unit || ''} 
                            onChange={handleInputChange}
                            placeholder="Ví dụ: Viên, Vỉ, Chai"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border"
                        />
                    </label>

                    {/* Trạng thái */}
                    <label className="block">
                        <span className="text-gray-700 font-medium">Trạng Thái</span>
                        <select
                            name="status"
                            value={formData.status || 'active'}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border"
                        >
                            <option value="active">Đang sử dụng</option>
                            <option value="inactive">Ngừng sử dụng</option>
                        </select>
                    </label>

                    {/* Mô tả */}
                    <label className="block">
                        <span className="text-gray-700 font-medium">Mô Tả / Công Dụng</span>
                        <textarea 
                            name="description" 
                            value={formData.description || ''} 
                            onChange={handleInputChange}
                            rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border"
                        ></textarea>
                    </label>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold">Hủy</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold">Lưu</button>
                </div>
            </form>
        </Modal>
    );
};

export default MedicineFormModal;