// src/App.tsx
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text } from 'react-native'; // Thêm Text
import { NavigationContainer } from '@react-navigation/native'; 
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons'; 

// --- Components ---
import { Navbar } from './src/components/Navbar';
import { MainLayout } from './src/components/MainLayout';
import { RatingModal } from './src/components/RatingModal';
import { ChatAIScreen } from './src/Screen/ChatAIScreen';
import { ProfileCompletionScreen } from './src/Screen/ProfileCompletionScreen';

// --- Screens ---
import { HomeScreen } from './src/Screen/Home';
import { Search } from './src/Screen/Search';
import { Profile } from './src/Screen/Profile';
import { Notifications } from './src/Screen/Notifications';
import { DoctorsScreen } from './src/Screen/DoctorsScreen';
import { DoctorDetail } from './src/Screen/DoctorDetail';
import { Booking } from './src/Screen/Booking';
import { NotificationDetail } from './src/Screen/NotificationDetail';
import { PatientVisitDetail } from './src/Screen/PatientVisitDetail';
import { PostDetail } from './src/Screen/PostDetail';
import { PostPage } from './src/Screen/PostPage';
import { ServiceDetail } from './src/Screen/ServiceDetail';

// --- Sub Screens ---
import { EditProfileScreen } from './src/Screen/EditProfileScreen';
import { ChangePasswordScreen } from './src/Screen/ChangePasswordScreen';
import { MyAppointmentsScreen } from './src/Screen/MyAppointmentsScreen';

// --- Auth Screens ---
import { LoginScreen } from './src/Screen/LoginScreen';
import { RegisterScreen } from './src/Screen/RegisterScreen';

// --- Contexts ---
import { AppProvider, useAppContext } from './src/context/AppContext';
import { SocketProvider, useSocket } from './src/context/SocketContext';
import { NotificationProvider } from './src/context/NotificationContext';

import './global.css';

