import specialties from "../models/SpecialtyModel.js";
import Doctor from "../models/DoctorModel.js";

// GET /api/specialties
// GET /api/specialties
export const listSpecialties = async (req, res, next) => {
  try {
    const items = await specialties.aggregate([
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "specialty_id",
          as: "doctors",
        },
      },
      {
        $addFields: {
          doctor_count: { $size: "$doctors" },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          code: 1,
          doctor_count: 1,
        },
      },
      { $sort: { name: 1 } },
    ]);

    res.json(items);
  } catch (e) {
    next(e);
  }
};

// GET /api/specialties/:id
export const getSpecialtyById = async (req, res, next) => {
  try {
    const specialtyId = req.params.id; 

    // 1. Tìm thông tin Chuyên khoa
    const specialtyItem = await specialties.findById(specialtyId).lean();
    if (!specialtyItem) {
      return res.status(404).json({ message: "Specialty not found" });
    } 

    // 2. Truy vấn tất cả Doctors có specialty_id khớp
    const doctors = await Doctor.find({ specialty_id: specialtyId })
      .select("fullName thumbnail introduction consultation_fee phone") // Chọn các trường hiển thị trong modal
      .lean(); 

    // 3. Tính toán số lượng bác sĩ (doctorCount)
    const doctorCount = doctors.length;

    // 4. Trả về thông tin chuyên khoa CÙNG VỚI danh sách và số lượng bác sĩ
    res.json({
      ...specialtyItem,
      // Thêm trường doctorCount (sử dụng tên doctorCount cho nhất quán với frontend)
      doctorCount: doctorCount,
      doctors: doctors,
    });
  } catch (e) {
    next(e);
  }
};
// POST /api/specialties
export const createSpecialty = async (req, res) => {
  try {
    const { name } = req.body;
    const newSpecialty = await specialties.create({ name });
    res.status(201).json(newSpecialty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// PUT /api/specialties/:id
export const updateSpecialty = async (req, res, next) => {
  // Thêm 'next' cho đồng bộ
  const { id } = req.params;
  try {
    // Sử dụng findByIdAndUpdate để thực hiện cập nhật
    const updatedSpecialty = await specialties.findByIdAndUpdate(id, req.body, {
      new: true, // Yêu cầu Mongoose trả về document SAU khi cập nhật
      runValidators: true, // Đảm bảo các quy tắc validation (Schema) được chạy
    });

    if (!updatedSpecialty) {
      return res.status(404).json({ message: "Specialty not found" });
    }
    res.json(updatedSpecialty);
  } catch (error) {
    // Chuyển lỗi tới middleware xử lý lỗi chung (nếu có)
    // Hoặc trả về lỗi 400 nếu lỗi liên quan đến validation (ví dụ: tên bị thiếu)
    res.status(500).json({ message: error.message });
  }
};
// DELETE /api/specialties/:id
export const deleteSpecialty = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSpecialty = await specialties.findByIdAndDelete(id);
    if (!deletedSpecialty) {
      return res.status(404).json({ message: "Specialty not found" });
    }
    res.json({ message: "Specialty deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
