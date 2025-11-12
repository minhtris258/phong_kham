
import User from "../models/UserModel.js";
import Role from "../models/RoleModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// GET /api/users/:id
export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });// 500: Lỗi server
  }
};


// POST /api/users
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Thiếu name | email | password" });

    const existed = await User.findOne({ email });
    if (existed)
      return res.status(409).json({ message: "Email đã tồn tại" });

    const patientRole = await Role.findOne({ name: "patient" });
    if (!patientRole)
      return res.status(500).json({ message: "Chưa seed role 'patient'" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hash,
      role_id: patientRole._id,
      profile_completed: false,
      status: "pending_profile",
    });

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: patientRole.name,
        status: user.status,
        profile_completed: user.profile_completed,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Đăng ký thành công.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: patientRole.name,
        status: user.status,
        profile_completed: user.profile_completed,
      },
    });
  } catch (e) {
    next(e);
  }
};


// Put //api/users/:id
export const updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const updateUser = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updateUser) return res.status(404).json({ message: "User not found" });
    res.json(updateUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//Put //api/users/password/:id
export const updateUserPassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });
    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete //api/users/:id
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
