// file: services/aiService.js
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";
import QRCode from "qrcode";
import Doctor from "../models/DoctorModel.js";
import Appointment from "../models/AppointmentModel.js";
import TimeSlot from "../models/TimeslotModel.js";
import Notification from "../models/NotificationModel.js";
import Patient from "../models/PatientModel.js";
import User from "../models/UserModel.js";
import sendEmail from "../utils/sendEmail.js";
import {
  getAvailableSlots,
  findNextAvailableSlot,
} from "../utils/scheduler.js";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export const chatSessions = new Map();

// --- CẤU HÌNH MODEL (Failover) ---
// Ưu tiên Lite trước (index 0), nếu lỗi thì qua Flash thường (index 1)
const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-3-flash"];

// --- 1. ĐỊNH NGHĨA TOOLS ---
const tools = [
  {
    functionDeclarations: [
      // Tool 1: Tìm bác sĩ
      {
        name: "search_doctors",
        description:
          "Tìm kiếm bác sĩ. QUAN TRỌNG: Nếu người dùng tìm theo tên (vd: 'bác sĩ Hùng'), hãy CHỈ lấy tên riêng (vd: 'Hùng') làm keyword, LOẠI BỎ từ 'bác sĩ', 'dr', 'bs'.",
        parameters: {
          type: "OBJECT",
          properties: { keyword: { type: "STRING" } },
          required: ["keyword"],
        },
      },
      // Tool 2: Check lịch ngày cụ thể
      {
        name: "check_availability",
        description:
          "Kiểm tra các khung giờ trống của bác sĩ trong một ngày cụ thể.",
        parameters: {
          type: "OBJECT",
          properties: {
            doctorId: { type: "STRING" },
            date: { type: "STRING", description: "Format YYYY-MM-DD" },
          },
          required: ["doctorId", "date"],
        },
      },
      // Tool 3: Tìm ngày gần nhất
      {
        name: "find_next_available",
        description:
          "Tìm các ngày có lịch trống GẦN NHẤT. Dùng khi khách hỏi 'khi nào rảnh', 'lịch sớm nhất' mà không nói ngày.",
        parameters: {
          type: "OBJECT",
          properties: { doctorId: { type: "STRING" } },
          required: ["doctorId"],
        },
      },
      // Tool 4: Đặt lịch
      {
        name: "book_appointment",
        description:
          "Thực hiện hành động đặt lịch khám. CHỈ GỌI KHI KHÁCH ĐÃ CHỐT GIỜ.",
        parameters: {
          type: "OBJECT",
          properties: {
            doctorId: { type: "STRING" },
            date: { type: "STRING", description: "Format YYYY-MM-DD" },
            time: { type: "STRING", description: "Format HH:mm" },
            reason: { type: "STRING", description: "Lý do khám bệnh" },
          },
          required: ["doctorId", "date", "time", "reason"],
        },
      },
    ],
  },
];

// --- 2. HÀM XỬ LÝ CHÍNH (WRAPPER) ---
export const handleAIChat = async (userMessage, socketId, userId, io) => {
  // Bắt đầu thử từ model đầu tiên (index 0)
  return await tryGenerateResponse(0, userMessage, socketId, userId, io);
};

