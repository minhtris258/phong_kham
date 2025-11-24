import React from "react";
import { X, User, Clock, Calendar, QrCode, CheckCircle } from "lucide-react";

const NotificationDetailModal = ({ notification, onClose }) => {
  if (!notification) return null;
  const { title, body, data, qr, createdAt } = notification;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex justify-between items-start">
          <h3 className="text-white text-lg font-bold pr-8">{title}</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition">
            <X size={20} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {/* Thời gian */}
          <p className="text-xs text-gray-400 flex items-center gap-1">
             <Clock size={12} /> {new Date(createdAt).toLocaleString('vi-VN')}
          </p>

          {/* Nội dung chính */}
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
            {body}
          </p>

          {/* Thông tin chi tiết (nếu có) */}
          {data && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2 text-sm">
              {data.doctorName && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Bác sĩ</p>
                    <p className="font-semibold">{data.doctorName}</p>
                  </div>
                </div>
              )}
              
              {data.time && data.date && (
                <div className="flex items-center gap-3 text-gray-700 border-t border-gray-100 pt-2 mt-2">
                  <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Thời gian khám</p>
                    <p className="font-semibold">{data.time} - {data.date}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* QR Code (Quan trọng nhất) */}
          {qr && (
            <div className="flex flex-col items-center justify-center pt-4 border-t border-dashed border-gray-200">
              <p className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wider flex items-center gap-1">
                <QrCode size={14} /> Mã Check-in
              </p>
              <div className="p-2 border-2 border-indigo-100 rounded-xl bg-white shadow-sm">
                <img src={qr} alt="QR Check-in" className="w-40 h-40 object-contain" />
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center">
                Đưa mã này cho lễ tân để xác thực
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailModal;