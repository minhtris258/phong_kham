import React from "react";
import { Calendar, Users, DollarSign } from "lucide-react"; // Import icon

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow p-5 flex items-center border-l-4 border-transparent hover:border-blue-500 transition">
    {/* color class sẽ tô màu cho background (bg-opacity) và cả icon (text-color) */}
    <div className={`p-3 rounded-full mr-4 ${color} bg-opacity-20`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500 font-medium uppercase">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const DashboardStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* 1. Ca khám hôm nay */}
      <StatCard
        title="Ca khám hôm nay"
        value={stats.visits_today}
        icon={<Calendar className="w-6 h-6" />}
        color="bg-blue-100 text-blue-600"
      />

      {/* 2. Tổng ca trong tháng */}
      <StatCard
        title="Tổng ca trong tháng"
        value={stats.visits_this_month}
        icon={<Users className="w-6 h-6" />}
        color="bg-green-100 text-green-600"
      />

      {/* 3. Doanh thu tháng */}
      <StatCard
        title="Doanh thu tháng"
        value={formatCurrency(stats.revenue_this_month)}
        icon={<DollarSign className="w-6 h-6" />}
        color="bg-yellow-100 text-yellow-600"
      />
    </div>
  );
};

export default DashboardStats;
