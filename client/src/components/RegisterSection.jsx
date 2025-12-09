import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import "../assets/assets.js";
import hero from "../assets/slider-03-b.jpg";
import logo from "../assets/logo.png";
import { toastSuccess, toastError } from "../utils/toast";

// 1. IMPORT HOOK CONTEXT & GOOGLE LOGIN
import { useAppContext } from "../context/AppContext";
import { GoogleLogin } from "@react-oauth/google";

export default function RegisterSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // 2. LẤY HÀM REGISTER VÀ LOGINGOOGLE TỪ CONTEXT
  const { register, loginGoogle } = useAppContext();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  // --- XỬ LÝ ĐĂNG KÝ THƯỜNG ---
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      toastError("Mật khẩu nhập lại không khớp!");
      setLoading(false);
      return;
    }

    try {
      const data = await register(
        form.name,
        form.email,
        form.password,
        form.confirmPassword
      );

      toastSuccess(data.message || "Đăng ký thành công!");
      setSuccess("Đăng ký thành công! Đang chuyển hướng...");
      setForm((s) => ({ ...s, password: "", confirmPassword: "" }));

      setTimeout(() => {
        const redirectPath = data.next || "/onboarding/profile-patient";
        navigate(redirectPath);
      }, 1000);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Có lỗi xảy ra, vui lòng thử lại.";
      setError(message);
      toastError(message);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. XỬ LÝ ĐĂNG KÝ/ĐĂNG NHẬP BẰNG GOOGLE ---
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      // Gọi hàm loginGoogle từ Context
      const res = await loginGoogle(credentialResponse.credential);
      
      toastSuccess("Đăng nhập Google thành công!");

      // Logic chuyển hướng dựa trên phản hồi từ server (biến 'next')
      // Hoặc tự check role/profile_completed
      let nextRoute = res.next || "/";
      
      if (!res.next) {
          if (res.user?.role === 'admin') nextRoute = "/admin";
          else if (!res.user?.profile_completed) {
             if (res.user?.role === 'patient') nextRoute = "/onboarding/profile-patient";
             else if (res.user?.role === 'doctor') nextRoute = "/onboarding/profile-doctor";
          }
      }

      navigate(nextRoute);

    } catch (err) {
      console.error(err);
      toastError("Đăng nhập Google thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="lg:h-[820px] object-cover bg-no-repeat"
      style={{ backgroundImage: `url(${hero})` }}
    >
      <div className="container">
        <div className="grid lg:grid-cols-2 pt-[100px] lg:px-12 px-2">
          <div className="bg-[#0a0f1f]/25 text-white rounded-3xl shadow-3xl col-span-1 py-12 lg:px-2 px-0">
            <img
              src={logo}
              alt="logo"
              className="justify-self-center h-[60px] w-auto"
            />

            <form className="w-full px-20 pt-4 pb-8" onSubmit={onSubmit}>
              <label htmlFor="name" className="sr-only">Họ tên</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Họ và tên"
                className="w-full h-12 mt-6 px-4 rounded-lg bg-white color-title border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none focus:border-white/30 focus:ring-2 focus:ring-white/15 transition"
                value={form.name}
                onChange={onChange}
                required
              />

              <label htmlFor="email" className="sr-only">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                className="w-full h-12 mt-4 px-4 rounded-lg bg-white color-title border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none focus:border-white/30 focus:ring-2 focus:ring-white/15 transition"
                value={form.email}
                onChange={onChange}
                required
              />

              <label htmlFor="password" className="sr-only">Mật khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Mật khẩu"
                className="w-full h-12 mt-4 px-4 rounded-lg bg-white color-title border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none focus:border-white/30 focus:ring-2 focus:ring-white/15 transition"
                value={form.password}
                onChange={onChange}
                required
              />

              <label htmlFor="confirmPassword" className="sr-only">Nhập lại mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                className="w-full h-12 mt-4 px-4 rounded-lg bg-white color-title border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none focus:border-white/30 focus:ring-2 focus:ring-white/15 transition"
                value={form.confirmPassword}
                onChange={onChange}
                required
              />

              {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
              {success && <p className="mt-4 text-sm text-emerald-300">{success}</p>}

              <button
                className="btn-color rounded-lg py-4 mt-6 w-full disabled:opacity-70"
                type="submit"
                disabled={loading}
              >
                {loading ? "Đang đăng ký..." : "Đăng Ký"}
              </button>
              
              <a href="/login" className="font-semibold text-white underline mt-4 block text-right px-2">
                Đăng nhập ?
              </a>
            </form>

            <p className="mb-4 text-center">------------ OR ------------</p>

            <div className="flex justify-center gap-4">
              <div className="w-full flex justify-center">
                  {/* 4. GẮN HÀM XỬ LÝ VÀO NÚT GOOGLE */}
                  <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => {
                          toastError('Đăng ký Google thất bại');
                      }}
                      useOneTap
                      theme="outline"
                      shape="pill"
                      text="signup_with" // Đổi text thành "Sign up with Google"
                  />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}