// src/controllers/DashboardController.js
import Appointment from "../models/AppointmentModel.js";
import Doctor from "../models/DoctorModel.js";
import Patient from "../models/PatientModel.js";
import User from "../models/UserModel.js";

// 1. Lấy số liệu tổng quan (KPI Cards)
export const getDashboardStats = async (req, res, next) => {
  try {
    // A. Tổng lịch hẹn
    const totalAppointments = await Appointment.countDocuments();

    // B. Tổng bác sĩ (đang active)
    const totalDoctors = await Doctor.countDocuments({ status: "active" });

    // C. Bệnh nhân mới (trong tháng này)
    const startOfMonth = new Date(new Date().setDate(1)); // Ngày mùng 1 tháng này
    const newPatients = await Patient.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // D. Tổng doanh thu (Tính dựa trên các lịch hẹn đã 'completed')
    // Lưu ý: Nếu Appointment không lưu giá tiền, ta phải lookup sang Doctor để lấy consultation_fee
    const revenueAgg = await Appointment.aggregate([
      { $match: { status: "completed" } },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor_id",
          foreignField: "_id",
          as: "doctor_info",
        },
      },
      { $unwind: "$doctor_info" },
      {
        $group: {
          _id: null,
          total: { $sum: "$doctor_info.consultation_fee" },
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

// 2. Biểu đồ Xu hướng (12 tháng gần nhất)
export const getAppointmentTrend = async (req, res, next) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);

    const trend = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Map dữ liệu để frontend dễ hiển thị (VD: "Thg 1")
    const formattedTrend = trend.map((item) => ({
      month: `Thg ${item._id.month}`,
      count: item.count,
    }));

    return res.status(200).json(formattedTrend);
  } catch (error) {
    next(error);
  }
};

// 3. Biểu đồ Trạng thái (Phân bổ %)
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
      // Tính phần trăm
      const percentage = Math.round((item.count / totalDocs) * 100);
      
      // Map tên trạng thái sang tiếng Việt (khớp với Frontend Dashboard.jsx nếu cần)
      let label = item._id;
      if (item._id === 'confirmed') label = 'Đã xác nhận';
      if (item._id === 'pending') label = 'Chờ xác nhận';
      if (item._id === 'completed') label = 'Hoàn thành';
      if (item._id === 'cancelled') label = 'Đã hủy';

      return {
        status: label,
        percentage: percentage,
        // Màu sắc sẽ được xử lý ở Frontend (Dashboard.jsx) dựa trên status key
      };
    });

    return res.status(200).json(formattedStatus);
  } catch (error) {
    next(error);
  }
};

// 4. Top Bác sĩ bận rộn nhất
export const getTopDoctors = async (req, res, next) => {
  try {
    const topDoctors = await Appointment.aggregate([
      // Gom nhóm theo doctor_id và đếm số lịch hẹn
      {
        $group: {
          _id: "$doctor_id",
          appointments: { $sum: 1 },
        },
      },
      // Sắp xếp giảm dần
      { $sort: { appointments: -1 } },
      // Lấy top 5
      { $limit: 5 },
      // Join sang bảng Doctors để lấy tên và chuyên khoa
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctor_info",
        },
      },
      { $unwind: "$doctor_info" },
      // Join tiếp sang bảng Specialties để lấy tên khoa
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

// 5. Hoạt động gần đây (Tổng hợp từ Appointment và User mới)
export const getRecentActivity = async (req, res, next) => {
  try {
    // Lấy 5 lịch hẹn mới nhất
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("patient_id", "fullName")
      .lean();

    // Format dữ liệu
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
            type: type // sale, user, system... để frontend tô màu
        }
    });

    return res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};