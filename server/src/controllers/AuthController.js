import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import Role from "../models/RoleModel.js";
import Patient from "../models/PatientModel.js";

// POST /api/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // 1. Kiểm tra thiếu email hoặc password
    if (!email || !password) {
      return res.status(400).json({ error: "Thiếu email hoặc password" });
    }

    // 2. Tìm người dùng và populate thông tin role
    const user = await User.findOne({ email }).populate("role_id", "name");
    
    // 3. Kiểm tra người dùng có tồn tại không
    if (!user) return res.status(401).json({ error: "Email hoặc password không đúng" });

    // 4. So sánh mật khẩu
    // Lưu ý: Đảm bảo đã import và sử dụng bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Email hoặc password không đúng" });

    // 5. Tạo JWT token
    const roleName = user.role_id.name; // Lấy tên role
    const isProfileCompleted = !!user.profile_completed;

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: roleName,
        status: user.status || "pending_profile",
        profile_completed: isProfileCompleted
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    // 6. Xác định trang chuyển hướng (next)
    let nextRoute = "/"; // Mặc định là trang chủ
    
    // Nếu role là 'admin', chuyển hướng đến /admin
    if (roleName === "admin") {
      nextRoute = "/admin";
    } 
    // Nếu là bệnh nhân
    if (roleName === "patient") {
      if (!isProfileCompleted) {
      // Bệnh nhân chưa hoàn thành hồ sơ -> onboarding
      nextRoute = "/onboarding/profile-patient";
      } else {
      // Bệnh nhân đã hoàn thành hồ sơ -> trang chính bệnh nhân
      nextRoute = "/";
      }
    }
    // Nếu là bác sĩ
    else if (roleName === "doctor") {
      if (!isProfileCompleted) {
      // Bác sĩ chưa hoàn thành hồ sơ -> onboarding bác sĩ
      nextRoute = "/onboarding/doctor-profile";
      } else {
      // Bác sĩ đã hoàn thành hồ sơ -> trang chính bác sĩ
      nextRoute = "/doctor";
      }
    }
    // Các role khác (company, staff, …) nếu chưa hoàn thành hồ sơ
    else if (!isProfileCompleted) {
      nextRoute = "/"; // Hoặc trang hoàn thành profile chung
    }

    // 7. Trả về phản hồi thành công
    return res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: roleName,
        status: user.status,
        profile_completed: isProfileCompleted
      },
      // Trường 'next' chứa đường dẫn chuyển hướng
      next: nextRoute
    });
  } catch (e) {
    next(e);
  }
};
// POST /api/registerpublic
export async function registerPublic(req, res, next) {
  try {
    // 1. Nhận thêm confirmPassword từ req.body
    const { name, email, password, confirmPassword } = req.body;

    // 2. Validate cơ bản: Kiểm tra dữ liệu rỗng
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ: Tên, Email, Mật khẩu và Xác nhận mật khẩu." });
    }

    // 3. === LOGIC MỚI === 
    // Kiểm tra mật khẩu và mật khẩu xác nhận có khớp nhau không
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Mật khẩu xác nhận không khớp." });
    }

    // 4. Kiểm tra Email đã tồn tại trong User chưa
    const existed = await User.findOne({ email }).lean();
    if (existed) {
      return res.status(409).json({ error: "Email này đã được sử dụng." });
    }

    // 5. Tìm Role 'patient'
    const patientRole = await Role.findOne({ name: "patient" }).lean();
    if (!patientRole) {
      return res.status(500).json({ error: "Lỗi hệ thống: Chưa cấu hình role 'patient'." });
    }

    // 6. Mã hóa mật khẩu
    const hash = await bcrypt.hash(password, 3);

    // 7. Tạo User (Tài khoản đăng nhập)
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hash,
      role_id: patientRole._id,
      profile_completed: false, 
      status: "pending_profile"
    });

    // 8. Tạo ngay bản ghi Patient rỗng
    const patient = await Patient.create({
      user_id: user._id,
      fullName: name,
      email: email.trim().toLowerCase(),
      status: "inactive", 
    });

    // 9. Tạo Token
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: "patient",
        status: "pending_profile",
        profile_completed: false
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 10. Trả về kết quả
    return res.status(201).json({
      message: "Đăng ký thành công! Vui lòng hoàn tất hồ sơ cá nhân.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: "patient",
        status: "pending_profile",
        profile_completed: false
      },
      patientId: patient._id,
      next: "/onboarding/profile-patient"
    });

  } catch (e) {
    next(e);
  }
};