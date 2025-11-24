import React from "react";
import { Plus, Edit, Trash2, Eye, Calendar  } from "lucide-react";
import StatusBadge from "./StatusBadge";

// Thêm prop specialtyMap để hiển thị tên chuyên khoa (nếu chưa được populate)
const DoctorList = ({
  doctors,
  specialtyMap,
  handleAddEdit,
  handleViewDoctor,
  confirmDelete,
  handleManageSchedule,
}) => {
  const doctorsArray = Array.isArray(doctors) ? doctors : [];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Danh Sách Bác Sĩ
        </h3>
        <button
          onClick={() => handleAddEdit(null)}
          className="flex items-center bg-indigo-600 text-white px-3 py-2 text-sm rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5 mr-1" /> Thêm Bác Sĩ
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                STT
              </th>{" "}
              {/* THÊM STT */}
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ảnh
              </th>{" "}
              {/* THÊM CỘT ẢNH */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên Bác Sĩ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chuyên Khoa
              </th>
              <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phí Khám
              </th>
              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng Thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành Động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {doctorsArray.length > 0 ? (
              // Sử dụng index trong map để tạo STT
              doctorsArray.map((doc, index) => (
                <tr key={doc._id} className="hover:bg-gray-50">
                  {/* CỘT STT */}
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {index + 1}
                  </td>

                  {/* CỘT ẢNH */}
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                    {doc.thumbnail ? (
                      <img
                        src={doc.thumbnail}
                        alt={`Ảnh ${doc.fullName}`}
                        className="w-10 h-10 rounded-full object-cover mx-auto border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 mx-auto">
                        Ảnh
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {doc.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* Sử dụng specialty_id.name nếu đã populate, nếu không dùng specialtyMap */}
                    {doc.specialty_id?.name ||
                      specialtyMap?.get(doc.specialty_id) ||
                      "Chưa chọn"}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doc.consultation_fee?.toLocaleString("vi-VN")} VNĐ
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doc.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center gap-2">
                    <button
                      onClick={() => handleViewDoctor(doc)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleManageSchedule(doc)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition"
                      title="Quản lý Lịch"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAddEdit(doc)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(doc._id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  {" "}
                  {/* Tăng colSpan lên 8 */}
                  Không có dữ liệu bác sĩ.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorList;
