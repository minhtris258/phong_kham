import React from "react";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import DoctorLayout from "./layouts/DoctorLayout";

// Admin Pages
import DashboardContent from "./pages/admin/Dashboard";
import AppointmentManagement from "./pages/admin/AppointmentManagement";
import PatientManagement from "./pages/admin/PatientManagement";
import DoctorManagement from "./pages/admin/DoctorManagement";
import ProfileSettings from "./pages/admin/ProfileSettings";
import SpecialtyManagement from "./pages/admin/specialtyManagement";

// Doctor Pages
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorSchedule from "./pages/doctor/DoctorSchedule";
import DoctorSettings from "./pages/doctor/DoctorSettings";

// User Pages
import HomePage from "./pages/Home";
import LoginSection from "./components/LoginSection";
import DoctorDetailPage from "./pages/patient/DoctorDetail"; // ← Đảm bảo import đúng
import PatientDashboard from "./pages/patient/Dashboard";
import PatientProfileContent from "./pages/patient/dashboard-sections/PatientProfile";
import AppointmentListContent from "./pages/patient/dashboard-sections/AppointmentList";
import PaymentHistoryContent from "./pages/patient/dashboard-sections/PaymentHistory";
import AccountSettingsContent from "./pages/patient/dashboard-sections/AccountSettings";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==================== USER LAYOUT (CÓ HEADER + FOOTER) ==================== */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<HomePage />} />
          <Route path="Login" element={<LoginSection />} />
          <Route path="bac-si/:id" element={<DoctorDetailPage />} />
          <Route path="/" element={<PatientDashboard />}>
            <Route path="ho-so" element={<PatientProfileContent />} />
            <Route path="lich-kham" element={<AppointmentListContent />} />
            <Route path="lich-su-thanh-toan" element={<PaymentHistoryContent />} />
            <Route path="tai-khoan" element={<AccountSettingsContent />} />
          </Route>
          {/* Có thể thêm các trang public khác ở đây */}
          {/* <Route path="tim-kiem" element={<SearchPage />} /> */}
          {/* <Route path="chuyen-khoa/:slug" element={<SpecialtyPage />} /> */}
        </Route>

        {/* ==================== ADMIN LAYOUT ==================== */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardContent />} />
          <Route path="appointments" element={<AppointmentManagement />} />
          <Route path="patients" element={<PatientManagement />} />
          <Route path="doctors" element={<DoctorManagement />} />
          <Route path="specialty" element={<SpecialtyManagement />} />
          <Route path="profile" element={<ProfileSettings />} />
        </Route>
         

          {/* ... các routes khác */}

        {/* ==================== DOCTOR LAYOUT ==================== */}
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<DoctorProfile />} />
          <Route path="schedule" element={<DoctorSchedule />} />
          <Route path="settings" element={<DoctorSettings />} />
        </Route>

        {/* ==================== 404 ==================== */}
        <Route path="*" element={
          <UserLayout>
            <div className="flex items-center justify-center min-h-screen text-3xl font-bold text-gray-500 bg-gray-50">
              404 - Không tìm thấy trang
            </div>
          </UserLayout>
        } />

      </Routes>
    </BrowserRouter>
  );
}