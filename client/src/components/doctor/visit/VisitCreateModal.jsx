import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, Calendar, Pill, DollarSign, FileText, Clock } from "lucide-react";
import { toast } from "react-toastify";
import visitService from "../../../services/VIsitService"; // Đảm bảo đúng tên file service của bạn
import timeslotService from "../../../services/TimeslotService"; // Import service bạn vừa cung cấp
import Modal from "../../Modal"; 

const VisitCreateModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  // === STATE ===
  const [loading, setLoading] = useState(false);
  
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

  // State danh sách thuốc & dịch vụ
  const [prescriptions, setPrescriptions] = useState([
    { drug: "", dosage: "", frequency: "", duration: "", note: "" }
  ]);
  const [billItems, setBillItems] = useState([
    { name: "Phí khám bệnh", quantity: 1, price: 0 } 
  ]);

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
      setPrescriptions([{ drug: "", dosage: "", frequency: "", duration: "", note: "" }]);
      setBillItems([{ name: "Phí khám bệnh", quantity: 1, price: 0 }]);
      
      // Reset timeslot
      setAvailableTimeslots([]);
      setSelectedTimeslotId("");
    }
  }, [isOpen, appointment]);

  // === EFFECT: Gọi API lấy Slot khi chọn ngày ===
  useEffect(() => {
    const fetchSlots = async () => {
      // 1. Kiểm tra điều kiện: phải có ngày và thông tin bác sĩ
      if (!formData.next_visit_date || !appointment) {
        setAvailableTimeslots([]);
        return;
      }
      
      // Lấy Doctor ID an toàn (xử lý trường hợp populate object hoặc string ID)
      const doctorId = typeof appointment.doctor_id === 'object' 
        ? appointment.doctor_id._id 
        : appointment.doctor_id;

      if (!doctorId) return;

      setLoadingSlots(true);
      try {
        // 2. Gọi API getSlotsByDate từ TimeslotService bạn cung cấp
        const res = await timeslotService.getSlotsByDate(doctorId, formData.next_visit_date);
        
        // 3. Xử lý data trả về (Tùy theo cấu trúc response của axiosClient)
        // Thường là res.data hoặc res.data.data
        const slots = res.data?.data || res.data || []; 
        
        // Lọc chỉ lấy các slot có status là "free" (nếu API chưa lọc)
        const freeSlots = Array.isArray(slots) ? slots.filter(s => s.status === 'free') : [];
        
        setAvailableTimeslots(freeSlots);
      } catch (error) {
        console.error("Lỗi lấy timeslot:", error);
        toast.error("Không thể tải danh sách khung giờ trống.");
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

  // Handlers Thuốc
  const handlePrescriptionChange = (index, field, value) => {
    const newList = [...prescriptions];
    newList[index][field] = value;
    setPrescriptions(newList);
  };
  const addPrescription = () => setPrescriptions([...prescriptions, { drug: "", dosage: "", frequency: "", duration: "", note: "" }]);
  const removePrescription = (index) => setPrescriptions(prescriptions.filter((_, i) => i !== index));

  // Handlers Bill
  const handleBillChange = (index, field, value) => {
    const newList = [...billItems];
    newList[index][field] = value;
    setBillItems(newList);
  };
  const addBillItem = () => setBillItems([...billItems, { name: "", quantity: 1, price: 0 }]);
  const removeBillItem = (index) => setBillItems(billItems.filter((_, i) => i !== index));
  
  const calculateTotal = () => billItems.reduce((total, item) => total + (Number(item.quantity || 0) * Number(item.price || 0)), 0);

  // === SUBMIT ===
  const handleSubmit = async () => {
    if (!formData.symptoms.trim()) {
      toast.error("Vui lòng nhập triệu chứng bệnh.");
      return;
    }

    // Validate: Nếu chọn ngày tái khám thì phải chọn giờ
    if (formData.next_visit_date && !selectedTimeslotId) {
        toast.warn("Vui lòng chọn khung giờ cho lịch tái khám.");
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
        
        // Gửi timeslot_id để backend book lịch chính xác
        next_visit_timeslot_id: selectedTimeslotId || null, 
        
        prescriptions: prescriptions.filter(p => p.drug.trim() !== ""),
        bill_items: billItems.filter(b => b.name.trim() !== "").map(item => ({
          name: item.name,
          quantity: Number(item.quantity),
          price: Number(item.price)
        }))
      };

      const res = await visitService.createVisit(payload);
      toast.success("Hoàn tất khám bệnh thành công!");
      
      // Thông báo kết quả đặt lịch tái khám
      if (res.data?.followup?.scheduled) {
        toast.info(`Đã hẹn tái khám: ${new Date(res.data.followup.date).toLocaleDateString('vi-VN')} (${res.data.followup.start})`);
      }
      
      onSuccess(); 
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Lỗi khi tạo hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  // UI Title
  const patientName = typeof appointment?.patient_id === 'object' 
    ? appointment.patient_id.fullName || appointment.patient_id.name
    : "Bệnh nhân";

  const modalTitle = (
    <div className="flex flex-col">
      <span>Tạo Hồ Sơ Khám Bệnh</span>
      <span className="text-sm font-normal text-gray-500 mt-1">
        Đang khám cho: <span className="font-semibold text-blue-600">{patientName}</span>
      </span>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      maxWidth="5xl"
    >
      <div className="space-y-8 pb-2">
        
        {/* 1. Thông tin lâm sàng */}
        <section>
          <div className="flex items-center gap-2 mb-3">
             <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600"><FileText size={20}/></div>
             <h3 className="text-lg font-semibold text-gray-800">Thông tin lâm sàng</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Triệu chứng <span className="text-red-500">*</span></label>
              <textarea name="symptoms" value={formData.symptoms} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                rows="3" placeholder="Mô tả triệu chứng..." />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Chẩn đoán</label>
              <textarea name="diagnosis" value={formData.diagnosis} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                rows="3" placeholder="Kết luận bệnh..." />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lời dặn bác sĩ</label>
              <input name="advice" value={formData.advice} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Dặn dò ăn uống..." />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (Nội bộ)</label>
              <input name="notes" value={formData.notes} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ghi chú riêng tư..." />
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* 2. Đơn thuốc */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
                <div className="bg-green-100 p-1.5 rounded-lg text-green-600"><Pill size={20}/></div>
                <h3 className="text-lg font-semibold text-gray-800">Kê đơn thuốc</h3>
            </div>
            <button onClick={addPrescription} type="button" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-md transition flex items-center gap-1">
              <Plus size={16}/> Thêm dòng
            </button>
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid gap-2 p-3">
                {prescriptions.map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-2 items-start md:items-center bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                    <span className="text-gray-400 font-mono w-6 text-center text-sm">{index + 1}</span>
                    <input placeholder="Tên thuốc" className="flex-1 border-gray-300 border p-2 rounded text-sm w-full outline-none focus:border-blue-500"
                        value={item.drug} onChange={(e) => handlePrescriptionChange(index, 'drug', e.target.value)}/>
                    <input placeholder="Liều (VD: 1v)" className="w-full md:w-24 border-gray-300 border p-2 rounded text-sm outline-none focus:border-blue-500"
                        value={item.dosage} onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}/>
                    <input placeholder="Sáng/Chiều" className="w-full md:w-36 border-gray-300 border p-2 rounded text-sm outline-none focus:border-blue-500"
                        value={item.frequency} onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}/>
                    <input placeholder="Thời gian" className="w-full md:w-28 border-gray-300 border p-2 rounded text-sm outline-none focus:border-blue-500"
                        value={item.duration} onChange={(e) => handlePrescriptionChange(index, 'duration', e.target.value)}/>
                    <button onClick={() => removePrescription(index)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                        <Trash2 size={16} />
                    </button>
                </div>
                ))}
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* 3. Dịch vụ & Tái khám */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cột trái: Billing */}
            <section className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <div className="bg-yellow-100 p-1.5 rounded-lg text-yellow-600"><DollarSign size={20}/></div>
                        <h3 className="text-lg font-semibold text-gray-800">Dịch vụ chỉ định</h3>
                    </div>
                    <button onClick={addBillItem} type="button" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-md transition flex items-center gap-1">
                        <Plus size={16}/> Thêm
                    </button>
                </div>
                <div className="space-y-2 flex-grow">
                    {billItems.map((item, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <input placeholder="Tên dịch vụ" className="flex-1 border border-gray-300 p-2 rounded text-sm outline-none focus:border-blue-500"
                                value={item.name} onChange={(e) => handleBillChange(index, 'name', e.target.value)}/>
                            <input type="number" placeholder="SL" className="w-16 border border-gray-300 p-2 rounded text-sm text-center outline-none focus:border-blue-500"
                                value={item.quantity} min="1" onChange={(e) => handleBillChange(index, 'quantity', e.target.value)}/>
                            <input type="number" placeholder="Giá" className="w-28 border border-gray-300 p-2 rounded text-sm text-right outline-none focus:border-blue-500"
                                value={item.price} min="0" onChange={(e) => handleBillChange(index, 'price', e.target.value)}/>
                            <button onClick={() => removeBillItem(index)} className="text-gray-400 hover:text-red-600 p-1">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-3 border-t border-dashed border-gray-300 flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Tổng chi phí thêm:</span>
                    <span className="text-xl font-bold text-indigo-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal())}
                    </span>
                </div>
            </section>

            {/* Cột phải: Tái khám */}
            <section className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 h-fit">
                <div className="flex items-center gap-2 mb-3">
                    <Calendar size={20} className="text-indigo-600"/>
                    <h3 className="text-lg font-semibold text-indigo-800">Hẹn tái khám</h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                   Chọn ngày và khung giờ để đặt lịch tái khám chính xác cho bệnh nhân.
                </p>
                
                {/* 1. Chọn ngày */}
                <div className="mb-3">
                    <label className="block text-xs font-bold text-indigo-900 uppercase mb-1">Ngày tái khám</label>
                    <input 
                        type="date"
                        name="next_visit_date"
                        min={new Date().toISOString().split("T")[0]}
                        value={formData.next_visit_date}
                        onChange={handleChange}
                        className="w-full border border-indigo-200 text-gray-800 font-medium p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                {/* 2. Chọn khung giờ */}
                {formData.next_visit_date && (
                    <div className="mb-3 animate-fade-in-down">
                         <label className="block text-xs font-bold text-indigo-900 uppercase mb-1">Khung giờ trống</label>
                         {loadingSlots ? (
                             <div className="text-sm text-indigo-500 flex items-center gap-2"><div className="animate-spin">⏳</div> Đang tải khung giờ...</div>
                         ) : (
                             <div className="relative">
                                <select
                                    value={selectedTimeslotId}
                                    onChange={(e) => setSelectedTimeslotId(e.target.value)}
                                    className="w-full border border-indigo-200 text-gray-800 p-2 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 outline-none bg-white pr-8 cursor-pointer"
                                >
                                    <option value="">-- Chọn giờ khám --</option>
                                    {availableTimeslots.length > 0 ? (
                                        availableTimeslots.map(slot => (
                                            <option key={slot._id} value={slot._id}>
                                                {slot.start} - {slot.end}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>Không có lịch trống</option>
                                    )}
                                </select>
                                <Clock size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none"/>
                             </div>
                         )}
                         {availableTimeslots.length === 0 && !loadingSlots && (
                             <p className="text-xs text-red-500 mt-1 italic">Ngày này bác sĩ không còn lịch trống.</p>
                         )}
                    </div>
                )}
                
                {selectedTimeslotId && (
                    <div className="mt-3 text-xs flex items-center gap-1 text-indigo-700 bg-indigo-100/50 p-2 rounded">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
                        Hệ thống sẽ tạo lịch hẹn mới và gửi thông báo cho bệnh nhân.
                    </div>
                )}
            </section>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
            <button onClick={onClose} disabled={loading}
                className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition duration-200">
                Hủy bỏ
            </button>
            <button onClick={handleSubmit} disabled={loading}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition duration-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? <span className="animate-spin">⏳</span> : <Save size={20} />}
                Hoàn tất & Lưu
            </button>
        </div>

      </div>
    </Modal>
  );
};

export default VisitCreateModal;