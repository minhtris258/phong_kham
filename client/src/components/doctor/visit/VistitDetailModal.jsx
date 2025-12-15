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
} from "lucide-react";
import Modal from "../../Modal";

const VisitDetailModal = ({ visit, onClose }) => {
  if (!visit) return null;

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
      title="Chi Tiết Hồ Sơ Khám Bệnh"
      maxWidth="4xl"
    >
      <div className="space-y-6 text-sm text-gray-700 print:text-black">
        {/* Header Thông tin */}
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-blue-800 font-bold uppercase text-xs border-b border-blue-200 pb-1 mb-2">
              <User size={16} /> <span>Bệnh nhân</span>
            </div>
            <p className="font-bold text-gray-900 text-lg">
              {visit.patient_id?.fullName || visit.patient_id?.name || "N/A"}
            </p>
            <p className="flex items-center space-x-2 text-gray-600">
              <Mail size={14} /> <span>{visit.patient_id?.email}</span>
            </p>
            <p className="flex items-center space-x-2 text-gray-600">
              <Phone size={14} /> <span>{visit.patient_id?.phone}</span>
            </p>
          </div>

          <div className="md:text-right space-y-2">
            <div className="flex items-center md:justify-end space-x-2 text-blue-800 font-bold uppercase text-xs border-b border-blue-200 pb-1 mb-2">
              <Calendar size={16} /> <span>Thời gian khám</span>
            </div>
            <p className="font-medium text-gray-900 text-lg">
              {formatDate(visit.createdAt)}
            </p>
            {visit.next_visit_date && (
              <div className="flex items-center md:justify-end space-x-2 mt-2">
                <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-bold flex items-center space-x-1">
                  <Clock size={12} />{" "}
                  <span>
                    Tái khám:{" "}
                    {new Date(visit.next_visit_date).toLocaleDateString(
                      "vi-VN"
                    )}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Chẩn đoán */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <h3 className="flex items-center space-x-2 text-red-700 font-bold mb-2">
              <Activity size={20} /> <span>Triệu chứng</span>
            </h3>
            <p className="text-gray-700">{visit.symptoms}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="flex items-center space-x-2 text-green-700 font-bold mb-2">
              <Stethoscope size={20} /> <span>Chẩn đoán</span>
            </h3>
            <p className="text-gray-800 font-medium text-lg">
              {visit.diagnosis || "Chưa có kết luận"}
            </p>
          </div>
        </div>

        {/* Ghi chú */}
        {(visit.advice || visit.notes) && (
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h3 className="flex items-center space-x-2 text-gray-800 font-bold mb-3 pb-2 border-b">
              <FileText size={20} /> <span>Ghi chú bác sĩ</span>
            </h3>
            {visit.advice && (
              <div className="mb-2">
                <span className="font-semibold block">Lời dặn:</span>{" "}
                <p className="text-blue-700 italic">"{visit.advice}"</p>
              </div>
            )}
            {visit.notes && (
              <div>
                <span className="font-semibold block text-xs text-gray-500">
                  Ghi chú nội bộ:
                </span>{" "}
                <p className="text-gray-600 text-xs">{visit.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Đơn thuốc */}
        {visit.prescriptions?.length > 0 && (
          <div>
            <h3 className="flex items-center space-x-2 text-sky-700 font-bold mb-3 border-b pb-2">
              <Pill size={20} /> <span>Đơn thuốc</span>
            </h3>
            <div className="overflow-hidden border rounded-lg shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-sky-50 text-sky-900 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Tên thuốc</th>
                    <th className="px-4 py-3 text-center">SL</th>
                    <th className="px-4 py-3 text-center">Đơn vị</th>
                    <th className="px-4 py-3">Liều dùng</th>
                    <th className="px-4 py-3">Cách dùng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {visit.prescriptions.map((med, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {med.drug}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-green-600">
                        {med.quantity}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500">
                        {med.unit}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {med.frequency} - {med.dosage}
                      </td>
                      <td className="px-4 py-3 text-gray-500 italic">
                        {med.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Thanh toán */}
        <div>
          <h3 className="flex items-center space-x-2 text-yellow-700 font-bold mb-3 border-b pb-2">
            <CreditCard size={20} /> <span>Chi tiết dịch vụ</span>
          </h3>
          <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Hạng mục</th>
                  <th className="px-4 py-3 text-center">SL</th>
                  <th className="px-4 py-3 text-right">Đơn giá</th>
                  <th className="px-4 py-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">Công khám bác sĩ</td>
                  <td className="px-4 py-3 text-center text-gray-500">1</td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {formatCurrency(visit.consultation_fee_snapshot)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(visit.consultation_fee_snapshot)}
                  </td>
                </tr>
                {visit.bill_items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency((item.quantity || 0) * (item.price || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-yellow-50 border-t border-yellow-100">
                <tr>
                  <td
                    colSpan="3"
                    className="px-4 py-4 text-right font-bold text-gray-900 uppercase text-xs"
                  >
                    Tổng cộng:
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-yellow-700 text-xl">
                    {formatCurrency(visit.total_amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-gray-100 space-x-3">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Printer size={16} /> <span>In phiếu</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VisitDetailModal;
