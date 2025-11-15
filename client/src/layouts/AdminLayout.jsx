// Pages/Admin/AdminLayout.jsx (Sửa đổi để dùng Router)
import { Outlet, Link } from "react-router-dom";
import { useState } from "react"; 
// Không cần import các Page Components nữa vì Router sẽ quản lý chúng
import Sidebar from "../components/admin/Sidebar";
import Header from "../components/admin/Header";


const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Lưu ý: Bạn không cần useState cho currentView nữa!

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    
    // Hủy bỏ hàm renderContent() vì chức năng này do Router đảm nhiệm.

    return (
        // Khung ngoài cùng: Chiều cao toàn màn hình, không cuộn
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            
            {/* 1. Sidebar */}
            {/* Sidebar vẫn cần quản lý trạng thái mở/đóng */}
            {/* Các link trong Sidebar bây giờ sẽ dùng <Link to="..."> thay vì gọi setView */}
            <Sidebar 
                isOpen={isSidebarOpen} 
                toggleSidebar={toggleSidebar} 
                // Có thể truyền currentPath xuống Sidebar để highlight link đang active
            />

            {/* Backdrop cho Mobile Sidebar */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black opacity-50 z-20 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* 2. Main Content Area (Header + Content) */}
            {/* Khu vực chính: Chiếm hết phần còn lại, kích hoạt cuộn dọc */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                
                {/* Header: Đã là sticky top-0, sẽ cố định khi cuộn */}
                <Header 
                    toggleSidebar={toggleSidebar} 
                    // Loại bỏ setView nếu Header không có chức năng chuyển đổi view nội bộ
                />

                {/* Nội dung chính: 
                    Đây là nơi các component con (Dashboard, PatientManagement, v.v.)
                    tương ứng với các routes lồng nhau sẽ được render.
                */}
                <main className="flex-1 p-4 sm:p-6">
                    <Outlet /> 
                </main>
                
            </div>
        </div>
    );
};

export default AdminLayout;