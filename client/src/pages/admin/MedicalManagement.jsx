import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
// Giả sử bạn đã tạo service này
import medicineService from '../../services/medicineService'; 
import { toastSuccess, toastError, toastWarning } from "../../utils/toast";

// Components
import MedicineList from '../../components/admin/medicine/MedicineList';
import MedicineFormModal from '../../components/admin/medicine/MedicineFormModal';
import SpecialtyDeleteModal from '../../components/admin/specialty/SpecialtyDeleteModal'; // Tái sử dụng Delete Modal

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
            // API backend của bạn hỗ trợ query ?search=...
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

    // Form Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddEdit = (med) => {
        setEditingMedicine(med);
        setFormData(med ? { ...med } : { name: '', unit: '', description: '', status: 'active' });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.name) return toastWarning("Tên thuốc là bắt buộc!");

        try {
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

    // Delete Handlers
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
                    {/* Search Box */}
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
                handleInputChange={handleInputChange}
                handleSave={handleSave}
                editingMedicine={editingMedicine}
            />

            {/* Tái sử dụng Modal Delete của Specialty nhưng đổi title props nếu component đó hỗ trợ, hoặc dùng Generic Modal */}
            <SpecialtyDeleteModal 
                confirmDeleteId={confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                handleDelete={handleDelete}
            />
        </main>
    );
};

export default MedicineManagement;