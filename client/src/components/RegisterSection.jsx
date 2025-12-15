import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import "../assets/assets.js";
import hero from "../assets/slider-03-b.jpg";
import logo from "../assets/logo.png";
import { toastSuccess, toastError } from "../utils/toast";
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
  const { register, loginGoogle } = useAppContext();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

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

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await loginGoogle(credentialResponse.credential);
      toastSuccess("Đăng nhập Google thành công!");

      let nextRoute = res.next || "/";

      if (!res.next) {
        if (res.user?.role === "admin") nextRoute = "/admin";
        else if (!res.user?.profile_completed) {
          if (res.user?.role === "patient")
            nextRoute = "/onboarding/profile-patient";
          else if (res.user?.role === "doctor")
            nextRoute = "/onboarding/profile-doctor";
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
      // 1. Mobile: min-h-screen, bg-cover
      // PC: lg:h-[820px]
      className="min-h-screen lg:h-[820px] object-cover bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: `url(${hero})` }}
    >
      <div className="container mx-auto">
        {/* 2. Padding Top Responsive: Mobile pt-24, Desktop pt-[100px] */}
        <div className="grid lg:grid-cols-2 pt-24 lg:pt-[100px] lg:px-12 px-4 pb-10">
          
          {/* 3. Background Form: Mobile đậm hơn (/80), Desktop nhạt (/25) */}
          <div className="bg-[#0a0f1f]/80 lg:bg-[#0a0f1f]/25 backdrop-blur-sm text-white rounded-3xl shadow-3xl col-span-1 py-8 lg:py-12 px-0">
            <img
              src={logo}
              alt="logo"
              className="justify-self-center h-[50px] lg:h-[60px] w-auto mb-2"
            />

            {/* 4. Padding Form (QUAN TRỌNG): Mobile px-6, Desktop px-20 */}
            <form className="w-full px-6 md:px-12 lg:px-20 pt-4 pb-4 lg:pb-8" onSubmit={onSubmit}>
              <label htmlFor="name" className="sr-only">Họ tên</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Họ và tên"
                className="w-full h-12 mt-4 lg:mt-6 px-4 rounded-lg bg-white color-title border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none focus:border-white/30 focus:ring-2 focus:ring-white/15 transition"
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

              {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}
              {success && <p className="mt-4 text-sm text-emerald-300 text-center">{success}</p>}

              <button
                className="btn-color rounded-lg py-3 lg:py-4 mt-6 w-full disabled:opacity-70 font-bold"
                type="submit"
                disabled={loading}
              >
                {loading ? "Đang đăng ký..." : "Đăng Ký"}
              </button>

              <a
                href="/login"
                className="font-semibold text-white/90 hover:text-white underline mt-4 block text-right px-2 text-sm lg:text-base"
              >
                Đăng nhập?
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
                    toastError("Đăng ký Google thất bại");
                  }}
                  useOneTap
                  theme="outline"
                  shape="pill"
                  text="signup_with"
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