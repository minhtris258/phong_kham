// src/controllers/DashboardController.js
import Appointment from "../models/AppointmentModel.js";
import Doctor from "../models/DoctorModel.js";
import Patient from "../models/PatientModel.js";
import User from "../models/UserModel.js";
import Visit from "../models/VisitModel.js"; // <--- QUAN TRỌNG: Import Visit để lấy doanh thu thực

// 1. Lấy số liệu tổng quan (KPI Cards)
export const getDashboardStats = async (req, res, next) => {
  try {
    // A. Tổng lịch hẹn (Vẫn giữ nguyên để đếm số lượng đặt lịch)
    const totalAppointments = await Appointment.countDocuments();

    // B. Tổng bác sĩ (đang active)
    const totalDoctors = await Doctor.countDocuments({ status: "active" });

    // C. Bệnh nhân mới (trong tháng này)
    const startOfMonth = new Date(new Date().setDate(1));
    startOfMonth.setHours(0, 0, 0, 0); // Reset về đầu ngày mùng 1
    
    const newPatients = await Patient.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // D. TỔNG DOANH THU (CẬP NHẬT LOGIC MỚI)
    // Thay vì tính từ Appointment (chỉ có phí khám), ta tính từ Visit (Phí khám + Dịch vụ + Thuốc)
    const revenueAgg = await Visit.aggregate([
      {
        $group: {
          _id: null,
          // total_amount trong Visit đã được tính toán gồm: Phí khám + Dịch vụ
          total: { $sum: "$total_amount" }, 
        },
      },
    ]);
    
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    return res.status(200).json({
      totalAppointments,
      totalDoctors,
      newPatients,
      totalRevenue,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Biểu đồ Xu hướng (12 tháng gần nhất) - GIỮ NGUYÊN
export const getAppointmentTrend = async (req, res, next) => {
  try {
    const { type = 'month' } = req.query; // Nhận tham số type từ frontend
    
    let matchStage = {};
    let groupStage = {};
    let sortStage = {};
    let formatLabel = (id) => ""; // Helper để format label hiển thị

    const now = new Date();

    if (type === 'day') {
        // Lấy 7 ngày gần nhất
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        sevenDaysAgo.setHours(0,0,0,0);

        matchStage = { createdAt: { $gte: sevenDaysAgo } };
        groupStage = {
            _id: { 
                day: { $dayOfMonth: "$createdAt" }, 
                month: { $month: "$createdAt" },
                year: { $year: "$createdAt" }
            },
            count: { $sum: 1 }
        };
        sortStage = { "_id.year": 1, "_id.month": 1, "_id.day": 1 };
        formatLabel = (id) => `${id.day}/${id.month}`; // VD: 15/10
    } 
    else if (type === 'year') {
        // Lấy 5 năm gần nhất
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(now.getFullYear() - 5);
        
        matchStage = { createdAt: { $gte: fiveYearsAgo } };
        groupStage = {
            _id: { year: { $year: "$createdAt" } },
            count: { $sum: 1 }
        };
        sortStage = { "_id.year": 1 };
        formatLabel = (id) => `${id.year}`; // VD: 2023
    } 
    else {
        // Mặc định: Lấy 12 tháng gần nhất (Month)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(now.getMonth() - 11);
        twelveMonthsAgo.setDate(1);

        matchStage = { createdAt: { $gte: twelveMonthsAgo } };
        groupStage = {
            _id: { 
                month: { $month: "$createdAt" }, 
                year: { $year: "$createdAt" } 
            },
            count: { $sum: 1 }
        };
        sortStage = { "_id.year": 1, "_id.month": 1 };
        formatLabel = (id) => `Thg ${id.month}`; // VD: Thg 10
    }

    const trend = await Appointment.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: sortStage },
    ]);

    // Format dữ liệu trả về cho Frontend
    // key 'label' dùng để hiển thị trên trục X
    const formattedTrend = trend.map((item) => ({
      label: formatLabel(item._id), 
      count: item.count,
      // Giữ lại các trường gốc nếu cần debug
      dateInfo: item._id 
    }));

    return res.status(200).json(formattedTrend);
  } catch (error) {
    next(error);
  }
};

// 3. Biểu đồ Trạng thái (Phân bổ %) - GIỮ NGUYÊN
export const getAppointmentStatus = async (req, res, next) => {
  try {
    const totalDocs = await Appointment.countDocuments();
    
    if (totalDocs === 0) return res.status(200).json([]);

    const statusStats = await Appointment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStatus = statusStats.map((item) => {
      const percentage = Math.round((item.count / totalDocs) * 100);
      
      let label = item._id;
      if (item._id === 'confirmed') label = 'Đã xác nhận';
      if (item._id === 'pending') label = 'Chờ xác nhận';
      if (item._id === 'completed') label = 'Hoàn thành';
      if (item._id === 'cancelled') label = 'Đã hủy';

      return {
        status: label,
        percentage: percentage,
      };
    });

    return res.status(200).json(formattedStatus);
  } catch (error) {
    next(error);
  }
};

// 4. Top Bác sĩ bận rộn nhất - GIỮ NGUYÊN (Tính theo số lượng lịch hẹn)
// Nếu muốn chính xác hơn có thể đổi sang đếm Visit, nhưng đếm Appointment thể hiện "Nhu cầu" tốt hơn
export const getTopDoctors = async (req, res, next) => {
  try {
    const topDoctors = await Appointment.aggregate([
      {
        $group: {
          _id: "$doctor_id",
          appointments: { $sum: 1 },
        },
      },
      { $sort: { appointments: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctor_info",
        },
      },
      { $unwind: "$doctor_info" },
      {
        $lookup: {
          from: "specialties",
          localField: "doctor_info.specialty_id",
          foreignField: "_id",
          as: "specialty_info",
        },
      },
      { $unwind: { path: "$specialty_info", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: "$doctor_info.fullName",
          specialty: { $ifNull: ["$specialty_info.name", "Đa khoa"] },
          appointments: 1,
        },
      },
    ]);

    return res.status(200).json(topDoctors);
  } catch (error) {
    next(error);
  }
};

// 5. Hoạt động gần đây - GIỮ NGUYÊN
export const getRecentActivity = async (req, res, next) => {
  try {
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("patient_id", "fullName")
      .lean();

    const activities = recentAppointments.map((app) => {
        let actionText = "";
        let type = "system";
        
        switch(app.status) {
            case 'pending': actionText = "vừa đặt lịch hẹn mới"; type = "sale"; break;
            case 'confirmed': actionText = "đã được xác nhận lịch khám"; type = "system"; break;
            case 'completed': actionText = "đã hoàn thành khám bệnh"; type = "sale"; break;
            case 'cancelled': actionText = "đã hủy lịch hẹn"; type = "system"; break;
            default: actionText = "vừa cập nhật trạng thái";
        }

        return {
            time: new Date(app.createdAt).toLocaleString('vi-VN'),
            user: app.patient_id?.fullName || "Khách vãng lai",
            action: actionText,
            type: type 
        }
    });

    return res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};