// src/pages/admin/SpecialtyManagement.jsx
import React, { useState, useEffect } from 'react';
import specialtyService from '../../services/SpecialtyService'; 

// Import components con
import SpecialtyList from './../../components/admin/specialty/SpecialtyList';
import SpecialtyFormModal from './../../components/admin/specialty/SpecialtyFormModal';
import SpecialtyDoctorsModal from './../../components/admin/specialty/SpecialtyDoctorsModal';
import SpecialtyDeleteModal from './../../components/admin/specialty/SpecialtyDeleteModal';


const SpecialtyManagement = () => {
    // --- State Dữ liệu và Loading ---
    const [specialtys, setSpecialtys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- State Modal Form ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSpecialty, setEditingSpecialty] = useState(null); 
    const [formData, setFormData] = useState({});
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    // --- State View Doctors ---
    const [isViewDoctorsModalOpen, setIsViewDoctorsModalOpen] = useState(false);
    const [currentSpecialtyDoctors, setCurrentSpecialtyDoctors] = useState({
        specialtyName: '',
        doctors: [],
    });
    const [isViewDoctorsLoading, setIsViewDoctorsLoading] = useState(false);


    // === LOGIC FETCH & CRUD API (đã được định nghĩa ở context trước) ===
    const fetchSpecialties = async () => {
        setLoading(true);
        try {
            const response = await specialtyService.getAllSpecialties();
            const list = response.data?.specialties || response.data || [];
            setSpecialtys(list);
            setError(null);
        } catch (err) {
            console.error("Lỗi tải chuyên khoa:", err);
            setError("Không thể tải danh sách chuyên khoa.");
        } finally {
            setLoading(false);
        }
    };

    // Gọi API khi component mount
    useEffect(() => { 
        fetchSpecialties(); 
    }, []);


    // === 2. HÀM INPUT & ADD/EDIT (Đã khôi phục) ===
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddEdit = (specialty) => {
        setEditingSpecialty(specialty);
        // Khởi tạo formData với các trường cần thiết
        setFormData(specialty ? 
            { _id: specialty._id || specialty.id, name: specialty.name, code: specialty.code || '' } : 
            { name: '', code: '' }
        );
        setIsModalOpen(true);
    };

    const handleSave = async (e) => { 
        e.preventDefault();
        
        if (!formData.name) {
            alert('Vui lòng điền tên chuyên khoa.');
            return;
        }
        
        try {
            if (editingSpecialty) {
                // SỬA
                await specialtyService.updateSpecialty(editingSpecialty._id || editingSpecialty.id, formData);
                alert("Cập nhật chuyên khoa thành công!");
            } else {
                // THÊM MỚI
                await specialtyService.createSpecialty(formData);
                alert("Thêm chuyên khoa thành công!");
            }
        } catch (err) {
            alert("Lỗi lưu: " + (err.response?.data?.error || "Lỗi không xác định"));
            console.error("Lỗi lưu chuyên khoa:", err);
        } finally {
            setIsModalOpen(false);
            setEditingSpecialty(null);
            fetchSpecialties(); // Refresh danh sách
        }
    };

    // === 3. DELETE LOGIC (Đã khôi phục) ===
    const confirmDelete = (id) => setConfirmDeleteId(id);

    const handleDelete = async () => {
        try {
            await specialtyService.deleteSpecialty(confirmDeleteId);
            setConfirmDeleteId(null);
            alert("Xóa chuyên khoa thành công!");
        } catch (err) {
            alert("Xóa thất bại: " + (err.response?.data?.error || "Lỗi không xác định"));
        } finally {
            fetchSpecialties(); // Refresh danh sách
        }
    };
    
    // === 4. VIEW DOCTORS LOGIC (Giữ nguyên) ===
    const handleViewDoctors = async (specialty) => {
        setIsViewDoctorsLoading(true);
        setIsViewDoctorsModalOpen(true);
        setCurrentSpecialtyDoctors({
            specialtyName: specialty.name,
            doctors: [],
        });
        
        try {
            const response = await specialtyService.getSpecialtyWithDoctors(specialty._id || specialty.id);
            const doctorsList = response.data?.doctors || [];
            
            setCurrentSpecialtyDoctors({
                specialtyName: response.data?.name || specialty.name,
                doctors: doctorsList,
            });
        } catch (err) {
            console.error("Lỗi tải danh sách bác sĩ:", err);
            alert("Lỗi: Không thể tải danh sách bác sĩ thuộc chuyên khoa này.");
        } finally {
            setIsViewDoctorsLoading(false);
        }
    };
    // =================================================================

    // --- Hiển thị Loading/Error ---
    if (loading)
        return (
            <main className="text-center p-8 text-xl">Đang tải danh sách chuyên khoa...</main>
        );
    if (error)
        return (
            <main className="text-center p-8 text-red-600 text-xl">Lỗi: {error}</main>
        );
    // =================================================================


    return (
        <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Quản Lý Chuyên Khoa</h2>
            
            <SpecialtyList 
                specialtys={specialtys} 
                handleAddEdit={handleAddEdit}
                confirmDelete={confirmDelete}
                handleViewDoctors={handleViewDoctors}
            />

            {/* Modal Form Thêm/Sửa */}
            <SpecialtyFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                formData={formData}
                handleInputChange={handleInputChange}
                handleSave={handleSave}
                editingSpecialty={editingSpecialty}
            />

            {/* Modal Xem Danh Sách Bác Sĩ */}
            <SpecialtyDoctorsModal
                isOpen={isViewDoctorsModalOpen}
                onClose={() => setIsViewDoctorsModalOpen(false)}
                currentSpecialtyDoctors={currentSpecialtyDoctors}
                isLoading={isViewDoctorsLoading}
                doctorCount={currentSpecialtyDoctors.doctors.length}
            />
            
            {/* Modal Xác nhận Xóa */}
            <SpecialtyDeleteModal
                confirmDeleteId={confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                handleDelete={handleDelete}
            />
        </main>
    );
};

export default SpecialtyManagement;