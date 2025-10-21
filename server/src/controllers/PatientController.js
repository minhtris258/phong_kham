// controllers/PatientController.js
import Patient from "../models/PatientModel.js";
import User from "../models/UserModel.js";

export const completePatientProfile = async (req, res, next) => {
  try {
    const userId = req.user._id; // ✅ lấy từ token

    // Kiểm tra trùng
    const existed = await Patient.findOne({ user_id: userId }).lean();
    if (existed)
      return res.status(409).json({ error: "Hồ sơ đã tồn tại." });

    // Lấy dữ liệu từ body
    const { fullName, dob, gender, phone, email, address, note } = req.body;

    // Kiểm tra thiếu dữ liệu
    if (!fullName || !dob || !gender || !phone || !email || !address) {
      return res
        .status(400)
        .json({ error: "Thiếu thông tin hồ sơ bắt buộc." });
    }

    // Tạo hồ sơ
    const profile = await Patient.create({
      user_id: userId,
      fullName,
      dob: new Date(dob),
      gender,
      phone,
      email,
      address,
      note
    });

    // Cập nhật trạng thái user
    await User.updateOne(
      { _id: userId },
      { $set: { profile_completed: true, status: "active" } }
    );

    return res.status(201).json(profile);
  } catch (e) {
    console.error(e);
    next(e);
  }
};
