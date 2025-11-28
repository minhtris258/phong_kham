import React from "react";

const VisitFilter = ({ filters, onChange, onSearch, onClear }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Tên bệnh */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chẩn đoán / Bệnh lý
          </label>
          <input
            type="text"
            name="diagnosis"
            value={filters.diagnosis}
            onChange={onChange}
            placeholder="Nhập tên bệnh..."
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Từ ngày */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Từ ngày
          </label>
          <input
            type="date"
            name="fromDate"
            value={filters.fromDate}
            onChange={onChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Đến ngày */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Đến ngày
          </label>
          <input
            type="date"
            name="toDate"
            value={filters.toDate}
            onChange={onChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Nút bấm */}
        <div className="flex gap-2">
          <button
            onClick={onSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex-1"
          >
            Tìm kiếm
          </button>
          <button
            onClick={onClear}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            Xóa lọc
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitFilter;