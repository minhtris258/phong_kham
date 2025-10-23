import specialties from "../models/SpecialtyModel.js";

// GET /api/specialties
export const listSpecialties = async (req, res, next) => {
  try {
    const items = await specialties
      .find({})
      .select("_id name code")
      .sort({ name: 1 })
      .lean();
    res.json(items);
  } catch (e) {
    next(e);
  }
};

// GET /api/specialties/:id
export const getSpecialtyById = async (req, res, next) => {
  try {
    const item = await specialties.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ message: "Specialty not found" });
    res.json(item);
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
export const updateSpecialty = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedSpecialty = await specialties.findById(id, req.body, {
      new: true,
    });
    if (!updatedSpecialty) {
      return res.status(404).json({ message: "Specialty not found" });
    }
    res.json(updatedSpecialty);
  } catch (error) {
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
