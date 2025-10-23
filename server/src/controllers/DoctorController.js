// controllers/doctor.controller.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import Role from "../models/RoleModel.js";
import Doctor from "../models/DoctorModel.js";
import Specialty from "../models/SpecialtyModel.js";

/** POST /api/doctors  (ADMIN tạo tài khoản bác sĩ) */
export const createDoctor = async (req, res, next) => {
  try {
    const role = req.user?.role || req.user?.role?.name;
    if (role !== "admin") {
      return res.status(403).json({ error: "Không có quyền truy cập" });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Thiếu name|email|password" });

    const existed = await User.findOne({ email }).lean();
    if (existed) return res.status(409).json({ error: "Email đã tồn tại" });

    const doctorRole = await Role.findOne({ name: "doctor" }).lean();
    if (!doctorRole)
      return res.status(500).json({ error: "Chưa seed role 'doctor'" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hash,
      role_id: doctorRole._id, // ✅ gán đúng role bác sĩ
      profile_completed: false,
      status: "pending_profile",
    });

    // Token onboarding: cho phép bác sĩ đăng nhập và hoàn tất hồ sơ
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: "doctor", // ✅ rõ ràng trên token
        status: "pending_profile",
        profile_completed: false,
      },
      process.env.JWT_SECRET || "minhtris_secret",
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Tạo bác sĩ thành công. Vui lòng hoàn tất hồ sơ bác sĩ.",
      token, // FE lưu token để gọi API bước 2
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: "doctor",
        status: "pending_profile",
        profile_completed: false,
      },
      next: "/onboarding/profiledoctor",
    });
  } catch (e) {
    next(e);
  }
};

/** POST /onboarding/doctor-profile  (Bác sĩ tự hoàn tất hồ sơ) */
export const completeDoctorProfile = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const role = req.user?.role || req.user?.role?.name;
    if (!userId)
      return res.status(401).json({ error: "Thiếu hoặc sai token." });
    if (role !== "doctor") {
      return res
        .status(403)
        .json({ error: "Chỉ tài khoản bác sĩ mới được hoàn tất hồ sơ." });
    }

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: "Không tìm thấy user." });

    const existed = await Doctor.findOne({ user_id: userId }).lean();
    if (existed)
      return res.status(409).json({ error: "Hồ sơ bác sĩ đã tồn tại." });

    const {
      fullName,
      dob,
      gender, // "male" | "female" | "other"
      phone,
      address,
      introduction,
      note,
      thumbnail,
      specialty_id,
    } = req.body;

    if (!fullName || !dob || !gender || !phone || !address || !specialty_id) {
      return res
        .status(400)
        .json({
          error:
            "Thiếu thông tin bắt buộc: fullName, dob, gender, phone, address, specialty_id.",
        });
    }

    const allowedGender = ["male", "female", "other"];
    if (!allowedGender.includes(gender)) {
      return res.status(400).json({ error: "Giá trị gender không hợp lệ." });
    }

    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      return res
        .status(400)
        .json({ error: "Định dạng dob không hợp lệ (ISO hoặc yyyy-mm-dd)." });
    }

    const specialty = await Specialty.findById(specialty_id).lean();
    if (!specialty)
      return res.status(404).json({ error: "Chuyên khoa không tồn tại." });

    const phoneTaken = await Doctor.findOne({ phone }).lean();
    if (phoneTaken)
      return res
        .status(409)
        .json({ error: "Số điện thoại đã được dùng cho hồ sơ khác." });

    const profile = await Doctor.create({
      user_id: userId,
      fullName,
      gender,
      dob: dobDate,
      phone,
      email: user.email, // khóa theo User.email
      address,
      introduction: introduction || "",
      note: note || "",
      thumbnail: thumbnail || "",
      specialty_id,
      status: "active",
    });

    await User.updateOne(
      { _id: userId },
      { $set: { profile_completed: true, status: "active" } }
    );

    const populated = await Doctor.findById(profile._id)
      .populate({ path: "specialty_id", select: "name code" })
      .select("-__v")
      .lean();

    return res.status(201).json({
      message: "Hoàn tất hồ sơ bác sĩ thành công.",
      profile: populated,
      next: "/dashboard/doctor",
    });
  } catch (e) {
    next(e);
  }
};

