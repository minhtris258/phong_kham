import React from "react";
import { Navigate, Outlet } from "react-router-dom";
// 👇 Đảm bảo đường dẫn này đúng với nơi bạn lưu Context
import { useAppContext } from "../context/AppContext";

const RejectAuth = () => {
  const { user } = useAppContext(); // Lấy thông tin user hiện tại

  // Nếu User ĐÃ TỒN TẠI (đã đăng nhập) -> Tự động chuyển về Home ("/")
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Nếu chưa đăng nhập -> Cho phép hiển thị trang con (Login/Register)
  return <Outlet />;
};

export default RejectAuth;
