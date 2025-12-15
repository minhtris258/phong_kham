// src/pages/admin/DoctorManagement.jsx (PatientManagement)
import React, { useState, useEffect } from "react";
import { toastSuccess, toastError } from "../../utils/toast";
import patientService from "../../services/PatientService";

// Import components
import PatientList from "./../../components/admin/patient/PatientList";
// ... (Giữ nguyên các import Modal)
import PatientAddModal from "../../components/admin/patient/PatientAddModal";
import PatientEditModal from "../../components/admin/patient/PatientEditModal";
import PatientViewModal from "./../../components/admin/patient/PatientViewModal";
import PatientDeleteModal from "./../../components/admin/patient/PatientDeleteModal";
import PatientPasswordModal from "../../components/admin/patient/PatientPasswordModal";

const PatientManagement = () => {
  // === State Dữ liệu ===
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // === State Phân trang & Tìm kiếm & Lọc ===
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalDocs: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "", // active, inactive, pending...
  });

  // ... (Giữ nguyên State Modal: isModalOpen, editingPatient...)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [patientToChangePassword, setPatientToChangePassword] = useState(null);
  const [isImagePending, setIsImagePending] = useState(false);

  // === Hàm gọi API ===
  const fetchPatients = async () => {
    setLoading(true);
    try {
      // Truyền params vào service
      const response = await patientService.getAllPatients({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        status: filters.status,
      });

      // Xử lý dữ liệu trả về từ cấu trúc mới của Controller
      const patientList = response.data?.patients || [];
      const pageInfo = response.data?.pagination || {};

      setPatients(patientList);
      setPagination((prev) => ({
        ...prev,
        totalPages: pageInfo.totalPages || 1,
        totalDocs: pageInfo.totalDocs || 0,
      }));
    } catch (err) {
      console.error("Lỗi tải danh sách:", err);
      toastError("Không thể tải danh sách bệnh nhân.");
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi page hoặc filter thay đổi
  useEffect(() => {
    // Sử dụng debounce cho search nếu cần thiết, ở đây gọi trực tiếp khi filters đổi
    // Để tối ưu, nên dùng hook useDebounce cho search string
    const timer = setTimeout(() => {
      fetchPatients();
    }, 500); // Debounce 500ms
    return () => clearTimeout(timer);
  }, [pagination.page, filters]);

  // === Handlers thay đổi Filter/Page ===
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset về trang 1 khi tìm kiếm
  };

  const handleStatusChange = (e) => {
    setFilters((prev) => ({ ...prev, status: e.target.value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // ... (Giữ nguyên các hàm handleAddEdit, confirmDelete, handleDelete, handleSave...)
  // Lưu ý: Sau khi handleDelete hoặc handleSave thành công, gọi lại fetchPatients()

  const handleAddEdit = (patient = null) => {
    setEditingPatient(patient);
    if (patient) {
      setFormData({
        ...patient,
        specialty_id: patient.specialty_id?._id || "",
      });
    } else {
      setFormData({ name: "", email: "", password: "" });
    }
    setIsModalOpen(true);
  };

  const confirmDelete = (id) => setConfirmDeleteId(id);

  const handleDelete = async () => {
    try {
      await patientService.deletePatient(confirmDeleteId);
      setConfirmDeleteId(null);
      fetchPatients(); // Reload lại danh sách hiện tại
      toastSuccess("Xóa bệnh nhân thành công!");
    } catch (err) {
      toastError("Xóa thất bại");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
    setFormData({});
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        await patientService.updatePatient(editingPatient._id, formData);
        toastSuccess("Cập nhật thành công!");
      } else {
        // Validate...
        await patientService.createPatient({ ...formData });
        toastSuccess("Tạo mới thành công!");
      }
      handleCloseModal();
      fetchPatients();
    } catch (err) {
      toastError("Lỗi lưu dữ liệu");
    }
  };

  // (Giữ nguyên các hàm xử lý ảnh và mật khẩu)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e) => {
    /* Code cũ */
  };
  const clearThumbnail = () => {
    /* Code cũ */
  };
  const handleChangePassword = (patient) => {
    setPatientToChangePassword(patient);
    setIsPasswordModalOpen(true);
  };
  const handlePasswordChangeSave = async (data) => {
  try {
    // 1. Lấy dữ liệu từ Modal gửi ra ({ patientId, newPassword })
    const { patientId, newPassword } = data;

    // 2. Gọi Service để gửi API xuống Backend
    await patientService.changePatientPassword(patientId, newPassword);

    // 3. Thông báo thành công
    toastSuccess("Đổi mật khẩu thành công!");

    // 4. Đóng Modal và reset state
    setIsPasswordModalOpen(false);
    setPatientToChangePassword(null);
    
  } catch (err) {
    console.error("Lỗi đổi pass:", err);
    // Hiển thị lỗi từ backend trả về nếu có
    const mess = err.response?.data?.message || err.response?.data?.error || "Đổi mật khẩu thất bại!";
    toastError(mess);
  }
};

  return (
    <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Quản Lý Bệnh Nhân
        </h2>

        {/* Truyền Props mới vào PatientList */}
        <PatientList
          patients={patients}
          loading={loading}
          // Filter & Search Props
          filters={filters}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          // Pagination Props
          pagination={pagination}
          onPageChange={handlePageChange}
          // Action Props cũ
          handleAddEdit={handleAddEdit}
          handleViewPatient={(p) => {
            setViewingPatient(p);
            setIsViewModalOpen(true);
          }}
          confirmDelete={confirmDelete}
          handleChangePassword={handleChangePassword}
        />

        {/* ... (Giữ nguyên phần render Modals) ... */}
        {isModalOpen && !editingPatient && (
          <PatientAddModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            formData={formData}
            handleInputChange={handleInputChange}
            handleSave={handleSave}
          />
        )}
        {isModalOpen && editingPatient && (
          <PatientEditModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            formData={formData}
            handleInputChange={handleInputChange}
            handleSave={handleSave}
            editingPatient={editingPatient}
            handleFileChange={handleFileChange}
            clearThumbnail={clearThumbnail}
            isImagePending={isImagePending}
          />
        )}
        <PatientViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          viewingPatient={viewingPatient}
        />
        {isPasswordModalOpen && patientToChangePassword && (
          <PatientPasswordModal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
            patientToChangePassword={patientToChangePassword}
            handlePasswordChange={handlePasswordChangeSave}
          />
        )}
        <PatientDeleteModal
          confirmDeleteId={confirmDeleteId}
          setConfirmDeleteId={setConfirmDeleteId}
          handleDelete={handleDelete}
        />
      </div>
    </main>
  );
};

export default PatientManagement;
