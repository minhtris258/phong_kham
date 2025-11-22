// src/pages/admin/DoctorManagement.jsx (PatientManagement)
import React, { useState, useEffect } from "react";
import patientService from "../../services/PatientService";

// Import components
import PatientList from "./../../components/admin/patient/PatientList";
import PatientAddModal from "../../components/admin/patient/PatientAddModal";
import PatientEditModal from "../../components/admin/patient/PatientEditModal";
import PatientViewModal from "./../../components/admin/patient/PatientViewModal";
import PatientDeleteModal from "./../../components/admin/patient/PatientDeleteModal";
import PatientPasswordModal from "../../components/admin/patient/PatientPasswordModal";

const PatientManagement = () => {
  // === 1. State Dữ liệu và Loading ===
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === 2. State Quản lý Modal & Form ===
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal Thêm/Sửa
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingPatient, setViewingPatient] = useState(null);
  // === 3. State Đổi Mật khẩu ===
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [patientToChangePassword, setPatientToChangePassword] = useState(null);

  // === 4. State Upload Ảnh ===
  const [isImagePending, setIsImagePending] = useState(false); // Trạng thái tải ảnh Base64 // Lấy danh sách bệnh nhân

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await patientService.getAllPatients();
      const patientList = response.data?.patients || response.data || [];
      setPatients(patientList);
      setError(null);
    } catch (err) {
      console.error("Lỗi tải danh sách bệnh nhân:", err);
      setError("Không thể tải danh sách bệnh nhân. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchPatients();
  }, []); // Mở modal thêm/sửa

  const handleAddEdit = (patient = null) => {
    setEditingPatient(patient);
    if (patient) {
      setFormData({
        ...patient,
        // Xử lý dữ liệu specialty_id nếu dùng chung modal cho Doctor và Patient
        specialty_id: patient.specialty_id?._id || patient.specialty_id || "",
      });
    } else {
      setFormData({ name: "", email: "", password: "" });
    }
    setIsModalOpen(true);
  }; // Xóa bệnh nhân

  const confirmDelete = (id) => setConfirmDeleteId(id);

  const handleDelete = async () => {
    try {
      await patientService.deletePatient(confirmDeleteId);
      setConfirmDeleteId(null);
      fetchPatients();
      alert("Xóa bệnh nhân thành công!");
    } catch (err) {
      alert(
        "Xóa thất bại: " + (err.response?.data?.error || "Lỗi không xác định")
      );
    }
  }; // Đóng modal chung

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
    setFormData({});
  }; // Lưu (Thêm hoặc Sửa)

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (editingPatient) {
        await patientService.updatePatient(editingPatient._id, formData);
        alert("Cập nhật thông tin bệnh nhân thành công!");
      } else {
        const { name, email, password } = formData;
        if (!name || !email || !password) {
          alert("Vui lòng nhập đầy đủ: Tên đăng nhập, Email, Mật khẩu");
          return;
        }
        await patientService.createPatient({
          name: name.trim(),
          email: email.trim(),
          password: password,
        });
        alert(
          "Tạo tài khoản bệnh nhân thành công!\n\nBệnh nhân sẽ nhận thông tin đăng nhập và cần hoàn tất hồ sơ cá nhân khi đăng nhập lần đầu."
        );
      }

      handleCloseModal();
      fetchPatients();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Lỗi không xác định";
      alert("Lỗi: " + errorMsg);
      console.error("Lỗi lưu bệnh nhân:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // === Xử lý Upload Ảnh (chuyển sang Base64) ===
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadstart = () => setIsImagePending(true);
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, thumbnail: reader.result }));
      setIsImagePending(false);
    };
    reader.onerror = (error) => {
      console.error("Lỗi đọc file:", error);
      setIsImagePending(false);
      alert("Lỗi tải ảnh cục bộ. Vui lòng thử lại.");
    };
  };

  const clearThumbnail = () => {
    setFormData((prev) => ({ ...prev, thumbnail: "" }));
  };

  // === Xử lý Đổi Mật khẩu ===
  const handleChangePassword = (patient) => {
    setPatientToChangePassword(patient);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordChangeSave = async (passwordData) => {
    const patientId = patientToChangePassword._id || patientToChangePassword.id;
    const { newPassword } = passwordData;

    // Bạn cần thêm state loading cho modal này nếu muốn

    try {
      // GỌI API THỰC TẾ
      await patientService.changePatientPassword(patientId, newPassword);

      alert(`Đổi mật khẩu cho ${patientToChangePassword.fullName} thành công!`);

      setIsPasswordModalOpen(false);
      setPatientToChangePassword(null);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Lỗi đổi mật khẩu không xác định";
      alert("Lỗi đổi mật khẩu: " + errorMsg);
      console.error("Lỗi đổi mật khẩu:", err);
    }
  };

  if (loading)
    return (
      <div className="text-center p-8 text-xl">
        Đang tải danh sách bệnh nhân...
      </div>
    );
  if (error)
    return (
      <div className="text-center p-8 text-red-600 text-xl">Lỗi: {error}</div>
    );

  return (
    <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-screen">
         {" "}
      <div className="max-w-7xl mx-auto">
           {" "}
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Quản Lý Bệnh Nhân
        </h2>
           {" "}
        <PatientList
          patients={patients}
          handleAddEdit={handleAddEdit}
          handleViewPatient={(patient) => {
            setViewingPatient(patient);
            setIsViewModalOpen(true);
          }}
          confirmDelete={confirmDelete}
          // Truyền hàm đổi mật khẩu
          handleChangePassword={handleChangePassword}
        />
            {/* Modal Thêm bệnh nhân */}   {" "}
        {isModalOpen && !editingPatient && (
          <PatientAddModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            formData={formData}
            handleInputChange={handleInputChange}
            handleSave={handleSave}
          />
        )}
            {/* Modal Sửa bệnh nhân */}   {" "}
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
            {/* Modal Xem chi tiết */}
           {" "}
        <PatientViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          viewingPatient={viewingPatient}
        />
        {/* Modal Đổi mật khẩu */}
        {isPasswordModalOpen && patientToChangePassword && (
          <PatientPasswordModal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
            patientToChangePassword={patientToChangePassword}
            handlePasswordChange={handlePasswordChangeSave} // ← Dùng hàm API thực tế
          />
        )}
            {/* Modal Xác nhận xóa */}
           {" "}
        <PatientDeleteModal
          confirmDeleteId={confirmDeleteId}
          setConfirmDeleteId={setConfirmDeleteId}
          handleDelete={handleDelete}
        />
           {" "}
      </div>
         {" "}
    </main>
  );
};

export default PatientManagement;
