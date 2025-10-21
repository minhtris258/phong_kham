// GET /api/users/:id
import User from "../models/UserModel.js";

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

// POST /api/registerpublic
export const registerPublic = async (req, res) => {
  try {
    const{ name, email, password } = req.body;
    if(!name || !email || !password){
      return res.status(400).json({ message: "Thiếu thông tin" });// 400: Yêu cầu không hợp lệ

      const existingUser = await User.findOne({ email });
      if(existingUser){
        return res.status(409).json({ message: "Email đã được sử dụng" });// 409: Xung đột
      }
      const patientRole = await Role.findOne({ name: "patient" });
      if(!patientRole){
        return res.status(500).json({ message: "Vai trò bệnh nhân không tồn tại" });// 500: Lỗi server

        const hash = await bcrypt.hash(password, 10);
        const User = await User.create({
          name,
          email,
          password: hash,
          role_id: patientRole._id
        });// Mặc định vai trò là bệnh nhân
        await User.save();
      }
      res.status(201).json(patientRole);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/users
export const createUser = async (req, res) => {
  try {
    const { _id, name, email, image, role_id, password } = req.body;
    const newUser = await User.create({ _id, name, email, image, role_id, password });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
