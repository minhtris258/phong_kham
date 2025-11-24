// src/pages/admin/SpecialtyManagement.jsx
import React, { useState, useEffect } from 'react';
import specialtyService from '../../services/SpecialtyService'; 

// Import components con
import SpecialtyList from './../../components/admin/specialty/SpecialtyList';
import SpecialtyFormModal from './../../components/admin/specialty/SpecialtyFormModal';
import SpecialtyDoctorsModal from './../../components/admin/specialty/SpecialtyDoctorsModal';
import SpecialtyDeleteModal from './../../components/admin/specialty/SpecialtyDeleteModal';


const SpecialtyManagement = () => {
    // ... (Giữ nguyên các State cũ) ...
    const [specialtys, setSpecialtys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSpecialty, setEditingSpecialty] = useState(null); 
    const [formData, setFormData] = useState({});
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const [isViewDoctorsModalOpen, setIsViewDoctorsModalOpen] = useState(false);
    const [currentSpecialtyDoctors, setCurrentSpecialtyDoctors] = useState({ specialtyName: '', doctors: [] });
    const [isViewDoctorsLoading, setIsViewDoctorsLoading] = useState(false);

    // === LOGIC FETCH (Giữ nguyên) ===
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

    useEffect(() => { 
        fetchSpecialties(); 
    }, []);


    // === 2. HÀM INPUT & ADD/EDIT (CÓ SỬA ĐỔI) ===
    
    // 1. Xử lý Input Text thông thường
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // 2. [MỚI] Xử lý Input File (Chuyển sang Base64)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file); // Đọc file dưới dạng chuỗi Base64
            reader.onloadend = () => {
                // Khi đọc xong, set vào formData.thumbnail
                setFormData(prev => ({
                    ...prev,
                    thumbnail: reader.result
                }));
            };
        }
    };

    const handleAddEdit = (specialty) => {
        setEditingSpecialty(specialty);
        // Khởi tạo formData (thêm trường thumbnail)
        setFormData(specialty ? 
            { 
                _id: specialty._id || specialty.id, 
                name: specialty.name, 
                thumbnail: specialty.thumbnail || '' // Load ảnh cũ nếu có
            } : 
            { name: '', thumbnail: '' }
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
                // SỬA: formData bây giờ chứa cả name và thumbnail (nếu có thay đổi)
                await specialtyService.updateSpecialty(editingSpecialty._id || editingSpecialty.id, formData);
                alert("Cập nhật chuyên khoa thành công!");
            } else {
                // THÊM MỚI
                await specialtyService.createSpecialty(formData);
                alert("Thêm chuyên khoa thành công!");
            }
        } catch (err) {
            alert("Lỗi lưu: " + (err.response?.data?.message || err.message || "Lỗi không xác định"));
            console.error("Lỗi lưu chuyên khoa:", err);
        } finally {
            setIsModalOpen(false);
            setEditingSpecialty(null);
            fetchSpecialties(); 
        }
    };

    // === 3. DELETE LOGIC (Giữ nguyên) ===
    const confirmDelete = (id) => setConfirmDeleteId(id);

    const handleDelete = async () => {
        try {
            await specialtyService.deleteSpecialty(confirmDeleteId);
            setConfirmDeleteId(null);
            alert("Xóa chuyên khoa thành công!");
        } catch (err) {
            alert("Xóa thất bại: " + (err.response?.data?.error || "Lỗi không xác định"));
        } finally {
            fetchSpecialties();
        }
    };
    
    // === 4. VIEW DOCTORS LOGIC (Giữ nguyên) ===
    const handleViewDoctors = async (specialty) => {
        setIsViewDoctorsLoading(true);
        setIsViewDoctorsModalOpen(true);
        setCurrentSpecialtyDoctors({ specialtyName: specialty.name, doctors: [] });
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

    // ... (Phần Loading/Error giữ nguyên) ...

    if (loading) return <main className="text-center p-8 text-xl">Đang tải danh sách chuyên khoa...</main>;
    if (error) return <main className="text-center p-8 text-red-600 text-xl">Lỗi: {error}</main>;

    return (
        <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Quản Lý Chuyên Khoa</h2>
            
            <SpecialtyList 
                specialtys={specialtys} 
                handleAddEdit={handleAddEdit}
                confirmDelete={confirmDelete}
                handleViewDoctors={handleViewDoctors}
            />

            {/* Truyền thêm prop handleFileChange */}
            <SpecialtyFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                formData={formData}
                handleInputChange={handleInputChange}
                handleFileChange={handleFileChange} // <-- Mới
                handleSave={handleSave}
                editingSpecialty={editingSpecialty}
            />

            <SpecialtyDoctorsModal
                isOpen={isViewDoctorsModalOpen}
                onClose={() => setIsViewDoctorsModalOpen(false)}
                currentSpecialtyDoctors={currentSpecialtyDoctors}
                isLoading={isViewDoctorsLoading}
                doctorCount={currentSpecialtyDoctors.doctors.length}
            />
            
            <SpecialtyDeleteModal
                confirmDeleteId={confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                handleDelete={handleDelete}
            />
        </main>
    );
};

export default SpecialtyManagement;