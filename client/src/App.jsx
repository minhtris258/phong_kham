import React from "react";
import "./index.css";
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import DashboardContent from "./pages/admin/Dashboard";
import AppointmentManagement from "./pages/admin/AppointmentManagement";
import PatientManagement from "./pages/admin/PatientManagement";
import DoctorManagement from "./pages/admin/DoctorManagement";
import ProfileSettings from "./pages/admin/ProfileSettings";
import HomePage from "./pages/Home";
import LoginSection from "./components/LoginSection";

export default function App() {
 return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserLayout />}>
          
          {/* Index Route - Trang chủ */}
          <Route index element={<HomePage />} /> 
          
         

        </Route>
        {/* Route cha sử dụng AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          
          {/* /admin => DashboardContent */}
          <Route index element={<DashboardContent />} /> 
          
          {/* /admin/appointments => AppointmentManagement */}
          <Route path="appointments" element={<AppointmentManagement />} />
          
          {/* /admin/patients => PatientManagement */}
          <Route path="patients" element={<PatientManagement />} />
          
          {/* /admin/doctors => DoctorManagement */}
          <Route path="doctors" element={<DoctorManagement />} />
          
          {/* /admin/profile => ProfileSettings */}
          <Route path="profile" element={<ProfileSettings />} />

          {/* /admin/profile => ProfileSettings */}
          <Route path="Loginsection" element={<LoginSection />} />

          {/* ... các routes khác */}
        </Route>

        {/* ... các routes cho người dùng thông thường và các trang khác */}
      </Routes>
    </BrowserRouter>
  );
}   