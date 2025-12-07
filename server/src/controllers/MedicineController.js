import Medicine from "../models/MedicineModel.js";

/** * GET /api/medicines
 * Lấy danh sách thuốc (Giữ nguyên)
 */
export const getMedicines = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;
    
    const [medicines, total] = await Promise.all([
      Medicine.find(filter)
        .sort({ name: 1 })
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
 * Thêm thuốc mới (Cập nhật để nhận mảng dosages)
 */
export const createMedicine = async (req, res, next) => {
  try {
    // 1. Nhận dosages từ body (Thay vì dosage số ít)
    const { name, unit, description, status, dosages } = req.body;

    if (!name) return res.status(400).json({ error: "Tên thuốc là bắt buộc." });

    const exists = await Medicine.findOne({ name: name });
    if (exists) {
        return res.status(409).json({ error: "Tên thuốc này đã tồn tại trong hệ thống." });
    }

    // 2. Xử lý dosages: Đảm bảo nó là mảng và loại bỏ các dòng rỗng
    let finalDosages = [];
    if (Array.isArray(dosages)) {
        // Lọc bỏ các giá trị rỗng hoặc null
        finalDosages = dosages.filter(d => d && d.trim() !== "");
    } else if (typeof dosages === 'string' && dosages.trim() !== "") {
        // Trường hợp client lỡ gửi string, ta biến nó thành mảng 1 phần tử
        finalDosages = [dosages];
    }

    const newMedicine = await Medicine.create({ 
        name, 
        unit, 
        description, 
        status, 
        dosages: finalDosages // Lưu mảng vào DB
    });
    
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
 * Cập nhật thuốc (Cho phép xóa/sửa liều lượng)
 */
export const updateMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, unit, description, status, dosages } = req.body;

    // 1. Chuẩn bị dữ liệu update
    const updateData = {
        name,
        unit,
        description,
        status
    };

    // 2. Xử lý Logic xóa/sửa Dosages
    // Client sẽ gửi lên danh sách MỚI NHẤT. 
    // Ví dụ cũ: ["500mg", "250mg"]. Client gửi lên: ["500mg"]. 
    // Server sẽ lưu ["500mg"] -> Tự động mất "250mg".
    if (dosages !== undefined) {
        if (Array.isArray(dosages)) {
            // Lọc bỏ chuỗi rỗng để data sạch
            updateData.dosages = dosages.filter(d => d && d.trim() !== ""); 
        } else {
            updateData.dosages = []; // Nếu gửi null/rỗng thì coi như xóa hết liều lượng
        }
    }

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
 * Xóa thuốc (Giữ nguyên)
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