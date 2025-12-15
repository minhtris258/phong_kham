// src/components/admin/patient/StatusBadge.jsx
import React from "react";

const StatusBadge = ({ status }) => {
  // Chuẩn hóa status về chữ thường để so sánh
  const normalizedStatus = status ? status.toLowerCase() : "";

  const getStatusStyle = (s) => {
    switch (s) {
      case "active":
        return "bg-green-100 text-green-800 border border-green-200";
      case "pending_profile":
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "inactive":
      case "banned":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusText = (s) => {
    switch (s) {
      case "active":
        return "Hoạt động";
      case "pending_profile":
      case "inactive":
        return "Ngưng hoạt động";
      default:
        return "Không xác định";
    }
  };

  return (
    <span
      className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusStyle(
        normalizedStatus
      )}`}
    >
      {getStatusText(normalizedStatus)}
    </span>
  );
};

export default StatusBadge;
