import React, { useState } from "react";
import { GoogleLogin } from '@react-oauth/google';
import "../index.css";
import "../assets/assets.js";
import hero from "../assets/slider-03-b.jpg";
import logo from "../assets/logo.png";
import { useAppContext } from "../context/AppContext.jsx";
import { toastSuccess, toastError, toastWarning } from "../utils/toast";

export default function LoginSection() {
  const { login, loginGoogle } = useAppContext();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await login(form.email, form.password);
      toastSuccess("Đăng nhập thành công!");
      window.location.href = res.next || "/";
    } catch (err) {
      toastError(err);
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Có lỗi xảy ra, vui lòng thử lại.";
      toastError(message);
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSuccess = async (credentialResponse) => {
      setLoading(true);
      try {
          // credentialResponse.credential chính là token Google trả về
          const res = await loginGoogle(credentialResponse.credential);
          
          toastSuccess("Đăng nhập Google thành công!");
          
          // Logic chuyển hướng giống login thường
          let nextRoute = "/";
          if (res.user?.role === 'admin') nextRoute = "/admin";
          else if (!res.user?.profile_completed) {
             if (res.user?.role === 'patient') nextRoute = "/onboarding/profile-patient";
             // thêm các case khác nếu cần
          }
          
          window.location.href = nextRoute;

      } catch (err) {
          console.error(err);
          toastError("Đăng nhập Google thất bại. Vui lòng thử lại.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div
      className="lg:h-[780px] object-cover bg-no-repeat"
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
              {/* Email */}
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                className="w-full h-12 mt-6 px-4 rounded-lg bg-white color-title border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none focus:border-white/30 focus:ring-2 focus:ring-white/15 transition"
                value={form.email}
                onChange={onChange}
                required
              />

              {/* Password */}
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                className="w-full h-12 px-4 mt-4 rounded-lg bg-white color-title border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none focus:border-white/30 focus:ring-2 focus:ring-white/15 transition"
                value={form.password}
                onChange={onChange}
                required
              />

              {/* Thông báo */}
              {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
              {success && (
                <p className="mt-4 text-sm text-emerald-300">{success}</p>
              )}

              <button
                className="btn-color rounded-lg py-4 mt-6 w-full disabled:opacity-70"
                type="submit"
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
              </button>
              <a
                href="/register"
                className="font-semibold text-white underline mt-4 block text-right px-2"
              >
                Đăng ký tài khoản ?
              </a>
            </form>

            <p className="mb-4 text-center">------------ OR ------------</p>

            <div className="flex justify-center gap-4">
              {/* 3 nút social giữ nguyên */}
              <div className="w-full flex justify-center">
                  <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => {
                          toastError('Đăng nhập Google thất bại');
                      }}
                      useOneTap // Tự động hiện popup đăng nhập ở góc
                      theme="outline" // hoặc "filled_blue"
                      shape="pill"
                      text="continue_with"
                  />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
