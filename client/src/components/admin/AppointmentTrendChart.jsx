import React, { useMemo, useState } from 'react';

// Props:
// - data: Array [{ label: "01/01", count: 10 }, ...] (Thay vì chỉ dùng key 'month', ta dùng 'label' cho tổng quát)
// - onFilterChange: Function (mode) => void (Gọi khi người dùng bấm nút)
const AppointmentTrendChart = ({ data, onFilterChange }) => {
  const [viewMode, setViewMode] = useState('month'); // 'day' | 'month' | 'year'

  // Xử lý khi bấm nút chuyển đổi
  const handleModeChange = (mode) => {
    setViewMode(mode);
    if (onFilterChange) {
      onFilterChange(mode); // Gửi tín hiệu ra component cha để load lại dữ liệu
    }
  };

  // Tính toán giá trị max để chia tỉ lệ biểu đồ
  const maxCount = useMemo(() => {
    if (!data || data.length === 0) return 10;
    const max = Math.max(...data.map(d => d.count));
    return Math.ceil(max * 1.2) || 10;
  }, [data]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96 flex flex-col relative overflow-hidden">
      {/* Header: Title & Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 z-10 gap-4">
        <div>
           <h3 className="text-lg font-bold text-gray-800">Xu Hướng Đặt Lịch</h3>
           <p className="text-xs text-gray-500 font-medium">
             Thống kê số lượng theo {viewMode === 'day' ? 'ngày' : viewMode === 'month' ? 'tháng' : 'năm'}
           </p>
        </div>

        {/* Bộ lọc Ngày/Tháng/Năm */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
            {['day', 'month', 'year'].map((mode) => (
                <button
                    key={mode}
                    onClick={() => handleModeChange(mode)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                        viewMode === mode 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {mode === 'day' ? 'Ngày' : mode === 'month' ? 'Tháng' : 'Năm'}
                </button>
            ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 relative px-2">
        {/* Đường kẻ ngang (Grid lines) */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
            {[1, 0.75, 0.5, 0.25, 0].map((ratio, i) => (
                <div key={i} className="flex items-center w-full">
                    <span className="text-[10px] text-gray-400 w-6 text-right mr-2">
                        {Math.round(maxCount * ratio)}
                    </span>
                    <div className="flex-1 h-[1px] bg-gray-100 border-t border-dashed border-gray-200"></div>
                </div>
            ))}
        </div>

        {/* Các cột biểu đồ */}
        {(!data || data.length === 0) ? (
            <div className="w-full text-center text-gray-400 text-sm mt-10 z-20">Không có dữ liệu</div>
        ) : (
            data.map((d, index) => {
                const heightPercent = (d.count / maxCount) * 100;
                // Ưu tiên hiển thị d.label, nếu không có thì dùng d.month (để tương thích code cũ)
                const displayLabel = d.label || d.month || d.year || d.date;

                return (
                    <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group z-10 relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-20 pointer-events-none">
                            <div className="bg-gray-800 text-white text-xs rounded-lg py-1 px-2 shadow-lg whitespace-nowrap z-50">
                                <span className="font-bold">{d.count}</span> lịch hẹn
                                <div className="block text-[10px] text-gray-400">{displayLabel}</div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                            </div>
                        </div>

                        {/* Bar */}
                        <div 
                            className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-500 ease-out shadow-sm cursor-pointer"
                            style={{ height: `${heightPercent}%` }}
                        ></div>
                        
                        {/* Label trục X */}
                        <span className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-2 truncate w-full text-center max-w-[50px]">
                            {displayLabel}
                        </span>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};

export default AppointmentTrendChart;