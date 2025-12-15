import React, { useState, useEffect } from "react";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import Modal from "../../Modal";
import timeslotService from "../../../services/TimeslotService"; // Import service
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo,
} from "../../../utils/toast";
const AppointmentFormModal = ({
  isOpen,
  onClose,
  formData,
  handleInputChange,
  handleSave,
  editingAppointment,
  mockPatients,
  mockDoctors,
  checkAvailability,
}) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState(null);

  const isEditing = !!editingAppointment;

  // Kiểm tra xem có phải đang dời lịch không (Giờ mới khác giờ gốc)
  const isRescheduling =
    isEditing &&
    formData.start &&
    editingAppointment.start &&
    formData.start !== editingAppointment.start;

  const defaultPatientId = mockPatients[0]?._id;
  const defaultDoctorId = mockDoctors[0]?._id;

  // === 1. Gọi API lấy Slot rảnh khi chọn Ngày hoặc Bác sĩ ===
  useEffect(() => {
    const fetchSlots = async () => {
      const { doctor_id, date } = formData;

      // Nếu chưa chọn bác sĩ hoặc ngày thì reset
      if (!doctor_id || !date) {
        setAvailableSlots([]);
        return;
      }

      setIsLoadingSlots(true);
      setSlotError(null);

      try {
        // Gọi API lấy slot
        const res = await timeslotService.getSlotsByDate(doctor_id, date);

        // Xử lý dữ liệu trả về (tùy cấu trúc API của bạn: res.data hoặc res)
        let slots = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];

        // LOGIC QUAN TRỌNG KHI EDIT:
        // Nếu đang sửa lịch và ngày chọn trùng với ngày của lịch cũ
        // Cần "nhét" thêm slot hiện tại vào danh sách (vì slot này đang bị booked bởi chính nó)
        // Nếu không làm vậy, dropdown sẽ không hiện giờ hiện tại
        const originalDate = editingAppointment?.date
          ? String(editingAppointment.date).substring(0, 10)
          : "";

        if (isEditing && date === originalDate) {
          const currentSlot = {
            _id: editingAppointment.timeslot_id, // ID slot cũ
            start: editingAppointment.start,
            status: "current", // Đánh dấu để UI hiển thị khác biệt
          };

          // Chỉ thêm nếu chưa có trong list (tránh duplicate nếu API trả về cả booked)
          if (!slots.find((s) => s.start === currentSlot.start)) {
            slots = [currentSlot, ...slots];
          }
        }

        // Sắp xếp slot theo giờ tăng dần
        slots.sort((a, b) => a.start.localeCompare(b.start));

        setAvailableSlots(slots);
      } catch (error) {
        toastError(
          "Lỗi lấy lịch rảnh: " +
            (error.response?.data?.message || error.message)
        );
        setSlotError("Không thể tải lịch làm việc.");
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [formData.doctor_id, formData.date, isEditing, editingAppointment]);

  // === 2. Xử lý khi chọn Giờ (Slot) ===
  const handleSlotChange = (e) => {
    const selectedTime = e.target.value;

    // Tìm object slot tương ứng
    const selectedSlot = availableSlots.find(
      (slot) => slot.start === selectedTime
    );

    // Cập nhật giờ hiển thị (start)
    handleInputChange({
      target: { name: "start", value: selectedTime },
    });

    // QUAN TRỌNG: Cập nhật timeslot_id chuẩn từ DB
    if (selectedSlot) {
      handleInputChange({
        target: { name: "timeslot_id", value: selectedSlot._id },
      });
    }
  };

  // === 3. Submit ===
  const handleSaveAndCheck = (e) => {
    e.preventDefault();

    // Validate
    if (!formData.patient_id || !formData.date || !formData.timeslot_id) {
      toastWarning(
        "Vui lòng chọn đầy đủ thông tin (Bệnh nhân, Ngày, Giờ khám)."
      );
      return;
    }

    // Gọi hàm save từ cha
    handleSave(formData);
  };

  return (
    <Modal
      title={
        isRescheduling
          ? "Xác Nhận Dời Lịch"
          : isEditing
          ? "Cập Nhật Thông Tin"
          : "Thêm Lịch Hẹn"
      }
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
    >
      <form onSubmit={handleSaveAndCheck}>
        <div className="space-y-5">
          {/* Thông báo Dời lịch */}
          {isRescheduling && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-700">
                <p className="font-bold">Bạn đang thay đổi giờ khám!</p>
                <p>
                  Lịch cũ: <b>{editingAppointment.start}</b> {"->"} Lịch mới:{" "}
                  <b>{formData.start}</b>
                </p>
              </div>
            </div>
          )}

          {/* Hàng 1: Bệnh nhân & Bác sĩ */}
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Bệnh Nhân
              </span>
              <select
                name="patient_id"
                value={formData.patient_id || defaultPatientId}
                onChange={handleInputChange}
                required
                disabled={isEditing} // Không cho đổi bệnh nhân khi sửa
                className={`mt-1 block w-full rounded-xl border-gray-300 shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 ${
                  isEditing ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
              >
                <option value="">-- Chọn bệnh nhân --</option>
                {mockPatients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.fullName || p.name} - {p.phone}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Bác Sĩ</span>
              <select
                name="doctor_id"
                value={formData.doctor_id || defaultDoctorId}
                onChange={handleInputChange}
                required
                disabled // Luôn disable vì bác sĩ chỉ đặt cho chính mình
                className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm p-3 bg-gray-100 cursor-not-allowed"
              >
                {mockDoctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.fullName || doctor.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Hàng 2: Ngày & Giờ (Slot) */}
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Ngày Hẹn
              </span>
              <input
                type="date"
                name="date"
                value={formData.date || ""}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Clock className="w-4 h-4" /> Giờ Hẹn
              </span>
              {isLoadingSlots ? (
                <div className="mt-1 p-3 text-sm text-gray-500 bg-gray-50 rounded-xl border animate-pulse flex items-center justify-center">
                  Loading...
                </div>
              ) : slotError ? (
                <div className="mt-1 p-3 text-sm text-red-500 bg-red-50 rounded-xl border border-red-200 text-center">
                  {slotError}
                </div>
              ) : (
                <select
                  name="start"
                  value={formData.start || ""}
                  onChange={handleSlotChange}
                  required
                  disabled={availableSlots.length === 0}
                  className={`mt-1 block w-full rounded-xl border-gray-300 shadow-sm p-3 ${
                    availableSlots.length === 0
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-white focus:ring-sky-500 focus:border-sky-500"
                  }`}
                >
                  <option value="">
                    {availableSlots.length === 0
                      ? "Hết lịch trống"
                      : "-- Chọn giờ --"}
                  </option>
                  {availableSlots.map((slot) => (
                    <option key={slot._id} value={slot.start}>
                      {slot.start}{" "}
                      {slot.status === "current" ? "(Hiện tại)" : ""}
                    </option>
                  ))}
                </select>
              )}
            </label>
          </div>

          {/* Trạng thái (Chỉ hiện khi Edit và không dời lịch) */}
          {isEditing && !isRescheduling && (
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Trạng Thái
              </span>
              <select
                name="status"
                value={formData.status || "pending"}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm p-3 bg-white focus:ring-sky-500"
              >
                <option value="pending">Đang chờ (Pending)</option>
                <option value="confirmed">Đã xác nhận (Confirmed)</option>
                <option value="completed">Đã hoàn thành (Completed)</option>
                {/* Hủy thì dùng nút Hủy riêng, không chọn ở đây để tránh nhầm lẫn */}
              </select>
            </label>
          )}

          {/* Lý do / Ghi chú */}
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              {isEditing ? "Ghi chú / Lý do:" : "Triệu chứng / Lý do khám:"}
            </span>
            <textarea
              name="reason"
              value={formData.reason || ""}
              onChange={handleInputChange}
              rows="3"
              placeholder={
                isRescheduling ? "Nhập lý do dời lịch..." : "Mô tả..."
              }
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 resize-none"
            ></textarea>
          </label>
        </div>

        <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            className={`px-6 py-2.5 text-white rounded-xl shadow-lg transition font-medium flex items-center gap-2 ${
              isRescheduling
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-sky-600 hover:bg-sky-700"
            }`}
          >
            {isRescheduling
              ? "Xác nhận Dời Lịch"
              : isEditing
              ? "Cập nhật"
              : "Tạo Lịch Hẹn"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentFormModal;
