import { v2 as cloudinary } from "cloudinary";
import Specialty from "../models/SpecialtyModel.js"; //
import Doctor from "../models/DoctorModel.js";

// --- Helper: Kiểm tra Base64 ---
const isBase64Image = (str) => {
  if (typeof str !== 'string') return false;
  return str.startsWith('data:image');
};

// --- Helper: Chuẩn hóa Keywords ---
// Chuyển "đau đầu, chóng mặt" -> ["đau đầu", "chóng mặt"]
const parseKeywords = (input) => {
  if (Array.isArray(input)) return input;
  if (typeof input === "string") {
    return input.split(",").map(k => k.trim()).filter(k => k);
  }
  return [];
};

// ==========================================
// GET /api/specialties (TÌM KIẾM THÔNG MINH)
// ==========================================
export const listSpecialties = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // 1. Tạo điều kiện tìm kiếm (Match Stage)
    let matchStage = {};
    
    if (search) {
      // TỐI ƯU CHO AI: Tìm trong cả Tên Khoa HOẶC Keywords
      // Ví dụ: search="đau bụng" sẽ tìm thấy khoa có keyword "đau bụng"
      matchStage = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { keywords: { $elemMatch: { $regex: search, $options: "i" } } }
        ]
      };
    }

    // 2. Aggregation: Lấy data + Đếm số bác sĩ
    const result = await Specialty.aggregate([
      { $match: matchStage },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            // Lookup đếm số bác sĩ thuộc khoa này
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
                doctor_count: { $size: "$doctors" }, //
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                thumbnail: 1,
                keywords: 1, // Trả về cả keywords để Frontend/AI hiển thị
                doctor_count: 1,
                createdAt: 1
              },
            },
            { $sort: { name: 1 } },
            { $skip: skip },
            { $limit: limitNumber }
          ]
        }
      }
    ]);

    const data = result[0].data;
    const totalDocs = result[0].metadata[0] ? result[0].metadata[0].total : 0;

    res.json({
      specialties: data,
      pagination: {
        totalDocs,
        limit: limitNumber,
        totalPages: Math.ceil(totalDocs / limitNumber),
        page: pageNumber,
      },
    });

  } catch (e) {
    next(e);
  }
};

// ==========================================
// GET /api/specialties/:id
// ==========================================
export const getSpecialtyById = async (req, res, next) => {
  try {
    const specialtyId = req.params.id;
    const specialtyItem = await Specialty.findById(specialtyId).lean();
    
    if (!specialtyItem) {
      return res.status(404).json({ message: "Specialty not found" });
    }

    // Lấy danh sách bác sĩ thuộc khoa này để hiển thị chi tiết
    const doctors = await Doctor.find({ specialty_id: specialtyId })
      .select("fullName thumbnail introduction consultation_fee phone")
      .lean();

    res.json({
      ...specialtyItem,
      doctorCount: doctors.length,
      doctors: doctors,
    });
  } catch (e) {
    next(e);
  }
};

// ==========================================
// POST /api/specialties (TẠO MỚI + KEYWORDS)
// ==========================================
export const createSpecialty = async (req, res, next) => {
  try {
    const { name, thumbnail, keywords } = req.body;

    if (!name) return res.status(400).json({ error: "Tên chuyên khoa là bắt buộc." });

    // 1. Xử lý Upload ảnh (Base64)
    let thumbnailUrl = "";
    if (thumbnail && isBase64Image(thumbnail)) {
      const result = await cloudinary.uploader.upload(thumbnail, {
        folder: "specialties",
        resource_type: "image"
      });
      thumbnailUrl = result.secure_url;
    }

    // 2. Xử lý Keywords (quan trọng cho AI)
    const formattedKeywords = parseKeywords(keywords);

    // 3. Lưu vào DB
    const newSpecialty = await Specialty.create({
      name,
      thumbnail: thumbnailUrl,
      keywords: formattedKeywords //
    });

    res.status(201).json({
        message: "Tạo chuyên khoa thành công",
        specialty: newSpecialty
    });
  } catch (error) {
    // Bắt lỗi trùng tên (unique: true trong Model)
    if (error.code === 11000) {
        return res.status(409).json({ error: "Tên chuyên khoa đã tồn tại." });
    }
    next(error);
  }
};

// ==========================================
// PUT /api/specialties/:id (UPDATE + KEYWORDS)
// ==========================================
export const updateSpecialty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, thumbnail, keywords } = req.body;

    // 1. Tìm bản ghi cũ
    const oldSpecialty = await Specialty.findById(id);
    if (!oldSpecialty) {
      return res.status(404).json({ message: "Specialty not found" });
    }

    let updateData = {};
    if (name) updateData.name = name;

    // 2. Xử lý Keywords (nếu có gửi lên thì mới update)
    if (keywords !== undefined) {
        updateData.keywords = parseKeywords(keywords);
    }

    // 3. Xử lý Ảnh (Base64)
    if (thumbnail) {
      if (isBase64Image(thumbnail)) {
        // Upload ảnh mới
        const result = await cloudinary.uploader.upload(thumbnail, {
          folder: "specialties",
        });
        updateData.thumbnail = result.secure_url;
      } else if (thumbnail.startsWith("http")) {
        // Nếu gửi URL cũ -> Giữ nguyên (hoặc updateData.thumbnail = thumbnail)
      }
    }

    // 4. Update
    const updatedSpecialty = await Specialty.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
        message: "Cập nhật thành công",
        specialty: updatedSpecialty
    });

  } catch (error) {
    if (error.code === 11000) {
        return res.status(409).json({ error: "Tên chuyên khoa đã tồn tại." });
    }
    next(error);
  }
};

// ==========================================
// DELETE (GIỮ NGUYÊN)
// ==========================================
export const deleteSpecialty = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSpecialty = await Specialty.findByIdAndDelete(id);
    if (!deletedSpecialty) {
      return res.status(404).json({ message: "Specialty not found" });
    }
    res.json({ message: "Specialty deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};