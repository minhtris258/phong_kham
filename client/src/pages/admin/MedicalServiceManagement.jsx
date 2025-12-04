import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import medicalServiceService from '../../services/medicalServiceService'; 
import { toastSuccess, toastError, toastWarning } from "../../utils/toast";

import ServiceList from '../../components/admin/service/ServiceList';
import ServiceFormModal from '../../components/admin/service/ServiceFormModal';
import SpecialtyDeleteModal from '../../components/admin/specialty/SpecialtyDeleteModal';

const ServiceManagement = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({});
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    // === FETCH DATA ===
    const fetchServices = async (search = '') => {
        setLoading(true);
        try {
            const response = await medicalServiceService.getServices({ search, limit: 100 });
            setServices(response.data?.data || []);
        } catch (err) {
            toastError("Lỗi tải danh sách dịch vụ.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchServices(); }, []);

    // === HANDLERS ===
    const handleSearch = (e) => {
        if (e.key === 'Enter') fetchServices(searchTerm);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // [MỚI] Xử lý chọn file ảnh -> Chuyển sang Base64
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    image: reader.result,      // Gửi chuỗi Base64 này xuống Backend
                    thumbnail: reader.result   // Dùng chuỗi này để Preview ngay trong Modal
                }));
            };
        }
    };

    const handleAddEdit = (svc) => {
        setEditingService(svc);
        // Reset form, đảm bảo xóa thumbnail cũ nếu là thêm mới
        setFormData(svc ? { ...svc } : { 
            name: '', code: '', price: '', description: '', status: 'active',
            image: '', thumbnail: '' 
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingService) {
                // Backend Controller đã xử lý: Nếu image là Base64 thì upload, nếu là Link cũ thì giữ nguyên
                await medicalServiceService.updateService(editingService._id, formData);
                toastSuccess("Cập nhật dịch vụ thành công!");
            } else {
                await medicalServiceService.createService(formData);
                toastSuccess("Thêm dịch vụ thành công!");
            }
            setIsModalOpen(false);
            fetchServices(searchTerm);
        } catch (err) {
            console.error(err);
            toastError(err.response?.data?.error || "Lỗi lưu dịch vụ.");
        }
    };

    const handleDelete = async () => {
        try {
            await medicalServiceService.deleteService(confirmDeleteId);
            toastSuccess("Xóa dịch vụ thành công!");
            setConfirmDeleteId(null);
            fetchServices(searchTerm);
        } catch (err) {
            toastError("Xóa thất bại.");
        }
    };

    return (
        <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-gray-900">Quản Lý Dịch Vụ Khám</h2>
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0">
                        <input type="text" placeholder="Tìm tên hoặc mã..." className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleSearch} />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                    <button onClick={() => handleAddEdit(null)} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 whitespace-nowrap">
                        <Plus className="w-5 h-5 mr-1" /> Thêm Dịch Vụ
                    </button>
                </div>
            </div>

            {loading ? <div className="text-center py-10">Đang tải...</div> : 
                <ServiceList 
                    services={services} 
                    handleAddEdit={handleAddEdit} 
                    confirmDelete={setConfirmDeleteId} 
                />
            }

            <ServiceFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                formData={formData}
                handleInputChange={handleInputChange} 
                handleFileChange={handleFileChange} // <--- Truyền hàm này vào Modal
                handleSave={handleSave} 
                editingService={editingService} 
            />

            <SpecialtyDeleteModal 
                confirmDeleteId={confirmDeleteId} 
                onClose={() => setConfirmDeleteId(null)} 
                handleDelete={handleDelete} 
            />
        </main>
    );
};

export default ServiceManagement;