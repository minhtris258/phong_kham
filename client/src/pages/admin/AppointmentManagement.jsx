// src/pages/admin/AppointmentManagement.jsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Calendar, List, Plus, Loader2 } from "lucide-react";
import { toastSuccess, toastError, toastWarning } from "../../utils/toast";

// Import components
import AppointmentCalendar from "../../components/admin/appointment/AppointmentCalendar";
import AppointmentListTable from "../../components/admin/appointment/AppointmentListTable";
import AppointmentFormModal from "../../components/admin/appointment/AppointmentFormModal";
import AppointmentDeleteModal from "../../components/admin/appointment/AppointmentDeleteModal";
import AppointmentDayModal from "../../components/admin/appointment/AppointmentDayModal";

// Services
import appointmentsService from "../../services/AppointmentsService.js";
import doctorService from "../../services/DoctorService.js";
import patientService from "../../services/PatientService.js";

const AppointmentManagement = () => {
  // === 1. State Dữ liệu ===
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Bộ lọc (Filters)
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    date: "",
  });

  // View Mode & Modals
  const [viewMode, setViewMode] = useState("calendar");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({});

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentDayDetails, setCurrentDayDetails] = useState({
    date: null,
    apps: [],
  });

  // === 2. Fetch API ===
  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptRes, docRes, patRes] = await Promise.all([
        appointmentsService.getAppointments({ limit: 2000 }),

        // 👇 QUAN TRỌNG: Thêm { limit: 2000 } để lấy hết danh sách
        doctorService.getAllDoctors({ limit: 2000 }),

        // 👇 QUAN TRỌNG: Thêm { limit: 2000 } để lấy hết danh sách
        patientService.getAllPatients({ limit: 2000 }),
      ]);

      setAppointments(apptRes.data?.data || []);

      // Xử lý dữ liệu trả về (hỗ trợ cả dạng mảng và dạng phân trang)
      const docList = docRes.data?.doctors || docRes.data || [];
      const patList = patRes.data?.patients || patRes.data || [];

      setDoctors(docList);
      setPatients(patList);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      toastError("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === 3. Handlers Bộ lọc ===
  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleStatusChange = (e) => {
    setFilters((prev) => ({ ...prev, status: e.target.value }));
  };

  const handleListDateChange = (e) => {
    setFilters((prev) => ({ ...prev, date: e.target.value }));
  };

  // Logic lọc dữ liệu (Client-side)
  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      // Lọc theo Search (Tên BN hoặc BS)
      const patientName =
        app.patient_id?.name || app.patient_id?.fullName || "";
      const doctorName = app.doctor_id?.name || app.doctor_id?.fullName || "";
      const searchText = filters.search.toLowerCase();
      const matchSearch =
        patientName.toLowerCase().includes(searchText) ||
        doctorName.toLowerCase().includes(searchText);

      // Lọc theo Status
      const matchStatus = filters.status ? app.status === filters.status : true;

      // Lọc theo Date
      const appDate = app.date
        ? new Date(app.date).toISOString().split("T")[0]
        : "";
      const matchDate = filters.date ? appDate === filters.date : true;

      return matchSearch && matchStatus && matchDate;
    });
  }, [appointments, filters]);

  // === 4. Các Handlers khác (Create/Edit/Delete) ===
  // (Giữ nguyên các hàm handleAddEdit, handleSave, confirmDelete, handleDelete của bạn)
  const handleAddEdit = useCallback(
    (appointment) => {
      setEditingAppointment(appointment);
      const defaultDate =
        currentDayDetails.date || new Date().toISOString().split("T")[0];
      const defaultDoctorId = doctors[0]?._id;
      const defaultPatientId = patients[0]?._id;

      if (appointment) {
        setFormData({
          _id: appointment._id,
          patient_id: appointment.patient_id?._id || appointment.patient_id,
          doctor_id: appointment.doctor_id?._id || appointment.doctor_id,
          date: appointment.date
            ? new Date(appointment.date).toISOString().split("T")[0]
            : "",
          start: appointment.start,
          status: appointment.status,
          reason: appointment.reason,
        });
      } else {
        setFormData({
          patient_id: defaultPatientId,
          doctor_id: defaultDoctorId,
          date: defaultDate,
          start: "09:00",
          status: "pending",
          reason: "",
        });
      }
      setIsModalOpen(true);
    },
    [currentDayDetails, doctors, patients]
  );

  const handleSave = async (submitData) => {
    try {
      if (editingAppointment) {
        await appointmentsService.updateAppointment(
          editingAppointment._id,
          submitData
        );
        toastSuccess("Cập nhật thành công!");
      } else {
        await appointmentsService.bookAppointment(submitData);
        toastSuccess("Tạo lịch hẹn thành công!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toastError(
        "Lỗi lưu dữ liệu: " + (error.response?.data?.error || error.message)
      );
    }
  };

  const confirmDelete = (id) => setConfirmDeleteId(id);

  const handleDelete = async () => {
    try {
      await appointmentsService.deleteAppointment(confirmDeleteId);
      setAppointments((prev) =>
        prev.filter((app) => app._id !== confirmDeleteId)
      );
      if (isDayModalOpen) {
        setCurrentDayDetails((prev) => ({
          ...prev,
          apps: prev.apps.filter((app) => app._id !== confirmDeleteId),
        }));
      }
      setConfirmDeleteId(null);
      toastSuccess("Xóa thành công!");
      fetchData();
    } catch (error) {
      toastError("Lỗi xóa: " + error.message);
    }
  };

  const handleDateSelection = useCallback((dateString, selectedApps) => {
    setCurrentDayDetails({ date: dateString, apps: selectedApps });
    setIsDayModalOpen(true);
  }, []);

  // Helpers
  const getDoctorName = useCallback(
    (doctor) => {
      if (!doctor) return "Không rõ";
      if (typeof doctor === "object")
        return doctor.fullName || doctor.name || "Không rõ";
      const found = doctors.find((d) => d._id === doctor);
      return found ? found.fullName : `ID: ${doctor}`;
    },
    [doctors]
  );

  const getPatientName = useCallback(
    (patient) => {
      if (!patient) return "Không rõ";
      if (typeof patient === "object")
        return patient.name || patient.fullName || "Không rõ";
      const found = patients.find((p) => p._id === patient);
      return found ? found.name || found.fullName : `ID: ${patient}`;
    },
    [patients]
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

  // === Render ===
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-sky-600">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );

  return (
    <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Header & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản Lý Lịch Hẹn</h2>
          <p className="text-gray-500 mt-1">
            Xem và quản lý tất cả lịch hẹn của phòng khám
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === "calendar"
                  ? "bg-sky-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Calendar className="w-4 h-4 inline-block mr-2" />
              Lịch
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === "list"
                  ? "bg-sky-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <List className="w-4 h-4 inline-block mr-2" />
              Danh sách
            </button>
          </div>
          <button
            onClick={() => handleAddEdit(null)}
            className="bg-sky-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-sky-600 transition flex items-center gap-2"
          >
            <Plus size={20} />{" "}
            <span className="hidden sm:inline">Thêm Lịch</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {viewMode === "calendar" ? (
          <div className=" p-4shadow-sm h-full">
            <AppointmentCalendar
              appointments={appointments}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              onSelectDate={handleDateSelection}
              getPatientName={getPatientName}
            />
          </div>
        ) : (
          <div className="h-full">
            {/* Component Table Mới */}
            <AppointmentListTable
              appointments={filteredAppointments} // Dữ liệu đã lọc
              loading={loading}
              // Props Bộ lọc
              filters={filters}
              onSearchChange={handleSearchChange}
              onStatusChange={handleStatusChange}
              onDateChange={handleListDateChange}
              // Actions
              handleAddEdit={handleAddEdit}
              confirmDelete={confirmDelete}
            />
          </div>
        )}
      </div>

      {/* Modals */}
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

      {isModalOpen && (
        <AppointmentFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          formData={formData}
          handleInputChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              [e.target.name]: e.target.value,
            }))
          }
          handleSave={handleSave}
          editingAppointment={editingAppointment}
          mockPatients={patients}
          mockDoctors={doctors}
        />
      )}

      <AppointmentDeleteModal
        confirmDeleteId={confirmDeleteId}
        setConfirmDeleteId={setConfirmDeleteId}
        handleDelete={handleDelete}
      />
    </main>
  );
};

export default AppointmentManagement;
