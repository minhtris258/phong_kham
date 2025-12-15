// src/components/doctor/profile/ProfileHeaderCard.jsx
import React from "react";
import { MapPin } from "lucide-react";

export default function ProfileHeaderCard({
  doctor,
  specialtyName,
  onEditClick,
  avatar,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-[url('https://cdn.medpro.vn/prod-partner/e351b2c8-5d2f-40f5-94b3-41c68c20bc36-bg_dvyt.webp')] h-48 w-full relative bg-cover bg-center bg-no-repeat">
        {/* Avatar Section */}
        <div className="absolute -bottom-16 left-8">
          {avatar ? (
            <img
              src={avatar}
              alt={doctor.fullName}
              className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover bg-white"
            />
          ) : (
            <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-xl flex items-center justify-center text-4xl font-bold text-blue-600 select-none">
              {doctor.fullName?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className="pt-20 px-8 pb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {doctor.fullName}
            </h2>
            <p className="text-xl text-blue-600 font-medium mt-1">
              {specialtyName}
            </p>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              {doctor.address || "Chưa cập nhật địa chỉ"}
            </p>
          </div>

          <button
            onClick={onEditClick}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-md transition whitespace-nowrap"
          >
            Chỉnh sửa hồ sơ
          </button>
        </div>

        {/* Giới thiệu ngắn */}
        {doctor.introduction && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-600 italic">"{doctor.introduction}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
