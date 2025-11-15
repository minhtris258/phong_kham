import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header'; // Giả sử có component này
import Footer from '../components/Footer'; // Giả sử có component này

const UserLayout = () => {
  return (
    <div className="user-layout-wrapper">
      <Header />
      
      {/* <Outlet /> là nơi React Router sẽ render component 
        con (như HomePage, ProfilePage) tương ứng với Route
      */}
      <main className="user-content-area">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default UserLayout;