import React, { useState, useEffect } from "react";
import specialtyService from "../../services/SpecialtyService";
import { toastSuccess, toastError, toastWarning } from "../../utils/toast";

// Components
import SpecialtyList from "./../../components/admin/specialty/SpecialtyList";
import SpecialtyFormModal from "./../../components/admin/specialty/SpecialtyFormModal";
import SpecialtyDoctorsModal from "./../../components/admin/specialty/SpecialtyDoctorsModal";
import SpecialtyDeleteModal from "./../../components/admin/specialty/SpecialtyDeleteModal";

const SpecialtyManagement = () => {
  // State dữ liệu
  const [specialtys, setSpecialtys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State Phân trang & Tìm kiếm
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalDocs: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");

  // State Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [formData, setFormData] = useState({});

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isViewDoctorsModalOpen, setIsViewDoctorsModalOpen] = useState(false);
  const [currentSpecialtyDoctors, setCurrentSpecialtyDoctors] = useState({
    specialtyName: "",
    doctors: [],
  });
  const [isViewDoctorsLoading, setIsViewDoctorsLoading] = useState(false);

  // === 1. FETCH DATA ===
  const fetchSpecialties = async () => {
    setLoading(true);
    try {
      const response = await specialtyService.getAllSpecialties({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
      });

      // Backend trả về: { specialties: [...], pagination: {...} }
      const list = response.data?.specialties || [];
      const pageInfo = response.data?.pagination || {};

      setSpecialtys(list);
      setPagination((prev) => ({
        ...prev,
        totalPages: pageInfo.totalPages || 1,
        totalDocs: pageInfo.totalDocs || 0,
      }));
      setError(null);
    } catch (err) {
      console.error("Lỗi tải chuyên khoa:", err);
      setError("Không thể tải danh sách chuyên khoa.");
    } finally {
      setLoading(false);
    }
  };

  // Debounce Search & Fetch khi page đổi
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSpecialties();
    }, 500);
    return () => clearTimeout(timer);
  }, [pagination.page, searchTerm]);

  // === HANDLERS ===
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () =>
        setFormData((prev) => ({ ...prev, thumbnail: reader.result }));
    }
  };

  // === [QUAN TRỌNG] CẬP NHẬT HÀM NÀY ĐỂ NẠP KEYWORDS ===
  const handleAddEdit = (specialty) => {
    setEditingSpecialty(specialty);
    if (specialty) {
      // Chế độ EDIT: Nạp dữ liệu cũ vào form
      setFormData({
        _id: specialty._id || specialty.id,
        name: specialty.name,
        thumbnail: specialty.thumbnail || "",
        keywords: specialty.keywords || [], // <--- Thêm dòng này để Modal hiển thị từ khóa cũ
      });
    } else {
      // Chế độ ADD: Reset form
      setFormData({
        name: "",
        thumbnail: "",
        keywords: "", // <--- Reset keywords
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toastWarning("Vui lòng điền tên chuyên khoa.");
      return;
    }

    try {
      if (editingSpecialty) {
        // Update
        await specialtyService.updateSpecialty(
          editingSpecialty._id || editingSpecialty.id,
          formData
        );
        toastSuccess("Cập nhật chuyên khoa thành công!");
      } else {
        // Create
        await specialtyService.createSpecialty(formData);
        toastSuccess("Thêm chuyên khoa thành công!");
      }
      setIsModalOpen(false);
      setEditingSpecialty(null);
      fetchSpecialties(); // Refresh list
    } catch (err) {
      toastError("Lỗi lưu: " + (err.response?.data?.message || err.message));
    }
  };

  const confirmDelete = (id) => setConfirmDeleteId(id);
  const handleDelete = async () => {
    try {
      await specialtyService.deleteSpecialty(confirmDeleteId);
      setConfirmDeleteId(null);
      toastSuccess("Xóa chuyên khoa thành công!");
      fetchSpecialties();
    } catch (err) {
      toastError("Xóa thất bại");
    }
  };

  const handleViewDoctors = async (specialty) => {
    setIsViewDoctorsLoading(true);
    setIsViewDoctorsModalOpen(true);
    setCurrentSpecialtyDoctors({ specialtyName: specialty.name, doctors: [] });
    try {
      const response = await specialtyService.getSpecialtyWithDoctors(
        specialty._id || specialty.id
      );
      setCurrentSpecialtyDoctors({
        specialtyName: response.data?.name || specialty.name,
        doctors: response.data?.doctors || [],
      });
    } catch (err) {
      toastError("Lỗi: Không thể tải danh sách bác sĩ.");
    } finally {
      setIsViewDoctorsLoading(false);
    }
  };

  return (
    <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Quản Lý Chuyên Khoa
      </h2>

      <SpecialtyList
        specialtys={specialtys}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        pagination={pagination}
        onPageChange={handlePageChange}
        handleAddEdit={handleAddEdit}
        confirmDelete={confirmDelete}
        handleViewDoctors={handleViewDoctors}
      />

      <SpecialtyFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
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
