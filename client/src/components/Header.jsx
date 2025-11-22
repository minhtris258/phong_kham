// src/components/Header.jsx
import { useEffect, useRef, useState } from "react";
import "../index.css";
import "../assets/assets.js";

export default function Header() {
  const [open, setOpen] = useState(false);
  const mainbarRef = useRef(null);
  const topbarRef = useRef(null);
  const drawerRef = useRef(null);

  // 👇 trạng thái đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);

  // Đọc token + user từ localStorage
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const userRaw = localStorage.getItem("user");
      if (token) {
        setIsLoggedIn(true);
        if (userRaw) {
          setUser(JSON.parse(userRaw));
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (e) {
      console.error("Cannot parse user from localStorage", e);
    }
  }, []);

  // 👉 HÀM LOGOUT – cái này đang bị thiếu
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = "/";
  };

  // Đặt vị trí mainbar: khi chưa scroll, mainbar nằm ngay dưới topbar; scroll qua thì dính top-0
  useEffect(() => {
    const mainbar = mainbarRef.current;
    const topbar = topbarRef.current;
    if (!mainbar) return;

    const positionMainbar = () => {
      const topH = topbar ? topbar.offsetHeight || 0 : 0;
      const scrolledPast = window.scrollY > topH;
      if (scrolledPast) {
        mainbar.style.top = "0px";
        mainbar.classList.remove("z-40");
        mainbar.classList.add("z-50");
      } else {
        mainbar.style.top = `${topH}px`;
        mainbar.classList.remove("z-50");
        mainbar.classList.add("z-40");
      }
    };

    positionMainbar();
    window.addEventListener("scroll", positionMainbar, { passive: true });
    window.addEventListener("resize", positionMainbar);
    return () => {
      window.removeEventListener("scroll", positionMainbar);
      window.removeEventListener("resize", positionMainbar);
    };
  }, []);

  // Đóng bằng ESC & click ngoài
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) => {
      if (!open) return;
      if (drawerRef.current && !drawerRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <header className="w-full">
      {/* TOP BAR: cuộn là mất (không fixed) */}
      <div
        id="topbar"
        ref={topbarRef}
        className="bg-[#28303f] py-2 hidden sm:block z-50 relative"
      >
        <div className="container mx-auto px-4 flex items-center">
          <ul className="flex gap-3 text-white pl-3">
            <li>
              <a href="#">FaceBook</a>
            </li>
            <li>
              <a href="#" className="border-l pl-3">
                Zalo
              </a>
            </li>
            <li>
              <a href="#" className="border-l pl-3">
                YouTube
              </a>
            </li>
            <li>
              <a href="#" className="border-l pl-3">
                TikTok
              </a>
            </li>
          </ul>
          <div className="ml-auto flex gap-6 text-white">
            <a href="mailto:medpro@example.com" className="flex gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="26"
                width="16"
                viewBox="0 0 512 512"
              >
                <path
                  fill="#ffffff"
                  d="M61.4 64C27.5 64 0 91.5 0 125.4 0 126.3 0 127.1 .1 128L0 128 0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256-.1 0c0-.9 .1-1.7 .1-2.6 0-33.9-27.5-61.4-61.4-61.4L61.4 64zM464 192.3L464 384c0 8.8-7.2 16-16 16L64 400c-8.8 0-16-7.2-16-16l0-191.7 154.8 117.4c31.4 23.9 74.9 23.9 106.4 0L464 192.3zM48 125.4C48 118 54 112 61.4 112l389.2 0c7.4 0 13.4 6 13.4 13.4 0 4.2-2 8.2-5.3 10.7L280.2 271.5c-14.3 10.8-34.1 10.8-48.4 0L53.3 136.1c-3.3-2.5-5.3-6.5-5.3-10.7z"
                />
              </svg>
              Email: medpro@example.com
            </a>
            <a href="tel:19006868" className="flex gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="26"
                width="16"
                viewBox="0 0 576 512"
              >
                <path
                  fill="#ffffff"
                  d="M344-32c128.1 0 232 103.9 232 232 0 13.3-10.7 24-24 24s-24-10.7-24-24c0-101.6-82.4-184-184-184-13.3 0-24-10.7-24-24s10.7-24 24-24zm8 192a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM320 88c0-13.3 10.7-24 24-24 75.1 0 136 60.9 136 136 0 13.3-10.7 24-24 24s-24-10.7-24-24c0-48.6-39.4-88-88-88-13.3 0-24-10.7-24-24zM144.1 1.4c19.7-5.4 40.3 4.7 48.1 23.5l40.5 97.3c6.9 16.5 2.1 35.6-11.8 47l-44.1 36.1c32.5 71.6 89 130 159.3 164.9L374.7 323c11.3-13.9 30.4-18.6 47-11.8L519 351.8c18.8 7.8 28.9 28.4 23.5 48.1l-1.5 5.5C523.4 470.1 460.9 525.3 384.6 509.2 209.6 472.1 71.9 334.4 34.8 159.4 18.7 83.1 73.9 20.6 138.5 2.9l5.5-1.5z"
                />
              </svg>
              Hotline: 1900 6868
            </a>
          </div>
        </div>
      </div>

      {/* MAIN BAR: luôn fixed, luôn màu nhạt (đè lên banner) */}
      <div
        id="mainbar"
        ref={mainbarRef}
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
                <li>
                  <a className="hover:text-cyan-300" href="/">
                    Trang Chủ
                  </a>
                </li>
                <li>
                  <a className="hover:text-cyan-300" href="#">
                    Giới Thiệu
                  </a>
                </li>
                <li>
                  <a className="hover:text-cyan-300" href="#">
                    Dịch Vụ
                  </a>
                </li>
                <li>
                  <a className="hover:text-cyan-300" href="#">
                    Bác Sĩ
                  </a>
                </li>
                <li>
                  <a className="hover:text-cyan-300" href="#">
                    Liên Hệ
                  </a>
                </li>
              </ul>
            </nav>

            {/* CTA + hamburger */}
            <div className="col-span-6 md:col-span-3 flex items-center justify-end gap-3">
              {/* 👇 Nếu đã đăng nhập: hiện icon user + tên + nút Đăng xuất, nếu chưa: nút Đăng Nhập */}
              {isLoggedIn ? (
                <div className="hidden md:block relative">
                  {/* Nút chính: avatar + tên, click để mở/đóng menu */}
                  <button
                    type="button"
                    onClick={() => setAccountOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2"
                    aria-haspopup="true"
                    aria-expanded={accountOpen}
                  >
                    {/* Icon chuông / thông báo */}
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-[#0a0f1f]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        width="21"
                        viewBox="0 0 448 512"
                      >
                        <path d="M224 0c-17.7 0-32 14.3-32 32l0 3.2C119 50 64 114.6 64 192l0 21.7c0 48.1-16.4 94.8-46.4 132.4L7.8 358.3C2.7 364.6 0 372.4 0 380.5 0 400.1 15.9 416 35.5 416l376.9 0c19.6 0 35.5-15.9 35.5-35.5 0-8.1-2.7-15.9-7.8-22.2l-9.8-12.2C400.4 308.5 384 261.8 384 213.7l0-21.7c0-77.4-55-142-128-156.8l0-3.2c0-17.7-14.3-32-32-32zM162 464c7.1 27.6 32.2 48 62 48s54.9-20.4 62-48l-124 0z" />
                      </svg>
                    </div>

                    {/* Icon user */}
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-[#0a0f1f]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                        className="w-5 h-5"
                      >
                        <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z" />
                      </svg>
                    </div>

                    {/* Tên user */}
                    {user?.name && (
                      <span className="text-sm font-semibold text-white truncate max-w-[120px]">
                        {user.name}
                      </span>
                    )}

                    {/* Mũi tên xuống */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-white"
                      viewBox="0 0 320 512"
                    >
                      <path d="M143 352.3L7 216.3C-2.3 207-2.3 192 7 182.6l14.1-14.1c9.4-9.4 24.6-9.4 33.9 0L160 273.5l105-105c9.4-9.4 24.6-9.4 33.9 0L313 182.6c9.4 9.4 9.4 24.6 0 33.9L177 352.3c-9.4 9.4-24.6 9.4-34 0z" />
                    </svg>
                  </button>

                  {/* Dropdown: Profile + Đăng xuất */}
                  {accountOpen && (
                    <div className="absolute right-0 mt-2 w-40 rounded-md bg-white shadow-lg py-1 z-50">
                      <a
                        href="/profile" // hoặc /dashboard tùy bạn
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setAccountOpen(false)}
                      >
                        Profile
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <a
                  href="/login"
                  className="hidden md:inline-flex items-center justify-center h-10 px-5 rounded btn-color transition"
                >
                  Đăng Nhập
                </a>
              )}

              <button
                id="open-menu"
                onClick={() => setOpen(true)}
                className="md:hidden inline-flex items-center justify-center w-10 h-10 text-white ml-2"
                aria-label="Mở menu"
              >
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
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
        ref={drawerRef}
        className={[
          "fixed inset-y-0 right-0 w-[88%] max-w-sm z-[60] p-6 text-white transition-all duration-300 ease-out",
          "bg-gradient-to-b from-[#0a0f1f]/90 via-[#0a0f1f]/60 to-transparent",
          open
            ? "translate-x-0 opacity-100 visible"
            : "translate-x-full opacity-0 invisible",
        ].join(" ")}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between mb-6">
          <span className="font-extrabold tracking-wide">MEDPRO</span>
          <button
            id="close-menu"
            onClick={() => setOpen(false)}
            className="w-10 h-10"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-4 font-raleway text-lg">
          <a
            href="/"
            className="block hover:text-cyan-300"
            onClick={() => setOpen(false)}
          >
            Trang Chủ
          </a>
          <a
            href="#"
            className="block hover:text-cyan-300"
            onClick={() => setOpen(false)}
          >
            Giới Thiệu
          </a>
          <a
            href="#"
            className="block hover:text-cyan-300"
            onClick={() => setOpen(false)}
          >
            Dịch Vụ
          </a>
          <a
            href="#"
            className="block hover:text-cyan-300"
            onClick={() => setOpen(false)}
          >
            Bác Sĩ
          </a>
          <a
            href="#"
            className="block hover:text-cyan-300"
            onClick={() => setOpen(false)}
          >
            Liên Hệ
          </a>
        </nav>

        {/* 👇 Nút bên dưới drawer: nếu login thì hiện user, nếu không thì Đăng Nhập */}
        {/* Ở trong MOBILE DRAWER */}
        {isLoggedIn ? (
          <>
            {/* Mục Profile */}
            <a
              href="/profile" // hoặc /dashboard tùy bạn
              className="mt-8 inline-flex items-center justify-start h-11 px-3 rounded bg-white/90 text-[#0a0f1f] font-semibold hover:bg-white transition w-full gap-3"
              onClick={() => setOpen(false)}
            >
              <div className="w-9 h-9 rounded-full bg-[#0a0f1f]/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  className="w-4 h-4"
                >
                  <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm leading-tight">
                  {user?.name || "Tài khoản của tôi"}
                </span>
                <span className="text-xs text-slate-600">
                  Xem thông tin tài khoản
                </span>
              </div>
            </a>

            {/* Mục Đăng xuất */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                handleLogout();
              }}
              className="mt-3 inline-flex items-center justify-start h-11 px-3 rounded bg-white/90 text-red-600 font-semibold hover:bg-white transition w-full gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  className="w-4 h-4"
                >
                  <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224H192c-17.7 0-32 14.3-32 32s14.3 32 32 32h210.7L329.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C60.7 32 32 60.7 32 96l0 320c0 35.3 28.7 64 64 64l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-320 64 0z" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm leading-tight">Đăng xuất</span>
                <span className="text-xs text-slate-600">
                  Thoát khỏi tài khoản hiện tại
                </span>
              </div>
            </button>
          </>
        ) : (
          // Trường hợp chưa đăng nhập: nút Đăng nhập cũ
          <a
            href="/login"
            className="mt-8 inline-flex items-center justify-center h-11 px-5 rounded bg-white text-black font-semibold hover:bg-[#003553] hover:text-white transition w-full"
            onClick={() => setOpen(false)}
          >
            Đăng Nhập
          </a>
        )}
      </aside>
    </header>
  );
}
