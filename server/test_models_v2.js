// file: test_models_v2.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// Danh sách "khổng lồ" các model để quét
const modelsToCheck = [
  // --- Dòng 2.0 (Mới nhất 2025) ---
  "gemini-2.5-flash",           // 🌟 Thông minh & Nhanh
  "gemini-2.5-flash-lite",      // Bản nhẹ của 2.5
  "gemini-2.5-flash-exp",       // Bản thử nghiệm tính năng mới
  "gemini-2.5-pro-exp", 
  "gemini-2.5-flash-tts",        // Bản Pro thử nghiệm (Rất thông minh)

  // --- Dòng 1.5 (Ổn định 2024) ---
  "gemini-1.5-flash",           // Alias chung
  "gemini-1.5-flash-001",       // Bản gốc
  "gemini-1.5-flash-002",       // Bản cập nhật hiệu năng (Nên dùng)
  "gemini-1.5-flash-8b",        // Siêu nhanh, siêu rẻ
  "gemini-1.5-pro",             // Thông minh, context dài
  "gemini-1.5-pro-001",
  "gemini-1.5-pro-002",         // Bản Pro tốt nhất hiện tại

  // --- Dòng thử nghiệm / Đặc biệt ---
  "gemini-2.5-flash-lite",      // Bản bạn đang dùng được
  "gemini-robotics-er-1.5-preview", // Bản robotics
  "gemini-exp-1206",            // Bản Experimental tháng 12
  "learnlm-1.5-pro-experimental", // Bản chuyên cho giáo dục
];

const checkModels = async () => {
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ LỖI: Chưa thấy GEMINI_API_KEY trong file .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  console.log("\n🚀 ĐANG QUÉT & ĐO TỐC ĐỘ CÁC MODEL...\n");
  console.log("-------------------------------------------------------------------------------");
  console.log(`| ${"Tên Model".padEnd(32)} | ${"Trạng Thái".padEnd(18)} | ${"Tốc độ".padEnd(10)} |`);
  console.log("-------------------------------------------------------------------------------");

  for (const modelName of modelsToCheck) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const start = Date.now(); // Bắt đầu bấm giờ
      // Gửi thử 1 câu chào
      const result = await model.generateContent("Hi"); 
      const response = await result.response;
      const end = Date.now();   // Kết thúc bấm giờ
      
      const duration = end - start; // Tính thời gian (ms)

      if (response) {
        let speedText = `${duration}ms`;
        // Tô màu tốc độ
        if (duration < 1000) speedText = `\x1b[32m${speedText} (🚀)\x1b[0m`; // Xanh lá: Siêu nhanh
        else if (duration < 2000) speedText = `\x1b[33m${speedText} (⚡)\x1b[0m`; // Vàng: Khá
        else speedText = `\x1b[31m${speedText} (🐢)\x1b[0m`; // Đỏ: Chậm

        console.log(`| ${modelName.padEnd(32)} | \x1b[32m✅ HOẠT ĐỘNG\x1b[0m       | ${speedText.padEnd(20)} |`);
      }
    } catch (error) {
      let status = "";
      let speedText = "---";
      
      if (error.message.includes("404")) {
        status = "\x1b[31m❌ 404 Not Found\x1b[0m"; 
      } else if (error.message.includes("429")) {
        status = "\x1b[33m⚠️  QUÁ TẢI (429)\x1b[0m"; // Model này ngon nhưng hết lượt
      } else {
        status = `❌ Lỗi khác`;
      }
      console.log(`| ${modelName.padEnd(32)} | ${status.padEnd(27)} | ${speedText.padEnd(10)} |`);
    }
  }
  console.log("-------------------------------------------------------------------------------");
  console.log("\n💡 GỢI Ý:");
  console.log("- Ưu tiên chọn cái nào có màu xanh lá (✅) và tốc độ nhanh nhất (🚀).");
  console.log("- Nếu thấy 'gemini-1.5-flash-002' hoặc 'gemini-2.0-flash' hoạt động, HÃY DÙNG NÓ (thông minh hơn bản lite).");
  console.log("- Bản '429' nghĩa là dùng được nhưng bạn đang spam nhanh quá, chờ xíu là hết.\n");
};

checkModels();