// --- HÀM RECURSIVE (XỬ LÝ CHÍNH + FAILOVER) ---
const tryGenerateResponse = async (
  modelIndex,
  userMessage,
  socketId,
  userId,
  io
) => {
  const currentModelName = MODELS[modelIndex];

  // Nếu đã thử hết danh sách model mà vẫn lỗi -> Báo hệ thống bận
  if (!currentModelName) {
    return "Hệ thống đang bận, tất cả các AI đều quá tải. Vui lòng thử lại sau.";
  }

  try {
    console.log(
      `🤖 Đang dùng model: ${currentModelName} (Index: ${modelIndex}) cho User ${socketId}`
    );

    const model = genAI.getGenerativeModel({
      model: currentModelName,
      tools: tools,
    });
    const today = new Date().toLocaleDateString("en-CA");

    // Khởi tạo session chat
    if (!chatSessions.has(socketId)) {
      const newChat = model.startChat({
        history: [
          {
            role: "user",
            parts: [
              {
                text: `
                    Bạn là trợ lý ảo của phòng khám. Hôm nay là ngày ${today}.
                    
                    QUY TRÌNH HỖ TRỢ (TUÂN THỦ TUYỆT ĐỐI):
                    1. Khách hỏi bác sĩ -> Dùng "search_doctors".
                    2. Khách hỏi lịch ngày X -> Dùng "check_availability".
                    3. Khách hỏi "khi nào rảnh" -> Dùng "find_next_available".
                     "QUAN TRỌNG: Trước khi 'book_appointment', BẮT BUỘC hỏi lý do khám/triệu chứng."
                    4. Khách chốt đặt lịch -> Dùng "book_appointment".
                    
                    LƯU Ý: 
                    - Nhắc khách đăng nhập nếu thiếu userId.
                    - Báo lại kết quả rõ ràng (Ngày, Giờ, Bác sĩ).
                    - Trả lời ngắn gọn, lịch sự.
                    `,
              },
            ],
          },
          {
            role: "model",
            parts: [{ text: "Đã rõ. Tôi sẽ hỗ trợ theo quy trình." }],
          },
        ],
      });
      chatSessions.set(socketId, newChat);
    }

    const chat = chatSessions.get(socketId);
    console.log(`📤 [User ${socketId}]: ${userMessage}`);

    // Gửi tin nhắn tới Gemini
    let result = await chat.sendMessage(userMessage);
    let response = result.response;
    let call = response.functionCalls();

    // --- VÒNG LẶP XỬ LÝ TOOL ---
    while (call) {
      const functionName = call[0].name;
      const args = call[0].args;
      let toolResult = null;
      console.log(`🛠️ AI gọi Tool: ${functionName}`);

      // 1. Search Doctors
      if (functionName === "search_doctors") {
        try {
          const doctors = await Doctor.find({
            fullName: { $regex: args.keyword, $options: "i" },
            status: "active",
          })
            .select("_id fullName specialty")
            .lean();
          toolResult =
            doctors.length > 0
              ? { status: "success", data: doctors }
              : { status: "failed", message: "Không tìm thấy." };
        } catch (err) {
          toolResult = { error: "Lỗi DB." };
        }
      }

      // 2. Check Availability
      else if (functionName === "check_availability") {
        if (!mongoose.Types.ObjectId.isValid(args.doctorId))
          toolResult = { status: "error", message: "ID bác sĩ lỗi." };
        else
          toolResult = {
            available_slots: await getAvailableSlots(args.doctorId, args.date),
          };
      }

      // 3. Find Next Available
      else if (functionName === "find_next_available") {
        if (!mongoose.Types.ObjectId.isValid(args.doctorId))
          toolResult = { status: "error", message: "ID bác sĩ lỗi." };
        else {
          const days = await findNextAvailableSlot(args.doctorId);
          toolResult =
            days.length > 0
              ? { status: "success", data: [days[0]] }
              : { status: "empty", message: "Kín lịch 7 ngày tới." };
        }
      }

      // 4. Book Appointment (Logic chính)
      else if (functionName === "book_appointment") {
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
          toolResult = {
            status: "error",
            message: "Bạn cần đăng nhập để đặt lịch.",
          };
        } else {
          try {
            // Xác định User và Patient Profile
            let userAccount = await User.findById(userId);
            let patientProfile = null;
            let realAccountId = userId;

            if (userAccount) {
              patientProfile = await Patient.findOne({ user_id: userId });
            } else {
              patientProfile = await Patient.findById(userId);
              if (patientProfile) {
                realAccountId = patientProfile.user_id;
                userAccount = await User.findById(realAccountId);
              }
            }

            if (!userAccount)
              toolResult = {
                status: "error",
                message: "Không tìm thấy tài khoản.",
              };
            else if (!patientProfile)
              toolResult = {
                status: "error",
                message: "Vui lòng cập nhật Hồ sơ bệnh nhân.",
              };
            else {
              // Khóa Slot
              const slot = await TimeSlot.findOneAndUpdate(
                {
                  doctor_id: args.doctorId,
                  date: args.date,
                  start: args.time,
                  status: "free",
                },
                { status: "booked" },
                { new: true }
              );

              if (!slot)
                toolResult = {
                  status: "error",
                  message: "Khung giờ này vừa bị đặt mất rồi.",
                };
              else {
                // Tạo Appointment
                const newAppt = await Appointment.create({
                  doctor_id: args.doctorId,
                  patient_id: patientProfile._id,
                  timeslot_id: slot._id,
                  date: args.date,
                  start: args.time,
                  status: "confirmed",
                  paymentStatus: "unpaid",
                  reason: args.reason || "Đặt qua AI",
                  checkinCode: Math.random()
                    .toString(36)
                    .substring(2, 10)
                    .toUpperCase(),
                });

                slot.appointment_id = newAppt._id;
                await slot.save();

                // Chuẩn bị thông tin thông báo
                const doctorInfo = await Doctor.findById(args.doctorId).select(
                  "fullName user_id"
                );
                const doctorName = doctorInfo ? doctorInfo.fullName : "Bác sĩ";
                const doctorUserId = doctorInfo ? doctorInfo.user_id : null;
                const formattedDate = new Date(args.date).toLocaleDateString(
                  "vi-VN"
                );

                // Tạo QR Code
                const qrData = JSON.stringify({
                  apptId: newAppt._id.toString(),
                  patientId: patientProfile._id.toString(),
                  code: newAppt.checkinCode,
                  action: "CHECK_IN",
                });
                const qrCodeBase64 = await QRCode.toDataURL(qrData);

                // --- A. Thông báo cho Bệnh nhân ---
                const newNotif = await Notification.create({
                  user_id: realAccountId,
                  type: "appointment",
                  title: "✅ Đặt Lịch Thành Công",
                  body: `Chào ${patientProfile.fullName}, đặt lịch thành công!\n- Bác sĩ: ${doctorName}\n- Thời gian: ${args.time} ngày ${formattedDate}`,
                  data: { doctorName, time: args.time, date: formattedDate },
                  appointment_id: newAppt._id,
                  qr: qrCodeBase64,
                  channels: ["in-app"],
                  status: "unread",
                  sent_at: new Date(),
                });

                // --- B. Thông báo cho Bác sĩ ---
                if (doctorUserId) {
                  await Notification.create({
                    user_id: doctorUserId,
                    type: "appointment",
                    title: "📅 Có Lịch Hẹn Mới",
                    body: `Bệnh nhân ${patientProfile.fullName} đặt lịch lúc ${args.time} ngày ${formattedDate}.`,
                    appointment_id: newAppt._id,
                    channels: ["in-app"],
                    status: "unread",
                    sent_at: new Date(),
                  });
                }

                // --- C. Socket Realtime ---
                if (io) {
                  io.to(realAccountId.toString()).emit("new_notification", {
                    message: newNotif.title,
                    data: newNotif,
                  });
                  io.emit("slot_booked", {
                    timeslotId: slot._id,
                    doctorId: args.doctorId,
                    bookedByUserId: realAccountId.toString(),
                  });
                }

                // --- D. Gửi Email (ĐÃ THÊM PHẦN NÀY) ---
                try {
                  const patientEmail =
                    userAccount.email || patientProfile.email;
                  if (patientEmail) {
                    await sendEmail({
                      email: patientEmail,
                      subject: `[MedPro] Xác nhận lịch khám - ${formattedDate}`,
                      message: `Xin chào ${patientProfile.fullName}, bạn đã đặt lịch thành công.`,
                      attachments: [
                        {
                          filename: "qrcode.png",
                          path: qrCodeBase64,
                          cid: "unique_qr_code_image",
                        },
                      ],
                      html: `
                        <div style="background-color: #f3f4f6; padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <div style="background-color: #007bff; padding: 30px 20px; text-align: center; color: #ffffff;">
                                    <h1 style="margin: 0; font-size: 24px; font-weight: 700;">ĐẶT LỊCH THÀNH CÔNG</h1>
                                    <p style="margin: 10px 0 0; opacity: 0.9;">Phòng Khám MedPro</p>
                                </div>
                                <div style="padding: 30px;">
                                    <p style="font-size: 16px; color: #333;">Xin chào <strong>${patientProfile.fullName}</strong>,</p>
                                    <p style="color: #555; line-height: 1.5;">Cảm ơn bạn đã tin tưởng lựa chọn dịch vụ của chúng tôi. Lịch hẹn của bạn đã được xác nhận với thông tin chi tiết dưới đây:</p>
                                    <table style="width: 100%; border-collapse: collapse; margin: 25px 0; background-color: #f8f9fa; border-radius: 8px;">
                                        <tr>
                                            <td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #666;">Bác sĩ:</td>
                                            <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">${doctorName}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #666;">Thời gian:</td>
                                            <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">${args.time} - ${formattedDate}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #666;">Lý do khám:</td>
                                            <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">${args.reason}</td>
                                        </tr>
                                    </table>
                                    <div style="text-align: center; margin-top: 30px; padding: 20px; border: 2px dashed #007bff; border-radius: 10px; background-color: #f0f7ff;">
                                        <p style="margin-bottom: 15px; font-weight: bold; color: #0056b3; font-size: 14px;">MÃ CHECK-IN</p>
                                        <img src="cid:unique_qr_code_image" alt="QR Code" style="width: 180px; height: 180px; display: inline-block;"/>
                                    </div>
                                </div>
                                <div style="background-color: #f3f4f6; padding: 20px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #e5e7eb;">
                                    <p style="margin: 0;">&copy; 2025 MedPro. All rights reserved.</p>
                                </div>
                            </div>
                        </div>
                      `,
                    });
                    console.log(
                      `📧 Email xác nhận đã gửi tới: ${patientEmail}`
                    );
                  }
                } catch (e) {
                  console.error("❌ Email error", e);
                }

                toolResult = {
                  status: "success",
                  message: `Đã đặt thành công cho ${patientProfile.fullName}!`,
                  details: {
                    date: args.date,
                    time: args.time,
                    doctor: doctorName,
                  },
                };
              }
            }
          } catch (err) {
            console.error("Booking Error", err);
            if (args.doctorId && args.date && args.time)
              await TimeSlot.updateOne(
                { doctor_id: args.doctorId, date: args.date, start: args.time },
                { status: "free", appointment_id: null }
              );
            toolResult = { status: "error", message: "Có lỗi xảy ra." };
          }
        }
      }

      console.log("   📤 Gửi kết quả Tool về AI...");
      result = await chat.sendMessage([
        { functionResponse: { name: functionName, response: toolResult } },
      ]);
      response = result.response;
      call = response.functionCalls();
    }

    return response.text();
  } catch (error) {
    // === LOGIC FAILOVER (QUAN TRỌNG) ===
    console.error(`❌ Lỗi tại model ${currentModelName}:`, error.message);

    // Nếu gặp lỗi quá tải (429) hoặc lỗi Server (503/500) -> Chuyển sang model tiếp theo
    if (
      error.status === 429 ||
      error.status === 503 ||
      error.message?.includes("429") ||
      error.message?.includes("503")
    ) {
      console.log(
        `⚠️ Model ${currentModelName} quá tải. Đang chuyển sang model dự phòng...`
      );

      // Xóa session lỗi để tạo mới
      chatSessions.delete(socketId);

      // ĐỆ QUY: Gọi lại hàm này với index tiếp theo (Flash)
      return await tryGenerateResponse(
        modelIndex + 1,
        userMessage,
        socketId,
        userId,
        io
      );
    }

    chatSessions.delete(socketId);
    return "Hệ thống đang bận, vui lòng thử lại sau.";
  }
};
