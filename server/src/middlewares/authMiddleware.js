import jwt from "jsonwebtoken";
import Patient from "../models/PatientModel.js";

/** Xác thực JWT */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    // nếu bạn dùng cookie, thêm cookie-parser ở app.js
    token = req.cookies.token;
  }

  if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "minhtris_secret");
    // decoded nên gồm: { _id, email, role, status, profile_completed, iat, exp }
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

/** Bắt buộc có hồ sơ bệnh nhân trước khi dùng các chức năng chính.
 *  Middleware này phải chạy SAU verifyToken.
 */
export const checkPatientProfile = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    // Nếu không phải bệnh nhân -> cho qua
    if (userRole !== "patient") return next();

    // Nếu token đã cho biết đã hoàn tất -> cho qua (tránh query DB)
    if (req.user.profile_completed === true) return next();

    // Chưa rõ hoặc chưa hoàn tất: kiểm tra DB
    const userId = req.user._id; // chú ý: _id chứ không phải id
    const patient = await Patient.findOne({ user_id: userId }).lean();

    if (!patient) {
      return res.status(403).json({
        code: "PROFILE_INCOMPLETE",
        message: "Bạn phải hoàn thiện hồ sơ bệnh nhân để tiếp tục."
      });
    }

    next();
  } catch (e) {
    next(e);
  }
};
