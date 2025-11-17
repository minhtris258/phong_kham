import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, KeyRound } from 'lucide-react';
import Modal from '../../components/admin/Modal';
import { initialMockPatients } from "../../mocks/mockdata";

// Giả định thêm trường profile_completed cho mock data nếu chưa có
const initialPatientsWithStatus = initialMockPatients.map((p, index) => ({
    ...p,
    profile_completed: index % 2 === 0 ? true : false,
    // Thêm trường password/passwordHash giả định nếu cần cho đổi mật khẩu
    // mockPassword: 'password123', 
}));

const PatientManagement = () => {
    const [patients, setPatients] = useState(initialPatientsWithStatus);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null); 
    const [formData, setFormData] = useState({});
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingPatient, setViewingPatient] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [patientToChangePassword, setPatientToChangePassword] = useState(null);

    const handleViewPatient = (patient) => {
        setViewingPatient(patient);
        setIsViewModalOpen(true);
    };

    const handleChangePassword = (patient) => {
        setPatientToChangePassword(patient);
        setIsPasswordModalOpen(true);
    };

    const handleAddEdit = (patient) => {
        setEditingPatient(patient);
        // Khi thêm mới, chỉ khởi tạo Tên, Email, và Mật khẩu tạm (password)
        setFormData(patient ? patient : { 
            user_id: 'mock-u-' + Date.now().toString().slice(-6),
            fullName: '', 
            phone: '', 
            gender: 'male', 
            dob: '1990-01-01', 
            email: '',
            address: '',
            password: '', // Trường MỚI cho thêm nhanh
            profile_completed: false,
        });
        setIsModalOpen(true);
    };

    const confirmDelete = (id) => {
        setConfirmDeleteId(id);
    };

    const handleDelete = () => {
        setPatients(patients.filter(p => p.id !== confirmDeleteId));
        setConfirmDeleteId(null);
    };

 const handleSave = (e) => {
        e.preventDefault();
        
        // Định nghĩa các trường cần thiết để coi là "HOÀN THÀNH" hồ sơ
        const requiredFieldsForCompletion = [
            'fullName', 'phone', 'email', 'address', 'gender', 'dob'
        ];
        
        // Kiểm tra xem tất cả các trường đều có giá trị (không rỗng, không 'N/A', không '1990-01-01' mặc định)
        const isProfileComplete = requiredFieldsForCompletion.every(field => {
            const value = formData[field];
            return value && value !== 'N/A' && value !== '1990-01-01';
        });

        // --- LOGIC XÁC THỰC VÀ LƯU ---
        if (editingPatient) {
            // Chế độ SỬA
            if (!formData.fullName || !formData.email) {
                console.error('Lỗi: Tên và Email là bắt buộc.');
                return;
            }
            
            setPatients(patients.map(p => (
                p.id === editingPatient.id 
                    ? { 
                        ...p, 
                        ...formData, 
                        profile_completed: isProfileComplete // Đặt trạng thái hoàn thành theo kết quả kiểm tra
                    } 
                    : p
            )));
        } else {
            // Chế độ THÊM MỚI
            if (!formData.fullName || !formData.email || !formData.password) {
                console.error('Lỗi: Vui lòng điền Tên, Email và Mật khẩu khi tạo mới.');
                return;
            }
            
            const newPatient = {
                ...formData,
                id: 'mock-p-' + Date.now().toString().slice(-6),
                // Gán giá trị mặc định cho các trường còn thiếu (để tránh lỗi undefined)
                phone: formData.phone || 'N/A',
                address: formData.address || 'N/A',
                gender: formData.gender || 'male',
                dob: formData.dob || '1990-01-01',
                // Đặt trạng thái hoàn thành theo kết quả kiểm tra
                profile_completed: isProfileComplete, 
            };
            setPatients([...patients, newPatient]);
        }

        setIsModalOpen(false);
        setEditingPatient(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? checked : value 
        });
    };

    const getGenderVietnamese = (gender) => {
        switch (gender) {
            case 'male': return 'Nam';
            case 'female': return 'Nữ';
            case 'other': return 'Khác';
            default: return 'N/A';
        }
    }

    const getProfileStatusStyle = (isCompleted) => {
        return isCompleted ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800';
    }

    return (
        <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Quản Lý Bệnh Nhân</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Danh Sách Bệnh Nhân</h3>
                    <button 
                        onClick={() => handleAddEdit(null)}
                        className="flex items-center bg-indigo-600 text-white px-3 py-2 text-sm rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                        <Plus className="w-5 h-5 mr-1" /> Thêm Bệnh Nhân
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SĐT</th>
                                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giới Tính</th>
                                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày Sinh</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hồ Sơ</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            { patients.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.fullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.phone}</td>
                                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getGenderVietnamese(p.gender)}</td>
                                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.dob}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getProfileStatusStyle(p.profile_completed)}`}>
                                            {p.profile_completed ? 'Hoàn thành' : 'Chưa đủ'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center space-x-2">
                                        
                                        <button onClick={() => handleViewPatient(p)} className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition" title="Xem chi tiết">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        
                                        <button onClick={() => handleAddEdit(p)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition" title="Sửa thông tin">
                                            <Edit className="w-4 h-4" />
                                        </button>

                                        <button onClick={() => handleChangePassword(p)} className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md hover:bg-yellow-50 transition" title="Đổi mật khẩu">
                                            <KeyRound className="w-4 h-4" />
                                        </button>
                                        
                                        <button onClick={() => confirmDelete(p.id)} className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition" title="Xóa bệnh nhân">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form cho Thêm/Sửa Bệnh Nhân */}
            <Modal 
                title={editingPatient ? 'Chỉnh Sửa Thông Tin Bệnh Nhân' : 'Thêm Bệnh Nhân Mới'} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
            >
                <form onSubmit={handleSave}>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-gray-700">Họ và Tên:</span>
                            <input type="text" name="fullName" value={formData.fullName || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border" required />
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-gray-700">Email:</span>
                                <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border" required />
                            </label>

                            {/* Trường MẬT KHẨU chỉ hiển thị khi THÊM MỚI */}
                            {!editingPatient && (
                                <label className="block">
                                    <span className="text-gray-700">Mật khẩu:</span>
                                    <input type="password" name="password" value={formData.password || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border" required />
                                </label>
                            )}
                        </div>

                        {/* HIỂN THỊ CÁC TRƯỜNG CHI TIẾT CHỈ KHI SỬA (hoặc nếu bạn muốn nhập đầy đủ) */}
                        {editingPatient && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="block">
                                        <span className="text-gray-700">Điện Thoại:</span>
                                        <input type="text" name="phone" value={formData.phone || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border" required />
                                    </label>
                                    <label className="block">
                                        <span className="text-gray-700">Giới Tính:</span>
                                        <select name="gender" value={formData.gender || 'male'} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border bg-white">
                                            <option value="male">Nam</option>
                                            <option value="female">Nữ</option>
                                            <option value="other">Khác</option>
                                        </select>
                                    </label>
                                </div>
                                <label className="block">
                                    <span className="text-gray-700">Ngày Sinh:</span>
                                    <input type="date" name="dob" value={formData.dob || new Date().toISOString().split('T')[0]} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-700">Địa Chỉ:</span>
                                    <textarea name="address" value={formData.address || ''} onChange={handleInputChange} rows="2" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border" required></textarea>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input 
                                        type="checkbox" 
                                        name="profile_completed" 
                                        checked={!!formData.profile_completed}
                                        onChange={handleInputChange}
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                                    />
                                    <span className="text-gray-700">Hồ sơ đã hoàn thành</span>
                                </label>
                            </>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold">
                            {editingPatient ? 'Lưu' : 'Tạo Tài Khoản'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Xem Chi tiết Bệnh Nhân (Giữ nguyên) */}
            <Modal
                title={`Chi Tiết Bệnh Nhân: ${viewingPatient?.fullName || ''}`}
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                className="max-w-xl"
            >
                {viewingPatient && (
                    <div className="space-y-4 text-gray-700">
                        <div className="grid grid-cols-2 gap-4 border-b pb-3">
                            <div>
                                <p className="text-sm font-semibold">Họ và Tên:</p>
                                <p className="text-md font-medium text-gray-800">{viewingPatient.fullName}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Email:</p>
                                <p className="text-md font-medium">{viewingPatient.email}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-semibold">Điện Thoại:</p>
                                <p>{viewingPatient.phone || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Giới Tính:</p>
                                <p>{getGenderVietnamese(viewingPatient.gender)}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-semibold">Ngày Sinh:</p>
                                <p>{viewingPatient.dob || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Trạng Thái Hồ Sơ:</p>
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getProfileStatusStyle(viewingPatient.profile_completed)}`}>
                                    {viewingPatient.profile_completed ? 'Hoàn thành' : 'Chưa đủ'}
                                </span>
                            </div>
                        </div>
                        <div className="border-t pt-3 mt-4">
                            <p className="text-sm font-semibold">Địa Chỉ:</p>
                            <p>{viewingPatient.address || 'Chưa cập nhật'}</p>
                        </div>
                    </div>
                )}
            </Modal>
            
            {/* Modal Đổi Mật Khẩu (Giữ nguyên) */}
            <Modal
                title={`Đổi Mật Khẩu cho ${patientToChangePassword?.fullName || ''}`}
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                className="max-w-md"
            >
                <form onSubmit={(e) => { e.preventDefault(); alert('Đã giả lập đổi mật khẩu cho ' + patientToChangePassword.fullName); setIsPasswordModalOpen(false); }}>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-gray-700">Mật khẩu mới:</span>
                            <input type="password" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border" />
                        </label>
                        <label className="block">
                            <span className="text-gray-700">Xác nhận mật khẩu:</span>
                            <input type="password" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 border" />
                        </label>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-semibold">Xác nhận đổi</button>
                    </div>
                </form>
            </Modal>

            {/* Modal Xác nhận Xóa (Giữ nguyên) */}
            <Modal
                title="Xác nhận Xóa Bệnh Nhân"
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                className="max-w-sm"
            >
                <p className="text-gray-700 mb-6">Bạn có chắc chắn muốn xóa bệnh nhân này khỏi hệ thống?</p>
                <div className="flex justify-end space-x-3">
                    <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold">Hủy</button>
                    <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold">Xóa</button>
                </div>
            </Modal>
        </main>
    );
};

export default PatientManagement;