import React from "react";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import DoctorLayout from "./layouts/DoctorLayout";

import Chatbox from "./components/Chatbox";

// Admin Pages
import AdminRoute from "./components/AdminRoute.jsx";
import DashboardContent from "./pages/admin/Dashboard";
import AppointmentManagement from "./pages/admin/AppointmentManagement";
import PatientManagement from "./pages/admin/PatientManagement";
import DoctorManagement from "./pages/admin/DoctorManagement";
import ProfileSettings from "./pages/admin/ProfileSettings";
import SpecialtyManagement from "./pages/admin/SpecialtyManagement";

// Doctor Pages
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorSchedule from "./pages/doctor/DoctorSchedule";
import DoctorSettings from "./pages/doctor/DoctorSettings";
import DoctorAppointment from "./pages/doctor/DoctorAppointment";

import DoctorList from "./pages/doctor/DoctorList";

import DoctorRoute from "./components/DoctorRoute.jsx";


// User Pages
import HomePage from "./pages/Home";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DoctorDetailPage from "./pages/patient/DoctorDetail"; // ← Đảm bảo import đúng
import PatientDashboard from "./pages/patient/Dashboard";
import PatientProfileContent from "./pages/patient/dashboard-sections/PatientProfile";
import AppointmentListContent from "./pages/patient/dashboard-sections/AppointmentList";
import PaymentHistoryContent from "./pages/patient/dashboard-sections/PaymentHistory";
import AccountSettingsContent from "./pages/patient/dashboard-sections/AccountSettings";
import HolidayManagement from "./pages/admin/HolidayManagement";
import NotificationPage from "./pages/NotificationPage";
import PartnersManagement from "./pages/admin/PartnersManagement";
import PostManagement from "./pages/admin/PostManagement";
import PostEditor from "./pages/admin/PostEditor";
import ProfileCompletion from "./pages/patient/ProfileCompletion.jsx";
import NotFound from "./pages/404.jsx";
import DoctorVisit from "./pages/doctor/DoctorVisit.jsx";
import PostList from "./pages/PostList.jsx";

// src/App.jsx

import PostDetailPage from "./pages/PostDetailPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== USER LAYOUT (CÓ HEADER + FOOTER) ==================== */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<HomePage />} />
          <Route path="Login" element={<LoginPage />} />
          <Route path="/post/:slug" element={<PostDetailPage />} />
          <Route path="Register" element={<RegisterPage />} />
          <Route path="notifications" element={<NotificationPage />} />
          <Route path="doctors/:id" element={<DoctorDetailPage />} />
          <Route path="doctorList" element={<DoctorList />} />
          <Route path="postList" element={<PostList />} />
          <Route path="/" element={<PatientDashboard />}>
            <Route path="ho-so" element={<PatientProfileContent />} />

            <Route path="lich-kham" element={<AppointmentListContent />} />
            <Route
              path="lich-su-thanh-toan"
              element={<PaymentHistoryContent />}
            />
            <Route path="tai-khoan" element={<AccountSettingsContent />} />
          </Route>
          <Route path="ProfileCompletion" element={<ProfileCompletion />} />
          {/* Có thể thêm các trang public khác ở đây */}
          {/* <Route path="tim-kiem" element={<SearchPage />} /> */}
          {/* <Route path="chuyen-khoa/:slug" element={<SpecialtyPage />} /> */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ==================== ADMIN LAYOUT ==================== */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<DashboardContent />} />
          <Route path="posts" element={<PostManagement />} />
          <Route path="posts/new" element={<PostEditor />} />
          <Route path="posts/edit/:id" element={<PostEditor />} />
          <Route path="appointments" element={<AppointmentManagement />} />
          <Route path="patients" element={<PatientManagement />} />
          <Route path="doctors" element={<DoctorManagement />} />
          <Route path="specialty" element={<SpecialtyManagement />} />
          <Route path="holidays" element={<HolidayManagement />} />
          <Route path="partners" element={<PartnersManagement />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ... các routes khác */}

        {/* ==================== DOCTOR LAYOUT ==================== */}
        <Route
          path="/doctor"
          element={
            <DoctorRoute>
              <DoctorLayout />
            </DoctorRoute>
          }
        >
          <Route index element={<DoctorProfile />} />
          <Route path="appointments" element={<DoctorAppointment />} />
          <Route path="schedule" element={<DoctorSchedule />} />
          <Route path="visits" element={<DoctorVisit />} />
          <Route path="settings" element={<DoctorSettings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <ToastContainer />
      <Chatbox />
    </BrowserRouter>
  );
}
