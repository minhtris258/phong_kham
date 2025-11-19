// src/components/patient/DoctorInfoCard.jsx
import React from 'react';
import { Heart, MapPin, Phone } from 'lucide-react';

export default function DoctorInfoCard({ doctor, specialty, experienceYears }) {
    const [liked, setLiked] = React.useState(false);

    return (
        <div className="bg-white rounded-2xl shadow-sm border p-8">
            <div className="flex flex-col md:flex-row gap-8">
                <img
                    src={`https://i.pravatar.cc/340?u=${doctor.email}`}
                    alt={doctor.fullName}
                    className="w-56 h-56 rounded-full object-cover border-4 border-gray-200 shadow-xl mx-auto md:mx-0"
                />
                <div className="flex-1 text-center md:text-left">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Phó giáo sư, Tiến sĩ, Bác sĩ {doctor.fullName}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 mt-3 justify-center md:justify-start">
                                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
                                    Bác sĩ
                                </span>
                                <span className="text-xl text-gray-600 font-medium">
                                    {experienceYears} năm kinh nghiệm
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setLiked(!liked)}
                            className="p-3 hover:bg-gray-100 rounded-full transition mt-2"
                        >
                            <Heart className={`w-8 h-8 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                        </button>
                    </div>

                    <div className="mt-8 space-y-4 text-gray-700 text-lg">
                        <div><strong>Chuyên khoa:</strong> {specialty?.name}</div>
                        <div><strong>Chức vụ:</strong> Trưởng khoa {specialty?.name} - Bệnh viện Chợ Rẫy</div>
                        <div><strong>Nơi công tác:</strong> Bệnh viện Chợ Rẫy</div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-6 justify-center md:justify-start text-gray-600">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-6 h-6 text-blue-600" />
                            <span className="text-lg">{doctor.address}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="w-6 h-6 text-blue-600" />
                            <span className="text-lg">{doctor.phone}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}