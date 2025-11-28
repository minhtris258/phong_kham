import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext'; 
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext.jsx';


createRoot(document.getElementById('root')).render(
<StrictMode>
    <SocketProvider> 
      <AppProvider> 
        <NotificationProvider>
        <App />
        </NotificationProvider>
      </AppProvider>
    </SocketProvider>
  </StrictMode>,
)
