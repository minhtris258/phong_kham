// src/components/admin/specialty/SpecialtyDoctorsModal.jsx
import React from "react";
import Modal from "../Modal";

const SpecialtyDoctorsModal = ({
  isOpen,
  onClose,
  currentSpecialtyDoctors,
  isLoading,
  doctorCount,
}) => {
  return (
    <Modal
      title={`Danh Sách Bác Sĩ Chuyên Khoa: ${currentSpecialtyDoctors.specialtyName}`}
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl"
    >
      {isLoading ? (
        <div className="text-center py-6 text-sky-600">
          Đang tải danh sách bác sĩ...
        </div>
      ) : currentSpecialtyDoctors.doctors.length > 0 ? (
        <div className="py-2 px-1 text-sm font-semibold text-gray-700 border-b border-gray-200">
          Tổng số bác sĩ: <span className="text-sky-600">{doctorCount}</span>
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 mt-4 border border-gray-100 rounded-lg">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên Bác Sĩ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phí Khám
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liên Hệ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentSpecialtyDoctors.doctors.map((doctor) => (
                  <tr key={doctor._id || doctor.id}>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {doctor.fullName}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {doctor.consultation_fee?.toLocaleString("vi-VN") || 0}{" "}
                      VNĐ
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {doctor.phone || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 py-4">
          Chuyên khoa này hiện chưa có bác sĩ nào được chỉ định.
        </p>
      )}
    </Modal>
  );
};

export default SpecialtyDoctorsModal;
