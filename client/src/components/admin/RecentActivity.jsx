import React from 'react';
import { Activity, DollarSign, Users, Calendar, Clock } from 'lucide-react';


const RecentActivity = ({ activity }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'sale':
        return 'text-green-500 bg-green-100';
      case 'user':
        return 'text-indigo-500 bg-indigo-100';
      case 'inventory':
        return 'text-yellow-500 bg-yellow-100';
      case 'system':
        return 'text-gray-500 bg-gray-100';
      default:
        return 'text-blue-500 bg-blue-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sale':
        return <DollarSign className="w-4 h-4" />;
      case 'user':
        return <Users className="w-4 h-4" />;
      case 'inventory':
        return <Calendar className="w-4 h-4" />;
      case 'system':
        return <Clock className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Hoạt Động Gần Đây</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {activity.map((item, index) => (
          <div key={index} className="flex items-start space-x-4">
            {/* Icon & Time */}
            <div className="flex flex-col items-center pt-1">
              <div className={`p-2 rounded-full ${getTypeColor(item.type)}`}>
                {getTypeIcon(item.type)}
              </div>
              {index < activity.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 my-1"></div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 pb-4">
              <p className="text-xs text-gray-400">{item.time}</p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-800">{item.user}</span> {item.action}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;