import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Chatbox from "../components/Chatbox";

// Thêm destructuring { children } vào props
const UserLayout = ({ children }) => {
  return (
    // Thêm class flex để footer luôn nằm dưới đáy nếu nội dung ngắn
    <div className="user-layout-wrapper flex flex-col min-h-screen">
      <Header />

      <main className="user-content-area flex-grow">
        {/* LOGIC QUAN TRỌNG:
            - Nếu có children (được truyền trực tiếp từ AdminRoute hoặc App.js), hiển thị children (Trang 404).
            - Nếu không, hiển thị Outlet (Các route con bình thường).
        */}
        {children ? children : <Outlet />}
      </main>
      <Chatbox />
      <Footer />
    </div>
  );
};

export default UserLayout;
