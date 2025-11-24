// src/components/admin/specialty/SpecialtyFormModal.jsx
import React from 'react';
import Modal from '../Modal'; 

// Thêm prop: handleFileChange
const SpecialtyFormModal = ({ isOpen, onClose, formData, handleInputChange, handleFileChange, handleSave, editingSpecialty }) => {
    return (
        <Modal 
            title={editingSpecialty ? 'Chỉnh Sửa Chuyên Khoa' : 'Thêm Chuyên Khoa Mới'} 
            isOpen={isOpen} 
            onClose={onClose}
        >
            <form onSubmit={handleSave}>
                <div className="space-y-4">
                    {/* Input Tên */}
                    <label className="block">
                        <span className="text-gray-700 font-medium">Tên Chuyên Khoa:</span>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name || ''} 
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border"
                            required
                        />
                    </label>

                    {/* Input Ảnh */}
                    <label className="block">
                        <span className="text-gray-700 font-medium">Hình ảnh (Thumbnail):</span>
                        
                        <div className="mt-2 flex items-center space-x-4">
                            {/* Hiển thị Preview Ảnh */}
                            <div className="w-20 h-20 border border-gray-300 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                                {formData.thumbnail ? (
                                    <img 
                                        src={formData.thumbnail} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <span className="text-gray-400 text-xs text-center px-1">Chưa có ảnh</span>
                                )}
                            </div>

                            {/* Nút chọn file */}
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
                            />
                        </div>
                    </label>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                    >
                        Hủy
                    </button>
                    <button 
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                    >
                        Lưu
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default SpecialtyFormModal;