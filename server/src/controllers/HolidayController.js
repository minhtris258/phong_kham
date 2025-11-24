import Holiday from "../models/HolidayModel.js";

/** POST /api/holidays (Admin tạo ngày lễ mới) */
export const createHoliday = async (req, res, next) => {
    try {
        const { date, name, isMandatoryDayOff = true } = req.body;
        
        const existing = await Holiday.findOne({ date });
        if (existing) {
            return res.status(409).json({ error: "Ngày lễ này đã tồn tại." });
        }

        const newHoliday = await Holiday.create({ date, name, isMandatoryDayOff });
        res.status(201).json(newHoliday);
    } catch (e) {
        next(e);
    }
};

/** GET /api/holidays (Lấy tất cả ngày lễ) */
export const getAllHolidays = async (req, res, next) => {
    try {
        const holidays = await Holiday.find().sort({ date: 1 }).lean();
        res.json(holidays);
    } catch (e) {
        next(e);
    }
};
// Update holiday
/** PUT /api/holidays/:id (Cập nhật ngày lễ) */
export const updateHoliday = async (req, res, next) => {
    try {
        const holidayId = req.params.id;
        const { date, name, isMandatoryDayOff } = req.body;
        const updated = await Holiday.findByIdAndUpdate(
            holidayId,
            { date, name, isMandatoryDayOff },
            { new: true, runValidators: true }
        ).lean();   
        if (!updated) {
            return res.status(404).json({ error: "Không tìm thấy ngày lễ." });
        }
        res.json(updated);
    }
    catch (e) {
        next(e);
    }
};
//** DELETE /api/holidays/:id (Xóa ngày lễ) */
export const deleteHoliday = async (req, res, next) => {
    try {
        const holidayId = req.params.id;
        const deleted = await Holiday.findByIdAndDelete(holidayId).lean();
        if (!deleted) {
            return res.status(404).json({ error: "Không tìm thấy ngày lễ." });
        }
        res.json({ message: "Xóa ngày lễ thành công." });
    } catch (e) {
        next(e);
    }
};