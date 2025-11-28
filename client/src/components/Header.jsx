import { useEffect, useRef, useState } from "react";
import "../index.css";
// import "../assets/assets.js"; // Bỏ comment nếu bạn có file này
import {
  CircleUserRound,
  Bell,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useAppContext } from "../context/AppContext.jsx";

export default function Header() {
  const [open, setOpen] = useState(false);
  const mainbarRef = useRef(null);
  const topbarRef = useRef(null);
  const drawerRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const { handleLogout } = useAppContext();

  // --- 1. Logic lấy thông tin User & Role ---
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const userRaw = localStorage.getItem("user");
      if (token) {
        setIsLoggedIn(true);
        if (userRaw) {
          const parsedUser = JSON.parse(userRaw);
          setUser(parsedUser);
          // Debug role để kiểm tra
          // console.log("User Role:", parsedUser.role);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (e) {
      console.error("Cannot parse user from localStorage", e);
    }
  }, []);

  // --- 2. Hàm xác định đường dẫn Dashboard ---
  const getDashboardPath = () => {
    if (!user?.role) return null;
    
    // Logic theo yêu cầu: admin -> /admin, doctor -> /doctor
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'doctor':
        return '/doctor'; // Hoặc '/doctor/visits' tùy route bạn định nghĩa
      default:
        return null;
    }
  };

  const dashboardPath = getDashboardPath();

  // --- 3. Logic Scroll Header ---
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

  // --- 4. Logic đóng/mở Drawer ---
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
      {/* TOP BAR */}
      <div
        id="topbar"
        ref={topbarRef}
        className="bg-[#28303f] py-2 hidden sm:block z-50 relative"
      >
        <div className="container mx-auto px-4 flex items-center">
          <ul className="flex gap-3 text-white pl-3">
            <li><a href="#">FaceBook</a></li>
            <li><a href="#" className="border-l pl-3">Zalo</a></li>
            <li><a href="#" className="border-l pl-3">YouTube</a></li>
            <li><a href="#" className="border-l pl-3">TikTok</a></li>
          </ul>
          <div className="ml-auto flex gap-6 text-white">
            <a href="mailto:medpro@example.com" className="flex gap-2">Email: medpro@example.com</a>
            <a href="tel:19006868" className="flex gap-2">Hotline: 1900 6868</a>
          </div>
        </div>
      </div>

      {/* MAIN BAR */}
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
                <li><a className="hover:text-cyan-300" href="/">Trang Chủ</a></li>
                <li><a className="hover:text-cyan-300" href="#">Giới Thiệu</a></li>
                <li><a className="hover:text-cyan-300" href="#">Dịch Vụ</a></li>
                <li><a className="hover:text-cyan-300" href="#">Bác Sĩ</a></li>
                <li><a className="hover:text-cyan-300" href="#">Liên Hệ</a></li>

              </ul>
            </nav>

            {/* CTA + hamburger */}
            <div className="col-span-6 md:col-span-3 flex items-center justify-end gap-3 ">
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  {/* ICON CHUÔNG (Desktop) */}
                  <a
                    href="/notifications"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition text-white"
                    onClick={() => setOpen(false)}
                  >
                    <div className="hidden md:flex w-10 h-10 rounded-full bg-white/90 items-center justify-center text-[#0a0f1f] hover:bg-white transition cursor-pointer">
                      <Bell size={20} />
                    </div>
                  </a>
                  
                  {/* Dropdown User */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAccountOpen((prev) => !prev)}
                      className="inline-flex items-center gap-2"
                    >
                      <div className="hidden md:flex w-10 h-10 rounded-full bg-white/90 items-center justify-center text-[#0a0f1f]">
                        <CircleUserRound size={24} />
                      </div>
                      {user?.name && (
                        <span className="text-sm font-semibold text-white truncate max-w-[120px] hidden md:block">
                          {user.name}
                        </span>
                      )}
                    </button>

                    {/* --- DESKTOP DROPDOWN --- */}
                    {accountOpen && (
                      <div className="hidden md:block absolute right-0 mt-2 w-56 rounded-md bg-white shadow-xl py-1 z-50 ring-1 ring-black ring-opacity-5">
                        <a
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setAccountOpen(false)}
                        >
                          <CircleUserRound size={16} className="mr-2" />
                          Hồ sơ cá nhân
                        </a>

                        {/* --- [NEW] Dashboard Link cho Admin/Doctor --- */}
                        {dashboardPath && (
                          <a
                            href={dashboardPath}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100"
                            onClick={() => setAccountOpen(false)}
                          >
                            <LayoutDashboard
                              size={16}
                              className="mr-2 text-indigo-600"
                            />
                            {user.role === 'admin' ? 'Trang quản trị' : 'Trang bác sĩ'}
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setAccountOpen(false);
                            handleLogout();
                          }}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 border-t border-gray-100"
                        >
                          <LogOut size={16} className="mr-2" />
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <a
                  href="/login"
                  className="hidden md:inline-flex items-center justify-center h-10 px-5 rounded btn-color transition font-medium"
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
          "fixed inset-y-0 right-0 w-[85%] max-w-sm z-[60] p-6 text-white transition-all duration-300 ease-out",
          "bg-gradient-to-b from-[#0a0f1f]/95 via-[#0a0f1f]/90 to-[#0a0f1f]/80 backdrop-blur-sm",
          open
            ? "translate-x-0 opacity-100 visible"
            : "translate-x-full opacity-0 invisible",
        ].join(" ")}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between mb-8">
          <span className="font-extrabold tracking-wide text-xl">MEDPRO</span>
          <button
            id="close-menu"
            onClick={() => setOpen(false)}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>


        <nav className="space-y-6 font-raleway text-lg border-b border-white/10 pb-6 mb-6">
          <a href="/" className="block hover:text-cyan-300 transition" onClick={() => setOpen(false)}>Trang Chủ</a>
          <a href="#" className="block hover:text-cyan-300 transition" onClick={() => setOpen(false)}>Giới Thiệu</a>
          <a href="#" className="block hover:text-cyan-300 transition" onClick={() => setOpen(false)}>Dịch Vụ</a>
          <a href="#" className="block hover:text-cyan-300 transition" onClick={() => setOpen(false)}>Bác Sĩ</a>
          <a href="#" className="block hover:text-cyan-300 transition" onClick={() => setOpen(false)}>Liên Hệ</a>
        </nav>

        {isLoggedIn ? (
          <div className="space-y-2">
            {/* Mục Thông báo */}
            <a
              href="/notifications"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition text-white"
              onClick={() => setOpen(false)}
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                <Bell size={22} />
              </div>
              <span className="font-medium">Thông báo</span>
            </a>

            {/* Mục Profile */}
            <a
              href="/profile"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition text-white"
              onClick={() => setOpen(false)}
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                <CircleUserRound size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-base leading-tight">
                  {user?.name || "Tài khoản của tôi"}
                </span>
                <span className="text-xs text-gray-300">Xem hồ sơ cá nhân</span>
              </div>
            </a>

            {/* --- [NEW] Dashboard Link cho Admin/Doctor (Mobile) --- */}
            {dashboardPath && (
              <a
                href={dashboardPath}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition text-indigo-300"
                onClick={() => setOpen(false)}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                  <LayoutDashboard size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-base leading-tight">
                    {user.role === 'admin' ? 'Dashboard Admin' : 'Trang Bác Sĩ'}
                  </span>
                  <span className="text-xs text-white/60">
                    {user.role === 'admin' ? 'Trang quản trị viên' : 'Quản lý lịch khám'}
                  </span>
                </div>
              </a>
            )}

            {/* Mục Đăng xuất */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                handleLogout();
              }}
              className="flex w-full items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition text-red-400 font-medium"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <LogOut size={20} />
              </div>
              <span>Đăng xuất</span>
            </button>
          </div>
        ) : (
          <a
            href="/login"
            className="flex items-center justify-center h-12 w-full rounded-lg bg-white text-[#0a0f1f] font-bold hover:bg-gray-100 transition"
            onClick={() => setOpen(false)}
          >
            Đăng Nhập
          </a>
        )}
      </aside>
    </header>
  );
}