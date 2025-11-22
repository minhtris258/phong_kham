// src/components/admin/specialty/SpecialtyFormModal.jsx
import React from 'react';
import Modal from '../Modal'; 

const SpecialtyFormModal = ({ isOpen, onClose, formData, handleInputChange, handleSave, editingSpecialty }) => {
    return (
        <Modal 
            title={editingSpecialty ? 'Chỉnh Sửa Chuyên Khoa' : 'Thêm Chuyên Khoa Mới'} 
            isOpen={isOpen} 
            onClose={onClose}
        >
            <form onSubmit={handleSave}>
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-gray-700">Tên Chuyên Khoa:</span>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name || ''} 
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border"
                            required
                        />
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