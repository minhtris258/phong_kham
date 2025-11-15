import { useEffect, useMemo, useRef, useState } from "react";

/** Helper dựng URL ảnh từ DB:
 * - Nếu đã là absolute (http/https) -> trả về luôn
 * - Nếu là relative ("/avatars/a.png") -> ghép với VITE_ASSET_BASE (nếu có)
 * - Nếu rỗng -> trả về ảnh fallback
 */
function getImageUrl(path, fallback = "/img/user/default-doctor.png") {
  if (!path || typeof path !== "string") return fallback;
  if (/^https?:\/\//i.test(path)) return path;
  const base = import.meta.env.VITE_ASSET_BASE || "";
  // Nếu bạn để ảnh trong thư mục public của React, chỉ cần path bắt đầu bằng "/"
  // còn nếu ảnh trên server (Laravel) thì đặt VITE_ASSET_BASE="http://localhost:8000"
  return `${base}${path}`;
}

export default function LoginPage() {
  // UI state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // (Tuỳ chọn) user demo để thấy cách hiển thị từ DB (ảnh, tên, email…)
  // Gắn data thật sau khi login hoặc fetch /api/me
  const [user, setUser] = useState(null);

  // Từ database mẫu của bạn:
  // {
  //   _id: "...",
  //   name: "Nguyen Van A",
  //   email: "a@example.com",
  //   image: "/avatars/a.png",
  //   ...
  // }
  // Ví dụ: mock user khi đã có session
  // useEffect(() => {
  //   setUser({ name: "Nguyen Van A", email: "a@example.com", image: "/avatars/a.png" });
  // }, []);

  const avatarSrc = useMemo(
    () => getImageUrl(user?.image, "/img/user/default-doctor.png"),
    [user]
  );

  // Submit handler: nối API thật của bạn tại đây
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ví dụ gọi API Laravel
      // const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/login`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   credentials: "include", // nếu dùng Sanctum
      //   body: JSON.stringify({ email, password, phone }),
      // });
      // const data = await res.json();
      // setUser(data.user);

      console.log("Login payload =>", { email, password, phone });
      alert("Gắn API thật của bạn vào onSubmit nhé!");
    } catch (err) {
      console.error(err);
      alert("Đăng nhập thất bại");
    }
  };

  // ESC để đóng drawer
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <header className="w-full">
        {/* TOP BAR: cuộn là mất (không fixed) */}
        <div id="topbar" className="bg-[#28303f] py-2 hidden sm:block z-50 relative">
          <div className="container mx-auto px-4 flex items-center">
            <ul className="flex gap-3 text-white border-l pl-3">
              <li><a href="#">FaceBook</a></li>
              <li><a href="#">Zalo</a></li>
              <li><a href="#">YouTube</a></li>
              <li><a href="#">TikTok</a></li>
            </ul>
            <div className="ml-auto flex gap-6 text-white">
              <a href="mailto:medpro@example.com" className="flex gap-2">
                {/* email svg */}
                <svg xmlns="http://www.w3.org/2000/svg" height="26" width="16" viewBox="0 0 512 512">
                  <path fill="#ffffff" d="M61.4 64C27.5 64 0 91.5 0 125.4 ..."></path>
                </svg>
                Email: medpro@example.com
              </a>
              <a href="tel:19006868" className="flex gap-2">
                {/* phone svg */}
                <svg xmlns="http://www.w3.org/2000/svg" height="26" width="16" viewBox="0 0 576 512">
                  <path fill="#ffffff" d="M344-32c128.1 0 232 103.9 ..."></path>
                </svg>
                Hotline: 1900 6868
              </a>
            </div>
          </div>
        </div>

        {/* MAIN BAR: luôn fixed, màu nhạt đè lên banner */}
        <div
          id="mainbar"
          className="fixed top-0 inset-x-0 z-40 bg-gradient-to-b from-[#0a0f1f]/90 via-[#0a0f1f]/60 to-transparent"
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-12 gap-4 h-[72px] md:h-[84px]">
              {/* Logo */}
              <div className="col-span-6 md:col-span-3 flex items-center">
                <a href="/" className="inline-flex items-center">
                  <img
                    className="h-9 md:h-11 w-auto"
                    src="https://medpro.vn/_next/image?url=https%3A%2F%2Fbo-api.medpro.com.vn%2Fstatic%2Fimages%2Fmedpro%2Fweb%2Fheader_logo.svg&w=1920&q=75"
                    alt="logo"
                  />
                </a>
              </div>

              {/* Nav desktop */}
              <nav className="col-span-6 md:col-span-6 hidden md:flex items-center justify-center">
                <ul className="flex gap-6 text-white font-raleway font-semibold">
                  <li><a className="hover:text-cyan-300" href="/">Trang Chủ</a></li>
                  <li><a className="hover:text-cyan-300" href="#">Giới Thiệu</a></li>
                  <li><a className="hover:text-cyan-300" href="#">Dịch Vụ</a></li>
                  <li><a className="hover:text-cyan-300" href="#">Bác Sĩ</a></li>
                  <li><a className="hover:text-cyan-300" href="#">Liên Hệ</a></li>
                </ul>
              </nav>

              {/* CTA + hamburger */}
              <div className="col-span-6 md:col-span-3 flex items-center justify-end">
                <a
                  href="#"
                  className="hidden md:inline-flex items-center justify-center h-10 px-5 rounded bg-[#16B7D7] text-white font-semibold hover:bg-[#14c4e9] transition"
                >
                  Đăng Nhập
                </a>
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="md:hidden inline-flex items-center justify-center w-10 h-10 text-white ml-2"
                  aria-label="Mở menu"
                >
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        <aside
          id="mobile-drawer"
          className={[
            "fixed inset-y-0 right-0 w-[88%] max-w-sm z-[60] p-6 text-white transition-all duration-300 ease-out",
            "bg-gradient-to-b from-[#0a0f1f]/90 via-[#0a0f1f]/60 to-transparent",
            drawerOpen ? "translate-x-0 opacity-100 visible" : "translate-x-full opacity-0 invisible",
          ].join(" ")}
        >
          <div className="flex items-center justify-between mb-6">
            <span className="font-extrabold tracking-wide">MEDPRO</span>
            <button onClick={() => setDrawerOpen(false)} className="w-10 h-10" aria-label="Đóng">✕</button>
          </div>
          <nav className="space-y-4 font-raleway text-lg">
            <a href="/" className="block hover:text-cyan-300">Trang Chủ</a>
            <a href="#" className="block hover:text-cyan-300">Giới Thiệu</a>
            <a href="#" className="block hover:text-cyan-300">Dịch Vụ</a>
            <a href="#" className="block hover:text-cyan-300">Bác Sĩ</a>
            <a href="#" className="block hover:text-cyan-300">Liên Hệ</a>
          </nav>
          <a
            href="#"
            className="mt-8 inline-flex items-center justify-center h-11 px-5 rounded bg-white text-black font-semibold hover:bg-[#003553] transition"
          >
            Đăng Nhập
          </a>
        </aside>
      </header>

      {/* BODY */}
      <div className="bg-[url(/img/slider-03-b.jpg)] lg:h-[687px] object-cover bg-no-repeat">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 pt-[100px]">
            <div className="bg-[#0a0f1f]/30 text-white rounded-3xl shadow-3xl p-4 col-span-1">
              {/* Nếu đã có user -> hiện avatar + tên để chứng minh mapping DB */}
              {user && (
                <div className="flex items-center gap-3">
                  <img
                    src={avatarSrc}
                    alt={user.name}
                    className="h-[60px] w-[60px] rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-white/80 text-sm">{user.email}</p>
                  </div>
                </div>
              )}

              {!user && (
                <img src="/img/logo.png" alt="logo" className="justify-self-center h-[60px] w-auto" />
              )}

              <form className="w-full max-w-md pt-4 space-y-4" onSubmit={onSubmit}>
                <div>
                  <label htmlFor="email" className="sr-only">Email</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    className="w-full h-12 px-4 rounded-lg bg-white color-title border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none focus:border-white/30 focus:ring-2 focus:ring-white/15 transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="sr-only">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="Number Phone"
                    className="w-full h-12 px-4 rounded-lg bg-white color-title border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none focus:border-white/30 focus:ring-2 focus:ring-white/15 transition"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Password"
                    className="w-full h-12 px-4 rounded-lg bg-white color-title border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none focus:border-white/30 focus:ring-2 focus:ring-white/15 transition"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <button className="bg-blue-400 rounded-lg px-8 py-4 w-full" type="submit">
                  Đăng Nhập
                </button>
              </form>

              <p className="py-8 text-center">------------ OR ------------</p>
              <button className="bg-blue-400 rounded-lg lg:px-20 py-4 w-full">
                Đăng Nhập Với Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
