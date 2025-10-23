import Patient from "../models/PatientModel.js";
import User from "../models/UserModel.js";

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
