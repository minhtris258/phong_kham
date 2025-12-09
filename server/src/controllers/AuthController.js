import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import Role from "../models/RoleModel.js";
import Patient from "../models/PatientModel.js";
import sendEmail from "../utils/sendEmail.js";
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/google-login (Xử lý cả Đăng nhập & Đăng ký)
export const loginWithGoogle = async (req, res) => {
    try {
        const { credential } = req.body; 

        // 1. Xác thực token với Google
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture, sub } = payload;

        // 2. Kiểm tra xem user đã tồn tại chưa
        let user = await User.findOne({ email }).populate("role_id");

        if (user) {
            // === TRƯỜNG HỢP: ĐÃ CÓ TÀI KHOẢN (ĐĂNG NHẬP) ===
            
            // Cập nhật Google ID nếu trước đó đăng ký bằng email thường
            if (!user.googleId) {
                user.googleId = sub;
                user.authType = 'google'; 
                if (!user.thumbnail) user.thumbnail = picture; // Cập nhật avatar nếu chưa có
                await user.save();
            }
        } else {
            // === TRƯỜNG HỢP: CHƯA CÓ TÀI KHOẢN (ĐĂNG KÝ MỚI) ===
            
            // A. Tìm Role Patient
            const patientRole = await Role.findOne({ name: "patient" });
            if (!patientRole) {
                 return res.status(500).json({ message: "Lỗi hệ thống: Chưa có role patient" });
            }

            // B. Tạo User mới
            user = new User({
                email: email,
                name: name, // Google trả về name, lưu vào field name của Model
                googleId: sub,
                thumbnail: picture, // Lưu ảnh đại diện từ Google
                authType: 'google',
                password: "", // Không cần password
                role_id: patientRole._id, // Liên kết role ID
                profile_completed: false,
                status: "pending_profile"
            });
            await user.save();

            // C. Tạo hồ sơ Patient (QUAN TRỌNG: Bước này bạn đang thiếu ở code cũ)
            await Patient.create({
                user_id: user._id,
                fullName: name,
                email: email,
                status: "active" // Google đã xác thực email nên có thể để active luôn
            });

            // D. Gửi Email chào mừng (Giống logic đăng ký thường)
            try {
                await sendEmail({
                    email: email,
                    subject: "Chào mừng đến với Phòng Khám MedPro (via Google)",
                    message: `Xin chào ${name}, bạn đã đăng nhập bằng Google thành công!`,
                    html: `
                      <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2 style="color: #007bff;">Xin chào ${name}!</h2>
                        <p>Bạn vừa đăng ký/đăng nhập thành công vào <b>Phòng Khám MedPro</b> thông qua tài khoản Google.</p>
                        <p>Vui lòng cập nhật thêm số điện thoại và địa chỉ trong hồ sơ để đặt lịch khám dễ dàng hơn.</p>
                      </div>
                    `,
                });
            } catch (err) {
                console.error("Lỗi gửi mail Google Login:", err);
            }
            
            // Populate role để xuống dưới tạo token không bị lỗi
            user = await user.populate("role_id");
        }

        // 3. Tạo JWT Token
        // Lấy tên role từ populate hoặc mặc định (đề phòng)
        const roleName = user.role_id?.name || "patient"; 

        const accessToken = jwt.sign(
            { 
                _id: user._id, 
                name: user.name, 
                email: user.email,
                role: roleName, 
                status: user.status || "active",
                profile_completed: !!user.profile_completed
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 4. Trả về Client
        return res.status(200).json({
            message: "Đăng nhập Google thành công",
            accessToken, // Frontend thường nhận biến này là 'token' hoặc 'accessToken' tùy bạn thống nhất
            token: accessToken, // Gửi cả 2 key để FE đỡ phải sửa code
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: roleName,
                status: user.status,
                thumbnail: user.thumbnail,
                profile_completed: user.profile_completed,
                authType: user.authType
            },
            // Logic điều hướng
            next: user.profile_completed ? "/" : "/onboarding/profile-patient"
        });

    } catch (error) {
        console.error("Google Login Error:", error);
        return res.status(400).json({ message: "Xác thực Google thất bại" });
    }
};

