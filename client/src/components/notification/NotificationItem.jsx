import React from "react";
import { Bell, Calendar, Clock, Trash2, Star, FileText } from "lucide-react"; // Thêm Star, FileText
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const NotificationItem = ({ notification, onClick, onDelete }) => {
  const { title, body, status, type, createdAt } = notification;
  const isUnread = status === "unread";

  // Icon theo loại
const getIcon = () => {
    switch (type) {
      // 👇 1. Thêm case cho "visit" (Kết quả khám bệnh)
      case "visit": 
        return <FileText className="w-5 h-5 text-purple-600" />;

      case "appointment": 
        // (Tùy chọn) Vẫn giữ logic cũ để hỗ trợ các thông báo cũ
        if (title.toLowerCase().includes("kết quả")) return <FileText className="w-5 h-5 text-indigo-600" />;
        return <Calendar className="w-5 h-5 text-blue-600" />;

      case "rating_request": 
        return <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />;

      case "reminder": 
        return <Clock className="w-5 h-5 text-orange-600" />;

      case "general": 
      case "system": // Thêm system nếu backend bạn dùng type này
        return <Bell className="w-5 h-5 text-green-600" />;

      default: 
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`group relative p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer flex gap-4 items-center
        ${isUnread ? "bg-indigo-50/60 border-indigo-100" : "bg-white border-gray-100 hover:border-gray-200"}
      `}
    >
      {/* Icon Tròn */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 
        ${isUnread ? "bg-white shadow-sm" : "bg-gray-100"}`}>
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0 pr-2 transition-all duration-300 ease-in-out group-hover:pr-10"> 
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-0.5 gap-1">
          <h4 className={`text-sm font-bold truncate pr-2 ${isUnread ? "text-gray-900" : "text-gray-700"}`}>
            {title}
          </h4>
          
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-gray-400 whitespace-nowrap transition-transform duration-300">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: vi })}
            </span>
            {isUnread && (
                <div className="w-2 h-2 bg-red-500 rounded-full shrink-0"></div>
            )}
          </div>
        </div>
        
        <p className="text-xs text-gray-500 truncate">
          {body}
        </p>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
        title="Xóa thông báo"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default NotificationItem;