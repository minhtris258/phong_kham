import Contact from "../models/ContactModel.js";
import sendEmail from "../utils/sendEmail.js";

// =================================================
// PUBLIC: DÀNH CHO BỆNH NHÂN / KHÁCH
// =================================================

// POST /api/contacts
// Người dùng gửi liên hệ mới
export const createContact = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // 1. Validate cơ bản
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "Vui lòng điền đầy đủ tên, email, tiêu đề và nội dung." 
      });
    }

    // 2. Lưu vào Database
    const newContact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
      status: "new"
    });

    // 3. Gửi email xác nhận tự động (HTML Template đẹp)
    try {
      const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px; margin-bottom: 20px;">
                <h2 style="color: #0ea5e9; margin: 0;">MEDPRO HOSPITAL</h2>
                <p style="color: #777; font-size: 12px; margin: 5px 0;">Hệ thống y tế hàng đầu</p>
            </div>
            
            <div style="color: #333; line-height: 1.6;">
                <p>Xin chào <strong>${name}</strong>,</p>
                <p>Cảm ơn bạn đã liên hệ với MedPro. Chúng tôi đã nhận được yêu cầu của bạn và đội ngũ chuyên viên sẽ xử lý trong thời gian sớm nhất (thường trong vòng 24h làm việc).</p>
                
                <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #0284c7;">Thông tin yêu cầu:</h3>
                    <p style="margin: 5px 0;"><strong>Tiêu đề:</strong> ${subject}</p>
                    <p style="margin: 5px 0;"><strong>Số điện thoại:</strong> ${phone}</p>
                    <p style="margin: 5px 0;"><strong>Nội dung:</strong></p>
                    <p style="margin: 5px 0; font-style: italic; color: #555;">"${message}"</p>
                </div>

                <p>Nếu bạn cần hỗ trợ khẩn cấp, vui lòng liên hệ hotline: <strong style="color: #dc2626;">1900 6868</strong>.</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
                <p>Đây là email tự động, vui lòng không trả lời email này.</p>
                <p>&copy; 2025 MedPro Hospital. All rights reserved.</p>
            </div>
        </div>
      `;

      await sendEmail({
        email: email,
        subject: `[Tiếp nhận] ${subject} - MedPro Support`,
        html: htmlTemplate, // Sử dụng HTML
        message: `Chào ${name}, cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm.` // Fallback text
      });
    } catch (emailError) {
      console.error("Lỗi gửi email xác nhận:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Gửi liên hệ thành công! Vui lòng kiểm tra email xác nhận.",
      data: newContact
    });

  } catch (error) {
    next(error);
  }
};

// =================================================
// ADMIN: QUẢN LÝ LIÊN HỆ
// =================================================

// GET /api/contacts
export const getAllContacts = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

    res.status(200).json({
      success: true,
      count: contacts.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: contacts
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/contacts/:id
export const getContactById = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: "Không tìm thấy liên hệ" });

    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

// PUT /api/contacts/:id/status
export const updateContactStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["new", "in_progress", "resolved"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ" });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );

    if (!contact) return res.status(404).json({ success: false, message: "Không tìm thấy liên hệ" });

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/contacts/:id/reply
// Admin trả lời qua email (HTML Template chuyên nghiệp)
export const replyToContact = async (req, res, next) => {
  try {
    const { replyMessage, subject } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).json({ success: false, message: "Không tìm thấy liên hệ" });
    if (!replyMessage) return res.status(400).json({ success: false, message: "Vui lòng nhập nội dung trả lời" });

    // Tạo HTML Template cho phản hồi
    // Chuyển đổi ký tự xuống dòng \n thành thẻ <br> để hiển thị đúng trong HTML
    const formattedReply = replyMessage.replace(/\n/g, '<br>');

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
          <div style="border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 20px;">
              <h2 style="color: #0ea5e9; margin: 0;">Phản hồi từ MedPro</h2>
          </div>
          
          <div style="color: #333; line-height: 1.6;">
              <p>Thân gửi <strong>${contact.name}</strong>,</p>
              
              <p>Về vấn đề bạn đã thắc mắc: <strong>"${contact.subject}"</strong></p>
              
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; color: #1f2937; margin: 20px 0;">
                  ${formattedReply}
              </div>
              
              <p>Hy vọng câu trả lời này giải đáp được thắc mắc của bạn. Nếu cần thêm thông tin, vui lòng liên hệ lại với chúng tôi.</p>
          </div>

          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 13px; color: #666;">
              <p style="font-weight: bold; margin-bottom: 5px;">Phòng khám Đa khoa MedPro</p>
              <p style="margin: 2px 0;">Hotline: 1900 6868</p>
              <p style="margin: 2px 0;">Địa chỉ: 70 Nguyễn Huệ, TP Huế</p>
              <p style="margin: 2px 0;">Website: <a href="https://medpro.vn" style="color: #0ea5e9; text-decoration: none;">medpro.vn</a></p>
          </div>
      </div>
    `;

    // Gửi email
    await sendEmail({
      email: contact.email,
      subject: subject || `[Phản hồi] V/v: ${contact.subject}`,
      html: htmlTemplate,
      message: replyMessage // Fallback text
    });

    // Cập nhật trạng thái -> resolved
    contact.status = "resolved";
    await contact.save();

    res.status(200).json({
      success: true,
      message: "Đã gửi email trả lời và cập nhật hồ sơ thành công.",
    });

  } catch (error) {
    next(error);
  }
};

// DELETE /api/contacts/:id
export const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: "Không tìm thấy liên hệ" });

    res.status(200).json({
      success: true,
      message: "Đã xóa liên hệ thành công"
    });
  } catch (error) {
    next(error);
  }
};