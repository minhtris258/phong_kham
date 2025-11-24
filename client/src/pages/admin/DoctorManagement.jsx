// src/pages/admin/DoctorManagement.jsx
import React, { useState, useMemo, useEffect } from "react";
import doctorService from "../../services/DoctorService";
import doctorSchedulesService from "../../services/DoctorScheduleService";

// Import components
import DoctorList from "./../../components/admin/doctor/DoctorList";
import DoctorAddModal from "../../components/admin/doctor/DoctorAddModal";
import DoctorScheduleAdminModal from "../../components/admin/doctor/DoctorScheduleAdminModal";
import DoctorEditModal from "../../components/admin/doctor/DoctorEditModal";
import DoctorViewModal from "./../../components/admin/doctor/DoctorViewModal";
import DoctorDeleteModal from "./../../components/admin/doctor/DoctorDeleteModal";

// Mock fallback nếu backend chưa có /specialties
import { mockSpecialties } from "../../mocks/mockdata";

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingDoctor, setViewingDoctor] = useState(null);
  const [isImagePending, setIsImagePending] = useState(false); // Trạng thái tải ảnh Base64

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDoctor, setScheduleDoctor] = useState(null); // Doctor đang được quản lý lịch
  // Danh sách chuyên khoa
  const [specialties, setSpecialties] = useState([]);

  // Map chuyên khoa: id → tên
  const specialtyMap = useMemo(
    () => new Map(specialties.map((s) => [s._id || s.id, s.name])),
    [specialties]
  );

  // Lấy chuyên khoa từ API (fallback mock nếu lỗi)
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await doctorService.getSpecialties();
        setSpecialties(res.data || res);
      } catch (err) {
        console.warn("Không lấy được chuyên khoa từ API → dùng mock", err);
        setSpecialties(mockSpecialties);
      }
    };
    fetchSpecialties();
  }, []);

  // Lấy danh sách bác sĩ
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await doctorService.getAllDoctors();
      // Backend trả { doctors: [...] } hoặc mảng trực tiếp → xử lý cả 2 trường hợp
      const doctorList = response.data?.doctors || response.data || [];
      setDoctors(doctorList);
      setError(null);
    } catch (err) {
      console.error("Lỗi tải danh sách bác sĩ:", err);
      setError("Không thể tải danh sách bác sĩ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);
  // Mở modal quản lý lịch bác sĩ
  const handleManageSchedule = (doctor) => {
    setScheduleDoctor(doctor);
    setIsScheduleModalOpen(true);
  };
  // Mở modal thêm/sửa
  const handleAddEdit = (doctor = null) => {
    setEditingDoctor(doctor);
    if (doctor) {
      // Sửa: copy toàn bộ dữ liệu bác sĩ
      setFormData({
        ...doctor,
        // Đảm bảo specialty_id là chuỗi khi được lưu vào form data
        specialty_id: doctor.specialty_id?._id || doctor.specialty_id || "",
      });
    } else {
      // Thêm mới: CHỈ set 3 trường bắt buộc
      setFormData({
        name: "",
        email: "",
        password: "",
      });
    }
    setIsModalOpen(true);
  };

  // Xóa bác sĩ
  const confirmDelete = (id) => setConfirmDeleteId(id);

  const handleDelete = async () => {
    try {
      await doctorService.deleteDoctor(confirmDeleteId);
      setConfirmDeleteId(null);
      fetchDoctors();
      alert("Xóa bác sĩ thành công!");
    } catch (err) {
      alert(
        "Xóa thất bại: " + (err.response?.data?.error || "Lỗi không xác định")
      );
    }
  };

  // Đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
    setFormData({});
  };

  // Lưu (Thêm hoặc Sửa)
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (editingDoctor) {
        // CẬP NHẬT bác sĩ đã có hồ sơ đầy đủ
        await doctorService.updateDoctor(editingDoctor._id, formData);
        alert("Cập nhật thông tin bác sĩ thành công!");
      } else {
        // TẠO MỚI: CHỈ gửi 3 trường → backend chấp nhận
        const { name, email, password } = formData;

        if (!name || !email || !password) {
          alert("Vui lòng nhập đầy đủ: Tên đăng nhập, Email, Mật khẩu");
          return;
        }

        await doctorService.createDoctor({
          name: name.trim(),
          email: email.trim(),
          password: password,
        });

        alert(
          "Tạo tài khoản bác sĩ thành công!\n\nBác sĩ sẽ nhận thông tin đăng nhập và cần hoàn tất hồ sơ cá nhân khi đăng nhập lần đầu."
        );
      }

      handleCloseModal();
      fetchDoctors(); // Refresh danh sách
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Lỗi không xác định";
      alert("Lỗi: " + errorMsg);
      console.error("Lỗi lưu bác sĩ:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Chuyển file thành Base64
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadstart = () => setIsImagePending(true);

    reader.onload = () => {
      // Lưu chuỗi Base64 vào formData để backend xử lý
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
    // Xóa ảnh trong form data. Gửi giá trị null hoặc chuỗi rỗng để backend xử lý
    // (Trong backend hiện tại, chuỗi rỗng/null sẽ giữ lại ảnh cũ, nhưng đây là cách để xóa ảnh ở FE)
    setFormData((prev) => ({ ...prev, thumbnail: "" }));
    // Nếu bạn muốn backend xóa ảnh, bạn có thể gửi một giá trị đặc biệt như "REMOVE_IMAGE"
  };
  if (loading)
    return (
      <div className="text-center p-8 text-xl">
        Đang tải danh sách bác sĩ...
      </div>
    );
  if (error)
    return (
      <div className="text-center p-8 text-red-600 text-xl">Lỗi: {error}</div>
    );

  return (
    <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Quản Lý Bác Sĩ
        </h2>

        <DoctorList
          doctors={doctors}
          specialtyMap={specialtyMap}
          handleAddEdit={handleAddEdit}
          handleViewDoctor={(doc) => {
            setViewingDoctor(doc);
            setIsViewModalOpen(true);
          }}
          confirmDelete={confirmDelete}
          handleManageSchedule={handleManageSchedule}
        />

        {/* Modal Thêm bác sĩ */}
        {isModalOpen && !editingDoctor && (
          <DoctorAddModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            formData={formData}
            handleInputChange={handleInputChange}
            handleSave={handleSave}
          />
        )}
        {isScheduleModalOpen && scheduleDoctor && (
          <DoctorScheduleAdminModal
            isOpen={isScheduleModalOpen}
            onClose={() => setIsScheduleModalOpen(false)}
            doctorId={scheduleDoctor?._id || scheduleDoctor?.id} // Rất an toàn
            doctorName={scheduleDoctor?.fullName}
          />
        )}
        {/* Modal Sửa bác sĩ */}
        {isModalOpen && editingDoctor && (
          <DoctorEditModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            formData={formData}
            handleInputChange={handleInputChange}
            handleSave={handleSave}
            editingDoctor={editingDoctor}
            specialties={specialties.length > 0 ? specialties : mockSpecialties} // ← ĐÚNG TÊN PROP
            handleFileChange={handleFileChange}
            clearThumbnail={clearThumbnail}
            isImagePending={isImagePending}
          />
        )}

        {/* Modal Xem chi tiết */}
        <DoctorViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          viewingDoctor={viewingDoctor}
          specialtyMap={specialtyMap}
        />

        {/* Modal Xác nhận xóa */}
        <DoctorDeleteModal
          confirmDeleteId={confirmDeleteId}
          setConfirmDeleteId={setConfirmDeleteId}
          handleDelete={handleDelete}
        />
      </div>
    </main>
  );
};

export default DoctorManagement;
