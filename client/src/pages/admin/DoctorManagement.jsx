import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react'; // Thêm Eye
import Modal from '../../components/admin/Modal';
import { initialMockDoctors, mockSpecialties } from "../../mocks/mockdata";

const DoctorManagement = () => {
    const [doctors, setDoctors] = useState(initialMockDoctors);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null); 
    const [formData, setFormData] = useState({});
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    // Thêm state cho Modal Xem Chi tiết
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingDoctor, setViewingDoctor] = useState(null);

    const specialtyMap = useMemo(() => new Map(mockSpecialties.map(s => [s.id, s.name])), []);

    // Xử lý Xem Chi tiết Bác sĩ
    const handleViewDoctor = (doctor) => {
        setViewingDoctor(doctor);
        setIsViewModalOpen(true);
    };

    const handleAddEdit = (doctor) => {
        setEditingDoctor(doctor);
        setFormData(doctor ? doctor : { 
            user_id: 'mock-u-' + Date.now().toString().slice(-6),
            fullName: '', 
            gender: 'male', 
            dob: '1990-01-01', 
            phone: '', 
            email: '', 
            address: '', 
            specialty_id: mockSpecialties[0].id, 
            status: 'active', 
            consultation_fee: 200000, 
        });
        setIsModalOpen(true);
    };

    const confirmDelete = (id) => {
        setConfirmDeleteId(id);
    };

    const handleDelete = () => {
        setDoctors(doctors.filter(doc => doc.id !== confirmDeleteId));
        setConfirmDeleteId(null);
    };

    const handleSave = (e) => {
        e.preventDefault();
        
        if (!formData.fullName || !formData.phone || !formData.specialty_id) {
            console.error('Lỗi: Vui lòng điền đầy đủ thông tin bắt buộc.');
            return;
        }

        const feeValue = parseInt(formData.consultation_fee, 10);
        
        if (editingDoctor) {
            setDoctors(doctors.map(doc => (doc.id === editingDoctor.id ? { ...doc, ...formData, consultation_fee: feeValue } : doc)));
        } else {
            const newDoctor = {
                ...formData,
                id: 'mock-d-' + Date.now().toString().slice(-6),
                consultation_fee: feeValue,
            };
            setDoctors([...doctors, newDoctor]);
        }
        setIsModalOpen(false);
        setEditingDoctor(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const getStatusStyle = (status) => {
        return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    }

    const getGenderVietnamese = (gender) => {
        switch (gender) {
            case 'male': return 'Nam';
            case 'female': return 'Nữ';
            default: return 'Khác';
        }
    }


    return (
        <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Quản Lý Bác Sĩ</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Danh Sách Bác Sĩ</h3>
                    <button 
                        onClick={() => handleAddEdit(null)}
                        className="flex items-center bg-indigo-600 text-white px-3 py-2 text-sm rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                        <Plus className="w-5 h-5 mr-1" /> Thêm Bác Sĩ
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Bác Sĩ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chuyên Khoa</th>
                                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phí Khám</th>
                                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            { doctors.map((doc) => (
                                <tr key={doc.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.fullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{specialtyMap.get(doc.specialty_id) || 'N/A'}</td>
                                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.consultation_fee.toLocaleString('vi-VN')} VNĐ</td>
                                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(doc.status)}`}>
                                            {doc.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center">
                                        {/* Nút Xem Chi tiết */}
                                        <button 
                                            onClick={() => handleViewDoctor(doc)}
                                            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition"
                                            title="Xem chi tiết Bác sĩ"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        {/* Nút Sửa */}
                                        <button 
                                            onClick={() => handleAddEdit(doc)}
                                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition ml-2"
                                            title="Chỉnh sửa thông tin Bác sĩ"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        {/* Nút Xóa */}
                                        <button 
                                            onClick={() => confirmDelete(doc.id)}
                                            className="text-red-600 hover:text-red-900 ml-2 p-1 rounded-md hover:bg-red-50 transition"
                                            title="Xóa Bác sĩ"
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

            {/* Modal Form cho Thêm/Sửa Bác Sĩ (Giữ nguyên) */}
            <Modal 
                title={editingDoctor ? 'Chỉnh Sửa Thông Tin Bác Sĩ' : 'Thêm Bác Sĩ Mới'} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
            >
                <form onSubmit={handleSave}>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-gray-700">Họ và Tên:</span>
                            <input 
                                type="text" 
                                name="fullName"
                                value={formData.fullName || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border"
                                required
                            />
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-gray-700">Chuyên Khoa:</span>
                                <select 
                                    name="specialty_id"
                                    value={formData.specialty_id || mockSpecialties[0].id}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border bg-white"
                                >
                                    {mockSpecialties.map(spec => (
                                        <option key={spec.id} value={spec.id}>{spec.name}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-gray-700">Giới Tính:</span>
                                <select 
                                    name="gender"
                                    value={formData.gender || 'male'}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border bg-white"
                                >
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </label>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <label className="block">
                                <span className="text-gray-700">SĐT:</span>
                                <input 
                                    type="text" 
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border"
                                    required
                                />
                            </label>
                            <label className="block">
                                <span className="text-gray-700">Email:</span>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border"
                                />
                            </label>
                            <label className="block">
                                <span className="text-gray-700">Phí Khám (VNĐ):</span>
                                <input 
                                    type="number" 
                                    name="consultation_fee"
                                    value={formData.consultation_fee || 0}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border"
                                    min="0"
                                />
                            </label>
                        </div>
                        <label className="block">
                            <span className="text-gray-700">Địa chỉ:</span>
                            <input 
                                type="text" 
                                name="address"
                                value={formData.address || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border"
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700">Trạng Thái:</span>
                            <select 
                                name="status"
                                value={formData.status || 'active'}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border bg-white"
                            >
                                <option value="active">Hoạt động (active)</option>
                                <option value="inactive">Tạm dừng (inactive)</option>
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

            {/* Modal Xác nhận Xóa (Giữ nguyên) */}
            <Modal
                title="Xác nhận Xóa Bác Sĩ"
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                className="max-w-sm"
            >
                <p className="text-gray-700 mb-6">Bạn có chắc chắn muốn xóa bác sĩ này? Hành động này sẽ ảnh hưởng đến các lịch hẹn đã đặt.</p>
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
            
            {/* Modal Xem Chi tiết Bác Sĩ (MỚI) */}
            <Modal
                title={`Chi Tiết Bác Sĩ: ${viewingDoctor?.fullName || ''}`}
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                className="max-w-xl"
            >
                {viewingDoctor && (
                    <div className="space-y-4 text-gray-700">
                        <div className="grid grid-cols-2 gap-4 border-b pb-3">
                            <div>
                                <p className="text-sm font-semibold">Chuyên Khoa:</p>
                                <p className="text-md font-medium text-indigo-600">
                                    {specialtyMap.get(viewingDoctor.specialty_id) || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Phí Khám:</p>
                                <p className="text-md font-medium">
                                    {viewingDoctor.consultation_fee.toLocaleString('vi-VN')} VNĐ
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-semibold">Giới Tính:</p>
                                <p>{getGenderVietnamese(viewingDoctor.gender)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Ngày Sinh:</p>
                                <p>{viewingDoctor.dob}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-semibold">SĐT:</p>
                                <p>{viewingDoctor.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Email:</p>
                                <p>{viewingDoctor.email}</p>
                            </div>
                        </div>
                        <div className="border-t pt-3 mt-4">
                            <p className="text-sm font-semibold">Địa Chỉ:</p>
                            <p>{viewingDoctor.address}</p>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-semibold">Trạng Thái:</p>
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(viewingDoctor.status)}`}>
                                {viewingDoctor.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                            </span>
                        </div>
                    </div>
                )}
            </Modal>
            
        </main>
    );
};

export default DoctorManagement;