// src/pages/ContactHospitalPage.jsx
import React, { useState } from "react";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Sau này bạn gọi API gửi form ở đây
    console.log("Form liên hệ:", form);
    setStatus(
      "Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất."
    );
    setForm({
      fullName: "",
      phone: "",
      email: "",
      department: "",
      subject: "",
      message: "",
    });
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
            <div className="space-y-6 grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-7">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  Thông tin liên hệ
                </h2>

                <div className="space-y-3 text-sm text-slate-600">
                  <div>
                    <p className="font-semibold text-slate-800">
                      Bệnh viện MedPro
                    </p>
                    <p>70 Nguyễn Huệ - Phường Thuận Hóa - TP Huế</p>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">Hotline</p>
                    <p>1900 6868</p>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">Email</p>
                    <p>lienhe@medpro.vn</p>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">Giờ làm việc</p>
                    <p>Thứ 2 – Thứ 7: 7:00 – 20:00</p>
                    <p>Chủ nhật & ngày lễ: 8:00 – 17:00</p>
                  </div>
                </div>
              </div>

              {/* Google Map (bạn thay src cho đúng bệnh viện thật) */}
              <div className="bg-white rounded-2xl shadow-lg h-56 md:h-80 overflow-hidden">
                <div className="h-56 md:h-80 w-full">
                  <iframe
                    title="Bản đồ bệnh viện"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7652.6891483027175!2d107.58852623334347!3d16.458081037849492!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141a147ba6bdbff%3A0x2e605afab4951ad9!2sHue%20Industrial%20College!5e0!3m2!1sen!2s!4v1765096316618!5m2!1sen!2s"
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
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
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
                  Tiêu đề
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
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

              {status && (
                <p className="text-xs md:text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                  {status}
                </p>
              )}

              <button
                type="submit"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold shadow-md hover:bg-sky-700 focus:ring-2 focus:ring-sky-200 focus:outline-none"
              >
                Gửi yêu cầu
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