function AppContent() {
  const { isAuthenticated, isLoading, loadCurrentUser, user } = useAppContext();
  const { socket } = useSocket();

  // State điều hướng
  const [currentView, setCurrentView] = useState('HOME');
  const [returnView, setReturnView] = useState('HOME'); 
  
  // State Auth
  const [showAuth, setShowAuth] = useState(false);
  const [authType, setAuthType] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  
  // State dữ liệu tạm
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string | null>(null);
  const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState(null);
  
  // State Modal Đánh giá
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingNotification, setRatingNotification] = useState(null);

  // --- Logic Auth & Socket ---
  useEffect(() => {
    if (isAuthenticated) setShowAuth(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!socket) return; 

    const handleProfileUpdate = (data: any) => {
      console.log("📱 Mobile: Update profile", data);
      loadCurrentUser();
    };

    const handleNewNotification = (data: any) => {
      console.log("🔔 [App.tsx] Nhận thông báo:", data);
      const notif = data.data || data; 

      if (!isAuthenticated) {
          Toast.show({
            type: 'info',
            text1: '🔔 Bạn có thông báo mới',
            text2: 'Vui lòng đăng nhập để xem chi tiết.',
            onPress: () => {
                setAuthType('LOGIN'); 
                setShowAuth(true);
            },
            visibilityTime: 4000,
          });
          return; 
      }
      
      Toast.show({
        type: 'info',
        text1: '🔔 Thông báo mới',
        text2: notif.title || 'Bạn có thông báo mới',
        onPress: () => setCurrentView('NOTIFICATIONS'),
        visibilityTime: 4000,
      });
    };

    socket.on("profile_updated", handleProfileUpdate);
    socket.on("user_updated", handleProfileUpdate);
    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("profile_updated", handleProfileUpdate);
      socket.off("user_updated", handleProfileUpdate);
      socket.off("new_notification", handleNewNotification);
    };
  }, [socket, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user) {
        const isCompleted = user.profile_completed === true || user.profile_completed === "true";
        if (!isCompleted) {
            setCurrentView('PROFILE_COMPLETION');
        } else {
            if (currentView === 'PROFILE_COMPLETION') {
                setCurrentView('HOME');
            }
        }
    }
  }, [isAuthenticated, user, currentView]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00B5F1" />
      </View>
    );
  }

  // --- AUTH SCREEN ---
  if (showAuth) {
    if (authType === 'REGISTER') {
      return (
        <RegisterScreen 
            onLoginPress={() => setAuthType('LOGIN')} 
            onBack={() => setShowAuth(false)} 
        />
      );
    }
    return (
        <LoginScreen 
            onRegisterPress={() => setAuthType('REGISTER')}
            onBack={() => setShowAuth(false)}
        />
    );
  }

  const requireAuth = (action: () => void) => {
    if (isAuthenticated) action();
    else {
      setAuthType('LOGIN');
      setShowAuth(true);
    }
  };

  // --- RENDER MAIN VIEW ---
  const renderMainView = () => {
    switch (currentView) {
      case 'HOME':
        return (
          <MainLayout showNavbar={true}>
            <HomeScreen 
              onNotificationIconPress={() => setCurrentView('NOTIFICATIONS')}
              onDoctorSelect={(doctor) => {
                  setSelectedDoctor(doctor);
                  setCurrentView('DOCTOR_DETAIL');
              }}
              onSeeAllDoctors={() => setCurrentView('DOCTORS')}
              onSeeAllPosts={() => setCurrentView('POSTS')}
              onPostSelect={(slug) => {
                  setSelectedPostSlug(slug);
                  setCurrentView('POST_DETAIL');
              }}
              onSelectSpecialty={(id) => {
                  setSelectedSpecialtyId(id);
                  setCurrentView('DOCTORS');
              }}
            />
          </MainLayout>
        );

      case 'POST_DETAIL':
        return (
            <MainLayout showNavbar={false} backgroundColor="#FFF">
                <PostDetail 
                    postSlug={selectedPostSlug || ''}
                    onBack={() => setCurrentView('HOME')} 
                    onRelatedPostClick={(slug) => setSelectedPostSlug(slug)} 
                />
            </MainLayout>
        );

      case 'POSTS':
       return (
          <MainLayout showNavbar={true}>
            <PostPage 
                onPostSelect={(slug) => {
                    setSelectedPostSlug(slug);
                    setCurrentView('POST_DETAIL');
                }}
                onServiceSelect={(service) => {
                    setSelectedService(service);
                    setCurrentView('SERVICE_DETAIL');
                }}
            />
          </MainLayout>
        );

      case 'SERVICE_DETAIL':
        return (
            <MainLayout showNavbar={false} backgroundColor="#FFF">
                <ServiceDetail 
                    service={selectedService}
                    onBack={() => setCurrentView('POSTS')} 
                    onBook={(item) => {
                        console.log("Booking service:", item.name);
                    }}
                />
            </MainLayout>
        );

      case 'NOTIFICATIONS':
        return (
          <MainLayout showNavbar={true}>
            {isAuthenticated ? (
                // Nếu ĐÃ ĐĂNG NHẬP -> Hiện danh sách thông báo
                <Notifications 
                    onSelectNotification={(item) => {
                        setSelectedNotification(item);
                        setCurrentView('NOTIFICATION_DETAIL');
                    }}
                />
            ) : (
                // Nếu CHƯA ĐĂNG NHẬP -> Hiện màn hình trống / yêu cầu đăng nhập
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
                    <Ionicons name="notifications-off-outline" size={80} color="#E5E7EB" />
                    <Text style={{ marginTop: 20, fontSize: 16, color: '#6B7280', textAlign: 'center' }}>
                        Bạn chưa đăng nhập.
                    </Text>
                    <Text style={{ marginTop: 5, fontSize: 14, color: '#9CA3AF', marginBottom: 20 }}>
                        Vui lòng đăng nhập để xem thông báo.
                    </Text>
                    <TouchableOpacity 
                        style={{
                            backgroundColor: '#00B5F1',
                            paddingHorizontal: 30,
                            paddingVertical: 12,
                            borderRadius: 25
                        }}
                        onPress={() => { setAuthType('LOGIN'); setShowAuth(true); }}
                    >
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Đăng nhập ngay</Text>
                    </TouchableOpacity>
                </View>
            )}
          </MainLayout>
        );

      case 'NOTIFICATION_DETAIL':
        return (
            <MainLayout showNavbar={false} backgroundColor="#FFF">
                <NotificationDetail 
                    notification={selectedNotification}
                    onBack={() => setCurrentView('NOTIFICATIONS')}
                    onRate={(item) => {
                        setRatingNotification(item);
                        setShowRatingModal(true);
                    }}
                    onViewResult={(item) => {
                        if (item.appointment_id) {
                            setSelectedAppointmentId(item.appointment_id);
                            setReturnView('NOTIFICATIONS'); 
                            setCurrentView('VISIT_DETAIL');
                        } else {
                            console.log("Không tìm thấy ID lịch hẹn");
                        }
                    }}
                />
            </MainLayout>
        );

      case 'VISIT_DETAIL':
        return (
            <MainLayout showNavbar={false} backgroundColor="#F9FAFB">
                <PatientVisitDetail 
                    appointmentId={selectedAppointmentId || ''}
                    onBack={() => setCurrentView(returnView)} 
                />
            </MainLayout>
        );

      case 'PROFILE':
        return (
          <MainLayout showNavbar={true}>
            <Profile 
                onLoginPress={() => { setAuthType('LOGIN'); setShowAuth(true); }}
               onRegisterPress={() => { 
                    setAuthType('REGISTER'); 
                    setShowAuth(true); 
                }}
                onNavigate={(screen) => setCurrentView(screen)} 
            />
          </MainLayout>
        );

      case 'EDIT_PROFILE':
        return (
            <MainLayout showNavbar={false} backgroundColor="#FFF">
                <EditProfileScreen onBack={() => setCurrentView('PROFILE')} />
            </MainLayout>
        );
      
      case 'CHANGE_PASSWORD':
        return (
            <MainLayout showNavbar={false} backgroundColor="#FFF">
                <ChangePasswordScreen onBack={() => setCurrentView('PROFILE')} />
            </MainLayout>
        );

      case 'MY_APPOINTMENTS':
        return (
            <MainLayout showNavbar={false} backgroundColor="#F9FAFB">
                <MyAppointmentsScreen 
                    onBack={() => setCurrentView('PROFILE')}
                    onViewResult={(appointmentId) => {
                        setSelectedAppointmentId(appointmentId);
                        setReturnView('MY_APPOINTMENTS');
                        setCurrentView('VISIT_DETAIL');
                    }}
                />
            </MainLayout>
        );

      case 'DOCTORS':
        return (
          <MainLayout showNavbar={true}>
            <DoctorsScreen 
              initialSpecialty={selectedSpecialtyId}
              onBack={() => {
                  setSelectedSpecialtyId(null); 
                  setCurrentView('HOME');
              }}
              onSelectDoctor={(doctor) => {
                setSelectedDoctor(doctor);
                setCurrentView('DOCTOR_DETAIL');
              }}
            />
          </MainLayout>
        );

      case 'DOCTOR_DETAIL':
        return (
          <MainLayout showNavbar={false} backgroundColor="#FFF">
            <DoctorDetail 
              doctor={selectedDoctor}
              onBack={() => setCurrentView('DOCTORS')} 
              onBookPress={(data) => {
                requireAuth(() => {
                    setBookingData(data);
                    setCurrentView('BOOKING');
                });
              }}
            />
          </MainLayout>
        );

      case 'BOOKING':
        return (
          <MainLayout showNavbar={false} backgroundColor="#FFF">
            <Booking 
              bookingData={bookingData}
              onBack={() => setCurrentView('DOCTOR_DETAIL')}
              onSuccess={() => setCurrentView('HOME')}
            />
          </MainLayout>
        );

      case 'CHAT_AI':
        return (
            <MainLayout showNavbar={false} backgroundColor="#F3F4F6">
                <ChatAIScreen onBack={() => setCurrentView(returnView || 'HOME')} />
            </MainLayout>
        );
      
      case 'PROFILE_COMPLETION':
        return (
            <MainLayout showNavbar={false} backgroundColor="#F3F4F6">
                <ProfileCompletionScreen 
                    onSuccess={() => {
                        setCurrentView('HOME'); 
                    }} 
                />
            </MainLayout>
        );
      
      default:
        return (
            <MainLayout showNavbar={true}>
                <HomeScreen />
            </MainLayout>
        );
    }
  };

  return (
    <>
      {renderMainView()}
      
      {['HOME', 'POSTS', 'NOTIFICATIONS', 'PROFILE', 'DOCTORS'].includes(currentView) && (
        <Navbar 
            currentView={currentView} 
            onChangeView={(view) => {
                if (view === 'DOCTORS') setSelectedSpecialtyId(null); 
                setCurrentView(view);
            }} 
        />
      )}

      {/* NÚT CHAT AI NỔI (FAB) */}
      {['HOME', 'POSTS', 'DOCTORS', 'NOTIFICATIONS'].includes(currentView) && (
          <TouchableOpacity
            style={{
                position: 'absolute', bottom: 100, right: 20,
                width: 50, height: 50, borderRadius: 25,
                backgroundColor: '#00B5F1',
                justifyContent: 'center', alignItems: 'center',
                elevation: 5, shadowColor: '#00B5F1', shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 4,
                zIndex: 100
            }}
            onPress={() => {
                setReturnView(currentView); 
                setCurrentView('CHAT_AI');
            }}
          >
            <Ionicons name="chatbubble-ellipses" size={28} color="#FFF" />
          </TouchableOpacity>
      )}

      <RatingModal 
        visible={showRatingModal}
        notification={ratingNotification}
        onClose={() => setShowRatingModal(false)}
        onSuccess={() => setCurrentView('NOTIFICATIONS')}
      />
    </>
  );
}

export default function App() {
 return (
    <NavigationContainer>
      <AppProvider>
        <SocketProvider> 
          <NotificationProvider> 
            <AppContent /> 
            <Toast position='top' topOffset={50} />
          </NotificationProvider>
        </SocketProvider>
      </AppProvider>
    </NavigationContainer>
  );
}