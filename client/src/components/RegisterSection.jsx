import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 THÊM DÒNG NÀY
import axios from "axios";
import "../index.css";
import "../assets/assets.js";
import hero from "../assets/slider-03-b.jpg";
import logo from "../assets/logo.png";

export default function RegisterSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate(); // 👈 KHỞI TẠO NAVIGATE

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
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        
      };

      const res = await axios.post(
        "http://localhost:3000/api/auth/register",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Register success:", res.data);

      // Lưu token nếu muốn auto login sau khi đăng ký
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      setSuccess(res.data.message || "Đăng ký thành công!");

      // Xoá mật khẩu cho an toàn
      setForm((s) => ({ ...s, password: "" }));

      // 👇 SAU KHI ĐĂNG KÝ THÀNH CÔNG → CHUYỂN SANG TRANG HOÀN THIỆN PROFILE

      navigate("/ProfileCompletion", { state: { email: form.email } });


    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Có lỗi xảy ra, vui lòng thử lại.";
      setError(message);
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
              {/* Họ tên */}
              <label htmlFor="name" className="sr-only">
                Họ tên
              </label>
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

              {/* Email */}
              <label htmlFor="email" className="sr-only">
                Email
              </label>
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

              {/* Số điện thoại */}
              <label htmlFor="phone" className="sr-only">
                Số điện thoại
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Số điện thoại"
                className="w-full h-12 mt-4 px-4 rounded-lg bg-white color-title border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none focus:border-white/30 focus:ring-2 focus:ring-white/15 transition"
                value={form.phone}
                onChange={onChange}
                required
              />

              {/* Password */}
              <label htmlFor="password" className="sr-only">
                Mật khẩu
              </label>
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

              {/* Thông báo */}
              {error && (
                <p className="mt-4 text-sm text-red-300">
                  {error}
                </p>
              )}
              {success && (
                <p className="mt-4 text-sm text-emerald-300">
                  {success}
                </p>
              )}

              <button
                className="btn-color rounded-lg py-4 mt-6 w-full disabled:opacity-70"
                type="submit"
                disabled={loading}
              >
                {loading ? "Đang đăng ký..." : "Đăng Ký"}
              </button>
              <a
                href="/login"
                className="font-semibold text-white underline mt-4 block text-right px-2"
              >
                Đăng nhập ?
              </a>
            </form>

            <p className="mb-4 text-center">------------ OR ------------</p>

            <div className="flex justify-center gap-4">
              {/* Social buttons giữ nguyên */}
              <button className="bg-white rounded-lg p-3 shadow-md transition">
                {/* Facebook */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="26"
                  width="26"
                  viewBox="0 0 512 512"
                >
                  <path d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256C0 376 82.7 476.8 194.2 504.5l0-170.3-52.8 0 0-78.2 52.8 0 0-33.7c0-87.1 39.4-127.5 125-127.5 16.2 0 44.2 3.2 55.7 6.4l0 70.8c-6-.6-16.5-1-29.6-1-42 0-58.2 15.9-58.2 57.2l0 27.8 83.6 0-14.4 78.2-69.3 0 0 175.9C413.8 494.8 512 386.9 512 256z" />
                </svg>
              </button>
              <button className="bg-white rounded-lg p-3 shadow-md transition">
                {/* Twitter/X */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="26"
                  width="26"
                  viewBox="0 0 512 512"
                >
                  <path d="M459.4 151.7c.3 4.5 .3 9.1 .3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13 1.6 19.8 1.6 9.4 0 18.8-1.3 27.6-3.6-48.1-9.7-84.1-52-84.1-103l0-1.3c14 7.8 30.2 12.7 47.4 13.3-28.3-18.8-46.8-51-46.8-87.4 0-19.5 5.2-37.4 14.3-53 51.7 63.7 129.3 105.3 216.4 109.8-1.6-7.8-2.6-15.9-2.6-24 0-57.8 46.8-104.9 104.9-104.9 30.2 0 57.5 12.7 76.7 33.1 23.7-4.5 46.5-13.3 66.6-25.3-7.8 24.4-24.4 44.8-46.1 57.8 21.1-2.3 41.6-8.1 60.4-16.2-14.3 20.8-32.2 39.3-52.6 54.3z" />
                </svg>
              </button>
              <button className="bg-white rounded-lg p-3 shadow-md transition">
                {/* Google */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="26"
                  width="26"
                  viewBox="0 0 512 512"
                >
                  <path d="M500 261.8C500 403.3 403.1 504 260 504 122.8 504 12 393.2 12 256S122.8 8 260 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9c-88.3-85.2-252.5-21.2-252.5 118.2 0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9l-140.8 0 0-85.3 236.1 0c2.3 12.7 3.9 24.9 3.9 41.4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
