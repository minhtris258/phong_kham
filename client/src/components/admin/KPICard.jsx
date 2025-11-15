import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const KPICard = ({ title, value, change, period, isPositive, icon: Icon, color }) => {
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;
  const ChangeBg = isPositive ? 'bg-green-100' : 'bg-red-100';
  const IconColor = `text-${color}-500`;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md transition duration-300 hover:shadow-xl border border-gray-100">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <Icon className={`h-5 w-5 ${IconColor}`} />
      </div>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      <div className="mt-4 flex items-center">
        <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${changeColor} ${ChangeBg}`}>
          <ChangeIcon className="h-3 w-3 mr-1" />
          {change}
        </div>
        <p className="text-xs text-gray-500 ml-2">so với {period}</p>
      </div>
    </div>
  );
};
export default KPICard;