// middlewares/attachDoctor.js
import Doctor from "../models/DoctorModel.js";

export const attachDoctor = async (req, res, next) => {
  try {
    if (!req.user?._id) return res.status(401).json({ error: "Chưa đăng nhập." });

    // 1) Nếu token đã có doctorId thì ưu tiên dùng
    if (req.user.doctorId) {
      const doc = await Doctor.findById(req.user.doctorId).lean();
      if (doc) { req.doctor = doc; return next(); }
    }

    // 2) Tìm theo liên kết “chuẩn”: user (đổi “user” nếu model của bạn dùng tên khác, vd: user_id/account)
    let doc = await Doctor.findOne({ user: req.user._id }).lean();
    if (doc) { req.doctor = doc; return next(); }

    // 3) Một số hệ cũ dùng chung _id giữa User và Doctor → thử findById(user._id)
    doc = await Doctor.findById(req.user._id).lean();
    if (doc) { req.doctor = doc; return next(); }

    // 4) (Tuỳ chọn) Nếu schema bạn dùng key khác: thử thêm các tên hay gặp
    const keys = ["user_id", "account", "account_id"];
    for (const k of keys) {
      doc = await Doctor.findOne({ [k]: req.user._id }).lean();
      if (doc) { req.doctor = doc; return next(); }
    }

    return res.status(404).json({ error: "Tài khoản này chưa có hồ sơ bác sĩ." });
  } catch (e) {
    next(e);
  }
};
