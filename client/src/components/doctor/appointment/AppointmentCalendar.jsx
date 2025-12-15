import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AppointmentCalendar = ({
  appointments,
  currentMonth,
  setCurrentMonth,
  onSelectDate,
  getPatientName, // <--- Nhận thêm prop này từ cha
}) => {
  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const [selectedDate, setSelectedDate] = useState(null);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Convert JS Sunday (0) to Vietnamese Sunday (6). Monday (1) stays (0).
    const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    return { startDayIndex, daysInMonth };
  };

  // Gom nhóm lịch hẹn theo ngày (YYYY-MM-DD)
  const appointmentsByDate = useMemo(() => {
    const map = {};
    appointments.forEach((app) => {
      if (!app.date) return;
      // Chuyển đổi ngày từ API (ISO) sang YYYY-MM-DD
      const dateStr = new Date(app.date).toISOString().split("T")[0];

      if (!map[dateStr]) {
        map[dateStr] = [];
      }
      map[dateStr].push(app);
    });
    return map;
  }, [appointments]);

  const { startDayIndex, daysInMonth } = getDaysInMonth(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
    setSelectedDate(null);
  };

  const handleDateClick = (day) => {
    // Tạo chuỗi YYYY-MM-DD chuẩn theo tháng hiện tại của lịch
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    const dateString = `${year}-${month}-${d}`;

    setSelectedDate(dateString);
    if (onSelectDate)
      onSelectDate(dateString, appointmentsByDate[dateString] || []);
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const hasAppointment = (day) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    const dateString = `${year}-${month}-${d}`;
    return !!appointmentsByDate[dateString];
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 mb-6 lg:mb-0 h-full">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-gray-800">
          Tháng {currentMonth.getMonth() + 1}/{currentMonth.getFullYear()}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-2 text-sky-600 font-bold">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Ô trống đầu tiên (padding) */}
        {Array.from({ length: startDayIndex }).map((_, index) => (
          <div key={`empty-${index}`} className="p-2 h-10"></div>
        ))}

        {/* Các ngày trong tháng */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const year = currentMonth.getFullYear();
          const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
          const d = String(day).padStart(2, "0");
          const dateString = `${year}-${month}-${d}`;

          const isBusy = hasAppointment(day);
          const todayClass = isToday(day)
            ? "ring-2 ring-sky-500 border-2 border-white"
            : "";
          const busyClass = isBusy
            ? "bg-sky-100 text-sky-700 font-semibold"
            : "text-gray-700 hover:bg-gray-50";
          const selectedClass =
            selectedDate === dateString
              ? "bg-sky-500 text-white hover:bg-sky-500"
              : "";

          return (
            <div
              key={day}
              className={`p-2 h-10 flex items-center justify-center rounded-lg cursor-pointer transition duration-150 relative ${busyClass} ${todayClass} ${selectedClass}`}
              onClick={() => handleDateClick(day)}
            >
              {day}
              {isBusy && selectedDate !== dateString && (
                <span className="absolute bottom-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </div>
          );
        })}
      </div>

      {/* Danh sách rút gọn bên dưới lịch */}
      {selectedDate && appointmentsByDate[selectedDate] && (
        <div className="mt-4 border-t pt-3">
          <h4 className="font-bold text-sm text-gray-700 mb-2">
            Lịch Hẹn Ngày {selectedDate.split("-").reverse().join("/")}:
          </h4>
          <ul className="space-y-1 max-h-24 overflow-y-auto">
            {appointmentsByDate[selectedDate].map((app) => (
              <li
                key={app._id || app.id}
                className="text-xs text-gray-600 bg-gray-50 p-1 rounded border border-gray-100 flex justify-between"
              >
                <span>
                  <span className="font-bold text-sky-600">{app.start}</span>:{" "}
                  {app.patient_id?.name || app.patient_id?.fullName || "N/A"}
                </span>
                <span
                  className={`px-1 rounded text-[10px] uppercase ${
                    app.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : app.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {app.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;
