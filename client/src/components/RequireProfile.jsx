import { Navigate, Outlet, useLocation } from "react-router-dom";

const RequireProfile = () => {
  const token = localStorage.getItem("token");
  const profileCompleted = localStorage.getItem("profileCompleted"); // "true" hoặc "false"
  const location = useLocation();

  // Nếu chưa đăng nhập thì thôi, để các Guard khác lo (hoặc cho qua)
  if (!token) {
    return <Outlet />;
  }

  // Nếu ĐÃ đăng nhập + CHƯA hoàn thiện hồ sơ + ĐANG KHÔNG Ở trang hoàn thiện
  if (profileCompleted === "false" && location.pathname !== "/onboarding/profile-patient") {
    // Bắt buộc chuyển hướng về trang hoàn thiện
    return <Navigate to="/onboarding/profile-patient" replace />;
  }

  // Nếu ĐÃ hoàn thiện hồ sơ mà CỐ TÌNH vào trang hoàn thiện -> Đẩy về trang chủ
  if (profileCompleted === "true" && location.pathname === "/onboarding/profile-patient") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireProfile;