// middlewares/auth.js
import jwt from "jsonwebtoken";
import Patient from "../models/PatientModel.js";
import Doctor from "../models/DoctorModel.js";

/** Xác thực JWT. Đọc Bearer token trước, rồi mới đến cookie `token`. */
export const verifyToken = (req, res, next) => {
  const headerVal = req.headers.authorization || req.headers.Authorization;
  let token = null;

  if (typeof headerVal === "string" && headerVal.startsWith("Bearer ")) {
    token = headerVal.slice(7);
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "minhtris_secret",
      { clockTolerance: 5 } // giây, tránh lệch giờ nhỏ
    );
    // decoded mong muốn: { _id, email, role, status, profile_completed, iat, exp }
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

/** Tuỳ chọn: không bắt buộc đăng nhập nhưng nếu có token thì parse vào req.user */
export const optionalAuth = (req, res, next) => {
  const headerVal = req.headers.authorization || req.headers.Authorization;
  let token = null;

  if (typeof headerVal === "string" && headerVal.startsWith("Bearer ")) {
    token = headerVal.slice(7);
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "minhtris_secret",
      { clockTolerance: 5 }
    );
    req.user = decoded;
  } catch {
    // token sai thì vẫn cho qua như chưa đăng nhập
  }
  return next();
};

/** Yêu cầu user có 1 trong các role */
export const requireRole = (roles = []) => (req, res, next) => {
  const role = req.user?.role || req.user?.role?.name;
  if (!role) return res.status(401).json({ error: "Unauthorized" });
  if (!roles.includes(role)) return res.status(403).json({ error: "Không đủ quyền" });
  return next();
};


/** Chính chủ hoặc admin (so sánh `:id` trên params với `req.user._id`) */
export const selfOrAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const role = req.user.role || req.user.role?.name;
  if (role === "admin") return next();
  if (String(req.user._id) === String(req.params.id)) return next();
  return res.status(403).json({ message: "Forbidden" });
};

/** Bắt buộc hồ sơ bệnh nhân đã tồn tại (dùng cho các tính năng cần profile) */
export const checkPatientProfile = async (req, res, next) => {
  try {
    const role = req.user?.role || req.user?.role?.name;
    if (role !== "patient") return next();

    // Nếu token đã có profile_completed = true thì cho qua nhanh
    if (req.user?.profile_completed === true) return next();

    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const profile = await Patient.findOne({ user_id: userId }).lean();
    if (!profile) {
      return res.status(403).json({
        code: "PROFILE_INCOMPLETE",
        message: "Bạn phải hoàn thiện hồ sơ bệnh nhân để tiếp tục."
      });
    }
    return next();
  } catch (e) {
    return next(e);
  }
};

/** Tương tự cho bác sĩ — dùng cho trang/route của doctor */
export const checkDoctorProfile = async (req, res, next) => {
  try {
    const role = req.user?.role || req.user?.role?.name;
    if (role !== "doctor") return next();

    if (req.user?.profile_completed === true) return next();

    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const profile = await Doctor.findOne({ user_id: userId }).lean();
    if (!profile) {
      return res.status(403).json({
        code: "PROFILE_INCOMPLETE",
        message: "Bạn phải hoàn thiện hồ sơ bác sĩ để tiếp tục."
      });
    }
    return next();
  } catch (e) {
    return next(e);
  }
};
