// src/components/doctor/EditDoctorProfileModal.jsx
import React, { useState } from 'react';
import { Save, Camera, Loader2, User, Phone, Mail, MapPin, DollarSign, FileText, Calendar, Briefcase } from 'lucide-react';
import { toast } from 'react-toastify';
import doctorService from '../../services/DoctorService';
import Modal from '../Modal';

export default function EditDoctorProfileModal({ doctor, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const currentYear = new Date().getFullYear();
    
    const [formData, setFormData] = useState({
        fullName: doctor.name || doctor.fullName || '',
        phone: doctor.phone || '',
        email: doctor.email || '',
        address: doctor.address || '',
        consultation_fee: doctor.consultation_fee || 0,
        introduction: doctor.introduction || '',
        dob: doctor.dob ? new Date(doctor.dob).toISOString().split('T')[0] : '',
        gender: doctor.gender || 'male',
        thumbnail: doctor.thumbnail || doctor.image || '',
        career_start_year: doctor.career_start_year || '', // [NEW] Initialize career start year
    });

    const [previewImage, setPreviewImage] = useState(doctor.thumbnail || doctor.image);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                setFormData(prev => ({ ...prev, thumbnail: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            if (!formData.fullName.trim() || !formData.phone.trim()) {
                toast.warning("Họ tên và Số điện thoại là bắt buộc");
                return;
            }

            // [NEW] Validate career_start_year
            if (formData.career_start_year) {
                const year = parseInt(formData.career_start_year);
                if (year < 1950 || year > currentYear) {
                    toast.warning(`Năm bắt đầu phải từ 1950 đến ${currentYear}`);
                    setLoading(false);
                    return;
                }
            }

            await doctorService.updateMyDoctorProfile(formData); // Use the correct service method for self-update
            toast.success("Cập nhật hồ sơ thành công!");
            if (onSuccess) onSuccess(formData);
            onClose();
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            const errorMsg = error.response?.data?.error || "Cập nhật thất bại. Vui lòng thử lại.";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            title="Chỉnh sửa hồ sơ cá nhân" 
            onClose={onClose} 
            isOpen={true} 
            maxWidth="3xl"
        >
            <div className="space-y-8 relative"> 
                
                {/* 1. Avatar Upload */}
                <div className="flex flex-col items-center pt-2">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 shadow-md">
                            {previewImage ? (
                                <img src={previewImage} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-blue-400">
                                    {formData.fullName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200 backdrop-blur-[2px]">
                            <Camera className="w-8 h-8 text-white drop-shadow-md" />
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                    </div>
                    <p className="text-sm text-gray-500 mt-3 font-medium">Nhấn vào ảnh để thay đổi</p>
                </div>

                {/* 2. Thông tin cá nhân */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                        Thông tin cá nhân
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-600" /> Họ và tên
                            </label>
                            <input type="text" value={formData.fullName} onChange={e => handleChange('fullName', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all bg-gray-50 focus:bg-white" placeholder="Nhập họ tên" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-600" /> Ngày sinh
                            </label>
                            <input type="date" value={formData.dob} onChange={e => handleChange('dob', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all bg-gray-50 focus:bg-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Giới tính</label>
                            <select value={formData.gender} onChange={e => handleChange('gender', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all bg-gray-50 focus:bg-white">
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-blue-600" /> Số điện thoại
                            </label>
                            <input type="text" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all bg-gray-50 focus:bg-white" placeholder="09xx..." />
                        </div>
                    </div>
                </div>

                {/* 3. Thông tin công việc */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                        <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                        Thông tin công việc
                    </h3>
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2 opacity-75">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-green-600" /> Email (Cố định)
                                </label>
                                <input type="email" value={formData.email} disabled className="w-full px-4 py-3 border border-gray-200 bg-gray-100 rounded-xl text-gray-500 cursor-not-allowed" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-600" /> Phí khám (VNĐ)
                                </label>
                                <input type="number" value={formData.consultation_fee} onChange={e => handleChange('consultation_fee', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all bg-gray-50 focus:bg-white" placeholder="200000" />
                            </div>
                        </div>

                        {/* [NEW] Row for Address & Career Start Year */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-green-600" /> Địa chỉ / Nơi công tác
                                </label>
                                <input type="text" value={formData.address} onChange={e => handleChange('address', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all bg-gray-50 focus:bg-white" placeholder="Nhập địa chỉ chi tiết" />
                            </div>

                            {/* [NEW] Career Start Year Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-green-600" /> Năm bắt đầu hành nghề
                                </label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={formData.career_start_year} 
                                        onChange={e => handleChange('career_start_year', e.target.value)}
                                        min="1950"
                                        max={currentYear}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all bg-gray-50 focus:bg-white pr-24" // Added padding-right
                                        placeholder={`VD: ${currentYear - 5}`}
                                    />
                                    {formData.career_start_year && (
                                        <span className="absolute right-3 top-3 text-sm font-semibold text-green-600 bg-green-50 px-2 rounded">
                                            {Math.max(0, currentYear - formData.career_start_year)} năm KN
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-green-600" /> Giới thiệu kinh nghiệm
                            </label>
                            <textarea value={formData.introduction} onChange={e => handleChange('introduction', e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all bg-gray-50 focus:bg-white resize-none" placeholder="Mô tả chuyên sâu về kinh nghiệm, các chứng chỉ..." />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white z-10 flex justify-end gap-4 pt-4 pb-2 border-t border-gray-100">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium text-gray-700"
                        disabled={loading}
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={loading}
                        className={`px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}