import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import "../index.css";
import {
  CircleUserRound,
  Bell,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Search,
} from "lucide-react";
import { useAppContext } from "../context/AppContext.jsx";
import { useNotification } from "../context/NotificationContext.jsx";
import SearchModal from "./SearchModal";

export default function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  // State lưu vị trí Top của Modal dựa trên Header thực tế
  const [currentHeaderTop, setCurrentHeaderTop] = useState(0);

  const mainbarRef = useRef(null);
  const topbarRef = useRef(null);
  const drawerRef = useRef(null);

  const { user, isAuthenticated, handleLogout } = useAppContext();
  const { unreadCount } = useNotification();

  const getDashboardPath = () => {
    if (!user?.role) return null;
    switch (user.role) {
      case "admin": return "/admin";
      case "doctor": return "/doctor/appointments";
      default: return null;
    }
  };

  const dashboardPath = getDashboardPath();

  // --- 2. Scroll Logic (Sticky Header) & Tính toán vị trí Modal ---
  useEffect(() => {
    const positionMainbar = () => {
      const mainbar = mainbarRef.current;
      const topbar = topbarRef.current;
      if (!mainbar) return;

      const topH = topbar ? topbar.offsetHeight : 0;
      const mainH = mainbar.offsetHeight; // Lấy chiều cao thực tế của thanh menu
      const scrolledPast = window.scrollY > topH;
      
      if (scrolledPast) {
        mainbar.style.top = "0px";
        mainbar.classList.replace("z-40", "z-50");
        // Khi cuộn xuống, Header dính lên đỉnh (0px), Modal nằm ngay dưới mainH
        setCurrentHeaderTop(mainH);
      } else {
        mainbar.style.top = `${topH}px`;
        mainbar.classList.replace("z-50", "z-40");
        // Khi ở trên cùng, Modal nằm dưới cả Topbar và Mainbar
        setCurrentHeaderTop(topH + mainH);
      }
    };

    window.addEventListener("scroll", positionMainbar, { passive: true });
    window.addEventListener("resize", positionMainbar);
    positionMainbar(); // Chạy ngay lập tức để tính vị trí ban đầu

    return () => {
      window.removeEventListener("scroll", positionMainbar);
      window.removeEventListener("resize", positionMainbar);
    };
  }, []);

  // --- 3. Drawer Close Logic ---
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) => {
      if (open && drawerRef.current && !drawerRef.current.contains(e.target) && e.target.id !== "open-menu") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <header className="w-full font-raleway">
      {/* TOP BAR */}
      <div id="topbar" ref={topbarRef} className="bg-[#0095D5] py-2 hidden sm:block z-50 relative">
        <div className="container mx-auto px-4 flex items-center justify-between text-white text-sm">
          <ul className="flex gap-4 pl-3">
            <li><a href="#" className="hover:text-cyan-300 transition">FaceBook</a></li>
            <li><a href="#" className="border-l border-white/30 pl-4 hover:text-cyan-300 transition">Zalo</a></li>
            <li><a href="#" className="border-l border-white/30 pl-4 hover:text-cyan-300 transition">YouTube</a></li>
            <li><a href="#" className="border-l border-white/30 pl-4 hover:text-cyan-300 transition">TikTok</a></li>
          </ul>
          <div className="flex gap-6">
            <a href="mailto:medpro@example.com" className="hover:text-cyan-300 transition">Email: medpro@example.com</a>
            <a href="tel:19006868" className="hover:text-cyan-300 transition">Hotline: 1900 6868</a>
          </div>
        </div>
      </div>

      {/* MAIN BAR */}
      <div id="mainbar" ref={mainbarRef} className="fixed top-0 inset-x-0 z-40 bg-white shadow-md transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-[72px] md:h-[84px]">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 w-40">
              <img
                className="h-8 md:h-10 w-auto"
                src="https://medpro.vn/_next/image?url=https%3A%2F%2Fbo-api.medpro.com.vn%2Fstatic%2Fimages%2Fmedpro%2Fweb%2Fheader_logo.svg&w=1920&q=75"
                alt="Medpro Logo"
              />
            </Link>

            {/* Nav Desktop */}
            <nav className="hidden md:flex items-center">
              <ul className="flex gap-8 text-black font-semibold text-sm lg:text-lg">
                <li><Link className="hover:text-[#0095D5] transition" to="/">Trang Chủ</Link></li>
                <li><Link className="hover:text-[#0095D5] transition" to="/post">Bài Viết</Link></li>
                <li><Link className="hover:text-[#0095D5] transition" to="/services">Dịch Vụ</Link></li>
                <li><Link className="hover:text-[#0095D5] transition" to="/doctors">Bác Sĩ</Link></li>
                <li><Link className="hover:text-[#0095D5] transition" to="/about-us">Liên Hệ</Link></li>
              </ul>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Nút bấm để mở/đóng Search Modal */}
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
              >
                {isSearchOpen ? <X size={22} /> : <Search size={22} />}
              </button>

              {isAuthenticated ? (
                <>
                  <Link to="/notifications" className="relative p-2.5 text-black hover:bg-slate-100 rounded-full transition">
                    <Bell size={22} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>

                  <div className="relative hidden md:block">
                    <button
                      onClick={() => setAccountOpen(!accountOpen)}
                      className="flex items-center gap-2 text-black hover:opacity-80 transition focus:outline-none"
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <CircleUserRound size={26} strokeWidth={1.5} className="text-slate-500" />
                        )}
                      </div>
                      <span className="font-medium text-sm max-w-[100px] truncate">{user?.fullName || "User"}</span>
                    </button>

                    {accountOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        {user?.role === "patient" && (
                          <Link to="/profile" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setAccountOpen(false)}>
                            <CircleUserRound size={16} className="mr-2" /> Hồ sơ cá nhân
                          </Link>
                        )}
                        {dashboardPath && (
                          <Link to={dashboardPath} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setAccountOpen(false)}>
                            <LayoutDashboard size={16} className="mr-2" /> {user.role === "admin" ? "Quản trị hệ thống" : "Kênh bác sĩ"}
                          </Link>
                        )}
                        <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1">
                          <LogOut size={16} className="mr-2" /> Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link to="/login" className="hidden md:inline-flex items-center justify-center h-10 px-6 rounded-full btn-color text-white font-bold text-sm transition shadow-sm">
                  Đăng Nhập
                </Link>
              )}

              <button id="open-menu" onClick={() => setOpen(true)} className="md:hidden text-black p-2 hover:bg-slate-100 rounded-lg transition">
                <Menu size={26} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <aside ref={drawerRef} className={`fixed inset-y-0 right-0 w-[80%] max-w-xs z-[60] bg-[#0f172a] text-white shadow-2xl transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="font-bold text-xl tracking-widest text-cyan-400">MENU</span>
            <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition"><X size={26} /></button>
          </div>
          {/* ... (phần link mobile giữ nguyên) ... */}
        </div>
      </aside>

      {/* Overlay Backdrop cho Menu Mobile */}
      {open && <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      {/* SEARCH MODAL - Luôn nằm dưới Header nhờ prop topOffset */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        navigate={navigate}
        topOffset={currentHeaderTop}
      />
    </header>
  );
}

const MobileNavLink = ({ to, children, onClick, icon }) => (
  <Link to={to} onClick={onClick} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition font-medium">
    {icon} <span>{children}</span>
  </Link>
);