// src/layouts/DoctorLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import DoctorSidebar from "../components/doctor/DoctorSidebar.jsx"; // Import Sidebar vừa tạo

export default function DoctorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Component */}
      <DoctorSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 transition-all duration-300">
        {/* Header Mobile (Chỉ hiện trên màn hình nhỏ) */}
        <header className="lg:hidden bg-white shadow-sm fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-4 border-b h-16">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h2 className="font-bold text-blue-700 text-lg">DOCTOR PORTAL</h2>
          <div className="w-10" /> {/* Spacer để cân giữa title */}
        </header>

        {/* Page Content */}
        <main className="pt-20 lg:pt-8 pb-10 px-4 sm:px-6 lg:px-8 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
