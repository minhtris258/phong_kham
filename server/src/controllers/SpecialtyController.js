import { v2 as cloudinary } from "cloudinary";
import specialties from "../models/SpecialtyModel.js";
import Doctor from "../models/DoctorModel.js";
// Không cần import 'fs' nữa vì không xử lý file tạm

// --- Helper: Hàm kiểm tra chuỗi có phải là Base64 image hợp lệ không (Tùy chọn nhưng nên dùng) ---
const isBase64Image = (str) => {
  if (typeof str !== 'string') return false;
  // Kiểm tra xem chuỗi có bắt đầu bằng định dạng data URI ảnh không
  return str.startsWith('data:image');
};

// GET /api/specialties (Giữ nguyên)
export const listSpecialties = async (req, res, next) => {
  try {
    // 1. Lấy tham số từ query
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // 2. Tạo điều kiện tìm kiếm (Match Stage)
    let matchStage = {};
    if (search) {
      matchStage = { 
        name: { $regex: search, $options: "i" } // Tìm theo tên, không phân biệt hoa thường
      };
    }

    // 3. Sử dụng Aggregation với $facet để lấy cả Data và Total Count trong 1 lần truy vấn
    const result = await specialties.aggregate([
      // Bước A: Lọc theo tên trước (nếu có search)
      { $match: matchStage },
      
      {
        $facet: {
          // Luồng 1: Đếm tổng số bản ghi (metadata)
          metadata: [{ $count: "total" }],
          
          // Luồng 2: Lấy dữ liệu chi tiết
          data: [
            // Lookup để đếm số bác sĩ (giữ nguyên logic cũ)
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
                thumbnail: 1, 
                code: 1,
                doctor_count: 1,
              },
            },
            { $sort: { name: 1 } }, // Sắp xếp tên A-Z
            { $skip: skip },        // Bỏ qua n phần tử
            { $limit: limitNumber } // Lấy limit phần tử
          ]
        }
      }
    ]);

    // 4. Xử lý kết quả trả về
    const data = result[0].data;
    const totalDocs = result[0].metadata[0] ? result[0].metadata[0].total : 0;

    res.json({
      specialties: data,
      pagination: {
        totalDocs,
        limit: limitNumber,
        totalPages: Math.ceil(totalDocs / limitNumber),
        page: pageNumber,
        hasNextPage: pageNumber < Math.ceil(totalDocs / limitNumber),
        hasPrevPage: pageNumber > 1,
      },
    });

  } catch (e) {
    next(e);
  }
};
// GET /api/specialties/:id (Giữ nguyên)
export const getSpecialtyById = async (req, res, next) => {
  try {
    const specialtyId = req.params.id; 
    const specialtyItem = await specialties.findById(specialtyId).lean();
    if (!specialtyItem) {
      return res.status(404).json({ message: "Specialty not found" });
    } 
    const doctors = await Doctor.find({ specialty_id: specialtyId })
      .select("fullName thumbnail introduction consultation_fee phone")
      .lean(); 
    const doctorCount = doctors.length;
    res.json({
      ...specialtyItem,
      doctorCount: doctorCount,
      doctors: doctors,
    });
  } catch (e) {
    next(e);
  }
};

// ==========================================
// POST /api/specialties (XỬ LÝ BASE64)
// ==========================================
export const createSpecialty = async (req, res) => {
  try {
    // Lấy name và chuỗi thumbnail từ body request (dạng JSON)
    const { name, thumbnail } = req.body;
    let thumbnailUrl = ""; // Mặc định là rỗng nếu không gửi ảnh

    // Kiểm tra nếu client có gửi trường thumbnail và nó là chuỗi Base64 hợp lệ
    if (thumbnail && isBase64Image(thumbnail)) {
      // Cloudinary tự động nhận diện chuỗi base64
      const result = await cloudinary.uploader.upload(thumbnail, {
        folder: "specialties", // Thư mục trên Cloudinary
        resource_type: "image"
      });
      // Lấy đường dẫn ảnh sau khi upload thành công
      thumbnailUrl = result.secure_url;
    }

    // Tạo mới trong DB với đường dẫn ảnh (hoặc chuỗi rỗng)
    const newSpecialty = await specialties.create({ 
        name, 
        thumbnail: thumbnailUrl 
    });
    
    res.status(201).json(newSpecialty);
  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// PUT /api/specialties/:id (XỬ LÝ BASE64 KHI UPDATE)
// ==========================================
export const updateSpecialty = async (req, res, next) => {
  const { id } = req.params;
  try {
    // 1. Tìm specialty cũ để đảm bảo nó tồn tại
    const oldSpecialty = await specialties.findById(id);
    if (!oldSpecialty) {
        return res.status(404).json({ message: "Specialty not found" });
    }

    // Sao chép dữ liệu gửi lên vào biến updateData
    let updateData = { ...req.body };

    // 2. Kiểm tra xem người dùng có gửi ảnh mới dạng Base64 không.
    // Nếu họ không đổi ảnh, frontend thường sẽ gửi lại URL cũ (https://...), 
    // hoặc không gửi trường thumbnail. Hàm isBase64Image sẽ bỏ qua các trường hợp đó.
    if (updateData.thumbnail && isBase64Image(updateData.thumbnail)) {
      
      // Upload ảnh mới từ chuỗi Base64
      const result = await cloudinary.uploader.upload(updateData.thumbnail, {
        folder: "specialties",
      });
      
      // QUAN TRỌNG: Thay thế chuỗi Base64 dài ngoằng trong updateData 
      // bằng URL ngắn gọn vừa nhận được từ Cloudinary
      updateData.thumbnail = result.secure_url;

      // (Tùy chọn nâng cao) Xóa ảnh cũ trên Cloudinary nếu muốn tiết kiệm dung lượng
      // handleDeleteOldImage(oldSpecialty.thumbnail); 
    }

    // 3. Cập nhật vào DB
    const updatedSpecialty = await specialties.findByIdAndUpdate(id, updateData, {
      new: true, // Trả về document mới sau khi update
      runValidators: true, // Chạy validate của Mongoose
    });

    res.json(updatedSpecialty);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/specialties/:id (Giữ nguyên)
export const deleteSpecialty = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSpecialty = await specialties.findByIdAndDelete(id);
    if (!deletedSpecialty) {
      return res.status(404).json({ message: "Specialty not found" });
    }
    // (Tùy chọn) Xóa ảnh trên Cloudinary khi xóa data trong DB
    // handleDeleteOldImage(deletedSpecialty.thumbnail);
    res.json({ message: "Specialty deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};