// src/pages/admin/AppointmentManagement.jsx

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Calendar, Plus, List } from "lucide-react";

// Import components
import AppointmentCalendar from "../../components/admin/appointment/AppointmentCalendar";
import AppointmentListTable from "../../components/admin/appointment/AppointmentListTable";
import AppointmentFormModal from "../../components/admin/appointment/AppointmentFormModal";
import AppointmentDeleteModal from "../../components/admin/appointment/AppointmentDeleteModal";
import AppointmentDayModal from "../../components/admin/appointment/AppointmentDayModal"; // MODAL MỚI

// Mock Data
import {
  initialMockAppointments,
  initialMockPatients,
  initialMockDoctors,
  MOCK_IDS,
} from "../../mocks/mockdata";

const AppointmentManagement = () => {
  // === 1. State Dữ liệu và View Mode ===
  const [appointments, setAppointments] = useState(initialMockAppointments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  // KHẮC PHỤC LỖI: Khai báo viewMode và setViewMode
  const [viewMode, setViewMode] = useState("calendar"); // 'list' or 'calendar'

  const [selectedDayAppointments, setSelectedDayAppointments] = useState(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [currentDayDetails, setCurrentDayDetails] = useState({
    date: null,
    apps: [],
  });

  // === 2. Mappings & Helpers ===
  const patientMap = useMemo(
    () => new Map(initialMockPatients.map((p) => [p.id, p])),
    []
  );
  const doctorMap = useMemo(
    () => new Map(initialMockDoctors.map((d) => [d.id, d])),
    []
  );

  const getDoctorName = useCallback(
    (id) => doctorMap.get(id)?.fullName || `BS ID: ${id}`,
    [doctorMap]
  );
  const getPatientName = useCallback(
    (id) => patientMap.get(id)?.fullName || `BN ID: ${id}`,
    [patientMap]
  );

  const getStatusStyle = useCallback((status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  }, []);

  // === 3. CORE LOGIC: Kiểm tra Bác sĩ Rảnh/Bận ===
  const checkAvailability = useCallback(
    (doctorId, date, startTime, excludeAppId = null) => {
      const conflict = appointments.find(
        (app) =>
          app.doctor_id === doctorId &&
          app.date === date &&
          app.start === startTime &&
          app.status !== "cancelled" &&
          app.id !== excludeAppId
      );
      return !conflict;
    },
    [appointments]
  );
  const confirmDelete = (id) => {
    setConfirmDeleteId(id);
  };

  // === 4. HÀM XỬ LÝ SỰ KIỆN TỪ LỊCH (Mở Modal Ngày) ===
  const handleDateSelection = useCallback((dateString, selectedApps) => {
    setCurrentDayDetails({ date: dateString, apps: selectedApps });
    setIsDayModalOpen(true); // Mở modal ngay
    setViewMode("calendar"); // Giữ ở chế độ lịch
  }, []);

  // Hàm mới xử lý lọc lịch hẹn theo ngày cho chế độ LIST
  const handleListDateChange = useCallback(
    (e) => {
      const dateString = e.target.value;
      // Sử dụng appointments state để lọc
      const appsForDate = appointments.filter((app) => app.date === dateString);

      // Cập nhật state để hiển thị trong bảng
      setCurrentDayDetails({ date: dateString, apps: appsForDate });
    },
    [appointments]
  );

  // === 5. HÀM XỬ LÝ THÊM/SỬA LỊCH HẸN ===
  const handleAddEdit = useCallback(
    (appointment) => {
      setEditingAppointment(appointment);

      // 1. Lấy ngày mặc định (ưu tiên ngày đã chọn từ currentDayDetails nếu đang ở chế độ List)
      const defaultDate =
        currentDayDetails.date || new Date().toISOString().split("T")[0];
      const defaultDoctorId = initialMockDoctors[0]?.id;
      const defaultPatientId = initialMockPatients[0]?.id;

      setFormData(
        appointment
          ? { ...appointment, date: appointment.date || defaultDate }
          : {
              patient_id: defaultPatientId,
              doctor_id: defaultDoctorId,
              date: defaultDate,
              start: "09:00",
              status: "pending",
              reason: "",
            }
      );
      setIsModalOpen(true);
    },
    [currentDayDetails]
  );

  // === 6. HÀM XỬ LÝ LƯU (CRUD) ===
  const handleSave = (newFormData) => {
    const isEditing = !!editingAppointment;

    let updatedAppointments = [];
    if (isEditing) {
      updatedAppointments = appointments.map((app) =>
        app.id === editingAppointment.id ? { ...app, ...newFormData } : app
      );
    } else {
      const newApp = {
        ...newFormData,
        id: "mock-a-" + Math.random().toString(36).substring(7),
        created_at: new Date().toISOString(),
      };
      updatedAppointments = [...appointments, newApp];
    }

    setAppointments(updatedAppointments);
    setIsModalOpen(false);
    setEditingAppointment(null);

    // Cập nhật lại danh sách của ngày đang chọn trong currentDayDetails
    if (currentDayDetails.date === newFormData.date) {
      setCurrentDayDetails((prev) => ({
        ...prev,
        apps: updatedAppointments.filter(
          (app) => app.date === newFormData.date
        ),
      }));
    }
  };

  // === 7. HÀM XỬ LÝ XÓA ===
  const handleDelete = () => {
    const updatedAppointments = appointments.filter(
      (app) => app.id !== confirmDeleteId
    );
    setAppointments(updatedAppointments);
    setConfirmDeleteId(null);

    // Cập nhật lại danh sách của ngày đang chọn trong currentDayDetails
    if (currentDayDetails.apps.some((app) => app.id === confirmDeleteId)) {
      setCurrentDayDetails((prev) => ({
        ...prev,
        apps: updatedAppointments.filter((app) => app.date === prev.date),
      }));
    }
  };

  // === 8. Lọc danh sách hiển thị ===
  const displayAppointments = useMemo(() => {
    // Dùng cho chế độ List Mode khi chưa chọn ngày cụ thể
    return appointments.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.start.localeCompare(b.start);
    });
  }, [appointments]);

  // --- Hiển thị Loading/Error ---
  // (Giả định không cần loading/error trong phiên bản mock này)

  return (
    <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Quản Lý Lịch Hẹn
      </h2>

      {/* Thanh điều khiển */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2 p-1 bg-white rounded-xl shadow-md border border-gray-200">
          <button
            onClick={() => {
              setViewMode("calendar");
              setCurrentDayDetails({ date: null, apps: [] });
            }}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition ${
              viewMode === "calendar"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Calendar className="w-5 h-5 mr-2" /> Chế Độ Lịch
          </button>
          <button
            onClick={() => {
              setViewMode("list");
              setCurrentDayDetails({ date: null, apps: [] });
            }}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition ${
              viewMode === "list"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <List className="w-5 h-5 mr-2" /> Chế Độ Danh Sách
          </button>
        </div>

        <button
          onClick={() => handleAddEdit(null)}
          className="flex items-center bg-indigo-600 text-white px-4 py-2 text-sm rounded-xl font-semibold shadow-md hover:bg-indigo-700 transition transform hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-1" /> Thêm Lịch Hẹn Mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* === KHỐI 1: LỊCH (Luôn chiếm 3/3 khi ở chế độ lịch) === */}
        {viewMode === "calendar" && (
          <div className="lg:col-span-3">
            <AppointmentCalendar
              appointments={appointments}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              onSelectDate={handleDateSelection} // Mở Modal Ngày khi click
            />
          </div>
        )}

        {/* === KHỐI 2: CHẾ ĐỘ DANH SÁCH (Chiếm 3/3 khi ở chế độ danh sách) === */}
        {viewMode === "list" && (
          <div className="lg:col-span-3">
            {/* O CHỌN NGÀY */}
            <div className="mb-4 flex items-center space-x-3 bg-white p-4 rounded-xl shadow-md border">
              <label className="text-sm font-semibold text-gray-700">
                Lọc theo ngày:
              </label>
              <input
                type="date"
                onChange={handleListDateChange}
                className="rounded-md border-gray-300 shadow-sm p-2 w-48"
              />
            </div>
            <AppointmentListTable
              // Nếu currentDayDetails có dữ liệu (đã chọn ngày), dùng nó, ngược lại dùng toàn bộ danh sách
              appointments={
                currentDayDetails.date
                  ? currentDayDetails.apps
                  : displayAppointments
              }
              selectedDate={currentDayDetails.date}
              getDoctorName={getDoctorName}
              getPatientName={getPatientName}
              getStatusStyle={getStatusStyle}
              handleAddEdit={handleAddEdit}
              confirmDelete={confirmDelete}
            />
          </div>
        )}
      </div>

      {/* MODAL MỚI: Modal Xem Lịch Hẹn Theo Ngày (khi click vào Lịch) */}
      <AppointmentDayModal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        date={currentDayDetails.date}
        dayAppointments={currentDayDetails.apps}
        getDoctorName={getDoctorName}
        getPatientName={getPatientName}
        getStatusStyle={getStatusStyle}
        handleAddEdit={handleAddEdit}
        confirmDelete={confirmDelete}
      />

      {/* Modal Thêm/Sửa Lịch Hẹn */}
      {isModalOpen && (
        <AppointmentFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          formData={formData}
          handleInputChange={(e) =>
            setFormData({ ...formData, [e.target.name]: e.target.value })
          }
          handleSave={handleSave}
          editingAppointment={editingAppointment}
          mockPatients={initialMockPatients}
          mockDoctors={initialMockDoctors}
          getDoctorName={getDoctorName}
          checkAvailability={checkAvailability}
        />
      )}

      {/* Modal Xác nhận Xóa */}
      {confirmDeleteId && (
        <AppointmentDeleteModal
          confirmDeleteId={confirmDeleteId}
          onClose={() => setConfirmDeleteId(null)}
          handleDelete={handleDelete}
        />
      )}
    </main>
  );
};

export default AppointmentManagement;
