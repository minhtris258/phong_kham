// src/components/admin/appointment/AppointmentDayModal.jsx
import React from "react";
import Modal from "../Modal";
import { Plus } from "lucide-react";

const AppointmentDayModal = ({
  isOpen,
  onClose,
  date,
  dayAppointments,
  getDoctorName,
  getPatientName,
  getStatusStyle,
  handleAddEdit,
  confirmDelete,
}) => {
  const formattedDate = date ? date.split("-").reverse().join("/") : "";
  const apps = dayAppointments || [];

  return (
    <Modal
      title={`Lịch Hẹn Ngày ${formattedDate}`}
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          Tổng cộng: {apps.length} lịch hẹn
        </h3>
        <button
          onClick={() => {
            handleAddEdit(null);
            onClose(); // Đóng modal ngày và mở modal form
          }}
          className="flex items-center bg-sky-500 text-white px-3 py-2 text-sm rounded-xl font-semibold shadow-md hover:bg-sky-700 transition"
        >
          <Plus className="w-5 h-5 mr-1" /> Thêm Lịch Hẹn
        </button>
      </div>

      <div className="overflow-y-auto max-h-[70vh]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                Bệnh Nhân
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                Bác Sĩ
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                Thời Gian
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                Trạng Thái
              </th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">
                Hành Động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {apps.length > 0 ? (
              apps
                .sort((a, b) => a.start.localeCompare(b.start))
                .map((app) => (
                  <tr key={app.id} className="hover:bg-sky-50/50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {app.patient_id?.name ||
                        app.patient_id?.fullName ||
                        "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {app.doctor_id?.fullName || app.doctor_id?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {app.start}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 inline-flex text-xs font-bold rounded-full ${getStatusStyle(
                          app.status
                        )}`}
                      >
                        {app.status.charAt(0).toUpperCase() +
                          app.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium flex justify-end items-center">
                      <button
                        onClick={() => {
                          handleAddEdit(app);
                          onClose();
                        }}
                        className="text-sky-600 hover:text-sky-900 p-1 rounded-full"
                        title="Sửa"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => confirmDelete(app._id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full ml-1"
                        title="Xóa"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                  Không có lịch hẹn nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

export default AppointmentDayModal;
