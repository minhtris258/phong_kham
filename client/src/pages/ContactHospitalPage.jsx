// src/pages/ContactHospitalPage.jsx
import React, { useState } from "react";
import contactService from "../services/ContactService"; // Ensure correct path
import { MapPin, Phone, Mail } from "lucide-react";
import { toastSuccess, toastError } from "../utils/toast"; // Assuming you have toast utils

export default function ContactHospitalPage() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    department: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getDepartmentLabel = (value) => {
    switch (value) {
      case "mat": return "Khoa Mắt";
      case "noi": return "Nội tổng quát";
      case "nhi": return "Nhi";
      case "ngoai": return "Ngoại khoa";
      case "san": return "Sản phụ khoa";
      case "khamtongquat": return "Khám tổng quát";
      default: return value;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      // Prepare payload for API
      // Backend expects: name, email, phone, subject, message
      // We map fullName -> name and include department in the message
      const payload = {
        name: form.fullName,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.department 
          ? `[Quan tâm khoa: ${getDepartmentLabel(form.department)}] \n${form.message}` 
          : form.message,
      };

      await contactService.createContact(payload);

      // Success handling
      setStatus("Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.");
      toastSuccess("Gửi liên hệ thành công!");
      
      // Reset form
      setForm({
        fullName: "",
        phone: "",
        email: "",
        department: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Lỗi gửi liên hệ:", error);
      const errorMsg = error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại sau.";
      toastError(errorMsg);
      setStatus(errorMsg); // You can choose to show error in UI text as well
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-10 md:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold color-title mt-8">
            Liên hệ với Bệnh viện
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-3 max-w-2xl mx-auto">
            Nếu bạn có bất kỳ thắc mắc nào về đặt lịch khám, kết quả xét nghiệm
            hoặc dịch vụ tại bệnh viện, vui lòng để lại thông tin bên dưới.
          </p>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-[2fr,1.2fr] gap-8">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8">
            {/* Info + Map */}
            <div className="space-y-6 grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-7 col-span-2 md:col-span-1">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  Thông tin liên hệ
                </h2>

                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">
                        Bệnh viện MedPro
                      </p>
                      <p>70 Nguyễn Huệ - Phường Thuận Hóa - TP Huế</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                     <Phone className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">Hotline</p>
                      <p>1900 6868</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">Email</p>
                      <p>lienhe@medpro.vn</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="font-semibold text-slate-800 mb-1">Giờ làm việc</p>
                    <p>Thứ 2 – Thứ 7: 7:00 – 20:00</p>
                    <p>Chủ nhật & ngày lễ: 8:00 – 17:00</p>
                  </div>
                </div>
              </div>

              {/* Google Map */}
              <div className="bg-white rounded-2xl shadow-lg h-56 md:h-auto overflow-hidden col-span-2 md:col-span-1 min-h-[250px]">
                <div className="h-full w-full">
                  <iframe
                    title="Bản đồ bệnh viện"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.340030737466!2d107.59158227590833!3d16.458214528919655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141a14704383c29%3A0x6c66314c44234053!2zNzAgTmd1eeG7hW4gSHXhu4csIFBow7ogTmh14bqtbiwgVGjDoW5oIHBo4buRIEh14LbqLCBUaOG7q2EgVGhpw6puIEh14LbqLCBWaWV0bmFt!5e0!3m2!1sen!2s!4v1709825654321!5m2!1sen!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
            
            <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4">
              Gửi yêu cầu liên hệ
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Họ và tên *
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full h-11 px-3 rounded-lg border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-sm"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Số điện thoại *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full h-11 px-3 rounded-lg border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-sm"
                    placeholder="0909 000 000"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full h-11 px-3 rounded-lg border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-sm"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Chuyên khoa cần hỗ trợ
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="w-full h-11 px-3 rounded-lg border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-sm bg-white"
                  >
                    <option value="">Chọn chuyên khoa</option>
                    <option value="mat">Khoa Mắt</option>
                    <option value="noi">Nội tổng quát</option>
                    <option value="nhi">Nhi</option>
                    <option value="ngoai">Ngoại khoa</option>
                    <option value="san">Sản phụ khoa</option>
                    <option value="khamtongquat">Khám tổng quát</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Tiêu đề *
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-sm"
                  placeholder="Ví dụ: Hỏi về lịch khám ngoài giờ..."
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Nội dung *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-sm resize-none"
                  placeholder="Mô tả chi tiết yêu cầu của bạn..."
                />
              </div>

              {/* Status Message */}
              {status && (
                <div className={`text-sm px-4 py-3 rounded-lg border ${status.includes("lỗi") ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                  {status}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md focus:ring-2 focus:ring-sky-200 focus:outline-none transition-all w-full md:w-auto
                  ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-700"}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi...
                  </>
                ) : (
                  "Gửi yêu cầu"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}