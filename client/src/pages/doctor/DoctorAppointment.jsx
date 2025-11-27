import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Calendar, List, Plus, Loader2 } from "lucide-react"; 
import { toast } from "react-toastify"; 

// Components
import AppointmentCalendar from "../../components/doctor/appointment/AppointmentCalendar";
import AppointmentListTable from "../../components/doctor/appointment/AppointmentListTable";
import AppointmentFormModal from "../../components/doctor/appointment/AppointmentFormModal";
import AppointmentDeleteModal from "../../components/doctor/appointment/AppointmentDeleteModal"; // Tái sử dụng modal này cho việc Hủy
import AppointmentDayModal from "../../components/doctor/appointment/AppointmentDayModal";
import VisitCreateModal from "../../components/doctor/visit/VisitCreateModal";

// Services
import appointmentsService from "../../services/AppointmentsService";
import doctorService from "../../services/DoctorService";

const DoctorAppointment = () => {
  // === 1. State ===
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]); 
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDoctor, setCurrentDoctor] = useState(null);

  // View Mode & Modals
  const [viewMode, setViewMode] = useState("calendar");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [selectedAppointmentForVisit, setSelectedAppointmentForVisit] = useState(null);
  
  // Đổi tên state cho rõ nghĩa: cancelId thay vì deleteId
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentDayDetails, setCurrentDayDetails] = useState({ date: null, apps: [] });

  // === 2. Fetch API ===
  const fetchData = async () => {
    setLoading(true);
    try {
      // B1: Lấy thông tin bác sĩ
      const meRes = await doctorService.getMe();
      const me = meRes.profile || meRes;
      if (!me || !me._id) throw new Error("Không xác định được danh tính bác sĩ.");
      
      setCurrentDoctor(me);
      setDoctors([me]); 

      // B2: Lấy lịch hẹn
      const apptRes = await appointmentsService.getDoctorAppointments({ limit: 1000 });
      const apptData = apptRes.data?.data || apptRes.data || [];
      setAppointments(apptData);

      // B3: Trích xuất danh sách bệnh nhân
      const uniquePatients = new Map();
      apptData.forEach(app => {
          if (app.patient_id && typeof app.patient_id === 'object') {
              uniquePatients.set(app.patient_id._id, app.patient_id);
          }
      });
      setPatients(Array.from(uniquePatients.values()));

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      toast.error("Không thể tải dữ liệu. " + (error.message || ""));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === 3. Helpers ===
  const getDoctorName = useCallback(() => currentDoctor?.fullName || "Tôi", [currentDoctor]);

  const getPatientName = useCallback((patient) => {
    if (!patient) return "Khách vãng lai";
    if (typeof patient === 'object') return patient.fullName || patient.name || "Không rõ";
    const found = patients.find(p => p._id === patient);
    return found ? (found.fullName || found.name) : `ID: ${patient}`;
  }, [patients]);

  const getStatusStyle = useCallback((status) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  }, []);

  // === 4. Handlers ===
  const handleAddEdit = useCallback((appointment) => {
    setEditingAppointment(appointment);
    const defaultDate = currentDayDetails.date || new Date().toISOString().split("T")[0];
    const myId = currentDoctor?._id;

    if (appointment) {
      // Khi Edit: Lưu lại timeslot_id cũ để so sánh xem có dời lịch không
      setFormData({
        _id: appointment._id,
        patient_id: appointment.patient_id?._id || appointment.patient_id,
        doctor_id: myId,
        date: appointment.date ? String(appointment.date).substring(0, 10) : '',
        start: appointment.start,
        status: appointment.status,
        reason: appointment.reason,
        timeslot_id: appointment.timeslot_id, // ID slot hiện tại
        original_timeslot_id: appointment.timeslot_id // ID slot gốc (để so sánh)
      });
    } else {
      // Khi Add mới
      setFormData({
        patient_id: patients[0]?._id || "",
        doctor_id: myId,
        date: defaultDate,
        start: "", 
        status: "pending",
        reason: "",
        timeslot_id: ""
      });
    }
    setIsModalOpen(true);
  }, [currentDayDetails, currentDoctor, patients]);
const handleOpenVisitModal = (appointment) => {
    // Chỉ mở được khi lịch hẹn đã Confirm hoặc đang xử lý, chưa hoàn thành
    if (appointment.status === 'completed') {
        toast.info("Lịch hẹn này đã hoàn thành khám.");
        return;
    }
    if (appointment.status === 'cancelled') {
        toast.error("Lịch hẹn đã bị hủy.");
        return;
    }
    
    setSelectedAppointmentForVisit(appointment);
    setIsVisitModalOpen(true);
  };
  // --- LOGIC LƯU QUAN TRỌNG: PHÂN BIỆT BOOK / UPDATE / RESCHEDULE ---
  const handleSave = async (submitData) => {
    try {
      const payload = { ...submitData, doctor_id: currentDoctor._id };
      
      if (editingAppointment) {
        // LOGIC SỬA LỊCH
        
        // 1. Kiểm tra xem bác sĩ có thay đổi giờ khám (timeslot) không?
        if (submitData.timeslot_id !== submitData.original_timeslot_id) {
            // -> Gọi API DỜI LỊCH (Reschedule)
            await appointmentsService.rescheduleAppointmentByDoctor(submitData._id, {
                new_timeslot_id: submitData.timeslot_id,
                reason: submitData.reason || "Bác sĩ dời lịch"
            });
            toast.success("Đã dời lịch khám thành công!");
        } else {
            // -> Gọi API CẬP NHẬT THÔNG TIN (Update Note/Status)
            await appointmentsService.updateAppointmentByDoctor(submitData._id, {
                status: submitData.status,
                note: submitData.reason
            });
            toast.success("Cập nhật thông tin thành công!");
        }

      } else {
        // LOGIC TẠO MỚI (Book)
        await appointmentsService.bookAppointment(payload);
        toast.success("Tạo lịch hẹn thành công!");
      }
      
      setIsModalOpen(false);
      fetchData(); 
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.error || error.message;
      toast.error("Lỗi: " + errMsg);
    }
  };

  const confirmCancel = (id) => setConfirmCancelId(id);
  
  // --- LOGIC HỦY LỊCH (Thay thế cho Delete) ---
  const handleCancel = async () => {
    try {
      // Gọi API hủy lịch dành cho bác sĩ
      await appointmentsService.cancelAppointmentByDoctor(confirmCancelId, {
          reason: "Bác sĩ hủy lịch"
      });
      
      // Cập nhật state local để phản ánh thay đổi ngay lập tức
      setAppointments(prev => prev.map(app => 
          app._id === confirmCancelId ? { ...app, status: 'cancelled' } : app
      ));

      if (isDayModalOpen) {
          setCurrentDayDetails(prev => ({
              ...prev,
              apps: prev.apps.map(app => 
                  app._id === confirmCancelId ? { ...app, status: 'cancelled' } : app
              )
          }));
      }
      
      setConfirmCancelId(null);
      toast.success("Đã hủy lịch hẹn thành công!");
      // fetchData(); // Có thể gọi lại để đồng bộ full data nếu cần
    } catch (error) {
      toast.error("Lỗi hủy lịch: " + (error.response?.data?.error || error.message));
    }
  };

  // ... (Các handler hiển thị lịch giữ nguyên) ...
  const handleDateSelection = useCallback((dateString, selectedApps) => {
    setCurrentDayDetails({ date: dateString, apps: selectedApps });
    setIsDayModalOpen(true);
  }, []);

  const handleListDateChange = useCallback((e) => {
    const dateString = e.target.value;
    const appsForDate = appointments.filter((app) => 
       app.date && String(app.date).substring(0, 10) === dateString
    );
    setCurrentDayDetails({ date: dateString, apps: appsForDate });
  }, [appointments]);

  const checkAvailability = useCallback((doctorId, date, startTime, excludeId) => {
    return !appointments.some(app => 
      app.date && String(app.date).substring(0, 10) === date &&
      app.start === startTime &&
      app.status !== "cancelled" &&
      app._id !== excludeId
    );
  }, [appointments]);

  // === Render ===
  if (loading) 
      return <div className="flex justify-center items-center h-screen text-blue-600"><Loader2 className="w-10 h-10 animate-spin" /></div>;

  return (
    <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Quản Lý Lịch Hẹn Của Tôi</h2>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2 bg-white p-1 rounded-xl shadow border">
          <button onClick={() => setViewMode("calendar")} className={`px-4 py-2 rounded-lg transition ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Lịch</button>
          <button onClick={() => setViewMode("list")} className={`px-4 py-2 rounded-lg transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Danh sách</button>
        </div>
        <button onClick={() => handleAddEdit(null)} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-md transition">
          <Plus size={20} /> Thêm Lịch Hẹn
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {viewMode === "calendar" ? (
          <div className="bg-white p-4 rounded-2xl shadow-sm border">
            <AppointmentCalendar
              appointments={appointments}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              onSelectDate={handleDateSelection}
              getPatientName={getPatientName}
            />
          </div>
        ) : (
          <div className="bg-white p-4 rounded-2xl shadow-sm border">
             <div className="mb-4 flex items-center gap-2">
                <span className="text-gray-700 font-medium">Lọc theo ngày:</span>
                <input type="date" onChange={handleListDateChange} className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
             </div>
             <AppointmentListTable
               appointments={currentDayDetails.date ? currentDayDetails.apps : appointments}
               selectedDate={currentDayDetails.date}
               getDoctorName={getDoctorName}
               getPatientName={getPatientName}
               getStatusStyle={getStatusStyle}
               handleAddEdit={handleAddEdit}
               confirmCancel={confirmCancel} // Truyền hàm HỦY thay vì hàm xóa
               handleOpenVisitModal={handleOpenVisitModal}
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
        confirmCancel={confirmCancel} // Truyền hàm HỦY
      />

      {isModalOpen && (
        <AppointmentFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          formData={formData}
          handleInputChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
          handleSave={handleSave}
          editingAppointment={editingAppointment}
          mockPatients={patients}
          mockDoctors={currentDoctor ? [currentDoctor] : []}
          getDoctorName={getDoctorName}
          checkAvailability={checkAvailability}
        />
      )}

      {/* Tái sử dụng Modal xóa nhưng đổi nội dung thành Hủy */}
      <AppointmentDeleteModal
        confirmCancelId={confirmCancelId}
        setconfirmCancelId={setConfirmCancelId}
        handleCancel={handleCancel} // Gọi hàm HỦY
        title="Xác nhận hủy lịch"
        message="Bạn có chắc chắn muốn hủy lịch hẹn này không? Lịch hẹn sẽ chuyển sang trạng thái 'Đã hủy' và thông báo sẽ được gửi đến bệnh nhân."
        confirmText="Hủy Lịch"
        cancelText="Không"
      />
      <VisitCreateModal
          isOpen={isVisitModalOpen}
          onClose={() => setIsVisitModalOpen(false)}
          appointment={selectedAppointmentForVisit}
          onSuccess={() => {
             fetchData(); // Load lại dữ liệu để cập nhật trạng thái appointment thành 'completed'
          }}
      />
    </main>
  );
};

export default DoctorAppointment;