// controllers/doctor.controller.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import User from "../models/UserModel.js";
import Role from "../models/RoleModel.js";
import Doctor from "../models/DoctorModel.js";
import Specialty from "../models/SpecialtyModel.js";
import DoctorSchedule from "../models/DoctorScheduleModel.js";

// Helper validate năm
const validateCareerYear = (year) => {
    if (!year) return true; // Cho phép null
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1950 || year > currentYear) {
        return false;
    }
    return true;
};
/** POST /api/doctors  (ADMIN tạo tài khoản bác sĩ) */
export const createDoctor = async (req, res, next) => {
  try {
    // Kiểm tra quyền admin
    const role = req.user?.role || req.user?.role?.name;
    if (role !== "admin") {
      return res.status(403).json({ error: "Không có quyền truy cập" });
    }

    // CHỈ YÊU CẦU 3 TRƯỜNG NÀY
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Thiếu thông tin bắt buộc: name, email, password",
      });
    }

    // Kiểm tra email trùng
    const existed = await User.findOne({ email }).lean();
    if (existed) {
      return res.status(409).json({ error: "Email đã tồn tại" });
    }

    // Tìm role doctor
    const doctorRole = await Role.findOne({ name: "doctor" }).lean();
    if (!doctorRole) {
      return res
        .status(500)
        .json({ error: "Chưa có role 'doctor' trong hệ thống" });
    }

    // Tạo User trước (chưa có fullName)
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hash,
      role_id: doctorRole._id,
      profile_completed: false,
      status: "pending_profile", // chờ hoàn tất hồ sơ
    });

    // Tạo bản ghi Doctor tạm (chưa có thông tin chi tiết)
    const doctor = await Doctor.create({
      user_id: user._id,
      fullName: name, // tạm dùng name làm fullName (sẽ cập nhật sau)
      email: email.trim().toLowerCase(),
      status: "inactive", // chưa kích hoạt
      // Các trường khác để trống → bác sĩ tự điền
    });
    const defaultSchedule = [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
    ].map(day => ({
        dayOfWeek: day,
        timeRanges: [
            { start: "08:00", end: "11:00" },
            { start: "13:00", end: "17:00" }
        ]
    }));
    await DoctorSchedule.create({
      doctor_id: doctor._id,  // Liên kết với bác sĩ vừa tạo
      slot_minutes: 30,          // Mặc định 30 phút/ca (hoặc tùy chỉnh)
      weekly_schedule: defaultSchedule,
      exceptions: []             // Chưa có ngày nghỉ phép nào
    });
    // Tạo token onboarding
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: "doctor",
        status: user.status,
        profile_completed: false,
      },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Tạo tài khoản bác sĩ thành công!",
      info: "Bác sĩ cần đăng nhập để hoàn tất hồ sơ cá nhân (họ tên thật, chuyên khoa, phí khám...)",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: "doctor",
        profile_completed: false,
        status: user.status,
      },
      doctorId: doctor._id,
      nextStep: "/onboarding/profile-doctor",
    });
  } catch (error) {
    console.error("Lỗi tạo bác sĩ:", error);
    next(error);
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
      thumbnail, // <--- Nguồn ảnh cần upload
      specialty_id,
      consultation_fee,
      career_start_year,
    } = req.body;

    if (!fullName || !dob || !gender || !phone || !address || !specialty_id) {
      return res.status(400).json({
        error:
          "Thiếu thông tin bắt buộc: fullName, dob, gender, phone, address, specialty_id.",
      });
    }
    if (career_start_year && !validateCareerYear(career_start_year)) {
        return res.status(400).json({ error: "Năm bắt đầu hành nghề không hợp lệ." });
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

    // -----------------------------------------------------------------
    // ✨ Xử lý Upload ảnh lên Cloudinary ✨
    // -----------------------------------------------------------------
    let thumbnailUrl = "";

    if (thumbnail) {
      try {
        // Giả định 'thumbnail' là đường dẫn file tạm thời (nếu dùng multer)
        // Hoặc là chuỗi base64 (nếu upload trực tiếp từ client)
        const uploadResult = await cloudinary.uploader.upload(thumbnail, {
          folder: "doctor_profiles", // Đặt tên thư mục của bạn
          resource_type: "image",
          public_id: `doctor_${userId}_avatar`, // Tạo public ID độc nhất
          overwrite: true,
        });
        thumbnailUrl = uploadResult.secure_url;

        // Lưu ý: Nếu bạn dùng multer, hãy đảm bảo bạn xóa file tạm thời ở đây
        // if (req.file) fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        // Bạn có thể chọn trả về lỗi hoặc tiếp tục với thumbnail rỗng
        return res.status(500).json({ error: "Lỗi khi upload ảnh đại diện." });
      }
    }
    // -----------------------------------------------------------------

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
      thumbnail: thumbnailUrl || "", // <-- Sử dụng URL từ Cloudinary
      specialty_id,
      status: "active",
      consultation_fee,
    career_start_year: career_start_year || null,
    });

    // Cập nhật trạng thái user đã hoàn thành hồ sơ (nếu có trường này)
    await User.findByIdAndUpdate(userId, { profile_completed: true });

    return res.status(201).json({
      message: "Hoàn tất hồ sơ bác sĩ thành công.",
      profile,
    });
  } catch (error) {
    console.error(error);
    next(error); // Chuyển lỗi sang middleware xử lý lỗi tổng quát
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
/** PUT /api/doctors/me  (Bác sĩ cập nhật hồ sơ của mình) */
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
      "thumbnail", // <--- Field này cần được xử lý upload
      "specialty_id",
      "consultation_fee",
      "career_start_year",
    ]);

    const payload = {};
    for (const [k, v] of Object.entries(req.body || {})) {
      if (ALLOWED.has(k) && v !== undefined && v !== null) {
        payload[k] = v;
      }
    }

    // validate cơ bản
    if (payload.career_start_year && !validateCareerYear(payload.career_start_year)) {
        return res.status(400).json({ error: "Năm bắt đầu hành nghề không hợp lệ." });
    }
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

    // -----------------------------------------------------------------
    // ✨ Xử lý Upload ảnh thumbnail lên Cloudinary (nếu có) ✨
    // -----------------------------------------------------------------
    if (payload.thumbnail) {
      // Kiểm tra xem payload.thumbnail có phải là URL cũ (không cần upload lại)
      // hay là dữ liệu mới cần upload (base64 hoặc đường dẫn file tạm)

      // Giả định: Nếu chuỗi không bắt đầu bằng "http" thì đó là dữ liệu mới cần upload
      if (!payload.thumbnail.startsWith("http")) {
        try {
          // Upload ảnh mới
          const uploadResult = await cloudinary.uploader.upload(
            payload.thumbnail,
            {
              folder: "doctor_profiles",
              resource_type: "image",
              // Sử dụng public ID độc nhất, có thể ghi đè ảnh cũ của doctor này
              public_id: `doctor_${userId}_avatar`,
              overwrite: true,
            }
          );
          // Gán URL mới vào payload để lưu vào DB
          payload.thumbnail = uploadResult.secure_url;
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          return res
            .status(500)
            .json({ error: "Lỗi khi upload ảnh đại diện mới." });
        }
      }
      // Nếu payload.thumbnail bắt đầu bằng "http", ta coi đó là URL cũ và không làm gì.
    }
    // -----------------------------------------------------------------

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
/** PUT /api/doctors/:id  (Admin cập nhật hồ sơ → TỰ ĐỘNG HOÀN THÀNH NẾU ĐỦ) */
export const updateDoctorAdmin = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const role = req.user?.role || req.user?.role?.name;
    const doctorToUpdateId = req.params.id;
    
    if (!userId) return res.status(401).json({ error: "Thiếu token." });
