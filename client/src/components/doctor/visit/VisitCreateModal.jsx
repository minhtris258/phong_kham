import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Save, Calendar, Pill, DollarSign, FileText, Clock, X, AlertCircle } from "lucide-react";
import { toastSuccess, toastError, toastWarning, toastInfo } from "../../../utils/toast";

// Import Services
import visitService from "../../../services/VisitService";
import timeslotService from "../../../services/TimeslotService";
import medicineService from "../../../services/MedicineService"; 
import medicalServiceService from "../../../services/MedicalServiceService";

import Modal from "../../Modal"; 

const VisitCreateModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  // === STATE ===
  const [loading, setLoading] = useState(false);
  
  // Dữ liệu danh mục
  const [medicineList, setMedicineList] = useState([]);
  const [serviceList, setServiceList] = useState([]);

  // Form chính
  const [formData, setFormData] = useState({
    symptoms: "",
    diagnosis: "",
    notes: "",
    advice: "",
    next_visit_date: "",
  });

  // Timeslot tái khám
  const [availableTimeslots, setAvailableTimeslots] = useState([]);
  const [selectedTimeslotId, setSelectedTimeslotId] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Danh sách thuốc
  const [prescriptions, setPrescriptions] = useState([
    { medicine_id: null, drug: "", dosage: "", frequency: "", duration: "", note: "", quantity: 1, unit: "Viên", availableDosages: [] }
  ]);

  // Danh sách dịch vụ (UI only)
  const [selectedServices, setSelectedServices] = useState([]);

  // === DATA LOADING ===
  useEffect(() => {
    if (isOpen) {
        // Load danh mục thuốc
        medicineService.getAllMedicines({ limit: 1000, status: 'active' })
            .then(res => setMedicineList(res.data?.data || []))
            .catch(err => console.error("Lỗi tải thuốc", err));

        // Load danh mục dịch vụ
        medicalServiceService.getAllServices({ limit: 100, status: 'active' })
            .then(res => setServiceList(res.data?.data || []))
            .catch(err => console.error("Lỗi tải dịch vụ", err));
    }
  }, [isOpen]);

  // === RESET FORM ===
  useEffect(() => {
    if (isOpen && appointment) {
      setFormData({
        symptoms: appointment.reason || "", 
        diagnosis: "",
        notes: "",
        advice: "",
        next_visit_date: "",
      });
      // Reset thuốc về dòng trắng
      setPrescriptions([{ medicine_id: null, drug: "", dosage: "", frequency: "", duration: "", note: "", quantity: 1, unit: "Viên", availableDosages: [] }]);
      setSelectedServices([]);
      setAvailableTimeslots([]);
      setSelectedTimeslotId("");
    }
  }, [isOpen, appointment]);

  // === LOAD TIMESLOTS (TÁI KHÁM) ===
  useEffect(() => {
    const fetchSlots = async () => {
      if (!formData.next_visit_date || !appointment) {
        setAvailableTimeslots([]);
        return;
      }
      
      // Xử lý an toàn doctor_id (có thể là string hoặc object populated)
      const doctorId = appointment.doctor_id?._id || appointment.doctor_id;
      if (!doctorId) return;

      setLoadingSlots(true);
      try {
        const res = await timeslotService.getSlotsByDate(doctorId, formData.next_visit_date);
        const slots = res.data?.data || res.data || []; 
        setAvailableTimeslots(Array.isArray(slots) ? slots.filter(s => s.status === 'free') : []);
      } catch (error) {
        console.error(error);
        setAvailableTimeslots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [formData.next_visit_date, appointment]);

  // === HANDLERS ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- XỬ LÝ THUỐC ---
  const handlePrescriptionChange = (index, field, value) => {
    const newList = [...prescriptions];
    newList[index][field] = value;

    // Logic thông minh: Khi chọn tên thuốc -> Tự điền ID, Unit và Load gợi ý Liều lượng
    if (field === 'drug') {
        const selectedMed = medicineList.find(m => m.name === value);
        if (selectedMed) {
            newList[index].medicine_id = selectedMed._id;
            newList[index].unit = selectedMed.unit || "Viên";
            // Lưu mảng dosages vào state tạm để hiển thị datalist cho ô dosage
            newList[index].availableDosages = selectedMed.dosages || []; 
        } else {
            // Nếu nhập tên thuốc mới/không có trong kho
            newList[index].medicine_id = null; 
            newList[index].availableDosages = [];
        }
    }

    setPrescriptions(newList);
  };
  
  const addPrescription = () => setPrescriptions([...prescriptions, { medicine_id: null, drug: "", dosage: "", frequency: "", duration: "", note: "", quantity: 1, unit: "Viên", availableDosages: [] }]);
  const removePrescription = (index) => setPrescriptions(prescriptions.filter((_, i) => i !== index));

  // --- XỬ LÝ DỊCH VỤ ---
  const handleServiceChange = (index, value) => {
    const newList = [...selectedServices];
    const selectedSvc = serviceList.find(s => s._id === value);
    
    if (selectedSvc) {
        newList[index] = {
            service_id: selectedSvc._id,
            name: selectedSvc.name,
            price: selectedSvc.price
        };
    } else {
        newList[index] = { service_id: "", name: "", price: 0 };
    }
    setSelectedServices(newList);
  };

  const addService = () => setSelectedServices([...selectedServices, { service_id: "", name: "", price: 0 }]);
  const removeService = (index) => setSelectedServices(selectedServices.filter((_, i) => i !== index));
  
  // Tính tổng tiền dự kiến (Dịch vụ + Phí khám bác sĩ)
  const totalAmountEstimate = useMemo(() => {
    const serviceTotal = selectedServices.reduce((total, item) => total + (item.price || 0), 0);
    // Giả sử lấy phí khám từ appointment (nếu backend có populate) hoặc mặc định
    const docFee = appointment?.doctor_id?.consultation_fee || 0; 
    return serviceTotal + docFee;
  }, [selectedServices, appointment]);

  // === SUBMIT ===
  const handleSubmit = async () => {
    if (!formData.symptoms.trim()) {
      toastError("Vui lòng nhập triệu chứng bệnh.");
      return;
    }

    if (formData.next_visit_date && !selectedTimeslotId) {
        toastWarning("Bạn đã chọn ngày tái khám nhưng chưa chọn giờ.");
        return;
    }

    setLoading(true);
    try {
      const payload = {
        appointment_id: appointment._id,
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        notes: formData.notes,
        advice: formData.advice,
        next_visit_timeslot_id: selectedTimeslotId || null, 
        
        // 1. Map danh sách thuốc
        prescriptions: prescriptions
            .filter(p => p.drug.trim() !== "") // Loại bỏ dòng trống
            .map(p => ({
                medicine_id: p.medicine_id || null, 
                drug: p.drug,
                dosage: p.dosage,
                frequency: p.frequency,
                duration: p.duration,
                note: p.note,
                quantity: Number(p.quantity),
                unit: p.unit
            })),

        // 2. Map danh sách dịch vụ (Chỉ cần gửi ID)
        serviceIds: selectedServices
            .filter(s => s.service_id)
            .map(s => s.service_id)
      };

      const res = await visitService.createVisit(payload);
      
      toastSuccess("Tạo hồ sơ khám thành công!");
      if (res.data?.followup?.scheduled) {
        toastInfo(`Đã hẹn tái khám ngày: ${new Date(res.data.followup.date).toLocaleDateString('vi-VN')}`);
      }
      
      onSuccess(); 
      onClose();
    } catch (error) {
      console.error(error);
      toastError(error.response?.data?.error || "Lỗi khi lưu hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  // Render Helper
  const patientName = appointment?.patient_id?.fullName || appointment?.patient_id?.name || "Bệnh nhân";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Khám bệnh: ${patientName}`} maxWidth="7xl">
      <div className="flex flex-col h-[80vh]"> {/* Cố định chiều cao modal */}
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-4">
            {/* 1. THÔNG TIN LÂM SÀNG */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
                <FileText className="text-blue-600" size={20}/>
                <h3 className="font-bold text-gray-800">Thông tin lâm sàng</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Triệu chứng <span className="text-red-500">*</span></label>
                <textarea name="symptoms" value={formData.symptoms} onChange={handleChange} rows="2"
                    className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 outline-none" placeholder="Mô tả triệu chứng..." />
                </div>
                <div>
                <label className="text-sm font-semibold text-gray-700">Chẩn đoán</label>
                <textarea name="diagnosis" value={formData.diagnosis} onChange={handleChange} rows="2"
                    className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 outline-none" placeholder="Kết luận bệnh..." />
                </div>
                <div>
                <label className="text-sm font-semibold text-gray-700">Lời dặn bác sĩ</label>
                <textarea name="advice" value={formData.advice} onChange={handleChange} rows="2"
                    className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 outline-none" placeholder="Dặn dò ăn uống, nghỉ ngơi..." />
                </div>
                <div className="col-span-1 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1"><AlertCircle size={14}/> Ghi chú nội bộ</label>
                <input name="notes" value={formData.notes} onChange={handleChange}
                    className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 outline-none text-sm bg-gray-50" placeholder="Ghi chú chỉ bác sĩ/admin thấy..." />
                </div>
            </div>
            </div>

            {/* 2. KÊ ĐƠN THUỐC */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <div className="flex items-center gap-2">
                    <Pill className="text-green-600" size={20}/>
                    <h3 className="font-bold text-gray-800">Đơn thuốc</h3>
                </div>
                <button onClick={addPrescription} className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-md font-medium hover:bg-green-100 transition flex items-center gap-1">
                <Plus size={16}/> Thêm dòng
                </button>
            </div>
            
            <div className="space-y-3">
                <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 uppercase px-2">
                    <div className="col-span-3">Tên thuốc</div>
                    <div className="col-span-1 text-center">Đơn vị</div>
                    <div className="col-span-1 text-center">SL</div>
                    <div className="col-span-2">Liều lượng</div>
                    <div className="col-span-2">Cách dùng</div>
                    <div className="col-span-2">Thời gian</div>
                    <div className="col-span-1"></div>
                </div>

                {prescriptions.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start bg-gray-50 p-3 md:p-2 rounded-lg border border-gray-100 shadow-sm md:shadow-none">
                    {/* Tên thuốc */}
                    <div className="md:col-span-3 relative">
                        <label className="md:hidden text-xs font-bold text-gray-500 mb-1 block">Tên thuốc</label>
                        <input 
                            list={`med-list-${index}`}
                            placeholder="Nhập tên thuốc..." 
                            className="w-full border-gray-300 border p-2 rounded text-sm outline-none focus:border-green-500 font-medium"
                            value={item.drug} 
                            onChange={(e) => handlePrescriptionChange(index, 'drug', e.target.value)}
                        />
                        <datalist id={`med-list-${index}`}>
                            {medicineList.map(med => (
                                <option key={med._id} value={med.name}>{med.unit}</option>
                            ))}
                        </datalist>
                    </div>

                    {/* Đơn vị */}
                    <div className="md:col-span-1">
                        <label className="md:hidden text-xs font-bold text-gray-500 mb-1 block">Đơn vị</label>
                        <input placeholder="Viên" className="w-full border-gray-300 border p-2 rounded text-sm outline-none text-center bg-gray-100"
                            value={item.unit} readOnly tabIndex={-1} />
                    </div>
                    
                    {/* Số lượng */}
                    <div className="md:col-span-1">
                        <label className="md:hidden text-xs font-bold text-gray-500 mb-1 block">Số lượng</label>
                        <input type="number" min="1" className="w-full border-gray-300 border p-2 rounded text-sm text-center outline-none font-bold text-green-700"
                            value={item.quantity} onChange={(e) => handlePrescriptionChange(index, 'quantity', e.target.value)}/>
                    </div>

                    {/* Liều lượng (Hỗ trợ gợi ý từ mảng dosages) */}
                    <div className="md:col-span-2">
                        <label className="md:hidden text-xs font-bold text-gray-500 mb-1 block">Liều lượng</label>
                        <input 
                            list={`dosage-list-${index}`}
                            placeholder="Vd: 500mg" 
                            className="w-full border-gray-300 border p-2 rounded text-sm outline-none"
                            value={item.dosage} 
                            onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                        />
                         {/* Datalist hiển thị mảng dosages của thuốc đã chọn */}
                        {item.availableDosages && item.availableDosages.length > 0 && (
                             <datalist id={`dosage-list-${index}`}>
                                {item.availableDosages.map((d, i) => <option key={i} value={d} />)}
                             </datalist>
                        )}
                    </div>

                    {/* Cách dùng */}
                    <div className="md:col-span-2">
                        <label className="md:hidden text-xs font-bold text-gray-500 mb-1 block">Cách dùng</label>
                        <input placeholder="Sáng 1, Chiều 1" className="w-full border-gray-300 border p-2 rounded text-sm outline-none"
                            value={item.frequency} onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}/>
                        {/* Note nhỏ */}
                        <input placeholder="Ghi chú (sau ăn...)" className="w-full mt-1 border-gray-200 border p-1.5 rounded text-xs outline-none text-gray-600"
                            value={item.note} onChange={(e) => handlePrescriptionChange(index, 'note', e.target.value)}/>
                    </div>

                    {/* Thời gian */}
                    <div className="md:col-span-2">
                        <label className="md:hidden text-xs font-bold text-gray-500 mb-1 block">Thời gian</label>
                        <input placeholder="5 ngày" className="w-full border-gray-300 border p-2 rounded text-sm outline-none"
                            value={item.duration} onChange={(e) => handlePrescriptionChange(index, 'duration', e.target.value)}/>
                    </div>

                    {/* Nút xóa */}
                    <div className="md:col-span-1 flex justify-center pt-2">
                        <button onClick={() => removePrescription(index)} className="text-gray-400 hover:text-red-600 bg-white p-1 rounded-full hover:bg-red-50 transition">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
                ))}
            </div>
            </div>

            {/* 3. DỊCH VỤ & TÁI KHÁM */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Dịch vụ */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <div className="flex items-center gap-2">
                            <DollarSign className="text-yellow-600" size={20}/>
                            <h3 className="font-bold text-gray-800">Dịch vụ kỹ thuật</h3>
                        </div>
                        <button onClick={addService} className="text-sm bg-yellow-50 text-yellow-700 px-3 py-1 rounded-md font-medium hover:bg-yellow-100 transition flex items-center gap-1">
                            <Plus size={16}/> Thêm
                        </button>
                    </div>

                    <div className="space-y-2">
                        {selectedServices.length === 0 && <p className="text-sm text-gray-400 italic text-center py-2">Chưa chọn dịch vụ nào</p>}
                        {selectedServices.map((item, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <select 
                                    className="flex-1 border border-gray-300 p-2 rounded text-sm outline-none focus:border-yellow-500"
                                    value={item.service_id}
                                    onChange={(e) => handleServiceChange(index, e.target.value)}
                                >
                                    <option value="">-- Chọn dịch vụ --</option>
                                    {serviceList.map(svc => (
                                        <option key={svc._id} value={svc._id}>
                                            {svc.name} ({svc.price?.toLocaleString()}đ)
                                        </option>
                                    ))}
                                </select>
                                <span className="text-sm font-semibold text-gray-700 w-24 text-right">{item.price?.toLocaleString()}</span>
                                <button onClick={() => removeService(index)} className="text-gray-400 hover:text-red-600 p-1">
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tái khám */}
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 h-fit">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar size={20} className="text-indigo-600"/>
                        <h3 className="font-bold text-indigo-800">Hẹn tái khám</h3>
                    </div>
                    
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-indigo-900 uppercase mb-1">Ngày tái khám</label>
                            <input type="date" name="next_visit_date" min={new Date().toISOString().split("T")[0]}
                                value={formData.next_visit_date} onChange={handleChange}
                                className="w-full border border-indigo-200 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>

                        {formData.next_visit_date && (
                            <div className="animate-fade-in-down">
                                 <label className="block text-xs font-bold text-indigo-900 uppercase mb-1">Khung giờ trống</label>
                                 {loadingSlots ? (
                                     <div className="text-sm text-indigo-500 flex items-center gap-2"><div className="animate-spin">⏳</div> Đang tìm giờ...</div>
                                 ) : (
                                    <div className="relative">
                                        <select value={selectedTimeslotId} onChange={(e) => setSelectedTimeslotId(e.target.value)}
                                            className="w-full border border-indigo-200 p-2 rounded-lg appearance-none bg-white pr-8 cursor-pointer outline-none text-sm">
                                            <option value="">-- Chọn giờ khám --</option>
                                            {availableTimeslots.length > 0 ? (
                                                availableTimeslots.map(slot => (
                                                    <option key={slot._id} value={slot._id}>{slot.start} - {slot.end}</option>
                                                ))
                                            ) : <option disabled>Hết lịch trống</option>}
                                        </select>
                                        <Clock size={16} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"/>
                                    </div>
                                 )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Footer & Tổng tiền */}
        <div className="border-t border-gray-200 pt-4 mt-2 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col">
                <span className="text-sm text-gray-500">Tổng chi phí dự kiến (Chưa bao gồm thuốc):</span>
                <span className="text-2xl font-bold text-blue-600">{totalAmountEstimate.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <button onClick={onClose} disabled={loading} className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">Hủy</button>
                <button onClick={handleSubmit} disabled={loading} className="flex-1 md:flex-none px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex justify-center items-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-200">
                    {loading ? <span className="animate-spin">⏳</span> : <Save size={20} />} Lưu Hồ Sơ
                </button>
            </div>
        </div>

      </div>
    </Modal>
  );
};

export default VisitCreateModal;