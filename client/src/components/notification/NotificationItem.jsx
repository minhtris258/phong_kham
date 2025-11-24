import React from "react";
import { Bell, Calendar, Clock, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const NotificationItem = ({ notification, onClick, onDelete }) => {
  const { title, body, status, type, createdAt } = notification;
  const isUnread = status === "unread";

  // Icon theo loại
  const getIcon = () => {
    switch (type) {
      case "appointment": return <Calendar className="w-5 h-5 text-blue-600" />;
      case "reminder": return <Clock className="w-5 h-5 text-orange-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
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
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
        ${isUnread ? "bg-white shadow-sm" : "bg-gray-100"}`}>
        {getIcon()}
      </div>

      {/* Nội dung Rút gọn */}
      <div className="flex-1 min-w-0"> {/* min-w-0 để truncate hoạt động */}
        <div className="flex justify-between items-baseline mb-0.5">
          <h4 className={`text-sm font-bold truncate pr-2 ${isUnread ? "text-gray-900" : "text-gray-700"}`}>
            {title}
          </h4>
          <span className="text-[10px] text-gray-400 shrink-0">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: vi })}
          </span>
        </div>
        
        {/* Line clamp 1 dòng */}
        <p className="text-xs text-gray-500 truncate">
          {body}
        </p>
      </div>

      {/* Chấm đỏ nếu chưa đọc */}
      {isUnread && (
        <div className="w-2 h-2 bg-red-500 rounded-full shrink-0"></div>
      )}

      {/* Nút xóa (Hiện khi hover) */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default NotificationItem;