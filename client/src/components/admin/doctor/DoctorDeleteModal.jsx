import React from 'react';
import Modal from '../Modal'; // Đảm bảo đường dẫn đúng

const DoctorDeleteModal = ({ confirmDeleteId, setConfirmDeleteId, handleDelete }) => {
    return (
        <Modal
            title="Xác nhận Xóa Bác Sĩ"
            isOpen={!!confirmDeleteId}
            onClose={() => setConfirmDeleteId(null)}
            className="max-w-sm"
        >
            <p className="text-gray-700 mb-6">Bạn có chắc chắn muốn xóa bác sĩ này? Hành động này sẽ ảnh hưởng đến các lịch hẹn đã đặt.</p>
            <div className="flex justify-end space-x-3">
                <button 
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                    Hủy
                </button>
                <button 
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                    Xóa
                </button>
            </div>
        </Modal>
    );
};

export default DoctorDeleteModal;