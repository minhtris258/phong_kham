import { GoogleGenerativeAI } from "@google/generative-ai";
import Doctor from "../models/DoctorModel.js";
import { getAvailableSlots } from "../utils/scheduler.js"; 
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export const chatSessions = new Map();

// 1. ĐỊNH NGHĨA TOOL (Thêm cảnh báo gắt hơn)
const tools = [
  {
    functionDeclarations: [
      {
        name: "search_doctors",
        description: "Tìm kiếm bác sĩ để lấy ID. BẮT BUỘC DÙNG KHI KHÁCH NÓI TÊN.",
        parameters: {
          type: "OBJECT",
          properties: { keyword: { type: "STRING" } },
          required: ["keyword"],
        },
      },
      {
        name: "check_availability",
        description: "Kiểm tra lịch trống. CHỈ DÙNG KHI ĐÃ CÓ 'DOCTOR_ID' CHUẨN (24 KÝ TỰ).",
        parameters: {
          type: "OBJECT",
          properties: {
            doctorId: { type: "STRING", description: "ID 24 ký tự lấy từ tool search_doctors. KHÔNG ĐƯỢC DÙNG TÊN." },
            date: { type: "STRING" },
          },
          required: ["doctorId", "date"],
        },
      },
    ],
  },
];

export const handleAIChat = async (userMessage, socketId) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", tools: tools });
    const today = new Date().toLocaleDateString("en-CA"); 

    // Reset session nếu AI bắt đầu nói linh tinh
    if (!chatSessions.has(socketId)) {
        const newChat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: `
                    Bạn là trợ lý đặt lịch phòng khám thông minh. Hôm nay là ngày ${today}.
                    
                    QUY TRÌNH XỬ LÝ TUYỆT ĐỐI (KHÔNG ĐƯỢC BỎ BƯỚC):
                    1. Khách nhắc đến tên bác sĩ (vd: "doctors22", "Nam") -> GỌI NGAY tool "search_doctors".
                    2. Lấy được ID từ kết quả tìm kiếm -> GỌI TIẾP tool "check_availability" với ID đó.
                    3. Tuyệt đối KHÔNG tự ý check lịch bằng Tên.
                    4. Nếu tool check lịch trả về kết quả, hãy liệt kê giờ và mời khách đặt.
                    5. KHÔNG BAO GIỜ NÓI "TÔI KHÔNG CÓ CHỨC NĂNG NÀY". Bạn CÓ chức năng này thông qua các tool tôi cung cấp.
                    
                    MẪU TRẢ LỜI KHI CÓ LỊCH TRỐNG:
                    "Bác sĩ [TÊN] còn trống các khung giờ: [DANH SÁCH GIỜ].
                    Bạn muốn đặt giờ nào để mình gửi link ạ?"
                    ` }],
                },
                {
                    role: "model",
                    parts: [{ text: "Đã rõ. Tôi sẽ luôn Tìm kiếm ID trước -> Check lịch sau -> Không bao giờ từ chối yêu cầu đặt lịch." }],
                },
            ],
        });
        chatSessions.set(socketId, newChat);
    }

    const chat = chatSessions.get(socketId);
    console.log(`📤 [User ${socketId}]:`, userMessage);
    
    let result = await chat.sendMessage(userMessage);
    let response = result.response;
    let call = response.functionCalls();

    // VÒNG LẶP XỬ LÝ (GIỮ NGUYÊN)
    while (call) {
      const functionName = call[0].name;
      const args = call[0].args;
      let toolResult = null;

      console.log(`🤖 AI gọi Tool: ${functionName} (Args: ${JSON.stringify(args)})`);

      if (functionName === "search_doctors") {
        try {
            const doctors = await Doctor.find({
                fullName: { $regex: args.keyword, $options: 'i' }, status: 'active'
            }).select('_id fullName').lean();
            
            // 👇 QUAN TRỌNG: Nếu tìm thấy, báo rõ cho AI biết ID là gì
            if (doctors.length > 0) {
                toolResult = { 
                    status: "success", 
                    message: "Tìm thấy bác sĩ. Hãy dùng ID này để check lịch ngay.",
                    data: doctors // AI sẽ tự đọc _id trong này
                };
            } else {
                toolResult = { status: "failed", message: "Không tìm thấy bác sĩ nào tên như vậy. Hãy hỏi lại khách." };
            }
        } catch (err) { toolResult = { error: "Lỗi DB" }; }
      }

      else if (functionName === "check_availability") {
        // 👇 Chặn ngay tại đây nếu AI vẫn cố chấp gửi ID rác
        if (!args.doctorId.match(/^[0-9a-fA-F]{24}$/)) {
             toolResult = { 
                status: "error", 
                message: "LỖI: Bạn đang dùng Tên để check lịch. Hãy quay lại bước gọi tool 'search_doctors' để lấy ID thật ngay!" 
             };
        } else {
             const slots = await getAvailableSlots(args.doctorId, args.date);
             toolResult = { available_slots: slots };
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
    console.error("❌ AI Error:", error);
    chatSessions.delete(socketId); // Xóa session lỗi
    return "Xin lỗi, hệ thống đang bận. Bạn hãy thử tải lại trang và hỏi lại nhé.";
  }
};