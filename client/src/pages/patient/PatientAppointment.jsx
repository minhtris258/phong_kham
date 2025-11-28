import React, { useEffect, useState } from "react";
import appointmentsService from "../../services/AppointmentsService";
import { Calendar, Clock, MapPin, User, AlertCircle, CheckCircle, XCircle, FileText } from "lucide-react"; 
import { toastSuccess, toastError,toastWarning } from "../../utils/toast";
import { useNavigate } from "react-router-dom"; 

const PatientAppointment = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); 

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await appointmentsService.myAppointments();
            const body = response && response.data ? response.data : response;
            const dataArray = body && body.data ? body.data : body;

            if (Array.isArray(dataArray)) {
                setAppointments(dataArray);
            } else {
                setAppointments([]); 
            }

        } catch (error) {
            console.error("❌ Lỗi tải lịch khám:", error);
            toastError("Không thể tải danh sách lịch khám.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này không?")) {
            try {
                await appointmentsService.cancelAppointment(id);
                toastSuccess("Hủy lịch hẹn thành công!");
                fetchAppointments(); 
            } catch (error) {
                console.error("Lỗi hủy lịch:", error);
                toastError(error.response?.data?.message || "Hủy lịch thất bại.");
            }
        }
    };

    // --- SỬA ĐỔI Ở ĐÂY: ĐIỀU HƯỚNG RA TRANG RIÊNG ---
    const handleViewVisit = (appointmentId) => {
        navigate(`/visit-detail/${appointmentId}`);
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
            case 'approved':
                return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium"><CheckCircle size={14} /> Đã xác nhận</span>;
            case 'pending':
                return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm font-medium"><Clock size={14} /> Chờ xác nhận</span>;
            case 'cancelled':
                return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium"><XCircle size={14} /> Đã hủy</span>;
            case 'completed':
                return <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium"><CheckCircle size={14} /> Đã khám</span>;
            default:
                return <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm">{status}</span>;
        }
    };

    const renderReason = (reason) => {
        if (!reason) return "Không có ghi chú";
        return reason.length > 50 ? reason.substring(0, 50) + "..." : reason;
    }

    if (loading) {
        return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div></div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-full">
            <div className="px-6 py-5 border-b border-gray-100 bg-white">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="text-indigo-600" /> Lịch Khám Bệnh
                </h3>
                <p className="text-sm text-gray-500 mt-1">Danh sách các cuộc hẹn khám bệnh của bạn</p>
            </div>

            <div className="p-6">
                {appointments.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
                        <p>Bạn chưa có lịch khám nào.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appointments.map((apt) => (
                            <div key={apt._id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition bg-white">
                                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <h4 className="text-lg font-bold text-gray-900">
                                                BS. {apt.doctor_id?.fullName || "Bác sĩ"}
                                            </h4>
                                            {getStatusBadge(apt.status)}
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-gray-600 mt-3">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-indigo-500" />
                                                <span>Ngày: <span className="font-medium text-gray-800">{new Date(apt.date).toLocaleDateString('vi-VN')}</span></span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-indigo-500" />
                                                <span>Giờ: <span className="font-medium text-gray-800">{apt.start}</span></span>
                                            </div>
                                            
                                            {apt.doctor_id?.specialty && (
                                                <div className="flex items-center gap-2">
                                                    <User size={16} className="text-indigo-500" />
                                                    <span>Chuyên khoa: {apt.doctor_id.specialty}</span>
                                                </div>
                                            )}
                                            
                                             <div className="flex items-start gap-2 col-span-1 sm:col-span-2">
                                                <AlertCircle size={16} className="text-indigo-500 mt-0.5" />
                                                <span className="text-gray-500 italic">Ghi chú: {renderReason(apt.reason)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 items-end">
                                        {(apt.status === 'pending' || apt.status === 'confirmed') && (
                                            <button 
                                                onClick={() => handleCancel(apt._id)}
                                                className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition whitespace-nowrap"
                                            >
                                                Hủy lịch
                                            </button>
                                        )}

                                        {apt.status === 'completed' && (
                                            <button 
                                                onClick={() => handleViewVisit(apt._id)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg font-medium transition whitespace-nowrap shadow-sm"
                                            >
                                                <FileText size={16} /> Xem kết quả
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientAppointment;