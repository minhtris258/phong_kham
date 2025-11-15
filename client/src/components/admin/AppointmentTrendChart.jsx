import React from 'react';

const AppointmentTrendChart = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count)) + 500; 

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-96 relative">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Xu Hướng Đặt Lịch Hẹn (Lượt)</h3>
      <div className="flex justify-between items-end h-64 border-b border-l border-gray-200 pl-2 pb-2">
        {/* Trục Y giả */}
        <div className="absolute top-16 left-2 h-64 w-full flex flex-col justify-between text-xs text-gray-400 opacity-0 lg:opacity-100 pointer-events-none">
            <div className="relative h-full flex flex-col justify-between">
                <div>{maxCount - 500}</div>
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2">{Math.round((maxCount - 500) / 2)}</div>
                <div>0</div>
            </div>
        </div>
        
        {data.map((d, index) => (
          <div key={index} className="flex flex-col items-center group relative h-full justify-end w-10 mx-1">
            {/* Thanh Số lượng Lịch hẹn */}
            <div
              className="w-4 rounded-t-lg bg-indigo-500 hover:bg-indigo-600 transition-all duration-300 cursor-pointer"
              style={{ height: `${(d.count / maxCount) * 100}%` }}
            >
                <span className="absolute bottom-full mb-1 p-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 -translate-x-1/2 left-1/2">
                    {d.count} Lượt
                </span>
            </div>
            <span className="text-xs font-medium text-gray-600 mt-1">{d.month}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-500 italic">Tổng lịch hẹn theo tháng.</p>
    </div>
  );
};

export default AppointmentTrendChart;