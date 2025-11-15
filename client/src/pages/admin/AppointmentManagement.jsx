import React, { useState } from 'react';
import { Calendar, Plus, Edit, Trash2, List } from 'lucide-react';
import Modal from '../../components/admin/Modal';
import AppointmentCalendar from './AppointmentCalendar';
import { initialMockAppointments, initialMockPatients, initialMockDoctors, mockSpecialties, MOCK_IDS } from '../../mocks/mockdata';
import { useMemo } from 'react';

const AppointmentManagement = () => {
    const [appointments, setAppointments] = useState(initialMockAppointments);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null); 
    const [formData, setFormData] = useState({});
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [selectedDayAppointments, setSelectedDayAppointments] = useState(null);

    // Mappings
    const patientMap = useMemo(() => new Map(initialMockPatients.map(p => [p.id, p])), []);
    const doctorMap = useMemo(() => new Map(initialMockDoctors.map(d => [d.id, d])), []);

    // Tìm tên Bác sĩ từ ID
    const getDoctorName = (doctorId) => {
        const doctor = doctorMap.get(doctorId);
        const specialty = mockSpecialties.find(s => s.id === doctor?.specialty_id)?.name;
        return doctor ? `${doctor.fullName} (${specialty || 'Chưa rõ'})` : 'Chưa xác định';
    };
    
    // Tìm tên Bệnh nhân từ ID
    const getPatientName = (patientId) => {
        const patient = patientMap.get(patientId);
        return patient ? patient.fullName : 'Chưa xác định';
    };


    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleAddEdit = (appointment) => {
        setEditingAppointment(appointment);
        setFormData(appointment ? appointment : { patient_id: MOCK_IDS.patients.p1, doctor_id: MOCK_IDS.doctors.d1, date: new Date().toISOString().split('T')[0], start: '09:00', reason: '', status: 'pending' });
        setIsModalOpen(true);
    };

    const confirmDelete = (id) => {
        setConfirmDeleteId(id);
    };

    const handleDelete = () => {
        setAppointments(appointments.filter(app => app.id !== confirmDeleteId));
        setConfirmDeleteId(null);
    };

    const handleSave = (e) => {
        e.preventDefault();
        
        if (!formData.patient_id || !formData.date || !formData.start) {
            console.error('Lỗi: Vui lòng điền đầy đủ thông tin bắt buộc.');
            return;
        }

        if (editingAppointment) {
            setAppointments(appointments.map(app => (app.id === editingAppointment.id ? { ...app, ...formData } : app)));
        } else {
            const newAppointment = {
                ...formData,
                id: 'mock-a-' + Date.now().toString().slice(-6),
                timeslot_id: 'mock-ts-' + Date.now().toString().slice(-6), // Giả lập Timeslot ID
            };
            setAppointments([...appointments, newAppointment]);
        }
        setIsModalOpen(false);
        setEditingAppointment(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDateSelection = (dateString, selectedApps) => {
        setSelectedDayAppointments({ date: dateString, apps: selectedApps });
    };

    return (
        <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Quản Lý Lịch Hẹn</h2>
            
            {/* Mobile View Toggle */}
            <div className="lg:hidden flex justify-center space-x-4 mb-6">
                <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center px-4 py-2 rounded-lg font-semibold transition ${
                        viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                >
                    <List className="w-5 h-5 mr-2" /> Danh sách
                </button>
                <button
                    onClick={() => setViewMode('calendar')}
                    className={`flex items-center px-4 py-2 rounded-lg font-semibold transition ${
                        viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                >
                    <Calendar className="w-5 h-5 mr-2" /> Lịch
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lịch Hẹn - Hiển thị 1/3 trên desktop, toàn bộ trên mobile khi viewMode là calendar */}
                <div className={`lg:col-span-1 ${viewMode === 'list' && 'hidden lg:block'}`}>
                    <AppointmentCalendar 
                        appointments={appointments}
                        currentMonth={currentMonth}
                        setCurrentMonth={setCurrentMonth}
                        onSelectDate={handleDateSelection}
                    />
                </div>

                {/* Danh sách Lịch Hẹn - Hiển thị 2/3 trên desktop, toàn bộ trên mobile khi viewMode là list */}
                <div className={`lg:col-span-2 ${viewMode === 'calendar' && 'hidden lg:block'}`}>
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">
                                {selectedDayAppointments ? `Lịch Hẹn Ngày ${selectedDayAppointments.date.split('-').reverse().join('/')}` : 'Danh Sách Lịch Hẹn'}
                            </h3>
                            <button 
                                onClick={() => handleAddEdit(null)}
                                className="flex items-center bg-indigo-600 text-white px-3 py-2 text-sm rounded-lg font-semibold hover:bg-indigo-700 transition"
                            >
                                <Plus className="w-5 h-5 mr-1" /> Thêm
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bệnh Nhân</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bác Sĩ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời Gian</th>
                                        <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lý Do</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    { (selectedDayAppointments ? selectedDayAppointments.apps : appointments).map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getPatientName(app.patient_id)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getDoctorName(app.doctor_id)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.start} - {app.date}</td>
                                            <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{app.reason}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(app.status)}`}>
                                                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button 
                                                    onClick={() => handleAddEdit(app)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => confirmDelete(app.id)}
                                                    className="text-red-600 hover:text-red-900 ml-2 p-1 rounded-md hover:bg-red-50 transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Form cho Thêm/Sửa Lịch Hẹn */}
            <Modal 
                title={editingAppointment ? 'Chỉnh Sửa Lịch Hẹn' : 'Thêm Lịch Hẹn Mới'} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
            >
                <form onSubmit={handleSave}>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-gray-700">Bệnh Nhân:</span>
                            <select 
                                name="patient_id"
                                value={formData.patient_id || MOCK_IDS.patients.p1}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border bg-white"
                            >
                                {initialMockPatients.map(p => (
                                    <option key={p.id} value={p.id}>{p.fullName} ({p.phone})</option>
                                ))}
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-gray-700">Bác Sĩ:</span>
                            <select 
                                name="doctor_id"
                                value={formData.doctor_id || MOCK_IDS.doctors.d1}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border bg-white"
                            >
                                {initialMockDoctors.map(doctor => (
                                    <option key={doctor.id} value={doctor.id}>{getDoctorName(doctor.id)}</option>
                                ))}
                            </select>
                        </label>
                        <div className="flex space-x-4">
                            <label className="block w-1/2">
                                <span className="text-gray-700">Ngày Hẹn:</span>
                                <input 
                                    type="date" 
                                    name="date"
                                    value={formData.date || new Date().toISOString().split('T')[0]}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border"
                                    required
                                />
                            </label>
                            <label className="block w-1/2">
                                <span className="text-gray-700">Giờ Hẹn:</span>
                                <input 
                                    type="time" 
                                    name="start"
                                    value={formData.start || '09:00'}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border"
                                    required
                                />
                            </label>
                        </div>
                        <label className="block">
                            <span className="text-gray-700">Lý Do Khám:</span>
                            <textarea
                                name="reason"
                                value={formData.reason || ''}
                                onChange={handleInputChange}
                                rows="2"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border"
                            ></textarea>
                        </label>
                        <label className="block">
                            <span className="text-gray-700">Trạng Thái:</span>
                            <select 
                                name="status"
                                value={formData.status || 'pending'}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border bg-white"
                            >
                                <option value="pending">Đang chờ (Pending)</option>
                                <option value="confirmed">Đã xác nhận (Confirmed)</option>
                                <option value="completed">Đã hoàn thành (Completed)</option>
                                <option value="cancelled">Đã hủy (Cancelled)</option>
                            </select>
                        </label>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                        >
                            Lưu
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Xác nhận Xóa */}
            <Modal
                title="Xác nhận Xóa Lịch Hẹn"
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                className="max-w-sm"
            >
                <p className="text-gray-700 mb-6">Bạn có chắc chắn muốn xóa lịch hẹn này? Hành động này không thể hoàn tác.</p>
                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                    >
                        Xóa
                    </button>
                </div>
            </Modal>
        </main>
    );
};
export default AppointmentManagement;