/** GET /api/doctors/me  (Bác sĩ xem hồ sơ của mình) */
export const getMyDoctorProfile = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const role = req.user?.role || req.user?.role?.name;
    if (!userId)
      return res.status(401).json({ error: "Thiếu hoặc sai token." });
    if (role !== "doctor") {
      return res
        .status(403)
        .json({ error: "Chỉ tài khoản bác sĩ mới được truy cập." });
    }

    const profile = await Doctor.findOne({ user_id: userId })
      .populate({ path: "specialty_id", select: "name code" })
      .select("-__v")
      .lean();

    if (!profile) {
      return res.status(404).json({ error: "Không tìm thấy hồ sơ bác sĩ." });
    }

    return res.status(200).json({ profile });
  } catch (e) {
    next(e);
  }
};

/** GET /api/doctors/:id  (Public/Admin tuỳ bạn) */
export const getDoctorById = async (req, res, next) => {
  try {
    const doctorId = req.params.id;
    const profile = await Doctor.findById(doctorId)
      .populate({ path: "specialty_id", select: "name code" })
      .select("-__v")
      .lean();

    if (!profile) {
      return res.status(404).json({ error: "Không tìm thấy hồ sơ bác sĩ." });
    }

    return res.status(200).json({ profile });
  } catch (e) {
    next(e);
  }
};

/** PUT /api/doctors/me  (Bác sĩ cập nhật hồ sơ của mình) */
export const updateMyDoctorProfile = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const role = req.user?.role || req.user?.role?.name;
    if (!userId)
      return res.status(401).json({ error: "Thiếu hoặc sai token." });
    if (role !== "doctor") {
      return res
        .status(403)
        .json({ error: "Chỉ tài khoản bác sĩ mới được truy cập." });
    }

    // các field cho phép cập nhật
    const ALLOWED = new Set([
      "fullName",
      "gender",
      "dob",
      "phone",
      "address",
      "introduction",
      "note",
      "thumbnail",
      "specialty_id",
    ]);

    const payload = {};
    for (const [k, v] of Object.entries(req.body || {})) {
      if (ALLOWED.has(k) && v !== undefined && v !== null) {
        payload[k] = v;
      }
    }

    // validate cơ bản
    if (payload.gender) {
      const allowedGender = ["male", "female", "other"];
      if (!allowedGender.includes(payload.gender)) {
        return res.status(400).json({ error: "Giá trị gender không hợp lệ." });
      }
    }
    if (payload.dob) {
      const d = new Date(payload.dob);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ error: "Định dạng dob không hợp lệ." });
      }
      payload.dob = d;
    }
    if (payload.specialty_id) {
      const s = await Specialty.findById(payload.specialty_id).lean();
      if (!s)
        return res.status(404).json({ error: "Chuyên khoa không tồn tại." });
    }
    if (payload.phone) {
      const phoneTaken = await Doctor.findOne({
        user_id: { $ne: userId },
        phone: payload.phone,
      }).lean();
      if (phoneTaken)
        return res
          .status(409)
          .json({ error: "Số điện thoại đã được dùng cho hồ sơ khác." });
    }

    const updated = await Doctor.findOneAndUpdate(
      { user_id: userId },
      { $set: payload },
      { new: true, runValidators: true }
    )
      .populate({ path: "specialty_id", select: "name code" })
      .select("-__v")
      .lean();

    if (!updated) {
      return res.status(404).json({ error: "Không tìm thấy hồ sơ bác sĩ." });
    }

    return res
      .status(200)
      .json({ message: "Cập nhật thành công.", profile: updated });
  } catch (e) {
    next(e);
  }
};
