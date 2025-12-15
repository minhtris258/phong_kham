// src/components/AdminRoute.jsx
import React from "react";
import { useAppContext } from "../context/AppContext";
import NotFound from "../pages/404";
import UserLayout from "../layouts/UserLayout"; // <--- IMPORT LAYOUT USER

const AdminRoute = ({ children }) => {
  const { user, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500 font-medium animate-pulse">
          Đang kiểm tra quyền truy cập...
        </div>
      </div>
    );
  }

  const isAdmin = user && user.role && user.role.toLowerCase() === "doctor";

  // Nếu KHÔNG PHẢI Admin -> Trả về 404 nằm trong UserLayout
  if (!isAdmin) {
    return (
      <UserLayout>
        <NotFound />
      </UserLayout>
    );
  }

  return children;
};

export default AdminRoute;