// ... (Giữ nguyên các hàm login, registerPublic, changePassword cũ của bạn ở dưới) ...
export const login = async (req, res, next) => {
    // ... code cũ giữ nguyên
    try {
        const { email, password } = req.body;
    
        // 1. Kiểm tra thiếu email hoặc password
        if (!email || !password) {
          return res.status(400).json({ error: "Thiếu email hoặc password" });
        }
    
        // 2. Tìm người dùng và populate thông tin role
        const user = await User.findOne({ email }).populate("role_id", "name");
    
        // 3. Kiểm tra người dùng có tồn tại không
        if (!user)
          return res.status(401).json({ error: "Email hoặc password không đúng" });
    
        // 4. So sánh mật khẩu
        // Lưu ý: Đảm bảo đã import và sử dụng bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return res.status(401).json({ error: "Email hoặc password không đúng" });
    
        // 5. Tạo JWT token
        const roleName = user.role_id.name; // Lấy tên role
        const isProfileCompleted = !!user.profile_completed;
    
        const token = jwt.sign(
          {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: roleName,
            status: user.status || "pending_profile",
            profile_completed: isProfileCompleted,
            authType: user.authType
          },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );
    
        // 6. Xác định trang chuyển hướng (next)
        let nextRoute = "/"; // Mặc định là trang chủ
    
        // Nếu role là 'admin', chuyển hướng đến /admin
        if (roleName === "admin") {
          nextRoute = "/admin";
        }
        // Nếu là bệnh nhân
        if (roleName === "patient") {
          if (!isProfileCompleted) {
            // Bệnh nhân chưa hoàn thành hồ sơ -> onboarding
            nextRoute = "/onboarding/profile-patient";
          } else {
            // Bệnh nhân đã hoàn thành hồ sơ -> trang chính bệnh nhân
            nextRoute = "/";
          }
        }
        // Nếu là bác sĩ
        else if (roleName === "doctor") {
          if (!isProfileCompleted) {
            // Bác sĩ chưa hoàn thành hồ sơ -> onboarding bác sĩ
            nextRoute = "/onboarding/profile-doctor";
          } else {
            // Bác sĩ đã hoàn thành hồ sơ -> trang chính bác sĩ
            nextRoute = "/";
          }
        }
        // Các role khác (company, staff, …) nếu chưa hoàn thành hồ sơ
        else if (!isProfileCompleted) {
          nextRoute = "/"; // Hoặc trang hoàn thành profile chung
        }
    
        // 7. Trả về phản hồi thành công
        return res.status(200).json({
          message: "Đăng nhập thành công",
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: roleName,
            status: user.status,
            profile_completed: isProfileCompleted,
            authType: user.authType
          },
          // Trường 'next' chứa đường dẫn chuyển hướng
          next: nextRoute,
        });
      } catch (e) {
        next(e);
      }
};

