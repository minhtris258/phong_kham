import Medicine from "../models/MedicineModel.js";

/** * GET /api/medicines
 * Lấy danh sách thuốc (Có tìm kiếm + Phân trang)
 */
export const getMedicines = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    
    // Tạo bộ lọc
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.name = { $regex: search, $options: "i" }; // Tìm gần đúng, không phân biệt hoa thường
    }

    // Thực hiện query
    const skip = (page - 1) * limit;
    
    const [medicines, total] = await Promise.all([
      Medicine.find(filter)
        .sort({ name: 1 }) // Sắp xếp tên A-Z
        .skip(Number(skip))
        .limit(Number(limit))
        .lean(),
      Medicine.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: medicines,
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

/** * POST /api/medicines
 * Thêm thuốc mới
 */
export const createMedicine = async (req, res, next) => {
  try {
    const { name, unit, description, status } = req.body;

    if (!name) return res.status(400).json({ error: "Tên thuốc là bắt buộc." });

    // Kiểm tra xem thuốc đã tồn tại chưa (Optional)
    const exists = await Medicine.findOne({ name: name });
    if (exists) {
        return res.status(409).json({ error: "Tên thuốc này đã tồn tại trong hệ thống." });
    }

    const newMedicine = await Medicine.create({ name, unit, description, status });
    
    res.status(201).json({ 
      success: true, 
      message: "Thêm thuốc thành công.", 
      data: newMedicine 
    });
  } catch (error) {
    next(error);
  }
};

/** * PUT /api/medicines/:id
 * Cập nhật thông tin thuốc
 */
export const updateMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedMedicine = await Medicine.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedMedicine) return res.status(404).json({ error: "Không tìm thấy thuốc." });

    res.json({ 
      success: true, 
      message: "Cập nhật thành công.", 
      data: updatedMedicine 
    });
  } catch (error) {
    next(error);
  }
};

/** * DELETE /api/medicines/:id
 * Xóa thuốc (Lưu ý: Nên dùng soft delete bằng cách update status thành inactive thay vì xóa hẳn)
 */
export const deleteMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Medicine.findByIdAndDelete(id);
    
    if (!deleted) return res.status(404).json({ error: "Không tìm thấy thuốc." });

    res.json({ success: true, message: "Đã xóa thuốc khỏi danh mục." });
  } catch (error) {
    next(error);
  }
};