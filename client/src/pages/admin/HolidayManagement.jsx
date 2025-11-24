import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar, X, Check } from "lucide-react";
import holidayService from "../../services/HolidayService"; // Đảm bảo đường dẫn đúng

const HolidayManagement = () => {
  // --- State ---
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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
      // API của bạn trả về mảng trực tiếp hoặc res.data, tùy cấu hình axios
      setHolidays(Array.isArray(res) ? res : res.data || []);
    } catch (error) {
      console.error("Lỗi tải ngày lễ:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

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
      // Edit mode: Format date sang YYYY-MM-DD để hiển thị trong input type="date"
      const dateStr = new Date(holiday.date).toISOString().split("T")[0];
      setFormData({
        name: holiday.name,
        date: dateStr,
        isMandatoryDayOff: holiday.isMandatoryDayOff,
      });
      setEditingItem(holiday);
    } else {
      // Add mode
      setFormData({ name: "", date: "", isMandatoryDayOff: true });
      setEditingItem(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // Update
        await holidayService.updateHoliday(editingItem._id || editingItem.id, formData);
        alert("Cập nhật ngày lễ thành công!");
      } else {
        // Create
        await holidayService.createHoliday(formData);
        alert("Thêm ngày lễ thành công!");
      }
      setIsModalOpen(false);
      fetchHolidays(); // Refresh list
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa ngày lễ này không?")) {
      try {
        await holidayService.deleteHoliday(id);
        fetchHolidays();
      } catch (error) {
        alert("Xóa thất bại: " + error.message);
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
            <h1 className="text-2xl font-bold text-gray-800">Quản Lý Lịch Nghỉ Lễ</h1>
            <p className="text-sm text-gray-500 mt-1">Cấu hình các ngày nghỉ lễ chung cho toàn hệ thống</p>
          </div>
          <button
            onClick={() => openModal(null)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium"
          >
            <Plus size={18} />
            Thêm Ngày Lễ
          </button>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
          ) : holidays.length === 0 ? (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center">
              <Calendar size={48} className="mb-3 opacity-20" />
              <p>Chưa có ngày lễ nào được cấu hình.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Tên Ngày Lễ</th>
                    <th className="px-6 py-4">Ngày (DD/MM/YYYY)</th>
                    <th className="px-6 py-4 text-center">Loại Nghỉ</th>
                    <th className="px-6 py-4 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {holidays.map((holiday) => (
                    <tr key={holiday._id || holiday.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-800">{holiday.name}</td>
                      <td className="px-6 py-4 text-indigo-600 font-medium">
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
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(holiday._id || holiday.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
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
          )}
        </div>
      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            {/* Modal Header */}
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

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Input Name */}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              {/* Input Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  required
                />
              </div>

              {/* Checkbox Mandatory */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  id="isMandatoryDayOff"
                  name="isMandatoryDayOff"
                  checked={formData.isMandatoryDayOff}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="isMandatoryDayOff" className="text-sm text-gray-700 cursor-pointer select-none">
                  <span className="font-semibold block">Nghỉ bắt buộc?</span>
                  <span className="text-xs text-gray-500">
                    Nếu chọn, hệ thống sẽ tự động đóng lịch khám của bác sĩ vào ngày này.
                  </span>
                </label>
              </div>

              {/* Modal Footer */}
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
                  className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-md transition flex items-center gap-2"
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