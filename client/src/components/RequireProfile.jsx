import { Navigate, Outlet, useLocation } from "react-router-dom";

const RequireProfile = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // "patient" hoặc "doctor"
  const profileCompleted = localStorage.getItem("profileCompleted"); // "true" hoặc "false"
  const location = useLocation();

  // 1. Nếu chưa đăng nhập -> Cho qua (để các Guard khác xử lý hoặc hiện nội dung public)
  if (!token) {
    return <Outlet />;
  }

  // 2. Xác định đường dẫn onboarding chuẩn cho từng Role
  const patientOnboarding = "/onboarding/profile-patient";
  const doctorOnboarding = "/onboarding/profile-doctor";

  const myOnboardingPath =
    role === "doctor" ? doctorOnboarding : patientOnboarding;

  // 3. CHẶN CHÉO ROLE:
  // Nếu là Doctor mà đang đứng ở trang Patient Onboarding -> Đẩy về Doctor Onboarding
  if (role === "doctor" && location.pathname === patientOnboarding) {
    return <Navigate to={doctorOnboarding} replace />;
  }
  // Nếu là Patient mà đang đứng ở trang Doctor Onboarding -> Đẩy về Patient Onboarding
  if (role === "patient" && location.pathname === doctorOnboarding) {
    return <Navigate to={patientOnboarding} replace />;
  }

  // 4. LOGIC CHƯA HOÀN THIỆN HỒ SƠ (profileCompleted === "false")
  if (profileCompleted === "false") {
    // Nếu đang không đứng ở đúng trang onboarding của mình -> Đẩy về đó ngay
    if (location.pathname !== myOnboardingPath) {
      return <Navigate to={myOnboardingPath} replace />;
    }
    // Nếu đang ở đúng trang onboarding rồi -> Cho phép hiển thị (Outlet)
    return <Outlet />;
  }

  // 5. LOGIC ĐÃ HOÀN THIỆN HỒ SƠ (profileCompleted === "true")
  if (profileCompleted === "true") {
    // Nếu cố tình quay lại trang onboarding -> Đẩy về trang chủ/dashboard
    if (
      location.pathname === patientOnboarding ||
      location.pathname === doctorOnboarding
    ) {
      const homePath = role === "doctor" ? "/doctor" : "/";
      return <Navigate to={homePath} replace />;
    }
  }

  return <Outlet />;
};

export default RequireProfile;
