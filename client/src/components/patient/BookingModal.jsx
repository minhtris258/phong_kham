// src/components/public/BookingModal.jsx
import React from 'react';
import { X, Upload, Calendar } from 'lucide-react';

export default function BookingModal({ doctor, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header của modal */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900">Đặt lịch khám</h2>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-full transition"
            aria-label="Đóng"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form bên trái */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bước 1 - Chọn ngày giờ */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    1
                  </div>
                  <h3 className="text-xl font-bold">Chọn ngày giờ khám</h3>
                </div>
                <div className="bg-white border-2 border-dashed rounded-xl p-8 text-center text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Chức năng chọn lịch đang được hoàn thiện</p>
                  <p className="text-sm mt-2">Sẽ hiển thị khung giờ trống theo lịch bác sĩ</p>
                </div>
              </div>

              {/* Bước 2 - Thông tin bệnh nhân */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    2
                  </div>
                  <h3 className="text-xl font-bold">Thông tin bệnh nhân</h3>
                </div>
                <select className="w-full px-5 py-4 border rounded-xl text-lg">
                  <option>Chọn hồ sơ bệnh nhân</option>
                  <option>Nguyễn Văn A - 01/01/1990</option>
                </select>
                <button className="mt-3 text-blue-600 font-medium hover:underline">
                  + Thêm hồ sơ mới
                </button>
              </div>

              {/* Ghi chú & file đính kèm */}
              <div className="space-y-6">
                <div>
                  <label className="block font-semibold mb-3">Triệu chứng / Ghi chú</label>
                  <textarea
                    placeholder="Mô tả triệu chứng, thuốc đang dùng, tiền sử bệnh..."
                    className="w-full px-5 py-4 border rounded-xl"
                    rows="4"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-3">
                    Đính kèm hình ảnh / kết quả xét nghiệm (tối đa 5 file)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Kéo thả file vào đây hoặc nhấn để chọn</p>
                    <p className="text-sm text-gray-500 mt-2">Hỗ trợ: JPG, PNG, PDF (tối đa 15MB)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tóm tắt bên phải */}
            <div className="bg-blue-50 rounded-2xl p-6 h-fit">
              <h3 className="font-bold text-xl mb-6">Thông tin đặt khám</h3>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <img
                    src={`https://i.pravatar.cc/200?u=${doctor.email}`}
                    alt={doctor.fullName}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-bold text-lg">{doctor.fullName}</p>
                    <p className="text-sm text-gray-600">Phòng khám tư nhân</p>
                  </div>
                </div>

                <div className="border-t pt-5 space-y-3 text-gray-700">
                  <div className="flex justify-between">
                    <span>Phí khám</span>
                    <strong className="text-blue-600 text-xl">
                      {doctor.consultation_fee.toLocaleString('vi-VN')}₫
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Ngày khám</span>
                    <strong>Chưa chọn</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Bệnh nhân</span>
                    <strong>Chưa chọn</strong>
                  </div>
                </div>

                <button className="w-full bg-blue-600 text-white font-bold text-xl py-5 rounded-xl hover:bg-blue-700 transition mt-6">
                  Xác nhận đặt lịch
                </button>

                <p className="text-xs text-gray-600 text-center">
                  Bằng việc nhấn nút xác nhận, bạn đã đồng ý với điều khoản sử dụng dịch vụ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}