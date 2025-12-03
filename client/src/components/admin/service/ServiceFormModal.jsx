import React from 'react';
import Modal from '../../Modal';

const ServiceFormModal = ({ isOpen, onClose, formData, handleInputChange, handleSave, editingService }) => {
    return (
        <Modal 
            title={editingService ? 'Cập Nhật Dịch Vụ' : 'Thêm Dịch Vụ Mới'} 
            isOpen={isOpen} 
            onClose={onClose}
        >
            <form onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tên dịch vụ */}
                    <label className="block col-span-2">
                        <span className="text-gray-700 font-medium">Tên Dịch Vụ <span className="text-red-500">*</span></span>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                    </label>

                    {/* Mã dịch vụ */}
                    <label className="block">
                        <span className="text-gray-700 font-medium">Mã Dịch Vụ</span>
                        <input type="text" name="code" value={formData.code || ''} onChange={handleInputChange} placeholder="Tự động nếu để trống"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                    </label>

                    {/* Giá tiền */}
                    <label className="block">
                        <span className="text-gray-700 font-medium">Giá Tiền (VNĐ) <span className="text-red-500">*</span></span>
                        <input type="number" name="price" value={formData.price || ''} onChange={handleInputChange} required min="0"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                    </label>

                    {/* Trạng thái */}
                    <label className="block col-span-2">
                        <span className="text-gray-700 font-medium">Trạng Thái</span>
                        <select name="status" value={formData.status || 'active'} onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border">
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Tạm ẩn</option>
                        </select>
                    </label>

                    {/* Mô tả */}
                    <label className="block col-span-2">
                        <span className="text-gray-700 font-medium">Mô Tả</span>
                        <textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"></textarea>
                    </label>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">Hủy</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">Lưu</button>
                </div>
            </form>
        </Modal>
    );
};

export default ServiceFormModal;