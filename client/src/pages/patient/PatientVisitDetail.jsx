import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import visitService from "../../services/VisitService";
import { 
    FileText, ArrowLeft, Stethoscope, Pill, Receipt, Calendar, User, Activity 
} from "lucide-react";

const PatientVisitDetail = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [visit, setVisit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (appointmentId) {
            fetchVisitDetail();
        }
    }, [appointmentId]);

    const fetchVisitDetail = async () => {
        try {
            setLoading(true);
            setError(null); 
            
            // Gọi API lấy thông tin khám dựa trên Appointment ID
            const response = await visitService.getVisitByAppointment(appointmentId);
            
            // Xử lý dữ liệu trả về an toàn
            // API có thể trả về: { data: { visit: {...} } } hoặc { visit: {...} } hoặc trực tiếp {...}
            const rawData = response && response.data ? response.data : response;
            
            // Tìm đúng object visit
            let visitData = null;
            if (Array.isArray(rawData)) {
                visitData = rawData[0];
            } else if (rawData.visit) {
                visitData = rawData.visit;
            } else {
                visitData = rawData;
            }

            if (visitData && visitData._id) {
                setVisit(visitData);
            } else {
                setError("Chưa tìm thấy hồ sơ khám bệnh cho lịch hẹn này.");
            }
        } catch (err) {
            console.error("Lỗi tải chi tiết khám:", err);
            if (err.response && err.response.status === 404) {
                 setError("Bác sĩ chưa cập nhật hồ sơ khám bệnh cho cuộc hẹn này.");
            } else {
                 setError("Đã có lỗi xảy ra khi tải dữ liệu.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Helper: Định dạng tiền tệ an toàn
    const formatCurrency = (amount) => {
        return (Number(amount) || 0).toLocaleString('vi-VN');
    };

    // Helper: Định dạng ngày an toàn
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch {
            return "N/A";
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500 mb-4"></div>
                <p className="text-gray-500">Đang tải kết quả khám...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center mt-8 mx-auto max-w-lg">
                <div className="bg-red-50 text-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Thông báo</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button 
                    onClick={() => navigate(-1)}
                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    if (!visit) return null;

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto py-6 px-4 mt-20 ">
            {/* Header: Nút quay lại & Tiêu đề */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600"
                    title="Quay lại"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="text-indigo-600" /> Kết Quả Khám Bệnh
                    </h2>
                    <p className="text-sm text-gray-500">
                        Mã hồ sơ: <span className="font-mono text-gray-700">#{visit._id ? visit._id.slice(-8).toUpperCase() : '---'}</span> • 
                        Ngày khám: {formatDate(visit.createdAt)}
                    </p>
                </div>
            </div>

            {/* Grid thông tin */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* CỘT TRÁI: THÔNG TIN KHÁM (Chiếm 2 phần) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* 1. Chẩn đoán lâm sàng */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-indigo-50/50 flex items-center gap-2">
                            <Stethoscope className="text-indigo-600" size={20} />
                            <h3 className="font-bold text-gray-800">Chẩn đoán & Triệu chứng</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Triệu chứng</label>
                                <p className="text-gray-800 text-lg font-medium mt-1">{visit.symptoms || "Không ghi nhận"}</p>
                            </div>
                            <div className="border-t border-dashed my-2 pt-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Chẩn đoán kết luận</label>
                                <p className="text-indigo-700 text-lg font-bold mt-1">{visit.diagnosis || "Chưa có chẩn đoán"}</p>
                            </div>
                             {visit.notes && (
                                <div className="border-t border-dashed my-2 pt-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Ghi chú bác sĩ</label>
                                    <p className="text-gray-600 mt-1 italic">{visit.notes}</p>
                                </div>
                            )}
                             {visit.advice && (
                                <div className="border-t border-dashed my-2 pt-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Lời dặn</label>
                                    <p className="text-gray-600 mt-1 italic">{visit.advice}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Đơn thuốc */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-green-50/50 flex items-center gap-2">
                            <Pill className="text-green-600" size={20} />
                            <h3 className="font-bold text-gray-800">Đơn thuốc</h3>
                        </div>
                        <div className="p-0">
                            {visit.prescriptions && visit.prescriptions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                                            <tr>
                                                <th className="px-6 py-3 font-semibold">Tên thuốc</th>
                                                <th className="px-6 py-3 font-semibold">Liều lượng</th>
                                                <th className="px-6 py-3 font-semibold">Tần suất</th>
                                                <th className="px-6 py-3 font-semibold">Thời gian</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {visit.prescriptions.map((drug, index) => (
                                                <tr key={index} className="hover:bg-gray-50/50">
                                                    <td className="px-6 py-4 font-medium text-gray-800">{drug.drug || drug.name}</td>
                                                    <td className="px-6 py-4 text-gray-600">{drug.dosage || "-"}</td>
                                                    <td className="px-6 py-4 text-gray-600">{drug.frequency || "-"}</td>
                                                    <td className="px-6 py-4 text-gray-600">{drug.duration || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-6 text-center text-gray-500 italic">Không có đơn thuốc.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: CHI PHÍ (Chiếm 1 phần) */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                        <div className="px-6 py-4 border-b border-gray-100 bg-orange-50/50 flex items-center gap-2">
                            <Receipt className="text-orange-600" size={20} />
                            <h3 className="font-bold text-gray-800">Chi phí khám</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                {/* Phí khám cơ bản */}
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Phí khám bệnh</span>
                                    <span className="font-medium text-gray-900">
                                        {formatCurrency(visit.consultation_fee_snapshot)} đ
                                    </span>
                                </div>

                                {/* Các dịch vụ thêm (Bill Items) */}
                                {visit.bill_items && visit.bill_items.length > 0 && visit.bill_items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">
                                            {item.name} <span className="text-xs text-gray-400">x{item.quantity || 1}</span>
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {formatCurrency(item.price)} đ
                                        </span>
                                    </div>
                                ))}

                                {/* Đường kẻ tổng */}
                                <div className="border-t border-dashed border-gray-200 my-3"></div>

                                {/* Tổng cộng */}
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-800">Tổng cộng</span>
                                    <span className="font-bold text-xl text-indigo-600">
                                        {formatCurrency(visit.total_amount)} đ
                                    </span>
                                </div>
                            </div>
                            
                            <div className="mt-6">
                                <button className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition text-sm">
                                    Tải hóa đơn (PDF)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PatientVisitDetail;