const existingDoctor = await Doctor.findById(doctorToUpdateId);
    
    if (!existingDoctor) {
        // Trả về 404 nếu không tìm thấy document Doctor
        return res.status(404).json({ error: "Không tìm thấy hồ sơ bác sĩ." });
    }
    // Cho phép cả doctor và admin sửa
   if (role !== "admin" && userId.toString() !== existingDoctor.user_id.toString()) {
      return res
        .status(403)
        .json({ error: "Không có quyền cập nhật hồ sơ của người khác." });
    }

    const ALLOWED_FIELDS = [
      "fullName",
      "gender",
      "dob",
      "phone",
      "address",
      "introduction",
      "note",
      "thumbnail",
      "specialty_id",
      "consultation_fee",
      "career_start_year",
    ];

    const payload = {};
    for (const [key, value] of Object.entries(req.body || {})) {
      if (
        ALLOWED_FIELDS.includes(key) &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        payload[key] = value;
      }
    }

    // === XỬ LÝ UPLOAD ẢNH (nếu có) ===
    if (payload.thumbnail && !payload.thumbnail.startsWith("http")) {
      try {
        const upload = await cloudinary.uploader.upload(payload.thumbnail, {
          folder: "doctor_profiles",
          // SỬ DỤNG existingDoctor ĐÃ TÌM ĐƯỢC
          public_id: `doctor_${existingDoctor.user_id.toString()}_avatar`, 
          overwrite: true,
        });
        payload.thumbnail = upload.secure_url;
      } catch (err) {
        // Thêm console.error để xem lỗi chi tiết trong Terminal
        console.error("LỖI CHI TIẾT CLOUDINARY:", err.message);

        // Trả về lỗi chi tiết cho client (chỉ nên làm trong môi trường dev/test)
        return res.status(500).json({
          error: "Lỗi upload ảnh đại diện.",
          detail: err.message, // Trả về thông báo lỗi cụ thể
        });
      }
    }

    // === VALIDATE DỮ LIỆU ===
    if (payload.career_start_year && !validateCareerYear(payload.career_start_year)) {
         return res.status(400).json({ error: "Năm bắt đầu hành nghề không hợp lệ." });
    }
    if (
      payload.gender &&
      !["male", "female", "other"].includes(payload.gender)
    ) {
      return res.status(400).json({ error: "Giới tính không hợp lệ." });
    }
    if (payload.dob) {
      const d = new Date(payload.dob);
      if (isNaN(d.getTime()))
        return res.status(400).json({ error: "Ngày sinh không hợp lệ." });
      payload.dob = d;
    }
    if (payload.specialty_id) {
      const s = await Specialty.findById(payload.specialty_id);
      if (!s)
        return res.status(404).json({ error: "Chuyên khoa không tồn tại." });
    }
    if (payload.phone) {
      const taken = await Doctor.findOne({
        phone: payload.phone,
        _id: { $ne: doctorToUpdateId }, // <-- SỬ DỤNG ID CỦA DOCTOR ĐANG CẬP NHẬT
      });
      if (taken)
        return res
          .status(409)
          .json({ error: "Số điện thoại đã được sử dụng." });
    }

    // === CẬP NHẬT HỒ SƠ ===
    const updatedDoctor = await Doctor.findOneAndUpdate(
      { _id: doctorToUpdateId }, // <-- DÙNG ID CỦA DOCTOR TRONG URL
      { $set: payload },
      { new: true, runValidators: true }
    ).populate({ path: "specialty_id", select: "name code" });

    if (!updatedDoctor) {
      return res.status(404).json({ error: "Không tìm thấy hồ sơ bác sĩ." });
    }

    // === KIỂM TRA ĐỦ THÔNG TIN → TỰ ĐỘNG HOÀN THÀNH HỒ SƠ ===
    const requiredFields = [
      "fullName",
      "gender",
      "dob",
      "phone",
      "address",
      "specialty_id",
    ];
    const isComplete = requiredFields.every(
      (field) =>
        updatedDoctor[field] &&
        (typeof updatedDoctor[field] === "string"
          ? updatedDoctor[field].trim() !== ""
          : true)
    );

    let profileStatusChanged = false;

    if (isComplete && updatedDoctor.status !== "active") {
      updatedDoctor.status = "active";
      await updatedDoctor.save();
      await User.findByIdAndUpdate(existingDoctor.user_id, {
        profile_completed: true,
        status: "active",
      });
      profileStatusChanged = true;
    }

    return res.status(200).json({
      message: profileStatusChanged
        ? "Cập nhật thành công! Hồ sơ đã được hoàn tất và kích hoạt!"
        : "Cập nhật thông tin thành công.",
      profile: updatedDoctor,
      profile_completed: isComplete,
    });
  } catch (error) {
    console.error("Lỗi cập nhật hồ sơ bác sĩ:", error);
    next(error);
  }
};
export const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find()
      .populate({ path: "specialty_id", select: "name code" })
      .select("-__v")
      .lean();
    return res.status(200).json({ doctors });
  } catch (e) {
    next(e);
  }
};

export const deleteDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.id;

    // 1. Tìm bác sĩ để lấy user_id
    const doctor = await Doctor.findById(doctorId).select("user_id").lean();

    if (!doctor) {
      return res.status(404).json({ error: "Không tìm thấy hồ sơ bác sĩ." });
    }

    // 2. XÓA BÁC SĨ TRƯỚC
    await Doctor.findByIdAndDelete(doctorId);

    // 3. XÓA USER TƯƠNG ỨNG (quan trọng nhất!)
    const deletedUser = await User.findByIdAndDelete(doctor.user_id);

    // 4. (Tùy chọn) Xóa các dữ liệu liên quan khác nếu cần
    // await Appointment.deleteMany({ doctor_id: doctorId });
    // await Schedule.deleteMany({ doctor_id: doctorId });

    return res.status(200).json({
      message: "Xóa bác sĩ thành công!",
      info: "Đã xóa cả tài khoản đăng nhập và hồ sơ bác sĩ.",
      deletedUserId: deletedUser?._id || doctor.user_id,
    });
  } catch (error) {
    console.error("Lỗi xóa bác sĩ:", error);
    next(error);
  }
};
