// src/components/doctor/profile/ContactInfo.jsx
import React from "react";
import { Phone, Mail } from "lucide-react";

export default function ContactInfo({ phone, email }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-4">Thông tin liên hệ</h3>
      <div className="space-y-4 text-gray-600">
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-blue-600" /> {phone}
        </div>
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-blue-600" /> {email}
        </div>
      </div>
    </div>
  );
}
