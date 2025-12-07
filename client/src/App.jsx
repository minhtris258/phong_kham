import React from "react";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import DoctorLayout from "./layouts/DoctorLayout";
import Chatbox from "./components/Chatbox";
import RequireProfile from "./components/RequireProfile"; // <--- IMPORT MỚI
import ScrollToTop from "./components/ScrollToTop";

// Admin Pages
import AdminRoute from "./components/AdminRoute.jsx";
import DashboardContent from "./pages/admin/Dashboard";
import AppointmentManagement from "./pages/admin/AppointmentManagement";
import PatientManagement from "./pages/admin/PatientManagement";
import DoctorManagement from "./pages/admin/DoctorManagement";
import ProfileSettings from "./pages/admin/ProfileSettings";
import SpecialtyManagement from "./pages/admin/SpecialtyManagement";
import HolidayManagement from "./pages/admin/HolidayManagement";
import PartnersManagement from "./pages/admin/PartnersManagement";
import PostManagement from "./pages/admin/PostManagement";
import PostEditor from "./pages/admin/PostEditor";

// Doctor Pages
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorSchedule from "./pages/doctor/DoctorSchedule";
import DoctorSettings from "./pages/doctor/DoctorSettings";
import DoctorAppointment from "./pages/doctor/DoctorAppointment";
import DoctorVisit from "./pages/doctor/DoctorVisit.jsx";
import DoctorRoute from "./components/DoctorRoute.jsx";
import CompletedProfileDoctor from "./pages/doctor/CompletedProfileDoctor.jsx";

// User Pages
import HomePage from "./pages/Home";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DoctorDetailPage from "./pages/DoctorDetail.jsx";
import PatientProfile from "./pages/patient/PatientProfile.jsx";
import NotificationPage from "./pages/NotificationPage";
import ProfileCompletion from "./pages/patient/ProfileCompletion.jsx";
import NotFound from "./pages/404.jsx";
import PostList from "./pages/PostList.jsx";
import PostDetailPage from "./pages/PostDetailPage.jsx";
import PatientDashboard from "./pages/patient/PatientDashboard.jsx";
import PatientPassword from "./pages/patient/PatientPassword.jsx";
import PatientAppointment from "./pages/patient/PatientAppointment.jsx";
import PatientVisitDetail from "./pages/patient/PatientVisitDetail.jsx";
import DoctorList from "./pages/doctor/DoctorList";
import ServiceManagement from "./pages/admin/MedicalServiceManagement.jsx";
import MedicineManagement from "./pages/admin/MedicalManagement.jsx";
import VisitManagement from "./pages/admin/VisitManagement.jsx";
import AboutUsPage from "./pages/ContactHospitalPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <Routes>
        
        {/* ==================== USER LAYOUT ==================== */}
        <Route path="/" element={<UserLayout />}>
          
          {/* --- PUBLIC ROUTES --- */}
          <Route path="Login" element={<LoginPage />} />
          <Route path="Register" element={<RegisterPage />} />
          <Route path="about-us" element={<AboutUsPage />} />
          <Route path="services" element={<ServicesPage />} />
          
          
          {/* --- ONBOARDING ROUTES (Bọc RequireProfile để xử lý logic chặn/đẩy) --- */}
          <Route element={<RequireProfile />}>
             {/* Trang hoàn thiện của Bệnh nhân */}
             <Route path="/onboarding/profile-patient" element={<ProfileCompletion />} />

             {/* Trang hoàn thiện của Bác sĩ (Dùng UserLayout nhưng logic riêng) */}
             <Route 
                path="/onboarding/profile-doctor" 
                element={
                  <DoctorRoute>
                     <CompletedProfileDoctor />
                  </DoctorRoute>
                } 
             />
          </Route>
          {/* 2. CÁC TRANG CẦN BẢO VỆ (PHẢI CÓ HỒ SƠ MỚI VÀO ĐƯỢC) */}
          <Route element={<RequireProfile />}>
            <Route index element={<HomePage />} />
            <Route path="/post/:slug" element={<PostDetailPage />} />
            <Route path="notifications" element={<NotificationPage />} />
            <Route path="doctors/:id" element={<DoctorDetailPage />} />
            <Route path="doctors" element={<DoctorList />} />
            <Route path="post" element={<PostList />} />
            <Route path="/visit-detail/:appointmentId" element={<PatientVisitDetail />} />
            
            {/* Dashboard Patient */}
            <Route path="/profile" element={<PatientDashboard />}>
              <Route index element={<PatientProfile />} />
              <Route path="appointments" element={<PatientAppointment />} />
              <Route path="password" element={<PatientPassword />} />
            </Route>
          </Route>

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
          <Route path="services" element={<ServiceManagement />} />
          <Route path="medicines" element={<MedicineManagement />} />
          <Route path="visits" element={<VisitManagement />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ==================== DOCTOR LAYOUT ==================== */}
        <Route
          path="/doctor"
          element={
            <DoctorRoute>
              <DoctorLayout />
            </DoctorRoute>
          }
        >
          <Route element={<RequireProfile />}>
          <Route index element={<DoctorProfile />} />
          <Route path="appointments" element={<DoctorAppointment />} />
          <Route path="schedule" element={<DoctorSchedule />} />
          <Route path="visits" element={<DoctorVisit />} />
          <Route path="settings" element={<DoctorSettings />} />
          
          <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer />
      <Chatbox />
    </BrowserRouter>
  );
}