import MedicalService from "../models/MedicalServiceModel.js";
import { v2 as cloudinary } from "cloudinary";

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

/** * POST /api/services
 * Tạo dịch vụ mới
 */
export const createService = async (req, res, next) => {
  try {
    const { name, code, price, description, status } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: "Tên dịch vụ và giá là bắt buộc." });
    }

    // Nếu người dùng không nhập code, có thể tự sinh code (Optional)
    // if (!code) code = "DV" + Date.now();

    const newService = await MedicalService.create({ name, code, price, description, status });
    
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
 * Cập nhật giá, tên...
 */
export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedService = await MedicalService.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedService) return res.status(404).json({ error: "Không tìm thấy dịch vụ." });

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

    res.json({ success: true, message: "Đã xóa dịch vụ." });
  } catch (error) {
    next(error);
  }
};