import React from 'react';

const AppointmentStatusChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Phân Bổ Trạng Thái Lịch Hẹn</h3>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-600 flex items-center">
                <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                {item.status}
              </span>
              <span className="text-sm font-bold text-gray-800">{item.percentage}%</span>
            </div>
            {/* Thanh tiến trình mô phỏng biểu đồ cột ngang */}
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`${item.color} h-2.5 rounded-full`}
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      <p className="mt-6 text-sm text-gray-500 italic">Dựa trên dữ liệu 30 ngày qua.</p>
    </div>
  );
};

export default AppointmentStatusChart;