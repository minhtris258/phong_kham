// src/utils/toast.js
import { toast } from 'react-toastify';

// Cấu hình mặc định chung cho cả app
const toastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "dark",
  
};

// Xuất các hàm dùng chung
export const toastSuccess = (message) => {
  toast.success(message, toastConfig);
};

export const toastError = (message) => {
  toast.error(message, toastConfig);
};

export const toastWarning = (message) => {
  toast.warn(message, toastConfig);
};
export const toastInfo = (message) => {
  toast.info(message, toastConfig);
};