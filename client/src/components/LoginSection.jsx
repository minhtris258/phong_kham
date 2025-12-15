import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
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
      const res = await loginGoogle(credentialResponse.credential);
      toastSuccess("Đăng nhập Google thành công!");

      let nextRoute = "/";
      if (res.user?.role === "admin") nextRoute = "/admin";
      else if (!res.user?.profile_completed) {
        if (res.user?.role === "patient")
          nextRoute = "/onboarding/profile-patient";
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
      // Mobile: min-h-screen để full màn hình, bg-cover để ảnh đẹp
      // PC: giữ nguyên lg:h-[780px]
      className="min-h-screen lg:h-[780px] object-cover bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: `url(${hero})` }}
    >
      <div className="container mx-auto">
        {/* Mobile: pt-24 (cách top vừa phải), px-4 (cách lề ít)
            PC: pt-[150px], px-12 giữ nguyên */}
        <div className="grid lg:grid-cols-2 pt-24 lg:pt-[150px] lg:px-12 px-4 pb-10">
          <div className="bg-[#0a0f1f]/80 lg:bg-[#0a0f1f]/25 backdrop-blur-sm text-white rounded-3xl shadow-3xl col-span-1 py-8 lg:py-12 px-0">
            <img
              src={logo}
              alt="logo"
              className="justify-self-center h-[50px] lg:h-[60px] w-auto mb-2"
            />

            {/* QUAN TRỌNG: Mobile px-6, PC px-20 */}
            <form className="w-full px-6 md:px-12 lg:px-20 pt-4 pb-4 lg:pb-8" onSubmit={onSubmit}>
              {/* Email */}
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                className="w-full h-12 mt-4 lg:mt-6 px-4 rounded-lg bg-white color-title border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none focus:border-white/30 focus:ring-2 focus:ring-white/15 transition"
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
              {error && <p className="mt-4 text-sm text-red-300 text-center">{error}</p>}
              {success && (
                <p className="mt-4 text-sm text-emerald-300 text-center">{success}</p>
              )}

              <button
                className="btn-color rounded-lg py-3 lg:py-4 mt-6 w-full disabled:opacity-70 font-bold"
                type="submit"
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
              </button>
              <a
                href="/register"
                className="font-semibold text-white/90 hover:text-white underline mt-4 block text-right text-sm lg:text-base"
              >
                Đăng ký tài khoản?
              </a>
            </form>

            <p className="mb-4 text-center text-sm lg:text-base text-white/60">
              ------------ OR ------------
            </p>

            <div className="flex justify-center gap-4 pb-4 lg:pb-0 px-6">
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    toastError("Đăng nhập Google thất bại");
                  }}
                  useOneTap
                  theme="outline"
                  shape="pill"
                  text="continue_with"
                  width="100%" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}