export async function registerPublic(req, res, next) {
    // ... code cũ giữ nguyên
    try {
        // 1. Nhận thêm confirmPassword từ req.body
        const { name, email, password, confirmPassword } = req.body;
    
        // 2. Validate cơ bản: Kiểm tra dữ liệu rỗng
        if (!name || !email || !password || !confirmPassword) {
          return res
            .status(400)
            .json({
              error:
                "Vui lòng nhập đầy đủ: Tên, Email, Mật khẩu và Xác nhận mật khẩu.",
            });
        }
    
        // 3. === LOGIC MỚI ===
        // Kiểm tra mật khẩu và mật khẩu xác nhận có khớp nhau không
        if (password !== confirmPassword) {
          return res.status(400).json({ error: "Mật khẩu xác nhận không khớp." });
        }
    
        // 4. Kiểm tra Email đã tồn tại trong User chưa
        const existed = await User.findOne({ email }).lean();
        if (existed) {
          return res.status(409).json({ error: "Email này đã được sử dụng." });
        }
    
        // 5. Tìm Role 'patient'
        const patientRole = await Role.findOne({ name: "patient" }).lean();
        if (!patientRole) {
          return res
            .status(500)
            .json({ error: "Lỗi hệ thống: Chưa cấu hình role 'patient'." });
        }
    
        // 6. Mã hóa mật khẩu
        const hash = await bcrypt.hash(password, 3);
    
        // 7. Tạo User (Tài khoản đăng nhập)
        const user = await User.create({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: hash,
          role_id: patientRole._id,
          profile_completed: false,
          status: "pending_profile",
          authType: 'local'
        });
    
        // 8. Tạo ngay bản ghi Patient rỗng
        const patient = await Patient.create({
          user_id: user._id,
          fullName: name,
          email: email.trim().toLowerCase(),
          status: "inactive",
        });
    
        // 9. Tạo Token
        const token = jwt.sign(
          {
            _id: user._id,
            email: user.email,
            role: "patient",
            status: "pending_profile",
            profile_completed: false,
            authType: 'local'
          },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );
    
        // --- 10. THÊM ĐOẠN NÀY ĐỂ GỬI MAIL ---
        try {
          await sendEmail({
            email: email,
            subject: "Chào mừng đến với Phòng Khám MedPro",
            message: `Xin chào ${name}, bạn đã đăng ký tài khoản thành công!`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #007bff;">Xin chào ${name}!</h2>
                <p>Chúc mừng bạn đã đăng ký tài khoản thành công tại <b>Phòng Khám MedPro</b>.</p>
                <p>Vui lòng hoàn tất hồ sơ cá nhân để bắt đầu đặt lịch khám.</p>
              </div>
            `,
          });
          console.log("Đã gửi email chào mừng!");
        } catch (err) {
          console.log("Lỗi gửi email:", err);
          // Không return lỗi ở đây để tránh chặn người dùng đăng ký nếu chỉ lỗi mail
        }
        // -------------------------------------
    
        // 11. Trả về kết quả (Code cũ của bạn dời xuống đây)
        return res.status(201).json({
          message: "Đăng ký thành công! Vui lòng hoàn tất hồ sơ cá nhân.",
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: "patient",
            status: "pending_profile",
            profile_completed: false,
            authType: user.authType
          },
          patientId: patient._id,
          next: "/onboarding/profile-patient",
        });
      } catch (e) {
        next(e);
      }
};

export const changePassword = async (req, res, next) => {
    // ... code cũ giữ nguyên
    try {
        const userId = req.user._id; // Lấy từ middleware xác thực
        const { currentPassword, newPassword } = req.body;
        // 1. Kiểm tra dữ liệu đầu vào
        if (!currentPassword || !newPassword) {
          return res
            .status(400)
            .json({ error: "Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới." });
        }
        // 2. Tìm user trong DB
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ error: "Người dùng không tồn tại." });
        }
        // 3. So sánh mật khẩu hiện tại
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(401).json({ error: "Mật khẩu hiện tại không đúng." });
        }
        // 4. Mã hóa mật khẩu mới
        const hashedNewPassword = await bcrypt.hash(newPassword, 3);
        // 5. Cập nhật mật khẩu trong DB
        user.password = hashedNewPassword;
        await user.save();
        return res.json({ message: "Đổi mật khẩu thành công." });
      } catch (e) {
        next(e);
      }
};
// src/controllers/AuthController.js

export const getMe = async (req, res) => {
  try {
    // 1. Dùng .populate("role_id") để lấy thông tin bảng Role
    // tham số thứ 2 là "name" nghĩa là chỉ lấy trường name của Role thôi
    const user = await User.findById(req.user._id)
        .select("-password")
        .populate("role_id", "name"); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Chuyển Mongoose Document sang Object thường để chỉnh sửa
    const userObj = user.toObject();

    // 3. Flatten (Làm phẳng) Role:
    // Frontend đang dùng user.role (string) -> ta gán roleName vào đó
    userObj.role = userObj.role_id?.name || "patient";
    
    // (Tuỳ chọn) Nếu bạn muốn giữ lại cả object role_id thì cứ để, 
    // còn không thì code trên đã tạo ra field userObj.role = "patient" rồi.

    // 4. Trả về
    res.json({ user: userObj });

  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};