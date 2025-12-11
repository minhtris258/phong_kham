import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom"; // <--- QUAN TRỌNG: Import Outlet
import patientService from "../../services/PatientService";
import Hero from "../../components/patient/Hero";
import Sidebar from "../../components/patient/Sidebar";

const PatientDashboard = () => { // Bỏ props { children }
    const [patientInfo, setPatientInfo] = useState(null);

    useEffect(() => {
        const fetchBasicInfo = async () => {
            try {
                const response = await patientService.getMyProfile();
                const data = response.profile || response;
                setPatientInfo(data);
            } catch (error) {
                console.error("Dashboard: Không lấy được thông tin user", error);
            }
        };
        fetchBasicInfo();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <Hero patient={patientInfo} />

            <div className="container mx-auto px-4 -mt-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <Sidebar />

                    <div className="lg:col-span-3 mt-4">
                        {/* Thay {children} bằng <Outlet /> */}
                        {/* Đây là nơi React Router sẽ nhét PatientProfile hoặc PatientPassword vào */}
                        <Outlet /> 
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;