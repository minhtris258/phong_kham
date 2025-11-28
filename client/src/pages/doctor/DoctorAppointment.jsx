import React, { useState, useCallback, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react"; 
import { toastSuccess, toastError,toastWarning } from "../../utils/toast";

// Import Hook Socket
import { useSocket } from "../../context/SocketContext"; 

// Components (Giữ nguyên)
import AppointmentCalendar from "../../components/doctor/appointment/AppointmentCalendar";
import AppointmentListTable from "../../components/doctor/appointment/AppointmentListTable";
import AppointmentFormModal from "../../components/doctor/appointment/AppointmentFormModal";
import AppointmentDeleteModal from "../../components/doctor/appointment/AppointmentDeleteModal"; 
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

  // Lấy socket từ Context
  const { socket, isConnected } = useSocket();

  // ... (Giữ nguyên các state ViewMode, Modal...)
  const [viewMode, setViewMode] = useState("calendar");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [selectedAppointmentForVisit, setSelectedAppointmentForVisit] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentDayDetails, setCurrentDayDetails] = useState({ date: null, apps: [] });

  // === 2. Fetch API ===
  const fetchData = async () => {
    try {
      let me = currentDoctor;
      if (!me) {
          const meRes = await doctorService.getMe();
          me = meRes.profile || meRes;
          setCurrentDoctor(me);
          setDoctors([me]);
      }

      const apptRes = await appointmentsService.getDoctorAppointments({ limit: 1000 });
      const apptData = apptRes.data?.data || apptRes.data || [];
      setAppointments(apptData);

      // Map patients
      const uniquePatients = new Map();
      apptData.forEach(app => {
          if (app.patient_id && typeof app.patient_id === 'object') {
              uniquePatients.set(app.patient_id._id, app.patient_id);
          }
      });
      
      setPatients(prev => {
        const newMap = new Map(prev.map(p => [p._id, p]));
        uniquePatients.forEach((val, key) => newMap.set(key, val));
        return Array.from(newMap.values());
      });

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === [QUAN TRỌNG] 3. LOGIC SOCKET REALTIME (ĐÃ SỬA) ===
  useEffect(() => {
    // Chỉ chạy khi socket đã kết nối và đã có thông tin bác sĩ
    if (!socket || !isConnected || !currentDoctor) return;

    // 1. Join Room (Quan trọng: Phải join đúng User ID của bác sĩ)
    socket.emit("join_room", currentDoctor.user_id); 
    console.log("Socket joining room:", currentDoctor.user_id);

    // 2. Lắng nghe: Có bệnh nhân đặt lịch mới
    const handleNewAppointment = (newAppt) => {
        // newAppt từ server gửi về đã có populate patient_id
        console.log("Nhận lịch hẹn mới:", newAppt);
        
        if (newAppt.doctor_id === currentDoctor._id) {
            toastSuccess(`📅 Có lịch hẹn mới lúc ${newAppt.start}`);
            
            // Cập nhật State trực tiếp (Không cần gọi lại API fetchData -> Giảm tải server)
            setAppointments(prev => [newAppt, ...prev]);
            
            // Cập nhật list Patients nếu bệnh nhân này chưa có trong list
            if (newAppt.patient_id && typeof newAppt.patient_id === 'object') {
                setPatients(prev => {
                    const exists = prev.find(p => p._id === newAppt.patient_id._id);
                    return exists ? prev : [...prev, newAppt.patient_id];
                });
            }
        }
    };

    // 3. Lắng nghe: Lịch bị hủy (Từ phía bệnh nhân hoặc Admin)
    const handleAppointmentCancelled = (data) => {
        // data = { appointmentId, ... }
        console.log("Lịch bị hủy:", data);
        setAppointments(prev => prev.map(app => 
            app._id === data.appointmentId ? { ...app, status: 'cancelled' } : app
        ));
        toastWarning("⚠️ Một lịch hẹn vừa bị hủy.");
    };

    // 4. Lắng nghe: Cập nhật (nếu có)
    const handleAppointmentUpdated = (updatedAppt) => {
        if (updatedAppt.doctor_id === currentDoctor._id) {
             setAppointments(prev => prev.map(app => 
                 app._id === updatedAppt._id ? { ...app, ...updatedAppt } : app
             ));
        }
    };

    // Đăng ký sự kiện
    socket.on('new_appointment', handleNewAppointment);
    socket.on('appointment_cancelled', handleAppointmentCancelled);
    socket.on('appointment_updated', handleAppointmentUpdated);

    // Cleanup khi unmount
    return () => {
        socket.off('new_appointment', handleNewAppointment);
        socket.off('appointment_cancelled', handleAppointmentCancelled);
        socket.off('appointment_updated', handleAppointmentUpdated);
    };

  }, [socket, isConnected, currentDoctor]); 

  // === 4. Sync State Modal Ngày (Giữ nguyên) ===
  useEffect(() => {
    if (currentDayDetails.date) {
        const updatedApps = appointments.filter(app => 
            app.date && String(app.date).substring(0, 10) === currentDayDetails.date
        );
        setCurrentDayDetails(prev => ({ ...prev, apps: updatedApps }));
    }
  }, [appointments, currentDayDetails.date]);

  // === 5. Helpers & Handlers (GIỮ NGUYÊN CODE CŨ CỦA BẠN TỪ ĐÂY TRỞ XUỐNG) ===
  // ... (Copy y nguyên phần còn lại từ file cũ của bạn) ...
  const getDoctorName = useCallback(() => currentDoctor?.fullName || "Tôi", [currentDoctor]);
  const getPatientName = useCallback((patient) => {
    if (!patient) return "Khách vãng lai";
    if (typeof patient === 'object') return patient.fullName || patient.name || "Không rõ";
    const found = patients.find(p => p._id === patient);
    return found ? (found.fullName || found.name) : "Đang tải...";
  }, [patients]);
  
  const getStatusStyle = useCallback((status) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  }, []);

  const handleAddEdit = useCallback((appointment) => {
    setEditingAppointment(appointment);
    const defaultDate = currentDayDetails.date || new Date().toISOString().split("T")[0];
    const myId = currentDoctor?._id;
    if (appointment) {
      setFormData({
        _id: appointment._id,
        patient_id: appointment.patient_id?._id || appointment.patient_id,
        doctor_id: myId,
        date: appointment.date ? String(appointment.date).substring(0, 10) : '',
        start: appointment.start,
        status: appointment.status,
        reason: appointment.reason,
        timeslot_id: appointment.timeslot_id, 
        original_timeslot_id: appointment.timeslot_id 
      });
    } else {
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
    if (appointment.status === 'completed') {
        toastSuccess("Lịch hẹn này đã hoàn thành khám.");
        return;
    }
    if (appointment.status === 'cancelled') {
        toastError("Lịch hẹn đã bị hủy.");
        return;
    }
    setSelectedAppointmentForVisit(appointment);
    setIsVisitModalOpen(true);
  };

  const handleSave = async (submitData) => {
    try {
      const payload = { ...submitData, doctor_id: currentDoctor._id };
      if (editingAppointment) {
        if (submitData.timeslot_id !== submitData.original_timeslot_id) {
            await appointmentsService.rescheduleAppointmentByDoctor(submitData._id, {
                new_timeslot_id: submitData.timeslot_id,
                reason: submitData.reason || "Bác sĩ dời lịch"
            });
            toastSuccess("Đã dời lịch khám thành công!");
        } else {
            await appointmentsService.updateAppointmentByDoctor(submitData._id, {
                status: submitData.status,
                note: submitData.reason
            });
            toastSuccess("Cập nhật thông tin thành công!");
        }
      } else {
        await appointmentsService.bookAppointment(payload);
        toastSuccess("Tạo lịch hẹn thành công!");
      }
      setIsModalOpen(false);
      fetchData(); 
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
          reason: "Bác sĩ hủy lịch"
      });
      // Cập nhật Optimistic UI
      setAppointments(prev => prev.map(app => 
          app._id === confirmCancelId ? { ...app, status: 'cancelled' } : app
      ));
      setConfirmCancelId(null);
        toastSuccess("Đã hủy lịch hẹn thành công!");
    } catch (error) {
      toastError("Lỗi hủy lịch: " + (error.response?.data?.error || error.message));
    }
  };

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
               confirmCancel={confirmCancel} 
               handleOpenVisitModal={handleOpenVisitModal}
             />
          </div>
        )}
      </div>

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

      <AppointmentDeleteModal
        confirmCancelId={confirmCancelId}
        setconfirmCancelId={setConfirmCancelId}
        handleCancel={handleCancel}
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
             fetchData(); 
          }}
      />
    </main>
  );
};

export default DoctorAppointment;