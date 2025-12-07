import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom"; // Use Link for SPA navigation
import "../index.css";
import {
  CircleUserRound,
  Bell,
  LogOut,
  LayoutDashboard,
  Menu, // Use lucide icon for consistency
  X,    // Use lucide icon for consistency
} from "lucide-react";
import { useAppContext } from "../context/AppContext.jsx";
import { useNotification } from "../context/NotificationContext.jsx";

export default function Header() {
  const [open, setOpen] = useState(false);
  const mainbarRef = useRef(null);
  const topbarRef = useRef(null);
  const drawerRef = useRef(null);

  const [accountOpen, setAccountOpen] = useState(false);
  
  // Use Context directly instead of manual localStorage parsing
  const { user, isAuthenticated, handleLogout } = useAppContext();
  const { unreadCount } = useNotification(); // Get unread count for badge

  // --- 1. Determine Dashboard Path ---
  const getDashboardPath = () => {
    if (!user?.role) return null;
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'doctor':
        return '/doctor/appointments'; // Default doctor landing page
      default:
        return null;
    }
  };

  const dashboardPath = getDashboardPath();

  // --- 2. Scroll Logic (Sticky Header) ---
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

  // --- 3. Drawer Close Logic ---
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) => {
      if (!open) return;
      if (drawerRef.current && !drawerRef.current.contains(e.target) && e.target.id !== "open-menu")
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
        className="bg-[#0095D5] py-2 hidden sm:block z-50 relative"
      >
        <div className="container mx-auto px-4 flex items-center">
          <ul className="flex gap-3 text-white pl-3 text-sm">
            <li><a href="#" className="hover:text-cyan-300">FaceBook</a></li>
            <li><a href="#" className="border-l pl-3 hover:text-cyan-300">Zalo</a></li>
            <li><a href="#" className="border-l pl-3 hover:text-cyan-300">YouTube</a></li>
            <li><a href="#" className="border-l pl-3 hover:text-cyan-300">TikTok</a></li>
          </ul>
          <div className="ml-auto flex gap-6 text-white text-sm">
            <a href="mailto:medpro@example.com" className="hover:text-cyan-300">Email: medpro@example.com</a>
            <a href="tel:19006868" className="hover:text-cyan-300">Hotline: 1900 6868</a>
          </div>
        </div>
      </div>

      {/* MAIN BAR */}
      <div
        id="mainbar"
        ref={mainbarRef}
        className="fixed top-0 inset-x-0 z-40 bg-white shadow-xl to-transparent backdrop-blur-sm transition-all duration-300"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-[72px] md:h-[84px]">
            
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                className="h-8 md:h-10 w-auto"
                src="https://medpro.vn/_next/image?url=https%3A%2F%2Fbo-api.medpro.com.vn%2Fstatic%2Fimages%2Fmedpro%2Fweb%2Fheader_logo.svg&w=1920&q=75"
                alt="Medpro Logo"
              />
            </Link>

            {/* Nav Desktop */}
            <nav className="hidden md:flex items-center gap-8 ">
              <ul className="flex gap-6 text-black font-raleway font-semibold text-sm lg:text-lg">
                <li><Link className="hover:text-cyan-300 transition" to="/">Trang Chủ</Link></li>
                <li><Link className="hover:text-cyan-300 transition" to="/post">Bài Viết</Link></li>
                <li><Link className="hover:text-cyan-300 transition" to="/services">Dịch Vụ</Link></li>
                <li><Link className="hover:text-cyan-300 transition" to="/doctors">Bác Sĩ</Link></li>
                <li><Link className="hover:text-cyan-300 transition" to="/about-us">Liên Hệ</Link></li>
              </ul>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              
              {isAuthenticated ? (
                <>
                  {/* Notification Bell */}
                  <Link
                    to="/notifications"
                    className="relative p-2 text-black hover:bg-white/10 rounded-full transition"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* User Dropdown (Desktop) */}
                  <div className="relative hidden md:block">
                    <button
                      onClick={() => setAccountOpen(!accountOpen)}
                      className="flex items-center gap-2 text-black hover:opacity-80 transition focus:outline-none"
                    >
                      <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                        {user?.avatar ? (
                           <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover"/>
                        ) : (
                           <CircleUserRound size={30} strokeWidth={1.5} />
                        )}
                      </div>
                      <span className="font-medium text-sm max-w-[100px] truncate">{user?.fullName || "User"}</span>
                    </button>

                    {/* Dropdown Menu */}
                    {accountOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 border border-gray-100">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>

                        {/* --- CHỈ HIỆN VỚI BỆNH NHÂN --- */}
                        {user?.role === 'patient' && (
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-cyan-600"
                            onClick={() => setAccountOpen(false)}
                          >
                            <CircleUserRound size={16} className="mr-2" />
                            Hồ sơ cá nhân
                          </Link>
                        )}

                        {/* Admin/Doctor Dashboard Link */}
                        {dashboardPath && (
                          <Link
                            to={dashboardPath}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                            onClick={() => setAccountOpen(false)}
                          >
                            <LayoutDashboard size={16} className="mr-2" />
                            {user.role === 'admin' ? 'Quản trị hệ thống' : 'Kênh bác sĩ'}
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            setAccountOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1"
                        >
                          <LogOut size={16} className="mr-2" />
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Login Button (Desktop) */
                <Link
                  to="/login"
                  className="hidden md:inline-flex items-center justify-center h-9 px-5 rounded-full btn-color text-white font-semibold text-sm transition shadow-sm"
                >
                  Đăng Nhập
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                id="open-menu"
                onClick={() => setOpen(true)}
                className="md:hidden text-black p-2 hover:bg-white/10 rounded-lg transition"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE DRAWER --- */}
      <aside
        ref={drawerRef}
        className={`fixed inset-y-0 right-0 w-[80%] max-w-xs z-[60] bg-[#0f172a] text-white shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-5">
          {/* Drawer Header */}
          <div className="flex items-center justify-between mb-8">
            <span className="font-bold text-xl tracking-wider text-cyan-400">MENU</span>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* User Info (Mobile) */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3 mb-8 p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="w-12 h-12 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate">{user?.fullName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="block w-full py-3 mb-8 text-center btn-color rounded-xl font-bold transition shadow-lg"
              onClick={() => setOpen(false)}
            >
              Đăng Nhập Ngay
            </Link>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1">
            <MobileNavLink to="/" onClick={() => setOpen(false)}>Trang Chủ</MobileNavLink>
            <MobileNavLink to="/post" onClick={() => setOpen(false)}>Bài Viết</MobileNavLink>
            <MobileNavLink to="/doctors" onClick={() => setOpen(false)}>Đặt Lịch Bác Sĩ</MobileNavLink>
            
            {isAuthenticated && (
              <>
                <div className="my-4 border-t border-white/10"></div>
                
                {/* --- CHỈ HIỆN VỚI BỆNH NHÂN --- */}
                {user?.role === 'patient' && (
                  <MobileNavLink to="/profile" onClick={() => setOpen(false)} icon={<CircleUserRound size={18}/>}>
                    Hồ sơ cá nhân
                  </MobileNavLink>
                )}

                <MobileNavLink to="/notifications" onClick={() => setOpen(false)} icon={<Bell size={18}/>}>
                  Thông báo {unreadCount > 0 && <span className="ml-auto bg-red-500 text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
                </MobileNavLink>
                
                {/* Admin/Doctor Link Mobile */}
                {dashboardPath && (
                  <MobileNavLink to={dashboardPath} onClick={() => setOpen(false)} icon={<LayoutDashboard size={18} className="text-cyan-400"/>}>
                    <span className="text-cyan-400">{user.role === 'admin' ? 'Quản Trị Viên' : 'Kênh Bác Sĩ'}</span>
                  </MobileNavLink>
                )}
              </>
            )}
          </nav>

          {/* Logout Button */}
          {isAuthenticated && (
            <button
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
              className="mt-auto flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition font-medium border border-red-500/20"
            >
              <LogOut size={18} /> Đăng Xuất
            </button>
          )}
        </div>
      </aside>

      {/* Overlay backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
    </header>
  );
}

// Helper Component for Mobile Links
const MobileNavLink = ({ to, children, onClick, icon }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition"
  >
    {icon}
    <span className="font-medium">{children}</span>
  </Link>
);