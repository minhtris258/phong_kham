// src/pages/doctor/DoctorAppointment.jsx
import React, { useState, useCallback, useEffect } from "react";
import {
  Plus,
  Loader2,
  Calendar as CalendarIcon,
  List as ListIcon,
} from "lucide-react";
import { toastSuccess, toastError, toastWarning } from "../../utils/toast";

// Context
import { useSocket } from "../../context/SocketContext";

// Services
import appointmentsService from "../../services/AppointmentsService.js";
import doctorService from "../../services/DoctorService.js";

// Components
import AppointmentCalendar from "../../components/doctor/appointment/AppointmentCalendar";
import AppointmentListTable from "../../components/doctor/appointment/AppointmentListTable";
import AppointmentFormModal from "../../components/doctor/appointment/AppointmentFormModal";
import AppointmentDeleteModal from "../../components/doctor/appointment/AppointmentDeleteModal";
import AppointmentDayModal from "../../components/doctor/appointment/AppointmentDayModal";
import VisitCreateModal from "../../components/doctor/visit/VisitCreateModal";

const DoctorAppointment = () => {
  // === STATE QUẢN LÝ DỮ LIỆU ===
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDoctor, setCurrentDoctor] = useState(null);

  // === STATE GIAO DIỆN & MODAL ===
  const [viewMode, setViewMode] = useState("calendar"); // 'calendar' | 'list'
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  // Data for Modals
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [selectedAppointmentForVisit, setSelectedAppointmentForVisit] =
    useState(null);
  const [currentDayDetails, setCurrentDayDetails] = useState({
    date: null,
    apps: [],
  });
  const [formData, setFormData] = useState({});

  // Socket
  const { socket, isConnected } = useSocket();

  // === 1. FETCH DỮ LIỆU ===
  const fetchData = async () => {
    try {
      // 1. Lấy thông tin bác sĩ (nếu chưa có)
      let me = currentDoctor;
      if (!me) {
        const meRes = await doctorService.getMe();
        me = meRes.profile || meRes;
        setCurrentDoctor(me);
        setDoctors([me]);
      }

      // 2. Lấy danh sách lịch hẹn (Lấy hết để Client tự filter/sort)
      const apptRes = await appointmentsService.getDoctorAppointments({
        limit: 2000,
      });
      const apptData = apptRes.data?.data || apptRes.data || [];
      setAppointments(apptData);

      // 3. Trích xuất danh sách bệnh nhân từ lịch hẹn để làm cache
      const uniquePatients = new Map();
      apptData.forEach((app) => {
        if (app.patient_id && typeof app.patient_id === "object") {
          uniquePatients.set(app.patient_id._id, app.patient_id);
        }
      });
      setPatients(Array.from(uniquePatients.values()));
    } catch (error) {
      toastError("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === 2. REALTIME SOCKET ===
  useEffect(() => {
    if (!socket || !isConnected || !currentDoctor) return;

    socket.emit("join_room", currentDoctor.user_id);
    console.log("🔥 Socket joined room:", currentDoctor.user_id);

    const handleNewAppointment = (newAppt) => {
      if (newAppt.doctor_id === currentDoctor._id) {
        toastSuccess(`📅 Có lịch hẹn mới lúc ${newAppt.start}`);
        setAppointments((prev) => [newAppt, ...prev]);

        // Cập nhật cache bệnh nhân nếu mới
        if (newAppt.patient_id && typeof newAppt.patient_id === "object") {
          setPatients((prev) => {
            const exists = prev.find((p) => p._id === newAppt.patient_id._id);
            return exists ? prev : [...prev, newAppt.patient_id];
          });
        }
      }
    };

    const handleAppointmentCancelled = (data) => {
      setAppointments((prev) =>
        prev.map((app) =>
          app._id === data.appointmentId ? { ...app, status: "cancelled" } : app
        )
      );
      if (data.doctor_id === currentDoctor._id) {
        toastWarning("⚠️ Một lịch hẹn vừa bị hủy.");
      }
    };

    const handleAppointmentUpdated = (updatedAppt) => {
      if (updatedAppt.doctor_id === currentDoctor._id) {
        setAppointments((prev) =>
          prev.map((app) =>
            app._id === updatedAppt._id ? { ...app, ...updatedAppt } : app
          )
        );
      }
    };

    socket.on("new_appointment", handleNewAppointment);
    socket.on("appointment_cancelled", handleAppointmentCancelled);
    socket.on("appointment_updated", handleAppointmentUpdated);

    return () => {
      socket.off("new_appointment", handleNewAppointment);
      socket.off("appointment_cancelled", handleAppointmentCancelled);
      socket.off("appointment_updated", handleAppointmentUpdated);
    };
  }, [socket, isConnected, currentDoctor]);

  // === 3. HELPERS ===
  // Sync data cho Modal Ngày (Khi appointments thay đổi -> Modal cập nhật theo)
  useEffect(() => {
    if (currentDayDetails.date) {
      const updatedApps = appointments.filter(
        (app) =>
          app.date &&
          String(app.date).substring(0, 10) === currentDayDetails.date
      );
      setCurrentDayDetails((prev) => ({ ...prev, apps: updatedApps }));
    }
  }, [appointments, currentDayDetails.date]);

  const getDoctorName = useCallback(
    () => currentDoctor?.fullName || "Tôi",
    [currentDoctor]
  );

  const getPatientName = useCallback(
    (patient) => {
      if (!patient) return "Khách vãng lai";
      if (typeof patient === "object")
        return patient.fullName || patient.name || "Không rõ";
      const found = patients.find((p) => p._id === patient);
      return found ? found.fullName || found.name : "Đang tải...";
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
      default:
        return "bg-yellow-100 text-yellow-800"; // pending
    }
  }, []);

  // === 4. HANDLERS (CRUD) ===
  const handleAddEdit = useCallback(
    (appointment) => {
      setEditingAppointment(appointment);
      const defaultDate =
        currentDayDetails.date || new Date().toISOString().split("T")[0];

      if (appointment) {
        // Edit Mode
        setFormData({
          _id: appointment._id,
          patient_id: appointment.patient_id?._id || appointment.patient_id,
          doctor_id: currentDoctor?._id,
          date: appointment.date
            ? String(appointment.date).substring(0, 10)
            : "",
          start: appointment.start,
          status: appointment.status,
          reason: appointment.reason,
          timeslot_id: appointment.timeslot_id,
          original_timeslot_id: appointment.timeslot_id,
        });
      } else {
        // Add Mode
        setFormData({
          patient_id: patients[0]?._id || "",
          doctor_id: currentDoctor?._id,
          date: defaultDate,
          start: "",
          status: "pending",
          reason: "",
          timeslot_id: "",
        });
      }
      setIsModalOpen(true);
    },
    [currentDayDetails, currentDoctor, patients]
  );

  const handleSave = async (submitData) => {
    try {
      const payload = { ...submitData, doctor_id: currentDoctor._id };

      if (editingAppointment) {
        // Nếu thay đổi slot (dời lịch)
        if (submitData.timeslot_id !== submitData.original_timeslot_id) {
          await appointmentsService.rescheduleAppointmentByDoctor(
            submitData._id,
            {
              new_timeslot_id: submitData.timeslot_id,
              reason: submitData.reason || "Bác sĩ dời lịch",
            }
          );
          toastSuccess("Đã dời lịch khám thành công!");
        } else {
          // Cập nhật thông tin thường
          await appointmentsService.updateAppointmentByDoctor(submitData._id, {
            status: submitData.status,
            note: submitData.reason,
          });
          toastSuccess("Cập nhật thông tin thành công!");
        }
      } else {
        // Tạo mới
        await appointmentsService.bookAppointment(payload);
        toastSuccess("Tạo lịch hẹn thành công!");
      }
      setIsModalOpen(false);
      fetchData(); // Reload lại dữ liệu sạch
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.error || error.message;
      toastError("Lỗi: " + errMsg);
    }
  };

  const confirmCancel = (id) => setConfirmCancelId(id);

  const handleCancel = async () => {
    try {
      await appointmentsService.cancelAppointmentByDoctor(confirmCancelId, {
        reason: "Bác sĩ hủy lịch",
      });
      // Optimistic UI Update
      setAppointments((prev) =>
        prev.map((app) =>
          app._id === confirmCancelId ? { ...app, status: "cancelled" } : app
        )
      );
      setConfirmCancelId(null);
      toastSuccess("Đã hủy lịch hẹn thành công!");
    } catch (error) {
      toastError(
        "Lỗi hủy lịch: " + (error.response?.data?.error || error.message)
      );
    }
  };

  const handleOpenVisitModal = (appointment) => {
    if (appointment.status === "completed") {
      toastSuccess("Lịch hẹn này đã hoàn thành khám.");
      return;
    }
    if (appointment.status === "cancelled") {
      toastError("Lịch hẹn đã bị hủy.");
      return;
    }
    setSelectedAppointmentForVisit(appointment);
    setIsVisitModalOpen(true);
  };

  // Handlers cho Calendar/List View
  const handleDateSelection = useCallback((dateString, selectedApps) => {
    setCurrentDayDetails({ date: dateString, apps: selectedApps });
    setIsDayModalOpen(true);
  }, []);

  const handleListDateChange = useCallback(
    (e) => {
      const dateString = e.target.value;
      // Nếu chọn ngày -> lọc, nếu xóa ngày -> hiện tất cả (dateString rỗng)
      if (!dateString) {
        setCurrentDayDetails({ date: null, apps: [] });
      } else {
        const appsForDate = appointments.filter(
          (app) => app.date && String(app.date).substring(0, 10) === dateString
        );
        setCurrentDayDetails({ date: dateString, apps: appsForDate });
      }
    },
    [appointments]
  );

  const checkAvailability = useCallback(
    (doctorId, date, startTime, excludeId) => {
      return !appointments.some(
        (app) =>
          app.date &&
          String(app.date).substring(0, 10) === date &&
          app.start === startTime &&
          app.status !== "cancelled" &&
          app._id !== excludeId
      );
    },
    [appointments]
  );

  // === RENDER ===
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-sky-600 animate-spin" />
      </div>
    );

  return (
    <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản Lý Lịch Hẹn</h2>
          <p className="text-gray-500 mt-1">
            Xem và quản lý danh sách bệnh nhân đặt khám
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex">
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "calendar"
                  ? "bg-sky-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <CalendarIcon className="w-4 h-4" /> Lịch
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "list"
                  ? "bg-sky-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <ListIcon className="w-4 h-4" /> Danh sách
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="min-h-[600px]">
        {viewMode === "calendar" ? (
          <div className="h-full">
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
            {/* Table Component */}
            <div className="flex-1">
              <AppointmentListTable
                appointments={
                  currentDayDetails.date ? currentDayDetails.apps : appointments
                }
                selectedDate={currentDayDetails.date}
                onDateChange={handleListDateChange}
                getDoctorName={getDoctorName}
                getPatientName={getPatientName}
                getStatusStyle={getStatusStyle}
                handleAddEdit={handleAddEdit}
                confirmCancel={confirmCancel}
                handleOpenVisitModal={handleOpenVisitModal}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Modals */}
      <AppointmentDayModal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        date={currentDayDetails.date}
        dayAppointments={currentDayDetails.apps}
        getDoctorName={getDoctorName}
        getPatientName={getPatientName}
        getStatusStyle={getStatusStyle}
        handleAddEdit={handleAddEdit}
        confirmCancel={confirmCancel}
        handleOpenVisitModal={handleOpenVisitModal}
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
          mockDoctors={currentDoctor ? [currentDoctor] : []}
          getDoctorName={getDoctorName}
          checkAvailability={checkAvailability}
        />
      )}

      <AppointmentDeleteModal
        confirmCancelId={confirmCancelId}
        setconfirmCancelId={setConfirmCancelId}
        handleCancel={handleCancel}
      />

      <VisitCreateModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        appointment={selectedAppointmentForVisit}
        onSuccess={() => fetchData()}
      />
    </main>
  );
};

export default DoctorAppointment;
