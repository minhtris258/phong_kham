import React, { useMemo } from "react";
import { Plus, CalendarSync, CalendarX, ClipboardPen } from "lucide-react";

const AppointmentListTable = ({
  appointments,
  selectedDate,
  getStatusStyle,
  handleAddEdit,
  confirmCancel,
  handleOpenVisitModal,
}) => {
  const title = selectedDate
    ? `Lịch Hẹn Ngày ${selectedDate.split("-").reverse().join("/")}`
    : "Danh Sách Lịch Hẹn";

  // Helper hiển thị tên
  const getDisplay = (obj) => {
    if (!obj) return "Không rõ";
    if (typeof obj === "object") return obj.name || obj.fullName || "Không rõ";
    return obj; // Trường hợp chưa populate
  };

  // [QUAN TRỌNG] Sắp xếp lại danh sách để Realtime không làm nhảy lộn xộn
  const sortedAppointments = useMemo(() => {
    // Tạo bản sao để tránh mutate props
    return [...appointments].sort((a, b) => {
        // 1. Sắp theo ngày
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) return dateB - dateA; // Mới nhất lên đầu (theo ngày)
        
        // 2. Nếu cùng ngày thì sắp theo giờ (08:00 -> 09:00)
        return a.start.localeCompare(b.start);
    });
  }, [appointments]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {title} 
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {appointments.length}
            </span>
        </h3>
        <button
          onClick={() => handleAddEdit(null)}
          className="flex items-center bg-indigo-600 text-white px-4 py-2 text-sm rounded-xl font-semibold shadow-md hover:bg-indigo-700 transition transform hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-1" /> Thêm Lịch Hẹn
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Bệnh Nhân
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Thời Gian
              </th>
              <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Lý Do
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Trạng Thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Hành Động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAppointments.length > 0 ? (
              sortedAppointments.map((app) => (
                <tr
                  key={app._id || app.id}
                  className="hover:bg-indigo-50/50 transition duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex flex-col">
                        <span>{getDisplay(app.patient_id)}</span>
                        {/* Hiển thị SĐT nếu có (đã populate) */}
                        {app.patient_id?.phone && (
                            <span className="text-xs text-gray-500">{app.patient_id.phone}</span>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    <span className="text-indigo-600 font-bold">{app.start}</span>
                    <span className="text-gray-400 mx-1">|</span> 
                    {new Date(app.date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {app.reason || "Không rõ"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${getStatusStyle(
                        app.status
                      )}`}
                    >
                      {app.status === 'pending' ? 'Chờ xác nhận' : 
                       app.status === 'confirmed' ? 'Đã xác nhận' :
                       app.status === 'completed' ? 'Hoàn thành' :
                       app.status === 'cancelled' ? 'Đã hủy' : app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center gap-2">
                    {/* Các nút hành động */}
                    {["confirmed", "pending"].includes(app.status) && (
                      <button
                        onClick={() => handleOpenVisitModal(app)}
                        className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-100 transition mr-1"
                        title="Khám bệnh"
                      >
                        <ClipboardPen className="w-5 h-5" />
                      </button>
                    )}
                    
                    {app.status !== "cancelled" && app.status !== "completed" && (
                      <button
                        onClick={() => handleAddEdit(app)}
                        className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-100 transition"
                        title="Dời lịch / Cập nhật"
                      >
                        <CalendarSync className="w-5 h-5" />
                      </button>
                    )}

                    {app.status !== "cancelled" && app.status !== "completed" ? (
                      <button
                        onClick={() => confirmCancel(app._id || app.id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition"
                        title="Hủy lịch hẹn"
                      >
                        <CalendarX className="w-5 h-5" />
                      </button>
                    ) : (
                      <div className="w-9 h-9"></div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-10 text-center text-gray-500 font-medium bg-gray-50"
                >
                  Chưa có lịch hẹn nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentListTable;