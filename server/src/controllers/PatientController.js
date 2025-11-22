import Patient from "../models/PatientModel.js";
import User from "../models/UserModel.js";
import Role from "../models/RoleModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const parseDob = (dob) => {
  if (!dob) return null;
  const d1 = new Date(dob);                    // ưu tiên ISO / yyyy-mm-dd
  if (!isNaN(d1.getTime())) return d1;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dob); // dd/MM/yyyy
  if (m) {
    const [_, dd, MM, yyyy] = m;
    const d2 = new Date(`${yyyy}-${MM}-${dd}T00:00:00Z`);
    if (!isNaN(d2.getTime())) return d2;
  }
  return null;
};
//POST /api/patients 
export const createPatient = async (req, res, next) => {
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

    // Tìm role patient
    const patientRole = await Role.findOne({ name: "patient" }).lean();
    if (!patientRole) {
      return res
        .status(500)
        .json({ error: "Chưa có role 'patient' trong hệ thống" });
    }

    // Tạo User trước (chưa có fullName)
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hash,
      role_id: patientRole._id,
      profile_completed: false,
      status: "pending_profile", // chờ hoàn tất hồ sơ
    });

    // Tạo bản ghi Patient tạm (chưa có thông tin chi tiết)
    const patient = await Patient.create({
      user_id: user._id,
      fullName: name, // tạm dùng name làm fullName (sẽ cập nhật sau)
      email: email.trim().toLowerCase(),
      status: "inactive", // chưa kích hoạt
      // Các trường khác để trống → bác sĩ tự điền
    });

    // Tạo token onboarding
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: "patient",
        status: user.status,
        profile_completed: false,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Tạo tài khoản bệnh nhân thành công!",
      info: "Bệnh nhân cần đăng nhập để hoàn tất hồ sơ cá nhân (họ tên thật, ngày sinh, giới tính, số điện thoại, địa chỉ...)",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: "patient",
        profile_completed: false,
        status: user.status,
      },
      patientId: patient._id,
      nextStep: "/onboarding/profile-patient",
    });
  } catch (error) {
    console.error("Lỗi tạo bệnh nhân:", error);
    next(error);
  }
};
// Admin hoàn tất hồ sơ bệnh nhân
/** PUT /api/patients/:id  (Admin cập nhật hồ sơ → TỰ ĐỘNG HOÀN THÀNH NẾU ĐỦ) */
export const updatePatientAdmin = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const role = req.user?.role || req.user?.role?.name;
    const patientToUpdateId = req.params.id;
    
    if (!userId) return res.status(401).json({ error: "Thiếu token." });
const existingPatient = await Patient.findById(patientToUpdateId);
    
    if (!existingPatient) {
        // Trả về 404 nếu không tìm thấy document Patient
        return res.status(404).json({ error: "Không tìm thấy hồ sơ bệnh nhân." });
    }
    // Cho phép cả doctor và admin sửa
   if (role !== "admin" && userId.toString() !== existingPatient.user_id.toString()) {
      return res
        .status(403)
        .json({ error: "Không có quyền cập nhật hồ sơ của người khác." });
    }
    const ALLOWED_FIELDS = [
      "fullName",
      "dob",
      "gender",
      "phone",
      "address",
      "note",
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

    // === VALIDATE DỮ LIỆU ===
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
    if (payload.phone) {
      const taken = await Patient.findOne({
        phone: payload.phone,
        _id: { $ne: patientToUpdateId }, // <-- SỬ DỤNG ID CỦA PATIENT ĐANG CẬP NHẬT
      });
      if (taken)
        return res
          .status(409)
          .json({ error: "Số điện thoại đã được sử dụng." });
    }

    // === CẬP NHẬT HỒ SƠ ===
    const updatedPatient = await Patient.findOneAndUpdate(
      { _id: patientToUpdateId }, // <-- DÙNG ID CỦA PATIENT TRONG URL
      { $set: payload },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updatedPatient) {
      return res.status(404).json({ error: "Không tìm thấy hồ sơ bệnh nhân." });
    }

    // === KIỂM TRA ĐỦ THÔNG TIN → TỰ ĐỘNG HOÀN THÀNH HỒ SƠ ===
    const requiredFields = [
      "fullName",
      "gender",
      "dob",
      "phone",
      "address",
    ];
    const isComplete = requiredFields.every(
      (field) =>
        updatedPatient[field] &&
        (typeof updatedPatient[field] === "string"
          ? updatedPatient[field].trim() !== ""
          : true)
    );

    let profileStatusChanged = false;

    if (isComplete && updatedPatient.status !== "active") {
      updatedPatient.status = "active";
      await updatedPatient.save();
      await User.findByIdAndUpdate(existingPatient.user_id, {
        profile_completed: true,
        status: "active",
      });
      profileStatusChanged = true;
    }

    return res.status(200).json({
      message: profileStatusChanged
        ? "Cập nhật thành công! Hồ sơ đã được hoàn tất và kích hoạt!"
        : "Cập nhật thông tin thành công.",
      profile: updatedPatient,
      profile_completed: isComplete,
    });
  } catch (error) {
    console.error("Lỗi cập nhật hồ sơ bệnh nhân:", error);
    next(error);
  }
};
// POST /onboarding/patient-profile
export const completePatientProfile = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const role = req.user?.role || req.user?.role?.name;
    if (!userId) return res.status(401).json({ error: "Thiếu hoặc sai token." });
    if (role !== "patient") {
      return res.status(403).json({ error: "Chỉ tài khoản bệnh nhân mới được hoàn tất hồ sơ." });
    }

    // user để lấy email (không cho FE tự gửi email)
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: "Không tìm thấy user." });

    // đã có hồ sơ chưa
    const existed = await Patient.findOne({ user_id: userId }).lean();
    if (existed) return res.status(409).json({ error: "Hồ sơ đã tồn tại." });

    // làm sạch key và value (tránh "fullName " có khoảng trắng)
    const clean = {};
    for (const [k, v] of Object.entries(req.body || {})) {
      clean[k.trim()] = typeof v === "string" ? v.trim() : v;
    }

    const { fullName, dob, gender, phone, address, note } = clean;

    // bắt buộc
    if (!fullName || !dob || !gender || !phone || !address) {
      return res.status(400).json({ error: "Thiếu thông tin hồ sơ bắt buộc: fullName, dob, gender, phone, address." });
    }

    // validate
    const allowedGender = ["male", "female", "other"];
    if (!allowedGender.includes(gender)) {
      return res.status(400).json({ error: "Giá trị gender không hợp lệ." });
    }

    const dobDate = parseDob(dob);
    if (!dobDate) {
      return res.status(400).json({ error: "Định dạng dob không hợp lệ. Hỗ trợ yyyy-mm-dd hoặc dd/MM/yyyy." });
    }

    // số điện thoại trùng với hồ sơ bệnh nhân khác?
    const phoneTaken = await Patient.findOne({ phone }).lean();
    if (phoneTaken) {
      return res.status(409).json({ error: "Số điện thoại đã được dùng cho hồ sơ khác." });
    }

    // tạo hồ sơ (email lấy từ User)
    const profile = await Patient.create({
      user_id: userId,
      fullName,
      dob: dobDate,
      gender,
      phone,
      email: user.email,
      address,
      note: note || "",
      status: "active",
    });

    // cập nhật trạng thái user
    await User.updateOne(
      { _id: userId },
      { $set: { profile_completed: true, status: "active" } }
    );

    // trả về
    const result = await Patient.findById(profile._id).select("-__v").lean();
    return res.status(201).json({
      message: "Hoàn tất hồ sơ bệnh nhân thành công.",
      profile: result,
      next: "/dashboard/patient",
    });
  } catch (e) {
    next(e);
  }
};

/** GET /api/patients/me  (Bác sĩ xem hồ sơ của mình) */
export const getMyPatientProfile = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const role = req.user?.role || req.user?.role?.name;
    if (!userId)
      return res.status(401).json({ error: "Thiếu hoặc sai token." });
    if (role !== "doctor") {
      return res
        .status(403)
        .json({ error: "Chỉ tài khoản bệnh nhân mới được truy cập." });
    }

    const profile = await Patient.findOne({ user_id: userId })
      .select("-__v")
      .lean();

    if (!profile) {
      return res.status(404).json({ error: "Không tìm thấy hồ sơ bệnh nhân." });
    }

    return res.status(200).json({ profile });
  } catch (e) {
    next(e);
  }
};

/** GET /api/patients/:id  (Public/Admin tuỳ bạn) */
export const getPatientById = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const profile = await Patient.findById(patientId)
      .select("-__v")
      .lean();

    if (!profile) {
      return res.status(404).json({ error: "Không tìm thấy hồ sơ bệnh nhân." });
    }

    return res.status(200).json({ profile });
  } catch (e) {
    next(e);
  }
};

/** PUT /api/patients/me  (Bác sĩ cập nhật hồ sơ của mình) */
export const updateMyPatientProfile = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const role = req.user?.role || req.user?.role?.name;
    if (!userId)
      return res.status(401).json({ error: "Thiếu hoặc sai token." });
    if (role !== "patient") {
      return res
        .status(403)
        .json({ error: "Chỉ tài khoản bệnh nhân mới được truy cập." });
    }

    // các field cho phép cập nhật
    const ALLOWED = new Set([
      "fullName",
      "dob",
      "gender",
      "phone",
      "address",
      "note",
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

    const updated = await Patient.findOneAndUpdate(
      { user_id: userId },
      { $set: payload },
      { new: true, runValidators: true }
    )
      .select("-__v")
      .lean();

    if (!updated) {
      return res.status(404).json({ error: "Không tìm thấy hồ sơ bệnh nhân." });
    }

    return res
      .status(200)
      .json({ message: "Cập nhật thành công.", profile: updated });
  } catch (e) {
    next(e);
  }
};
export const getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find()
      .populate({ 
        path: 'user_id', // Giả định trường liên kết là user_id
        select: 'email profile_completed status' // Chỉ lấy các trường cần thiết từ User
      })
      .select("-__v")
      .lean();

    // Dữ liệu trả về sẽ có User embedded trong trường user_id

    // Tái cấu trúc dữ liệu để hiển thị dễ dàng hơn
    const formattedPatients = patients.map(p => ({
        ...p,
        email: p.user_id?.email, // Lấy email từ User
        profile_completed: p.user_id?.profile_completed, // Lấy trạng thái từ User
        status: p.user_id?.status, // Lấy status từ User
        // Giữ lại ID User nếu cần (p.user_id._id)
    }));
    
    return res.status(200).json({ patients: formattedPatients });
  } catch (e) {
    next(e);
  }
};
export const deletePatientById = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const deleted = await Patient.findByIdAndDelete(patientId).lean();
    if (!deleted) {
      return res.status(404).json({ error: "Không tìm thấy hồ sơ bệnh nhân." });
    }
    return res.status(200).json({ message: "Xóa hồ sơ bệnh nhân thành công." });
  } catch (e) {
    next(e);
  }
};
export const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });
    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const adminUpdatePatientPassword = async (req, res) => {
  const { id } = req.params; // ID của Patient document
  const { newPassword } = req.body;
  
  try {
    // 1. Tìm Patient (dùng để lấy user_id)
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // 2. Tính Hash Mật khẩu MỚI (chỉ một lần)
    const hash = await bcrypt.hash(newPassword, 10); 
    
    // 3. Cập nhật User liên kết
    // Sử dụng findByIdAndUpdate trực tiếp để cập nhật trường 'password'
    const user = await User.findByIdAndUpdate(
        patient.user_id, 
        { password: hash },
        { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found (Associated User ID is missing or invalid)" });
    }

    // 4. Phản hồi thành công
    res.json({ message: "Patient password updated successfully" });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu Admin:", error);
    res.status(500).json({ message: error.message });
  }
};