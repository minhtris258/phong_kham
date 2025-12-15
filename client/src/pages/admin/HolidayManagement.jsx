import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  X,
  Check,
  ChevronLeft,
  ChevronRight, // Thêm icon cho nút phân trang
} from "lucide-react";
import holidayService from "../../services/HolidayService";
import { toastSuccess, toastError } from "../../utils/toast";

const HolidayManagement = () => {
  // --- State ---
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Số lượng item trên mỗi trang (bạn có thể đổi thành 10)

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    isMandatoryDayOff: true,
  });

  // --- Fetch Data ---
  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await holidayService.getAllHolidays();
      setHolidays(Array.isArray(res) ? res : res.data || []);
      // Reset về trang 1 khi load lại dữ liệu để tránh lỗi đang ở trang trống
      setCurrentPage(1);
    } catch (error) {
      console.error("Lỗi tải ngày lễ:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHolidays = holidays.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(holidays.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openModal = (holiday = null) => {
    if (holiday) {
      const dateStr = new Date(holiday.date).toISOString().split("T")[0];
      setFormData({
        name: holiday.name,
        date: dateStr,
        isMandatoryDayOff: holiday.isMandatoryDayOff,
      });
      setEditingItem(holiday);
    } else {
      setFormData({ name: "", date: "", isMandatoryDayOff: true });
      setEditingItem(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await holidayService.updateHoliday(
          editingItem._id || editingItem.id,
          formData
        );
        toastSuccess("Cập nhật ngày lễ thành công!");
      } else {
        await holidayService.createHoliday(formData);
        toastSuccess("Thêm ngày lễ thành công!");
      }
      setIsModalOpen(false);
      fetchHolidays();
    } catch (error) {
      toastError("Lỗi: " + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa ngày lễ này không?")) {
      try {
        await holidayService.deleteHoliday(id);
        // Sau khi xóa gọi lại fetch để cập nhật danh sách
        const res = await holidayService.getAllHolidays();
        const newHolidays = Array.isArray(res) ? res : res.data || [];
        setHolidays(newHolidays);

        // Logic kiểm tra nếu xóa hết item ở trang cuối thì lùi về trang trước
        const totalPagesAfterDelete = Math.ceil(
          newHolidays.length / itemsPerPage
        );
        if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
          setCurrentPage(totalPagesAfterDelete);
        }
      } catch (error) {
        toastError("Xóa thất bại: " + error.message);
      }
    }
  };

  // --- Helpers ---
  const formatDateVN = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // --- Render ---
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Quản Lý Lịch Nghỉ Lễ
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Cấu hình các ngày nghỉ lễ chung cho toàn hệ thống
            </p>
          </div>
          <button
            onClick={() => openModal(null)}
            className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition shadow-sm font-medium"
          >
            <Plus size={18} />
            Thêm Ngày Lễ
          </button>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Đang tải dữ liệu...
            </div>
          ) : holidays.length === 0 ? (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center">
              <Calendar size={48} className="mb-3 opacity-20" />
              <p>Chưa có ngày lễ nào được cấu hình.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">STT</th>{" "}
                      {/* Thêm cột STT để dễ theo dõi */}
                      <th className="px-6 py-4">Tên Ngày Lễ</th>
                      <th className="px-6 py-4">Ngày (DD/MM/YYYY)</th>
                      <th className="px-6 py-4 text-center">Loại Nghỉ</th>
                      <th className="px-6 py-4 text-right">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* Render currentHolidays thay vì holidays */}
                    {currentHolidays.map((holiday, index) => (
                      <tr
                        key={holiday._id || holiday.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {holiday.name}
                        </td>
                        <td className="px-6 py-4 text-sky-600 font-medium">
                          {formatDateVN(holiday.date)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {holiday.isMandatoryDayOff ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                              Bắt buộc nghỉ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              Vẫn làm việc
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => openModal(holiday)}
                            className="p-2 text-sky-600 hover:bg-sky-50 rounded-md transition"
                            title="Chỉnh sửa"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(holiday._id || holiday.id)
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* --- PAGINATION CONTROLS --- */}
              {totalPages > 0 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
                  <div className="text-sm text-gray-500">
                    Hiển thị{" "}
                    <span className="font-medium text-gray-800">
                      {indexOfFirstItem + 1}
                    </span>{" "}
                    đến{" "}
                    <span className="font-medium text-gray-800">
                      {Math.min(indexOfLastItem, holidays.length)}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-medium text-gray-800">
                      {holidays.length}
                    </span>{" "}
                    kết quả
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg border transition ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-600 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 shadow-sm"
                      }`}
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {/* Render Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (number) => (
                          <button
                            key={number}
                            onClick={() => handlePageChange(number)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                              currentPage === number
                                ? "bg-sky-500 text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {number}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg border transition ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-600 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 shadow-sm"
                      }`}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            {/* ... (Phần Modal giữ nguyên như cũ) ... */}
            {/* Tôi đã rút gọn phần render modal ở đây để code không quá dài, 
                 bạn giữ nguyên phần modal trong code cũ của bạn nhé */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                {editingItem ? "Cập Nhật Ngày Lễ" : "Thêm Ngày Lễ Mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên ngày lễ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Tết Nguyên Đán"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition"
                  required
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  id="isMandatoryDayOff"
                  name="isMandatoryDayOff"
                  checked={formData.isMandatoryDayOff}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-sky-600 rounded border-gray-300 focus:ring-sky-500 cursor-pointer"
                />
                <label
                  htmlFor="isMandatoryDayOff"
                  className="text-sm text-gray-700 cursor-pointer select-none"
                >
                  <span className="font-semibold block">Nghỉ bắt buộc?</span>
                  <span className="text-xs text-gray-500">
                    Nếu chọn, hệ thống sẽ tự động đóng lịch khám của bác sĩ vào
                    ngày này.
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-sky-500 hover:bg-sky-700 rounded-lg font-medium shadow-md transition flex items-center gap-2"
                >
                  <Check size={18} />
                  {editingItem ? "Lưu Thay Đổi" : "Tạo Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidayManagement;
