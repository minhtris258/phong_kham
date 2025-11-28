// src/pages/admin/AppointmentManagement.jsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Calendar, List, Plus } from "lucide-react"; // Import icon còn thiếu
import { toastSuccess, toastError,toastWarning } from "../../utils/toast";
// Import components
import AppointmentCalendar from "../../components/admin/appointment/AppointmentCalendar";
import AppointmentListTable from "../../components/admin/appointment/AppointmentListTable";
import AppointmentFormModal from "../../components/admin/appointment/AppointmentFormModal";
import AppointmentDeleteModal from "../../components/admin/appointment/AppointmentDeleteModal";
import AppointmentDayModal from "../../components/admin/appointment/AppointmentDayModal";

// Services
import appointmentsService from "../../services/AppointmentsService";
import doctorService from "../../services/DoctorService"; // Cần tạo/import service này
import patientService from "../../services/PatientService";     // Cần tạo/import service này để lấy patients

const AppointmentManagement = () => {
  // === 1. State Dữ liệu ===
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View Mode & Modals
  const [viewMode, setViewMode] = useState("calendar");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({});
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentDayDetails, setCurrentDayDetails] = useState({ date: null, apps: [] });

  // === 2. Fetch API ===
  const fetchData = async () => {
    setLoading(true);
    try {
      // Gọi song song các API cần thiết
      const [apptRes, docRes, patRes] = await Promise.all([
        appointmentsService.getAppointments({ limit: 1000 }), // Lấy nhiều để hiện lịch
        doctorService.getAllDoctors(),
        patientService.getAllPatients() // Hoặc getAllUsers({ role: 'patient' })
      ]);
console.log("API Patients Response:", patRes.data);
      setAppointments(apptRes.data?.data || []); // Chú ý cấu trúc trả về của API
      setDoctors(docRes.data?.doctors || []);
      setPatients(patRes.data?.patients || []); // Giả sử API trả về list users
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      toastError("Không thể tải dữ liệu lịch hẹn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Chạy 1 lần khi mount

  // === 3. Mappings & Helpers ===
  // Tạo Map để tra cứu tên nhanh hơn
  const patientMap = useMemo(() => new Map(patients.map((p) => [p._id, p])), [patients]);
  const doctorMap = useMemo(() => new Map(doctors.map((d) => [d._id, d])), [doctors]);

  const getDoctorName = useCallback((doctor) => {
    if (!doctor) return "Không rõ";
    // Nếu đã populate (là object) -> lấy fullName
    if (typeof doctor === 'object') return doctor.fullName || doctor.name || "Không rõ";
    
    // Nếu chưa populate (là ID string) -> tìm trong danh sách doctors đã tải
    const found = doctors.find(d => d._id === doctor);
    return found ? found.fullName : `ID: ${doctor}`;
}, [doctors]);

// Hàm lấy tên Bệnh nhân an toàn
const getPatientName = useCallback((patient) => {
    if (!patient) return "Không rõ";
    // Nếu đã populate (là object) -> lấy name
    if (typeof patient === 'object') return patient.name || patient.fullName || "Không rõ";

    // Nếu chưa populate (là ID string) -> tìm trong danh sách patients đã tải
    const found = patients.find(p => p._id === patient);
    return found ? (found.name || found.fullName) : `ID: ${patient}`;
}, [patients]);

  const getStatusStyle = useCallback((status) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "pending": default: return "bg-yellow-100 text-yellow-800";
    }
  }, []);

  // === 4. Handlers ===
  
  // Mở Modal Thêm/Sửa
  const handleAddEdit = useCallback((appointment) => {
    setEditingAppointment(appointment);
    // Ngày mặc định: ngày đang chọn hoặc hôm nay
    const defaultDate = currentDayDetails.date || new Date().toISOString().split("T")[0];
    const defaultDoctorId = doctors[0]?._id;
    const defaultPatientId = patients[0]?._id;

    if (appointment) {
      // Edit Mode
      setFormData({
        _id: appointment._id,
        patient_id: appointment.patient_id?._id || appointment.patient_id, // Xử lý nếu populate object
        doctor_id: appointment.doctor_id?._id || appointment.doctor_id,
        date: appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : '',
        start: appointment.start,
        status: appointment.status,
        reason: appointment.reason,
      });
    } else {
      // Add Mode
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
  }, [currentDayDetails, doctors, patients]);

  // Lưu (Create/Update)
  const handleSave = async (submitData) => {
    try {
      if (editingAppointment) {
        await appointmentsService.updateAppointment(editingAppointment._id, submitData);
        toastSuccess("Cập nhật thành công!");
      } else {
        // Lưu ý: API tạo lịch hẹn cho Admin có thể khác API book của Patient
        // Nếu chưa có API admin create, bạn có thể dùng tạm bookAppointment hoặc viết thêm
        await appointmentsService.bookAppointment(submitData); // Cần check quyền admin ở backend
        toastSuccess("Tạo lịch hẹn thành công!");
      }
      setIsModalOpen(false);
      fetchData(); // Refresh lại dữ liệu
    } catch (error) {
      console.error(error);
      toastError("Lỗi lưu dữ liệu: " + (error.response?.data?.error || error.message));
    }
  };

  // Xóa
  const confirmDelete = (id) => setConfirmDeleteId(id);
  
  const handleDelete = async () => {
    try {
      await appointmentsService.deleteAppointment(confirmDeleteId);
      setAppointments(prev => prev.filter(app => app._id !== confirmDeleteId));
      if (isDayModalOpen) {
          setCurrentDayDetails(prev => ({
              ...prev,
              apps: prev.apps.filter(app => app._id !== confirmDeleteId)
          }));
      }
       setConfirmDeleteId(null);
      toastSuccess("Xóa thành công!");
     
      fetchData();
    } catch (error) {
      toastError("Lỗi xóa: " + error.message);
    }
  };

  // Chọn ngày trên lịch -> Mở Modal Ngày
  const handleDateSelection = useCallback((dateString, selectedApps) => {
    setCurrentDayDetails({ date: dateString, apps: selectedApps });
    setIsDayModalOpen(true);
  }, []);

  // Chọn ngày ở chế độ List
  const handleListDateChange = useCallback((e) => {
    const dateString = e.target.value;
    // Lọc client-side từ danh sách đã tải (hoặc gọi API getAppointments({date: ...}))
    const appsForDate = appointments.filter((app) => 
       app.date && new Date(app.date).toISOString().split('T')[0] === dateString
    );
    setCurrentDayDetails({ date: dateString, apps: appsForDate });
  }, [appointments]);

  // Check xung đột (Logic client-side tạm thời để UX tốt hơn)
  const checkAvailability = useCallback((doctorId, date, startTime, excludeId) => {
    return !appointments.some(app => 
      app.doctor_id === doctorId &&
      // So sánh ngày (cần format chuẩn)
      new Date(app.date).toISOString().split('T')[0] === date &&
      app.start === startTime &&
      app.status !== "cancelled" &&
      app._id !== excludeId
    );
  }, [appointments]);

  // Danh sách hiển thị cho Table
  const displayAppointments = useMemo(() => {
    return appointments; 
  }, [appointments]);

  // === Render ===
  if (loading && appointments.length === 0) 
      return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

  return (
    <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Quản Lý Lịch Hẹn</h2>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2 bg-white p-1 rounded-xl shadow border">
          <button onClick={() => setViewMode("calendar")} className={`px-4 py-2 rounded-lg ${viewMode === 'calendar' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>Lịch</button>
          <button onClick={() => setViewMode("list")} className={`px-4 py-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>Danh sách</button>
        </div>
        <button onClick={() => handleAddEdit(null)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700">
          <Plus size={20} /> Thêm Lịch Hẹn
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {viewMode === "calendar" ? (
          <div className="lg:col-span-3">
            <AppointmentCalendar
              appointments={appointments}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              onSelectDate={handleDateSelection}
            />
          </div>
        ) : (
          <div className="lg:col-span-3">
             <div className="mb-4 bg-white p-4 rounded-xl shadow border">
                Lọc ngày: <input type="date" onChange={handleListDateChange} className="border p-2 rounded ml-2"/>
             </div>
             <AppointmentListTable
               appointments={currentDayDetails.date ? currentDayDetails.apps : displayAppointments}
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
         handleInputChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
          handleSave={handleSave}
          editingAppointment={editingAppointment}
          mockPatients={patients} // Truyền list patients thật
          mockDoctors={doctors}   // Truyền list doctors thật
          getDoctorName={getDoctorName}
          checkAvailability={checkAvailability}
        />
      )}

      <AppointmentDeleteModal
        confirmDeleteId={confirmDeleteId}
        setConfirmDeleteId={setConfirmDeleteId} // Chú ý prop name
        handleDelete={handleDelete}
      />
    </main>
  );
};

export default AppointmentManagement;