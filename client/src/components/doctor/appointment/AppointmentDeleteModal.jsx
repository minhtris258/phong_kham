import React from 'react';
import Modal from '../../Modal'; // Đảm bảo đường dẫn đúng

const AppointmentDeleteModal = ({ confirmCancelId, setconfirmCancelId, handleCancel }) => {
    return (
        <Modal
            title="Xác nhận Xóa Lịch Hẹn"
            isOpen={!!confirmCancelId}
            onClose={() => setconfirmCancelId(null)}
            className="max-w-sm"
        >
            <p className="text-gray-700 mb-6">Bạn có chắc chắn muốn xóa lịch hẹn này? Hành động này sẽ không thể hoàn tác.</p>
            <div className="flex justify-end space-x-3">
                <button 
                    onClick={() => setconfirmCancelId(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                    Hủy
                </button>
                <button 
                    onClick={handleCancel}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                    Xóa
                </button>
            </div>
        </Modal>
    );
};

export default AppointmentDeleteModal;