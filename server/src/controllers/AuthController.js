import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import Role from "../models/RoleModel.js";

// POST /api/login
export const login = async (req, res, next) => {
  try {
    const {email, password} =  req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Thiếu email hoặc password" });
    }
    const user = await User.findOne({ email }).populate("role_id", "name");
    if(!user) return res.status(401).json({ error: "Email hoặc password không đúng" });

    const isMatch =  await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(401).json({ error: "Email hoặc password không đúng" });

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: user.role_id.name,
        status: user.status || "pending_profile",
        profile_completed: !!user.profile_completed
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role_id.name,
        status: user.status || "pending_profile",
        profile_completed: !!user.profile_completed
      },
      next: (!user.profile_completed ? "/onboarding/profile" : "/dashboard")
    });
  } catch (e) { next(e); }
};
// POST /api/registerpublic
export async function registerPublic(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Thiếu name|email|password" });

    const existed = await User.findOne({ email });
    if (existed) return res.status(409).json({ error: "Email đã tồn tại" });

    const patientRole = await Role.findOne({ name: "patient" });
    if (!patientRole) return res.status(500).json({ error: "Chưa seed role 'patient'" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hash,
      role_id: patientRole._id,
      profile_completed: false,
      status: "pending_profile"
    });
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

    return res.status(201).json({
      message: "Đăng ký thành công. Vui lòng hoàn tất hồ sơ bệnh nhân.",
      token, // FE lưu token để gọi API bước 2
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: "patient",
        status: "pending_profile",
        profile_completed: false
      },
      next: "/onboarding/profile" // 👈 gợi ý điều hướng
    });
  } catch (e) { next(e); }
};