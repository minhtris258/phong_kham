// file: services/aiService.js
import mongoose from "mongoose"; // 👈 Bắt buộc để ép kiểu ID
import { GoogleGenerativeAI } from "@google/generative-ai";
import Doctor from "../models/DoctorModel.js";
import Appointment from "../models/AppointmentModel.js";
import TimeSlot from "../models/TimeslotModel.js";
import Notification from "../models/NotificationModel.js";
import Patient from "../models/PatientModel.js"; // 👈 Model Patient để tìm hồ sơ
import User from "../models/UserModel.js";
import { getAvailableSlots, findNextAvailableSlot } from "../utils/scheduler.js"; 
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export const chatSessions = new Map();

// --- 1. ĐỊNH NGHĨA TOOLS ---
const tools = [
  {
    functionDeclarations: [
      // Tool 1: Tìm bác sĩ
      {
        name: "search_doctors",
        description: "Tìm kiếm bác sĩ theo tên hoặc chuyên khoa để lấy ID.",
        parameters: {
          type: "OBJECT",
          properties: { keyword: { type: "STRING" } },
          required: ["keyword"],
        },
      },
      // Tool 2: Check lịch ngày cụ thể
      {
        name: "check_availability",
        description: "Kiểm tra các khung giờ trống của bác sĩ trong một ngày cụ thể.",
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
        description: "Tìm các ngày có lịch trống GẦN NHẤT. Dùng khi khách hỏi 'khi nào rảnh', 'lịch sớm nhất' mà không nói ngày.",
        parameters: {
          type: "OBJECT",
          properties: {
            doctorId: { type: "STRING" },
          },
          required: ["doctorId"],
        },
      },
      // Tool 4: Đặt lịch
      {
        name: "book_appointment",
        description: "Thực hiện hành động đặt lịch khám. CHỈ GỌI KHI KHÁCH ĐÃ CHỐT GIỜ.",
        parameters: {
          type: "OBJECT",
          properties: {
            doctorId: { type: "STRING" },
            date: { type: "STRING", description: "Format YYYY-MM-DD" },
            time: { type: "STRING", description: "Format HH:mm" },
          },
          required: ["doctorId", "date", "time"],
        },
      },
    ],
  },
];

