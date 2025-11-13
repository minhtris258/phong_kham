// src/components/Header.jsx
import { useEffect, useRef, useState } from "react";
import "../index.css";
import "../assets/assets.js";


export default function Header() {
  const [open, setOpen] = useState(false);
  const mainbarRef = useRef(null);
  const topbarRef = useRef(null);
  const drawerRef = useRef(null);

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
      if (drawerRef.current && !drawerRef.current.contains(e.target)) setOpen(false);
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
          <ul className="flex gap-3 text-white border-l pl-3">
            <li><a href="#">FaceBook</a></li>
            <li><a href="#">Zalo</a></li>
            <li><a href="#">YouTube</a></li>
            <li><a href="#">TikTok</a></li>
          </ul>
          <div className="ml-auto flex gap-6 text-white">
            <a href="mailto:medpro@example.com" className="flex gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" height="26" width="16" viewBox="0 0 512 512">
                <path
                  fill="#ffffff"
                  d="M61.4 64C27.5 64 0 91.5 0 125.4 0 126.3 0 127.1 .1 128L0 128 0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256-.1 0c0-.9 .1-1.7 .1-2.6 0-33.9-27.5-61.4-61.4-61.4L61.4 64zM464 192.3L464 384c0 8.8-7.2 16-16 16L64 400c-8.8 0-16-7.2-16-16l0-191.7 154.8 117.4c31.4 23.9 74.9 23.9 106.4 0L464 192.3zM48 125.4C48 118 54 112 61.4 112l389.2 0c7.4 0 13.4 6 13.4 13.4 0 4.2-2 8.2-5.3 10.7L280.2 271.5c-14.3 10.8-34.1 10.8-48.4 0L53.3 136.1c-3.3-2.5-5.3-6.5-5.3-10.7z"
                />
              </svg>
              Email: medpro@example.com
            </a>
            <a href="tel:19006868" className="flex gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" height="26" width="16" viewBox="0 0 576 512">
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
              {/* Nếu dùng Router: <Link to="/" className="inline-flex items-center"> */}
              <a href="index.html" className="inline-flex items-center">
                <img
                  className="h-9 md:h-11 w-auto"
                  src="https://medpro.vn/_next/image?url=https%3A%2F%2Fbo-api.medpro.com.vn%2Fstatic%2Fimages%2Fmedpro%2Fweb%2Fheader_logo.svg&w=1920&q=75"
                  alt="logo"
                />
              </a>
              {/* </Link> */}
            </div>

            {/* Nav desktop */}
            <nav className="col-span-6 md:col-span-6 hidden md:flex items-center justify-center">
              <ul className="flex gap-6 text-white font-raleway font-semibold">
                <li>
                  {/* <Link className="hover:text-cyan-300" to="/">Trang Chủ</Link> */}
                  <a className="hover:text-cyan-300" href="./index.html">Trang Chủ</a>
                </li>
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
                id="open-menu"
                onClick={() => setOpen(true)}
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
        ref={drawerRef}
        className={[
          "fixed inset-y-0 right-0 w-[88%] max-w-sm z-[60] p-6 text-white transition-all duration-300 ease-out",
          "bg-gradient-to-b from-[#0a0f1f]/90 via-[#0a0f1f]/60 to-transparent",
          open ? "translate-x-0 opacity-100 visible" : "translate-x-full opacity-0 invisible",
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
          {/* Nếu dùng Router: <Link to="/" className="block hover:text-cyan-300" onClick={()=>setOpen(false)}>Trang Chủ</Link> */}
          <a href="./index.html" className="block hover:text-cyan-300" onClick={() => setOpen(false)}>Trang Chủ</a>
          <a href="#" className="block hover:text-cyan-300" onClick={() => setOpen(false)}>Giới Thiệu</a>
          <a href="#" className="block hover:text-cyan-300" onClick={() => setOpen(false)}>Dịch Vụ</a>
          <a href="#" className="block hover:text-cyan-300" onClick={() => setOpen(false)}>Bác Sĩ</a>
          <a href="#" className="block hover:text-cyan-300" onClick={() => setOpen(false)}>Liên Hệ</a>
        </nav>

        <a
          href="#"
          className="mt-8 inline-flex items-center justify-center h-11 px-5 rounded bg-white text-black font-semibold hover:bg-[#003553] transition"
          onClick={() => setOpen(false)}
        >
          Đăng Nhập
        </a>
      </aside>
    </header>
  );
}
