import MedicalService from "../models/MedicalServiceModel.js";
import { v2 as cloudinary } from "cloudinary";

// Cấu hình Cloudinary (Nếu chưa cấu hình ở file server.js hay config riêng thì thêm vào đây, hoặc đảm bảo đã config ở chỗ khác)
// cloudinary.config({ ... });

/** * GET /api/services
 * Lấy danh sách dịch vụ
 */
export const getServices = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      // Tìm theo tên HOẶC mã dịch vụ
      filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [services, total] = await Promise.all([
      MedicalService.find(filter)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean(),
      MedicalService.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: services,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
/** * GET /api/services/:id
 * Lấy chi tiết 1 dịch vụ theo ID (Để xem chi tiết hoặc edit)
 */
export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await MedicalService.findById(id);

    if (!service) {
      return res.status(404).json({ error: "Không tìm thấy dịch vụ." });
    }

    res.json({ 
      success: true, 
      data: service 
    });
  } catch (error) {
    next(error);
  }
};

/** * POST /api/services
 * Tạo dịch vụ mới (Có xử lý ảnh Base64)
 */
export const createService = async (req, res, next) => {
  try {
    const { name, code, price, description, status, image } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: "Tên dịch vụ và giá là bắt buộc." });
    }

    let imageUrl = "";

    // --- XỬ LÝ ẢNH BASE64 ---
    if (image) {
        try {
            const uploadRes = await cloudinary.uploader.upload(image, {
                upload_preset: "ml_default", // Hoặc bỏ dòng này nếu dùng cấu hình gốc
                folder: "medical_services"   // Lưu vào thư mục riêng cho gọn
            });
            imageUrl = uploadRes.secure_url;
        } catch (uploadErr) {
            console.error("Lỗi upload ảnh:", uploadErr);
            // Có thể return lỗi hoặc để trống ảnh tùy logic của bạn
            // return res.status(500).json({ error: "Lỗi khi upload ảnh." });
        }
    }
    // ------------------------

    const newService = await MedicalService.create({ 
        name, 
        code, 
        price, 
        description, 
        status, 
        image: imageUrl // Lưu link ảnh vào DB
    });
    
    res.status(201).json({ 
      success: true, 
      message: "Tạo dịch vụ thành công.", 
      data: newService 
    });
  } catch (error) {
    // Bắt lỗi trùng Code (E11000)
    if (error.code === 11000) {
        return res.status(409).json({ error: "Mã dịch vụ (code) này đã tồn tại." });
    }
    next(error);
  }
};

/** * PUT /api/services/:id
 * Cập nhật giá, tên, ảnh...
 */
export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, price, description, status, image } = req.body;
    
    // Tìm dịch vụ cũ trước
    const service = await MedicalService.findById(id);
    if (!service) return res.status(404).json({ error: "Không tìm thấy dịch vụ." });

    let imageUrl = service.image; // Mặc định giữ nguyên ảnh cũ

    // --- XỬ LÝ ẢNH KHI UPDATE ---
    // Kiểm tra xem 'image' gửi lên có phải là Base64 mới không (thường bắt đầu bằng "data:image")
    // Nếu là link http... thì nghĩa là người dùng không đổi ảnh
    if (image && image.startsWith("data:image")) {
        try {
            // (Tùy chọn) Xóa ảnh cũ trên Cloudinary nếu cần tiết kiệm dung lượng
            // const publicId = service.image.split('/').pop().split('.')[0];
            // await cloudinary.uploader.destroy(publicId);

            const uploadRes = await cloudinary.uploader.upload(image, {
                folder: "medical_services"
            });
            imageUrl = uploadRes.secure_url;
        } catch (uploadErr) {
             console.error("Lỗi upload ảnh update:", uploadErr);
        }
    } else if (image === "" || image === null) {
        // Trường hợp người dùng muốn xóa ảnh
        imageUrl = "";
    }
    // ----------------------------

    const updateData = {
        name, code, price, description, status,
        image: imageUrl 
    };

    const updatedService = await MedicalService.findByIdAndUpdate(id, updateData, { new: true });

    res.json({ 
      success: true, 
      message: "Cập nhật dịch vụ thành công.", 
      data: updatedService 
    });
  } catch (error) {
    if (error.code === 11000) {
        return res.status(409).json({ error: "Mã dịch vụ bị trùng." });
    }
    next(error);
  }
};

/** * DELETE /api/services/:id
 */
export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await MedicalService.findByIdAndDelete(id);
    
    if (!deleted) return res.status(404).json({ error: "Không tìm thấy dịch vụ." });

    // (Tùy chọn) Xóa ảnh trên Cloudinary khi xóa DB
    // if (deleted.image) { ... logic destroy cloudinary ... }

    res.json({ success: true, message: "Đã xóa dịch vụ." });
  } catch (error) {
    next(error);
  }
};