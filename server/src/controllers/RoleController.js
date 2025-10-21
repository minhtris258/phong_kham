import Role from "../models/RoleModel.js";

// GET /api/roles
export const getRole = async (req, res) => {
    try {
        const roles = await Role.find();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// POST /api/roles
export const createRole = async (req, res) => {
    try {
        const { name } = req.body;
        const newRole = await Role.create({ name });
        res.status(201).json(newRole);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//PUT /api/roles/:id
export const updateRole = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedRole = await Role.findByIdAndUpdate
        (id, req.body, { new: true });
        if (!updatedRole) {
            return res.status(404).json({ message: "Role not found" });
        }
        res.json(updatedRole);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// DELETE /api/roles/:id
export const deleteRole = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedRole = await Role.findByIdAndDelete(id);
        if (!deletedRole) {
            return res.status(404).json({ message: "Role not found" });
        }
        res.json({ message: "Role deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};