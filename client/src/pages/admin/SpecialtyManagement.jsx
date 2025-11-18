import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import Modal from '../../components/admin/Modal';
import { initialMockSpecialtys, initialMockDoctors } from "../../mocks/mockdata"; 

const SpecialtyManagement = () => {
    const [specialtys, setSpecialtys] = useState(initialMockSpecialtys);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSpecialty, setEditingSpecialty] = useState(null); 
    const [formData, setFormData] = useState({});
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    // ********** LOGIC MỚI CHO VIEW DOCTORS **********
    const [isViewDoctorsModalOpen, setIsViewDoctorsModalOpen] = useState(false);
    const [currentSpecialtyDoctors, setCurrentSpecialtyDoctors] = useState({
        specialtyName: '',
        doctors: [],
    });

    const handleViewDoctors = (specialty) => {
        // Lọc danh sách bác sĩ dựa trên specialty_id (đã sửa theo mockdata mới)
        const doctorsInSpecialty = initialMockDoctors.filter(
            doc => doc.specialty_id === specialty.id
        );

        setCurrentSpecialtyDoctors({
            specialtyName: specialty.name,
            doctors: doctorsInSpecialty,
        });
        setIsViewDoctorsModalOpen(true);
    };
    // ************************************************

    const handleAddEdit = (specialty) => {
        setEditingSpecialty(specialty);
        setFormData(specialty ? { id: specialty.id, name: specialty.name } : {
            name: '',
        });
        setIsModalOpen(true);
    };

    const confirmDelete = (id) => {
        setConfirmDeleteId(id);
    };

    const handleDelete = () => {
        setSpecialtys(specialtys.filter(s => s.id !== confirmDeleteId));
        setConfirmDeleteId(null);
    };

    const handleSave = (e) => {
        e.preventDefault();
        
        if (!formData.name) {
            console.error('Lỗi: Vui lòng điền tên chuyên khoa.');
            return;
        }

        if (editingSpecialty) {
            setSpecialtys(specialtys.map(s => (s.id === editingSpecialty.id ? { ...s, name: formData.name } : s)));
        } else {
            const newSpecialty = {
                id: 'mock-s-' + Date.now().toString().slice(-6),
                name: formData.name,
                doctorCount: 0, 
            };
            setSpecialtys([...specialtys, newSpecialty]);
        }
        setIsModalOpen(false);
        setEditingSpecialty(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Quản Lý Chuyên Khoa</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Danh Sách Chuyên Khoa</h3>
                    <button 
                        onClick={() => handleAddEdit(null)}
                        className="flex items-center bg-indigo-600 text-white px-3 py-2 text-sm rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                        <Plus className="w-5 h-5 mr-1" /> Thêm Chuyên Khoa
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Chuyên Khoa</th>
                                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số Bác Sĩ</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            { specialtys.map((s, index) => (
                                <tr key={s.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.name}</td>
                                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.doctorCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center">
                                        
                                        {/* Nút Xem Bác sĩ */}
                                        <button 
                                            onClick={() => handleViewDoctors(s)}
                                            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition"
                                            title="Xem danh sách Bác sĩ"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        {/* Nút Sửa */}
                                        <button 
                                            onClick={() => handleAddEdit(s)}
                                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition ml-2"
                                            title="Chỉnh sửa Chuyên khoa"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        
                                        {/* Nút Xóa */}
                                        <button 
                                            onClick={() => confirmDelete(s.id)}
                                            className="text-red-600 hover:text-red-900 ml-2 p-1 rounded-md hover:bg-red-50 transition"
                                            title="Xóa Chuyên khoa"
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

            {/* Modal Form cho Thêm/Sửa Chuyên khoa (ĐÃ KHÔI PHỤC NỘI DUNG) */}
            <Modal 
                title={editingSpecialty ? 'Chỉnh Sửa Chuyên Khoa' : 'Thêm Chuyên Khoa Mới'} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
            >
                <form onSubmit={handleSave}>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-gray-700">Tên Chuyên Khoa:</span>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name || ''} 
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border"
                                required
                            />
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
                title="Xác nhận Xóa Chuyên Khoa"
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                className="max-w-sm"
            >
                <p className="text-gray-700 mb-6">Bạn có chắc chắn muốn xóa chuyên khoa này khỏi hệ thống?</p>
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
            
            {/* Modal Xem Danh Sách Bác Sĩ (Giữ nguyên) */}
            <Modal
                title={`Danh Sách Bác Sĩ Chuyên Khoa ${currentSpecialtyDoctors.specialtyName}`}
                isOpen={isViewDoctorsModalOpen}
                onClose={() => setIsViewDoctorsModalOpen(false)}
                className="max-w-2xl"
            >
                {currentSpecialtyDoctors.doctors.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200 mt-4 border border-gray-100 rounded-lg">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Bác Sĩ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liên Hệ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentSpecialtyDoctors.doctors.map(doctor => (
                                <tr key={doctor.id}>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.fullName}</td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{doctor.phone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-600 py-4">Chuyên khoa này hiện chưa có bác sĩ nào được chỉ định.</p>
                )}
            </Modal>
        </main>
    );
};

export default SpecialtyManagement;