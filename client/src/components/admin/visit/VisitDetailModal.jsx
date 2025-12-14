import React from 'react';
import Modal from '../../Modal';
import { FileText, User, Calendar, Stethoscope, Pill, CreditCard, Activity } from 'lucide-react'; // Thêm icon Activity cho dịch vụ

const VisitDetailModal = ({ isOpen, onClose, visit }) => {
    if (!visit) return null;

    // Helper format tiền tệ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    // Helper hiển thị tên thuốc an toàn
    const getMedicineName = (med) => {
        if (med.medicine_id && typeof med.medicine_id === 'object') {
            return med.medicine_id.name || "Thuốc không tên";
        }
        return med.drug || med.name || "Thuốc kê ngoài";
    };

    return (
        <Modal
            title="Chi Tiết Phiếu Khám Bệnh"
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="3xl"
        >
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                
                {/* 1. THÔNG TIN CHUNG (Giữ nguyên) */}
                <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-full shadow-sm"><User className="w-5 h-5 text-sky-600" /></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Bệnh Nhân</p>
                                <p className="font-bold text-gray-900">{visit.patient_id?.fullName || "N/A"}</p>
                                <p className="text-sm text-gray-600">{visit.patient_id?.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-full shadow-sm"><Stethoscope className="w-5 h-5 text-green-600" /></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Bác Sĩ</p>
                                <p className="font-bold text-gray-900">{visit.doctor_id?.fullName || "N/A"}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-full shadow-sm"><Calendar className="w-5 h-5 text-sky-600" /></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Ngày Khám</p>
                                <p className="font-bold text-gray-900">{new Date(visit.date || visit.createdAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. KẾT QUẢ KHÁM (Giữ nguyên) */}
                <div>
                    <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3 border-b pb-2">
                        <FileText className="w-5 h-5 text-gray-500" /> Kết Quả Lâm Sàng
                    </h4>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Triệu chứng:</p>
                            <p className="text-gray-900">{visit.symptoms || "Không ghi nhận"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Chẩn đoán:</p>
                            <p className="text-gray-900 font-medium text-lg">{visit.diagnosis || "Chưa có chẩn đoán"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Lời dặn:</p>
                            <p className="text-gray-600 italic bg-gray-50 p-3 rounded-lg border border-gray-100">{visit.notes || visit.advice || "Không có lời dặn"}</p>
                        </div>
                    </div>
                </div>

                {/* 3. DỊCH VỤ SỬ DỤNG (MỚI THÊM) */}
                <div>
                    <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3 border-b pb-2">
                        <Activity className="w-5 h-5 text-orange-500" /> Dịch Vụ Đã Sử Dụng
                    </h4>
                    {visit.bill_items && visit.bill_items.length > 0 ? (
                        <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tên Dịch Vụ</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">SL</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Đơn Giá</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Thành Tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {/* Dòng phí khám cố định (nếu có lưu riêng) */}
                                    {visit.consultation_fee_snapshot > 0 && (
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">Phí khám bệnh</td>
                                            <td className="px-4 py-3 text-center text-sm text-gray-700">1</td>
                                            <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(visit.consultation_fee_snapshot)}</td>
                                            <td className="px-4 py-3 text-right text-sm font-bold text-gray-800">{formatCurrency(visit.consultation_fee_snapshot)}</td>
                                        </tr>
                                    )}

                                    {/* Các dịch vụ khác (XN, Siêu âm...) */}
                                    {visit.bill_items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                {item.name || item.service_name || "Dịch vụ khác"}
                                            </td>
                                            <td className="px-4 py-3 text-center text-sm text-gray-700">
                                                {item.quantity || 1}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-gray-600">
                                                {formatCurrency(item.price)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-bold text-gray-800">
                                                {formatCurrency((item.price || 0) * (item.quantity || 1))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-gray-50 text-center text-gray-500 py-4 rounded-xl border border-dashed border-gray-300">
                            Không có dịch vụ kỹ thuật nào được thực hiện.
                        </div>
                    )}
                </div>

                {/* 4. ĐƠN THUỐC (Giữ nguyên) */}
                <div>
                    <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3 border-b pb-2">
                        <Pill className="w-5 h-5 text-red-500" /> Đơn Thuốc
                    </h4>
                    {(visit.prescriptions && visit.prescriptions.length > 0) || (visit.prescription && visit.prescription.length > 0) ? (
                        <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tên thuốc</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Số lượng</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Cách dùng</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {(visit.prescriptions || visit.prescription).map((med, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900 font-bold">
                                                {getMedicineName(med)}
                                            </td>
                                            <td className="px-4 py-3 text-center text-sm font-medium text-sky-600">
                                                {med.quantity} {med.unit || "Viên"}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {[med.dosage, med.usage, med.frequency].filter(Boolean).join(" - ") || "Theo chỉ định"}
                                                {med.note && <div className="text-xs text-gray-400 italic mt-1">Lưu ý: {med.note}</div>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-gray-50 text-center text-gray-500 py-6 rounded-xl border border-dashed border-gray-300">
                            Không có thuốc được kê trong phiếu khám này.
                        </div>
                    )}
                </div>

               
            </div>
            
            <div className="flex justify-end  ">
                 {/* 5. TỔNG CỘNG */}
                {(visit.total_amount || visit.total_fee) > 0 && (
                    <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-200">
                        <CreditCard className="w-6 h-6 text-gray-400" />
                        <span className="text-gray-600 font-bold text-lg">Tổng thanh toán:</span>
                        <span className="text-2xl font-extrabold text-red-600">
                            {formatCurrency(visit.total_amount || visit.total_fee)}
                        </span>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default VisitDetailModal;