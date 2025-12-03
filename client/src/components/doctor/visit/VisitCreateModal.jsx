import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, Calendar, Pill, DollarSign, FileText, Clock, Search } from "lucide-react";
import { toastSuccess, toastError, toastWarning, toastInfo } from "../../../utils/toast";

// Import Services
import visitService from "../../../services/VisitService";
import timeslotService from "../../../services/TimeslotService";
// Giả sử bạn đã có 2 service này (nếu chưa, hãy tạo file gọi API tương ứng)
import medicineService from "../../../services/MedicineService"; 
import medicalServiceService from "../../../services/MedicalServiceService";

import Modal from "../../Modal"; 

const VisitCreateModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  // === STATE ===
  const [loading, setLoading] = useState(false);
  
  // Dữ liệu danh mục để chọn
  const [medicineList, setMedicineList] = useState([]);
  const [serviceList, setServiceList] = useState([]);

  const [formData, setFormData] = useState({
    symptoms: "",
    diagnosis: "",
    notes: "",
    advice: "",
    next_visit_date: "",
  });

  // State cho Timeslot
  const [availableTimeslots, setAvailableTimeslots] = useState([]);
  const [selectedTimeslotId, setSelectedTimeslotId] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);

  // State danh sách thuốc
  const [prescriptions, setPrescriptions] = useState([
    { medicine_id: "", drug: "", dosage: "", frequency: "", duration: "", note: "", quantity: 1, unit: "Viên" }
  ]);

  // State danh sách dịch vụ (Chỉ dùng để hiển thị preview cho bác sĩ)
  const [selectedServices, setSelectedServices] = useState([
    { service_id: "", name: "", price: 0 } 
  ]);

  // === EFFECT: Load danh mục Thuốc & Dịch vụ ===
  useEffect(() => {
    if (isOpen) {
        // Load danh sách thuốc
        medicineService.getAllMedicines({ limit: 1000, status: 'active' })
            .then(res => setMedicineList(res.data?.data || []))
            .catch(err => console.error("Lỗi tải thuốc", err));

        // Load danh sách dịch vụ
        medicalServiceService.getAllServices({ limit: 100, status: 'active' })
            .then(res => setServiceList(res.data?.data || []))
            .catch(err => console.error("Lỗi tải dịch vụ", err));
    }
  }, [isOpen]);

  // === EFFECT: Reset form khi mở modal ===
  useEffect(() => {
    if (isOpen && appointment) {
      setFormData({
        symptoms: appointment.reason || "", 
        diagnosis: "",
        notes: "",
        advice: "",
        next_visit_date: "",
      });
      setPrescriptions([{ medicine_id: "", drug: "", dosage: "", frequency: "", duration: "", note: "", quantity: 1, unit: "Viên" }]);
      setSelectedServices([]); // Mặc định chưa chọn dịch vụ nào (Phí khám server tự tính)
      
      setAvailableTimeslots([]);
      setSelectedTimeslotId("");
    }
  }, [isOpen, appointment]);

  // === EFFECT: Load Timeslot ===
  useEffect(() => {
    const fetchSlots = async () => {
      if (!formData.next_visit_date || !appointment) {
        setAvailableTimeslots([]);
        return;
      }
      
      const doctorId = typeof appointment.doctor_id === 'object' ? appointment.doctor_id._id : appointment.doctor_id;
      if (!doctorId) return;

      setLoadingSlots(true);
      try {
        const res = await timeslotService.getSlotsByDate(doctorId, formData.next_visit_date);
        const slots = res.data?.data || res.data || []; 
        setAvailableTimeslots(Array.isArray(slots) ? slots.filter(s => s.status === 'free') : []);
      } catch (error) {
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

    // Logic: Nếu chọn tên thuốc từ datalist, tự điền ID và Unit
    if (field === 'drug') {
        const selectedMed = medicineList.find(m => m.name === value);
        if (selectedMed) {
            newList[index].medicine_id = selectedMed._id;
            newList[index].unit = selectedMed.unit || "Viên";
        } else {
            newList[index].medicine_id = null; // Thuốc mới/tự nhập
        }
    }

    setPrescriptions(newList);
  };
  
  const addPrescription = () => setPrescriptions([...prescriptions, { medicine_id: "", drug: "", dosage: "", frequency: "", duration: "", note: "", quantity: 1, unit: "Viên" }]);
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
  
  const calculateTotalService = () => selectedServices.reduce((total, item) => total + (item.price || 0), 0);

  // === SUBMIT ===
  const handleSubmit = async () => {
    if (!formData.symptoms.trim()) {
      toastError("Vui lòng nhập triệu chứng bệnh.");
      return;
    }

    if (formData.next_visit_date && !selectedTimeslotId) {
        toastWarning("Vui lòng chọn khung giờ cho lịch tái khám.");
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
        
        // 1. Gửi danh sách thuốc chuẩn
        prescriptions: prescriptions
            .filter(p => p.drug.trim() !== "")
            .map(p => ({
                medicine_id: p.medicine_id || null, // Backend sẽ dùng cái này nếu có
                drug: p.drug,
                dosage: p.dosage,
                frequency: p.frequency,
                duration: p.duration,
                note: p.note,
                quantity: Number(p.quantity),
                unit: p.unit
            })),

        // 2. Gửi danh sách ID dịch vụ (Backend sẽ tự tính tiền)
        serviceIds: selectedServices
            .filter(s => s.service_id)
            .map(s => s.service_id)
      };

      const res = await visitService.createVisit(payload);
      toastSuccess("Hoàn tất khám bệnh thành công!");
      
      if (res.data?.followup?.scheduled) {
        toastInfo(`Đã hẹn tái khám: ${new Date(res.data.followup.date).toLocaleDateString('vi-VN')} (${res.data.followup.start})`);
      }
      
      onSuccess(); 
      onClose();
    } catch (error) {
      console.error(error);
      toastError(error.response?.data?.error || "Lỗi khi tạo hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  // UI Helper
  const patientName = typeof appointment?.patient_id === 'object' 
    ? appointment.patient_id.fullName || appointment.patient_id.name
    : "Bệnh nhân";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tạo Hồ Sơ Khám: ${patientName}`} maxWidth="6xl">
      <div className="space-y-6 pb-2">
        
        {/* 1. THÔNG TIN LÂM SÀNG */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
             <FileText className="text-blue-600" size={20}/>
             <h3 className="font-bold text-gray-800">Thông tin lâm sàng</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Triệu chứng <span className="text-red-500">*</span></label>
              <textarea name="symptoms" value={formData.symptoms} onChange={handleChange} rows="3"
                className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 outline-none" placeholder="Mô tả triệu chứng..." />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Chẩn đoán</label>
              <textarea name="diagnosis" value={formData.diagnosis} onChange={handleChange} rows="3"
                className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 outline-none" placeholder="Kết luận bệnh..." />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Lời dặn bác sĩ</label>
              <input name="advice" value={formData.advice} onChange={handleChange}
                className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 outline-none" placeholder="Dặn dò ăn uống..." />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Ghi chú (Nội bộ)</label>
              <input name="notes" value={formData.notes} onChange={handleChange}
                className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 outline-none" placeholder="Ghi chú riêng tư..." />
            </div>
          </div>
        </div>

        {/* 2. KÊ ĐƠN THUỐC */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <div className="flex items-center gap-2">
                <Pill className="text-green-600" size={20}/>
                <h3 className="font-bold text-gray-800">Kê đơn thuốc</h3>
            </div>
            <button onClick={addPrescription} className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-md font-medium hover:bg-green-100 transition flex items-center gap-1">
              <Plus size={16}/> Thêm thuốc
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Header Table */}
            <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 uppercase px-2">
                <div className="col-span-3">Tên thuốc</div>
                <div className="col-span-2">Đơn vị</div>
                <div className="col-span-1">SL Mua</div>
                <div className="col-span-2">Liều dùng (Sáng/...)</div>
                <div className="col-span-2">Cách dùng</div>
                <div className="col-span-2">Thời gian</div>
            </div>

            {prescriptions.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                {/* Tên thuốc + Datalist */}
                <div className="col-span-3">
                    <input 
                        list={`med-list-${index}`}
                        placeholder="Nhập tên thuốc..." 
                        className="w-full border-gray-300 border p-2 rounded text-sm outline-none focus:border-green-500"
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
                <div className="col-span-2">
                    <input placeholder="Viên/Vỉ" className="w-full border-gray-300 border p-2 rounded text-sm outline-none"
                        value={item.unit} onChange={(e) => handlePrescriptionChange(index, 'unit', e.target.value)}/>
                </div>
                
                {/* Số lượng mua */}
                <div className="col-span-1">
                    <input type="number" min="1" className="w-full border-gray-300 border p-2 rounded text-sm text-center outline-none font-semibold text-green-700"
                        value={item.quantity} onChange={(e) => handlePrescriptionChange(index, 'quantity', e.target.value)}/>
                </div>

                {/* Liều dùng */}
                <div className="col-span-2">
                    <input placeholder="Sáng 1, Tối 1" className="w-full border-gray-300 border p-2 rounded text-sm outline-none"
                        value={item.frequency} onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}/>
                </div>

                {/* Cách dùng (Note) */}
                <div className="col-span-2">
                    <input placeholder="Sau ăn..." className="w-full border-gray-300 border p-2 rounded text-sm outline-none"
                        value={item.note} onChange={(e) => handlePrescriptionChange(index, 'note', e.target.value)}/>
                </div>

                {/* Thời gian + Nút Xóa */}
                <div className="col-span-2 flex gap-1">
                    <input placeholder="5 ngày" className="w-full border-gray-300 border p-2 rounded text-sm outline-none"
                        value={item.duration} onChange={(e) => handlePrescriptionChange(index, 'duration', e.target.value)}/>
                    <button onClick={() => removePrescription(index)} className="text-gray-400 hover:text-red-600 p-1">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
            ))}
          </div>
        </div>

        {/* 3. DỊCH VỤ & TÁI KHÁM */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Cột Trái: Dịch vụ */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <div className="flex items-center gap-2">
                        <DollarSign className="text-yellow-600" size={20}/>
                        <h3 className="font-bold text-gray-800">Chỉ định dịch vụ</h3>
                    </div>
                    <button onClick={addService} className="text-sm bg-yellow-50 text-yellow-700 px-3 py-1 rounded-md font-medium hover:bg-yellow-100 transition flex items-center gap-1">
                        <Plus size={16}/> Thêm
                    </button>
                </div>

                <div className="space-y-2 flex-grow">
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
                            
                            <div className="w-24 text-right text-sm font-semibold text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                                {item.price?.toLocaleString()}
                            </div>

                            <button onClick={() => removeService(index)} className="text-gray-400 hover:text-red-600 p-1">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
                
                <div className="mt-4 pt-3 border-t border-dashed border-gray-300 flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Tổng phí dịch vụ (Dự kiến):</span>
                    <span className="text-xl font-bold text-indigo-600">
                        {calculateTotalService().toLocaleString('vi-VN')} đ
                    </span>
                </div>
            </div>

            {/* Cột Phải: Tái khám */}
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
                                 <div className="text-sm text-indigo-500 flex items-center gap-2"><div className="animate-spin">⏳</div> Đang tải...</div>
                             ) : (
                                <div className="relative">
                                    <select value={selectedTimeslotId} onChange={(e) => setSelectedTimeslotId(e.target.value)}
                                        className="w-full border border-indigo-200 p-2 rounded-lg appearance-none bg-white pr-8 cursor-pointer outline-none">
                                        <option value="">-- Chọn giờ --</option>
                                        {availableTimeslots.length > 0 ? (
                                            availableTimeslots.map(slot => (
                                                <option key={slot._id} value={slot._id}>{slot.start} - {slot.end}</option>
                                            ))
                                        ) : <option disabled>Hết lịch trống</option>}
                                    </select>
                                    <Clock size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none"/>
                                </div>
                             )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
            <button onClick={onClose} disabled={loading} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">Hủy</button>
            <button onClick={handleSubmit} disabled={loading} className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70">
                {loading ? <span className="animate-spin">⏳</span> : <Save size={20} />} Lưu Hồ Sơ
            </button>
        </div>

      </div>
    </Modal>
  );
};

export default VisitCreateModal;