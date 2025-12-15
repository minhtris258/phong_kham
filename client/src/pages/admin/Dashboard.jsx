// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Users, Calendar, Activity, DollarSign, Loader2 } from "lucide-react";

// Components
import KPICard from "../../components/admin/KPICard";
import AppointmentTrendChart from "../../components/admin/AppointmentTrendChart";
import AppointmentStatusChart from "../../components/admin/AppointmentStatusChart";
import RecentActivity from "../../components/admin/RecentActivity";

// Services
import dashboardService from "../../services/DashboardService";
import { toastError } from "../../utils/toast";

const DashboardContent = () => {
  const [loading, setLoading] = useState(true);

  // State lưu dữ liệu
  const [kpiData, setKpiData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [activities, setActivities] = useState([]);

  // State cho bộ lọc biểu đồ (Mặc định là 'month')
  const [trendFilter, setTrendFilter] = useState("month");

  // === 1. FETCH DỮ LIỆU TỔNG QUAN (Chạy 1 lần đầu tiên) ===
  useEffect(() => {
    const fetchGeneralData = async () => {
      setLoading(true);
      try {
        // Gọi các API KHÔNG phụ thuộc vào bộ lọc Trend
        const [statsRes, statusRes, topDocsRes, activityRes] =
          await Promise.all([
            dashboardService.getStats().catch(() => null),
            dashboardService.getAppointmentStatus().catch(() => []),
            dashboardService.getTopDoctors().catch(() => []),
            dashboardService.getRecentActivity().catch(() => []),
          ]);

        // 1. Xử lý KPI Cards
        if (statsRes) {
          setKpiData([
            {
              title: "Tổng Lịch Hẹn",
              value: statsRes.totalAppointments || 0,
              change: "+12%",
              period: "tháng trước",
              isPositive: true,
              icon: Calendar,
              color: "sky",
            },
            {
              title: "Tổng Doanh Thu",
              value: (statsRes.totalRevenue || 0).toLocaleString("vi-VN") + "đ",
              change: "+8%",
              period: "tháng trước",
              isPositive: true,
              icon: DollarSign,
              color: "green",
            },
            {
              title: "Bệnh Nhân Mới",
              value: statsRes.newPatients || 0,
              change: "-2%",
              period: "tháng trước",
              isPositive: false,
              icon: Users,
              color: "blue",
            },
            {
              title: "Hiệu Suất Hoạt Động",
              value: "95%",
              change: "+5%",
              period: "tháng trước",
              isPositive: true,
              icon: Activity,
              color: "yellow",
            },
          ]);
        }

        // 2. Xử lý biểu đồ Status
        const coloredStatus = (statusRes || []).map((item) => {
          let color = "bg-gray-500";
          if (item.status === "Hoàn thành" || item.status === "completed")
            color = "bg-green-500";
          if (item.status === "Đã hủy" || item.status === "cancelled")
            color = "bg-red-500";
          if (item.status === "Đã xác nhận" || item.status === "confirmed")
            color = "bg-blue-500";
          if (item.status === "Chờ xác nhận" || item.status === "pending")
            color = "bg-yellow-500";
          return { ...item, color };
        });
        setStatusData(coloredStatus);

        // 3. Top Doctors & Activity
        setTopDoctors(topDocsRes || []);
        setActivities(activityRes || []);
      } catch (err) {
        console.error("Dashboard General Error:", err);
        toastError("Không thể tải dữ liệu tổng quan.");
      } finally {
        setLoading(false);
      }
    };

    fetchGeneralData();
  }, []);

  // === 2. FETCH DỮ LIỆU TREND (Chạy khi trendFilter thay đổi) ===
  useEffect(() => {
    const fetchTrendData = async () => {
      // Lưu ý: Không set loading toàn trang để tránh nhấp nháy,
      // component Chart sẽ tự xử lý hoặc hiển thị data cũ cho đến khi data mới về
      try {
        // Truyền tham số type (day/month/year) vào service
        // Đảm bảo dashboardService.getAppointmentTrend chấp nhận params
        const trendRes = await dashboardService.getAppointmentTrend({
          type: trendFilter,
        });
        setTrendData(trendRes || []);
      } catch (err) {
        console.error("Trend Error:", err);
        setTrendData([]);
      }
    };

    fetchTrendData();
  }, [trendFilter]); // Chạy lại mỗi khi trendFilter thay đổi

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
          <p className="text-gray-500 text-sm">Đang tải dữ liệu tổng quan...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Dashboard Đặt Lịch Khám
        </h1>
        <p className="text-gray-500 mt-1">
          Tổng quan về lịch hẹn và hiệu suất của phòng khám.
        </p>
      </header>

      {/* 1. KPI Cards Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </section>

      {/* 2. Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Biểu đồ Xu hướng Lịch Hẹn */}
        <div className="lg:col-span-2">
          {/* Truyền props onFilterChange để nhận sự kiện từ Chart */}
          <AppointmentTrendChart
            data={trendData}
            onFilterChange={setTrendFilter}
          />
        </div>

        {/* Biểu đồ Trạng thái Lịch Hẹn */}
        <div className="lg:col-span-1">
          {statusData.length > 0 ? (
            <AppointmentStatusChart data={statusData} />
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-96 flex items-center justify-center text-gray-400">
              Chưa có dữ liệu trạng thái
            </div>
          )}
        </div>
      </section>

      {/* 3. Detailed Data & Activity Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bảng Bác sĩ Bận rộn nhất */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Top 5 Bác Sĩ Bận Rộn Nhất
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bác Sĩ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chuyên khoa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng Lịch Hẹn
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topDoctors.length > 0 ? (
                  topDoctors.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name || item.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.specialty || "Đa khoa"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                        {item.appointments || item.count || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Chưa có dữ liệu bác sĩ.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bảng Hoạt động Gần đây */}
        <div className="lg:col-span-1">
          <RecentActivity activity={activities} />
        </div>
      </section>

      <footer className="mt-12 text-center text-sm text-gray-400">
        Dữ liệu được cập nhật mới nhất từ hệ thống.
      </footer>
    </main>
  );
};

export default DashboardContent;
