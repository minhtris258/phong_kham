import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import medicineService from '../../services/medicineService'; 
import { toastSuccess, toastError, toastWarning } from "../../utils/toast";

import MedicineList from '../../components/admin/medicine/MedicineList';
import MedicineFormModal from '../../components/admin/medicine/MedicineFormModal';
import SpecialtyDeleteModal from '../../components/admin/specialty/SpecialtyDeleteModal'; 

const MedicineManagement = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // State Modal & Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);
    const [formData, setFormData] = useState({});
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    // Fetch Medicines
    const fetchMedicines = async (search = '') => {
        setLoading(true);
        try {
            const response = await medicineService.getMedicines({ search, limit: 100 }); 
            const list = response.data?.data || [];
            setMedicines(list);
        } catch (err) {
            console.error(err);
            toastError("Không thể tải danh sách thuốc.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicines();
    }, []);

    // Handle Search Enter
    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            fetchMedicines(searchTerm);
        }
    };

    // --- SỬA LOGIC KHỞI TẠO FORM ---
    const handleAddEdit = (med) => {
        setEditingMedicine(med);
        // Nếu edit: copy dữ liệu, đảm bảo dosages luôn là mảng
        // Nếu add: khởi tạo dosages là mảng rỗng
        setFormData(med 
            ? { ...med, dosages: med.dosages || [] } 
            : { name: '', unit: '', description: '', status: 'active', dosages: [] }
        );
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.name) return toastWarning("Tên thuốc là bắt buộc!");

        try {
            // formData bây giờ đã chứa mảng dosages từ Modal
            if (editingMedicine) {
                await medicineService.updateMedicine(editingMedicine._id, formData);
                toastSuccess("Cập nhật thành công!");
            } else {
                await medicineService.createMedicine(formData);
                toastSuccess("Thêm thuốc mới thành công!");
            }
            setIsModalOpen(false);
            fetchMedicines(searchTerm);
        } catch (err) {
            toastError(err.response?.data?.error || "Lỗi khi lưu thuốc.");
        }
    };

    const handleDelete = async () => {
        try {
            await medicineService.deleteMedicine(confirmDeleteId);
            toastSuccess("Đã xóa thuốc thành công!");
            setConfirmDeleteId(null);
            fetchMedicines(searchTerm);
        } catch (err) {
            toastError("Xóa thất bại.");
        }
    };

    return (
        <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-gray-900">Quản Lý Kho Thuốc</h2>
                
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0">
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm thuốc..." 
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>

                    <button 
                        onClick={() => handleAddEdit(null)}
                        className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5 mr-1" /> Thêm Thuốc
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Đang tải dữ liệu...</div>
            ) : (
                <MedicineList 
                    medicines={medicines}
                    handleAddEdit={handleAddEdit}
                    confirmDelete={setConfirmDeleteId}
                />
            )}

            <MedicineFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                formData={formData}
                // Quan trọng: Truyền hàm setFormData xuống để Modal thao tác mảng dosages
                setFormData={setFormData} 
                handleSave={handleSave}
                editingMedicine={editingMedicine}
            />

            <SpecialtyDeleteModal 
                confirmDeleteId={confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                handleDelete={handleDelete}
            />
        </main>
    );
};

export default MedicineManagement;