// src/pages/admin/DoctorManagement.jsx
import React, { useState, useMemo, useEffect } from "react";
import doctorService from "../../services/DoctorService";
// ... giữ nguyên các imports khác ...
import { toastSuccess, toastError, toastWarning } from "../../utils/toast";
import DoctorList from "./../../components/admin/doctor/DoctorList";
import DoctorAddModal from "../../components/admin/doctor/DoctorAddModal";
import DoctorScheduleAdminModal from "../../components/admin/doctor/DoctorScheduleAdminModal";
import DoctorEditModal from "../../components/admin/doctor/DoctorEditModal";
import DoctorViewModal from "./../../components/admin/doctor/DoctorViewModal";
import DoctorDeleteModal from "./../../components/admin/doctor/DoctorDeleteModal";
import { mockSpecialties } from "../../mocks/mockdata";

const DoctorManagement = () => {
  // === State Dữ liệu ===
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === State Phân trang & Filter ===
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalDocs: 0
  });
  const [filters, setFilters] = useState({
    search: "",
    specialty: "", // Lọc theo ID chuyên khoa
    status: "" // Lọc theo trạng thái
  });

  // === State Modal (Giữ nguyên) ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingDoctor, setViewingDoctor] = useState(null);
  const [isImagePending, setIsImagePending] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDoctor, setScheduleDoctor] = useState(null);
  
  // === Data Chuyên khoa ===
  const [specialties, setSpecialties] = useState([]);
  
  const specialtyMap = useMemo(() => {
    // FIX: Kiểm tra nếu specialties là mảng thì mới map, không thì dùng mảng rỗng
    const list = Array.isArray(specialties) ? specialties : [];
    return new Map(list.map((s) => [s._id || s.id, s.name]));
  }, [specialties]);

  // 1. Fetch Specialties
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        // 👇 THÊM: limit: 100 để lấy danh sách đầy đủ cho Dropdown
        const res = await doctorService.getSpecialties({ limit: 100 });
        
        // Backend trả về: { specialties: [...], pagination: ... }
        // Lấy mảng specialties
        const rawData = res.data?.specialties || res.data || [];
        
        // Đảm bảo luôn là mảng
        setSpecialties(Array.isArray(rawData) ? rawData : []);
        
      } catch (err) {
        console.error("Lỗi lấy chuyên khoa:", err);
        setSpecialties(mockSpecialties || []);
      }
    };
    fetchSpecialties();
  }, []);
  // 2. Fetch Doctors (Gọi khi pagination hoặc filters thay đổi)
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      // Truyền params vào service
      const response = await doctorService.getAllDoctors({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        specialty: filters.specialty,
        status: filters.status
      });

      // Xử lý response mới
      const doctorList = response.data?.doctors || [];
      const pageInfo = response.data?.pagination || {};

      setDoctors(doctorList);
      setPagination(prev => ({
        ...prev,
        totalPages: pageInfo.totalPages || 1,
        totalDocs: pageInfo.totalDocs || 0
      }));
      setError(null);
    } catch (err) {
      console.error("Lỗi tải danh sách bác sĩ:", err);
      setError("Không thể tải danh sách bác sĩ.");
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchDoctors();
    }, 500);
    return () => clearTimeout(timer);
  }, [pagination.page, filters]); // Trigger khi page hoặc filter đổi

  // === Handlers ===
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
        setPagination(prev => ({ ...prev, page: newPage }));
    }
  };
const handleStatusFilterChange = (e) => {
  setFilters(prev => ({ ...prev, status: e.target.value }));
  setPagination(prev => ({ ...prev, page: 1 }));
};  
  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset về trang 1
  };

  const handleSpecialtyFilterChange = (e) => {
    setFilters(prev => ({ ...prev, specialty: e.target.value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // ... (Giữ nguyên logic handleAddEdit, confirmDelete, modals...)
  const handleManageSchedule = (doctor) => { setScheduleDoctor(doctor); setIsScheduleModalOpen(true); };
  const handleAddEdit = (doctor = null) => {
    setEditingDoctor(doctor);
    if (doctor) {
      setFormData({ ...doctor, specialty_id: doctor.specialty_id?._id || doctor.specialty_id || "" });
    } else {
      setFormData({ name: "", email: "", password: "" });
    }
    setIsModalOpen(true);
  };
  const confirmDelete = (id) => setConfirmDeleteId(id);
  const handleDelete = async () => {
    try {
      await doctorService.deleteDoctor(confirmDeleteId);
      setConfirmDeleteId(null);
      fetchDoctors();
      toastSuccess("Xóa bác sĩ thành công!");
    } catch (err) { toastError("Xóa thất bại"); }
  };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingDoctor(null); setFormData({}); };
  const handleSave = async (e) => {
      // ... Logic save giữ nguyên, sau khi save xong gọi fetchDoctors() ...
      e.preventDefault();
      try {
        if (editingDoctor) {
            await doctorService.updateDoctor(editingDoctor._id, formData);
            toastSuccess("Cập nhật thành công!");
        } else {
            // validate...
            await doctorService.createDoctor(formData);
            toastSuccess("Tạo mới thành công!");
        }
        handleCloseModal();
        fetchDoctors();
      } catch (err) { toastError("Lỗi lưu dữ liệu"); }
  };
  const handleInputChange = (e) => { const { name, value } = e.target; setFormData((prev) => ({ ...prev, [name]: value })); };
  const handleFileChange = (e) => { /* Logic cũ */ };
  const clearThumbnail = () => { /* Logic cũ */ };

  return (
    <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Quản Lý Bác Sĩ
        </h2>

        <DoctorList
          doctors={doctors}
          loading={loading}
          specialtyMap={specialtyMap}
          
          // Props mới cho Filter/Search/Pagination
          specialties={specialties} // Để render dropdown filter
          filters={filters}
          onSearchChange={handleSearchChange}
          onSpecialtyFilterChange={handleSpecialtyFilterChange}
          pagination={pagination}
          onPageChange={handlePageChange}
          onStatusFilterChange={handleStatusFilterChange}

          // Props cũ
          handleAddEdit={handleAddEdit}
          handleViewDoctor={(doc) => { setViewingDoctor(doc); setIsViewModalOpen(true); }}
          confirmDelete={confirmDelete}
          handleManageSchedule={handleManageSchedule}
        />

        {/* ... (Phần render Modals giữ nguyên) ... */}
        {isModalOpen && !editingDoctor && (
          <DoctorAddModal isOpen={isModalOpen} onClose={handleCloseModal} formData={formData} handleInputChange={handleInputChange} handleSave={handleSave} />
        )}
        {isScheduleModalOpen && scheduleDoctor && (
          <DoctorScheduleAdminModal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} doctorId={scheduleDoctor?._id || scheduleDoctor?.id} doctorName={scheduleDoctor?.fullName} />
        )}
        {isModalOpen && editingDoctor && (
          <DoctorEditModal isOpen={isModalOpen} onClose={handleCloseModal} formData={formData} handleInputChange={handleInputChange} handleSave={handleSave} editingDoctor={editingDoctor} specialties={specialties} handleFileChange={handleFileChange} clearThumbnail={clearThumbnail} isImagePending={isImagePending} />
        )}
        <DoctorViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} viewingDoctor={viewingDoctor} specialtyMap={specialtyMap} />
        <DoctorDeleteModal confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId} handleDelete={handleDelete} />
      </div>
    </main>
  );
};

export default DoctorManagement;