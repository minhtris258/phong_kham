import React from "react";
import { Plus, Edit, Trash2, Eye, KeyRound } from "lucide-react";

// Helper
const getGenderVietnamese = (gender) => {
  switch (gender) {
    case "male":
      return "Nam";
    case "female":
      return "Nữ";
    case "other":
      return "Khác";
    default:
      return "N/A";
  }
};

const getProfileStatusStyle = (isCompleted) => {
  return isCompleted ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800";
};

const PatientList = ({
  patients,
  handleAddEdit,
  handleViewPatient,
  confirmDelete,
  handleChangePassword,
}) => {
  const patientsArray = Array.isArray(patients) ? patients : [];

  // NOTE comment: dùng patient._id hoặc patient.id tùy dữ liệu

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Danh Sách Bệnh Nhân</h3>
        <button
          onClick={() => handleAddEdit(null)}
          className="flex items-center bg-indigo-600 text-white px-3 py-2 text-sm rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5 mr-1" /> Thêm Bệnh Nhân
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên Bệnh Nhân
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SĐT
              </th>
              <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giới Tính
              </th>
              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hồ Sơ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành Động
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {patientsArray.length > 0 ? (
              patientsArray.map((patient) => {
                const id = patient?._id ?? patient?.id ?? Math.random().toString(36).slice(2);
                const completed = Boolean(patient?.profile_completed);
                return (
                  <tr key={id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient?.fullName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient?.phone || "N/A"}
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getGenderVietnamese(patient?.gender)}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient?.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getProfileStatusStyle(
                          completed
                        )}`}
                      >
                        {completed ? "Hoàn thành" : "Chưa đủ"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center gap-2">
                      <button
                        onClick={() => handleViewPatient(patient)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleAddEdit(patient)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleChangePassword(patient)}
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded-full hover:bg-yellow-50 transition"
                        title="Đổi mật khẩu"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => confirmDelete(patient?._id ?? patient?.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Không có dữ liệu bệnh nhân.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientList;
