import React, { useState } from 'react'; // 👈 Import useState
import { Navbar } from './components/Navbar'; // Giả sử đường dẫn đúng
import './global.css'; // Giữ lại nếu cần
import { HomeScreen } from './Screen/Home'; // Giả sử đường dẫn đúng
import { Search } from './Screen/Search'; // Giả sử đường dẫn đúng
import { Profile } from './Screen/Profile'; // Giả sử đường dẫn đúng
import { Notifications } from './Screen/Notifications'; // Giả sử đường dẫn đúng
import { BookingView } from './Screen/Booking'; // Giả sử đường dẫn đúng
// Định nghĩa các tên màn hình (View)
type ViewState = 'HOME' | 'SEARCH' | 'BOOKING' | 'NOTIFICATIONS' | 'PROFILE';

export default function App() {
  // 1. Dùng State để lưu trữ màn hình đang hiển thị. Mặc định là 'HOME'.
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  // 2. Hàm xử lý khi nhấn vào các mục trên Navbar
  const handleChangeView = (view: ViewState) => {
    console.log(`Chuyển sang màn hình: ${view}`);
    setCurrentView(view); // Cập nhật trạng thái, React sẽ re-render
  };
  
  // 3. Hàm để render màn hình phù hợp với trạng thái
  const renderView = () => {
    switch (currentView) {
      case 'HOME':
        // Truyền hàm xử lý thông báo xuống HomeScreen nếu cần
        return <HomeScreen onNotificationIconPress={() => console.log('Notification icon pressed')} />;
      case 'SEARCH':
        return <Search title="Tìm kiếm" />;
      case 'NOTIFICATIONS':
        return <Notifications />;
        case 'PROFILE':
        return <Profile />;
     // Khi render BookingView trong App
case 'BOOKING':
  console.log('[App] rendering BookingView, preSelectedDoctor=null, passing onBack -> setCurrentView("HOME")');
  return (
    <BookingView
      preSelectedDoctor={null}
      user={{ id: 'u1', name: 'User' }}
      onBack={() => {
        console.log('[App] parent onBack called — going to HOME');
        setCurrentView('HOME');
      }}
      onBook={(appt) => console.log('Booked appointment:', appt)}
    />
  );

      default:
        return <HomeScreen onNotificationIconPress={() => console.log('Notification icon pressed')} />;
      
      // Thêm các case khác nếu cần (BOOKING, NOTIFICATIONS, v.v.)
    }
  };

  return (
    <>
      {/* Hiển thị màn hình dựa trên State */}
      {renderView()} 

      {/* Navbar luôn hiển thị và truyền hàm đổi State vào prop onChangeView */}
      <Navbar 
        currentView={currentView} // Truyền trạng thái hiện tại
        onChangeView={handleChangeView} // Truyền hàm cập nhật trạng thái
      />
      {/* Lưu ý: Chỉ hiển thị 1 màn hình và Navbar */}
    </>
  );
}