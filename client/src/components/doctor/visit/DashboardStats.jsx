import React from "react";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
};

const StatCard = ({ title, value, icon, customIcon, color }) => (
  <div className="bg-white rounded-lg shadow p-5 flex items-center border-l-4 border-transparent hover:border-blue-500 transition">
    <div className={`p-3 rounded-full mr-4 ${color} bg-opacity-20`}>
      {customIcon ? customIcon : <span className="text-2xl">{icon}</span>}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium uppercase">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const DashboardStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Ca khám hôm nay"
        value={stats.visits_today}
        icon="📅"
        color="bg-blue-100 text-blue-600"
      />
      <StatCard
        title="Tổng ca trong tháng"
        value={stats.visits_this_month}
        customIcon={<span className="text-2xl">👥</span>}
        color="bg-green-100 text-green-600"
      />
      <StatCard
        title="Doanh thu tháng"
        value={formatCurrency(stats.revenue_this_month)}
        icon="💰"
        color="bg-yellow-100 text-yellow-600"
      />
    </div>
  );
};

export default DashboardStats;