// --- 2. HÀM XỬ LÝ CHÍNH ---
export const handleAIChat = async (userMessage, socketId, userId, io) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", tools: tools });
    const today = new Date().toLocaleDateString("en-CA"); 

    // Khởi tạo session chat nếu chưa có
    if (!chatSessions.has(socketId)) {
        const newChat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: `
                    Bạn là trợ lý ảo của phòng khám. Hôm nay là ngày ${today}.
                    
                    QUY TRÌNH HỖ TRỢ (TUÂN THỦ TUYỆT ĐỐI):
                    1. Khách hỏi bác sĩ -> Dùng "search_doctors".
                    2. Khách hỏi lịch ngày X -> Dùng "check_availability".
                    3. Khách hỏi "khi nào rảnh" (không rõ ngày) -> Dùng "find_next_available".
                    4. Khách chốt đặt lịch (vd: "ok đặt giờ này") -> Dùng "book_appointment".
                    
                    LƯU Ý QUAN TRỌNG:
                    - Nếu khách chưa đăng nhập (userId bị thiếu), hãy nhắc khách đăng nhập.
                    - Khi đặt lịch thành công, hãy báo lại rõ ràng ngày giờ và bác sĩ.
                    - Luôn trả lời ngắn gọn, lịch sự, thân thiện.
                    ` }],
                },
                {
                    role: "model",
                    parts: [{ text: "Đã rõ. Tôi sẽ hỗ trợ theo quy trình: Tìm kiếm -> Check lịch -> Đặt lịch." }],
                },
            ],
        });
        chatSessions.set(socketId, newChat);
    }

    const chat = chatSessions.get(socketId);
    console.log(`📤 [User ${socketId} | ID: ${userId}]: ${userMessage}`);
    
    let result = await chat.sendMessage(userMessage);
    let response = result.response;
    let call = response.functionCalls();

    // --- VÒNG LẶP XỬ LÝ TOOL ---
    while (call) {
      const functionName = call[0].name;
      const args = call[0].args;
      let toolResult = null;
      console.log(`🤖 AI gọi Tool: ${functionName}`);

      // 1. Tool Tìm Bác Sĩ
      if (functionName === "search_doctors") {
        try {
            const doctors = await Doctor.find({
                fullName: { $regex: args.keyword, $options: 'i' }, status: 'active'
            }).select('_id fullName specialty').lean();
            
            toolResult = doctors.length > 0 
                ? { status: "success", data: doctors } 
                : { status: "failed", message: "Không tìm thấy bác sĩ phù hợp." };
        } catch (err) { toolResult = { error: "Lỗi truy vấn DB." }; }
      }

      // 2. Tool Check Lịch Ngày Cụ Thể
      else if (functionName === "check_availability") {
        if (!mongoose.Types.ObjectId.isValid(args.doctorId)) {
             toolResult = { status: "error", message: "ID bác sĩ không hợp lệ." };
        } else {
             const slots = await getAvailableSlots(args.doctorId, args.date);
             toolResult = { available_slots: slots };
        }
      }

      // 3. Tool Tìm Ngày Gần Nhất
      else if (functionName === "find_next_available") {
        if (!mongoose.Types.ObjectId.isValid(args.doctorId)) {
             toolResult = { status: "error", message: "ID bác sĩ không hợp lệ." };
        } else {
             const availableDays = await findNextAvailableSlot(args.doctorId);
             toolResult = availableDays.length > 0 
                ? { status: "success", data: availableDays }
                : { status: "empty", message: "Bác sĩ đã kín lịch trong 7 ngày tới." };
        }
      }

      // 4. Tool Đặt Lịch (Logic quan trọng nhất)
      else if (functionName === "book_appointment") {
          if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
              toolResult = { status: "error", message: "Bạn cần đăng nhập để đặt lịch." };
          } else {
              try {
                  // --- LOGIC MỚI: TỰ ĐỘNG NHẬN DIỆN ID LÀ USER HAY PATIENT ---
                  let userAccount = null;
                  let patientProfile = null;
                  let realAccountId = null; // ID dùng để gửi socket/notification

                  // 1. Thử tìm trong bảng User trước
                  userAccount = await User.findById(userId);

                  if (userAccount) {
                      // Nếu tìm thấy User -> userId chính là AccountID
                      console.log("✅ ID gửi lên là User Account ID.");
                      realAccountId = userId;
                      // Tìm Patient theo user_id
                      patientProfile = await Patient.findOne({ user_id: userId });
                  } else {
                      // 2. Nếu không thấy trong User -> Thử tìm trong bảng Patient (Trường hợp Client gửi nhầm ID hồ sơ)
                      console.log("⚠️ Không thấy trong bảng User, thử tìm trong bảng Patient...");
                      patientProfile = await Patient.findById(userId);
                      
                      if (patientProfile) {
                          console.log("✅ ID gửi lên là Patient ID. Đang truy ngược lại User...");
                          realAccountId = patientProfile.user_id; // Lấy Account ID thực sự từ hồ sơ
                          userAccount = await User.findById(realAccountId);
                      }
                  }

                  // --- KIỂM TRA KẾT QUẢ ---
                  if (!userAccount) {
                      toolResult = { status: "error", message: "Không tìm thấy tài khoản người dùng hợp lệ." };
                  } else if (!patientProfile) {
                      const userName = userAccount.fullName || "bạn";
                      toolResult = { 
                          status: "error", 
                          message: `Chào ${userName}, hệ thống chưa tìm thấy Hồ sơ bệnh nhân. Vui lòng vào mục 'Hồ sơ cá nhân' cập nhật thông tin y tế trước khi đặt lịch.` 
                      };
                  } else {
                      // --- NẾU TÌM THẤY CẢ 2 -> TIẾN HÀNH ĐẶT LỊCH ---
                      
                      const slot = await TimeSlot.findOne({
                          doctor_id: args.doctorId,
                          date: args.date,
                          start: args.time,
                          status: "free"
                      });

                      if (!slot) {
                          toolResult = { status: "error", message: "Giờ này vừa bị người khác đặt mất rồi." };
                      } else {
                          // Update Slot
                          slot.status = "booked";
                          await slot.save();

                          // Tạo Appointment (Dùng ID Bệnh Nhân)
                          const newAppt = await Appointment.create({
                              doctor_id: args.doctorId,
                              patient_id: patientProfile._id, // 👈 Luôn dùng đúng ID hồ sơ
                              timeslot_id: slot._id,
                              date: args.date,
                              start: args.time,
                              status: "confirmed",
                              paymentStatus: "unpaid",
                              reason: "Đặt lịch qua AI Chatbot",
                              checkinCode: Math.random().toString(36).substring(2, 10).toUpperCase()
                          });

                          slot.appointment_id = newAppt._id;
                          await slot.save();

                          // Tạo Thông báo (Dùng ID Tài khoản thực sự)
                          const doctorInfo = await Doctor.findById(args.doctorId).select('fullName');
                          const doctorName = doctorInfo ? doctorInfo.fullName : "Bác sĩ";
                          const notifTitle = "✅ Đặt Lịch Thành Công";
                          const notifBody = `Bạn đã đặt lịch với BS ${doctorName} lúc ${args.time} ngày ${args.date}.`;

                          const newNotif = await Notification.create({
                              user_id: realAccountId, // 👈 Gửi cho Account ID thực sự
                              type: "appointment",
                              title: notifTitle,
                              body: notifBody,
                              appointment_id: newAppt._id,
                              channels: ["in-app"],
                              status: "unread",
                              sent_at: new Date()
                          });

                          // Gửi Socket (Dùng ID Tài khoản thực sự)
                          if (io) {
                              console.log(`📡 Bắn Socket tới Account: ${realAccountId}`);
                              io.to(realAccountId.toString()).emit('new_notification', {
                                  message: notifTitle,
                                  data: newNotif
                              });
                              io.emit('slot_booked', {
                                  timeslotId: slot._id,
                                  doctorId: args.doctorId
                              });
                          }

                          toolResult = { 
                              status: "success", 
                              message: `Đã đặt thành công! Lịch hẹn với BS ${doctorName} lúc ${args.time} ngày ${args.date} đã được lưu.`, 
                              details: newAppt 
                          };
                      }
                  }
              } catch (err) {
                  console.error("AI Booking Error:", err);
                  toolResult = { status: "error", message: "Lỗi hệ thống." };
              }
          }
      }

      console.log("   📤 Gửi kết quả Tool về AI...");
      result = await chat.sendMessage([{
          functionResponse: { name: functionName, response: toolResult }
      }]);

      response = result.response;
      call = response.functionCalls(); 
    }

    return response.text();

  } catch (error) {
    if (error.status === 429 || error.message?.includes('429')) {
        return "Hệ thống đang quá tải, bạn vui lòng đợi 30 giây rồi thử lại nhé.";
    }
    console.error("❌ AI Error:", error);
    chatSessions.delete(socketId);
    return "Hệ thống đang bận, vui lòng thử lại sau.";
  }
};