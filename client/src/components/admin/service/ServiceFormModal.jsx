import React from 'react';
import Modal from '../../Modal';

const ServiceFormModal = ({ isOpen, onClose, formData, handleInputChange, handleFileChange, handleSave, editingService }) => {
    return (
        <Modal 
            title={editingService ? 'Cập Nhật Dịch Vụ' : 'Thêm Dịch Vụ Mới'} 
            isOpen={isOpen} 
            onClose={onClose}
        >
            <form onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* --- PHẦN ẢNH DỊCH VỤ --- */}
                    <div className="md:col-span-2">
                        <label className="block text-gray-700 font-medium mb-2">Hình ảnh dịch vụ:</label>
                        <div className="flex items-center space-x-4">
                            {/* Preview Ảnh */}
                            <div className="w-24 h-24 border border-gray-300 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center relative">
                                {formData.thumbnail ? (
                                    // Ưu tiên 1: Ảnh preview base64 (vừa chọn xong)
                                    <img src={formData.thumbnail} alt="New Preview" className="w-full h-full object-cover" />
                                ) : formData.image ? (
                                    // Ưu tiên 2: Ảnh cũ từ DB (nếu đang sửa)
                                    <img src={formData.image} alt="Current" className="w-full h-full object-cover" />
                                ) : (
                                    // Không có ảnh nào
                                    <span className="text-gray-400 text-xs text-center px-1">No Image</span>
                                )}
                            </div>

                            {/* Input File */}
                            <div className="flex-1">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileChange} // <--- QUAN TRỌNG: Hàm này phải chạy ở cha để set formData.thumbnail
                                    className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-indigo-50 file:text-sky-700
                                    hover:file:bg-indigo-100 cursor-pointer"
                                />
                                <p className="text-xs text-gray-400 mt-1">Hỗ trợ: JPG, PNG, JPEG</p>
                            </div>
                        </div>
                    </div>

                    {/* --- CÁC INPUT KHÁC --- */}
                    <label className="block md:col-span-2">
                        <span className="text-gray-700 font-medium">Tên Dịch Vụ <span className="text-red-500">*</span></span>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 p-2 border" />
                    </label>

                    <label className="block">
                        <span className="text-gray-700 font-medium">Mã Dịch Vụ</span>
                        <input type="text" name="code" value={formData.code || ''} onChange={handleInputChange} placeholder="Tự động"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 p-2 border" />
                    </label>

                    <label className="block">
                        <span className="text-gray-700 font-medium">Giá Tiền (VNĐ) <span className="text-red-500">*</span></span>
                        <input type="number" name="price" value={formData.price || ''} onChange={handleInputChange} required min="0"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 p-2 border" />
                    </label>

                    <label className="block md:col-span-2">
                        <span className="text-gray-700 font-medium">Trạng Thái</span>
                        <select name="status" value={formData.status || 'active'} onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 p-2 border">
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Tạm ẩn</option>
                        </select>
                    </label>

                    <label className="block md:col-span-2">
                        <span className="text-gray-700 font-medium">Mô Tả</span>
                        <textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 p-2 border"></textarea>
                    </label>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">Hủy</button>
                    <button type="submit" className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-700 font-semibold">Lưu</button>
                </div>
            </form>
        </Modal>
    );
};

export default ServiceFormModal;