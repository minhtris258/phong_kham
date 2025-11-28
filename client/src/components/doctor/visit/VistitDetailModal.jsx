import React from "react";
import { 
  Printer, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Activity, 
  Stethoscope, 
  FileText, 
  Pill, 
  CreditCard,
  AlertCircle
} from "lucide-react";
import Modal from "../../Modal"; // Đảm bảo đường dẫn import đúng với cấu trúc thư mục của bạn

const VisitDetailModal = ({ visit, onClose }) => {
  // Nếu không có dữ liệu visit, không render gì cả
  if (!visit) return null;

  // --- Helpers format ---
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  return (
    <Modal
      isOpen={!!visit}
      onClose={onClose}
      title="Hồ Sơ Chi Tiết"
      maxWidth="4xl" // Sử dụng maxWidth rộng hơn cho trang chi tiết
    >
      <div className="space-y-6 text-sm text-gray-700">
        
        {/* 1. THÔNG TIN CHUNG (Header) */}
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cột trái: Thông tin bệnh nhân */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-blue-800 font-bold uppercase text-xs tracking-wide border-b border-blue-200 pb-1 mb-2">
              <User className="w-4 h-4" />
              <span>Thông tin bệnh nhân</span>
            </div>
            
            <p className="font-bold text-gray-900 text-lg">
              {visit.patient_id?.name || "Khách vãng lai"}
            </p>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{visit.patient_id?.email || "Chưa cập nhật email"}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{visit.patient_id?.phone || "Chưa cập nhật SĐT"}</span>
            </div>
          </div>

          {/* Cột phải: Thời gian khám */}
          <div className="md:text-right space-y-2">
            <div className="flex items-center md:justify-end space-x-2 text-blue-800 font-bold uppercase text-xs tracking-wide border-b border-blue-200 pb-1 mb-2">
              <Calendar className="w-4 h-4" />
              <span>Thời gian khám</span>
            </div>
            
            <p className="font-medium text-gray-900 text-lg">{formatDate(visit.createdAt)}</p>
            
            {visit.next_visit_date && (
              <div className="flex items-center md:justify-end space-x-2 mt-2">
                <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-bold flex items-center space-x-1 shadow-sm">
                  <Clock className="w-3 h-3" />
                  <span>Tái khám: {new Date(visit.next_visit_date).toLocaleDateString("vi-VN")}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 2. CHẨN ĐOÁN & TRIỆU CHỨNG */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <div className="flex items-center space-x-2 text-red-700 font-bold mb-2">
              <Activity className="w-5 h-5" />
              <h3>Triệu chứng</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">{visit.symptoms}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center space-x-2 text-green-700 font-bold mb-2">
              <Stethoscope className="w-5 h-5" />
              <h3>Chẩn đoán</h3>
            </div>
            <p className="text-gray-800 font-medium text-lg">{visit.diagnosis || "Chưa có kết luận"}</p>
          </div>
        </div>

        {/* 3. LỜI DẶN & GHI CHÚ */}
        {(visit.advice || visit.notes) && (
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 text-gray-800 font-bold mb-3 pb-2 border-b border-gray-200">
              <FileText className="w-5 h-5" />
              <h3>Ghi chú bác sĩ</h3>
            </div>
            
            {visit.notes && (
              <div className="mb-4">
                <span className="font-semibold text-gray-700 block mb-1">Ghi chú nội bộ:</span>
                <p className="text-gray-600 bg-white p-2 rounded border border-gray-200 text-xs italic">
                  {visit.notes}
                </p>
              </div>
            )}
            
            {visit.advice && (
              <div>
                <span className="font-semibold text-gray-700 block mb-1">Lời dặn bệnh nhân:</span>
                <p className="text-gray-800 pl-3 border-l-4 border-blue-400">
                  "{visit.advice}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* 4. ĐƠN THUỐC (Prescriptions) */}
        {visit.prescriptions && visit.prescriptions.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 text-indigo-700 font-bold mb-3 border-b pb-2">
              <Pill className="w-5 h-5" />
              <h3>Đơn thuốc</h3>
            </div>
            <div className="overflow-hidden border rounded-lg shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-indigo-50 text-indigo-900 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Tên thuốc</th>
                    <th className="px-4 py-3">Liều lượng</th>
                    <th className="px-4 py-3 text-center">Tần suất</th>
                    <th className="px-4 py-3">Cách dùng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {visit.prescriptions.map((med, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{med.drug}</td>
                      <td className="px-4 py-3 text-gray-600">{med.dosage}</td>
                      <td className="px-4 py-3 text-center font-semibold">{med.frequency}</td>
                      <td className="px-4 py-3 text-gray-500 italic">
                        {med.duration}
                        {med.note && <span className="text-xs text-gray-400 block not-italic">({med.note})</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. CHI PHÍ & THANH TOÁN (Bill Items) */}
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 font-bold mb-3 border-b pb-2">
            <CreditCard className="w-5 h-5" />
            <h3>Chi tiết thanh toán</h3>
          </div>
          <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Hạng mục</th>
                  <th className="px-4 py-3 text-center font-semibold">SL</th>
                  <th className="px-4 py-3 text-right font-semibold">Đơn giá</th>
                  <th className="px-4 py-3 text-right font-semibold">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Phí khám cố định */}
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">Phí khám bệnh</td>
                  <td className="px-4 py-3 text-center text-gray-500">1</td>
                  <td className="px-4 py-3 text-right text-gray-500">{formatCurrency(visit.consultation_fee_snapshot)}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(visit.consultation_fee_snapshot)}</td>
                </tr>
                {/* Các dịch vụ/thuốc thêm */}
                {visit.bill_items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency((item.quantity || 0) * (item.price || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-emerald-50 border-t border-emerald-100">
                <tr>
                  <td colSpan="3" className="px-4 py-4 text-right font-bold text-gray-900 uppercase text-xs tracking-wider">Tổng cộng:</td>
                  <td className="px-4 py-4 text-right font-bold text-emerald-700 text-xl">
                    {formatCurrency(visit.total_amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex justify-end pt-4 border-t border-gray-100 space-x-3">
          {/* Nút in */}
          <button
            onClick={() => window.print()} 
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>In phiếu khám</span>
          </button>
          
          {/* Nút đóng (Thực ra Modal đã có nút X, nhưng thêm nút này cho UX tốt hơn) */}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
          >
            Đóng
          </button>
        </div>

      </div>
    </Modal>
  );
};

export default VisitDetailModal;